const Joi = require('joi');

const rightsSchema = Joi.object({
  id: Joi.number().integer().required(),
  category: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  situation: Joi.string().required(),
  remedies: Joi.array().items(Joi.string()).required(),
  timeframe: Joi.string().required(),
  cost: Joi.string().required(),
  successRate: Joi.string().required()
});

const rightsLibrary = [
  {
    id: 1,
    category: 'employment',
    title: 'Unpaid Wages',
    description: 'When your employer fails to pay agreed wages',
    situation: 'Your employer hasn\'t paid your salary for the agreed period',
    remedies: [
      'File wage claim with labor department',
      'Demand payment with interest',
      'Seek attorney fees if state law allows',
      'File civil lawsuit for damages'
    ],
    timeframe: '30-90 days for wage claims',
    cost: 'Usually free for wage claims',
    successRate: 'High (80-90%)'
  },
  {
    id: 2,
    category: 'rental',
    title: 'Security Deposit Not Returned',
    description: 'Landlord fails to return security deposit within legal timeframe',
    situation: 'Your landlord didn\'t return your security deposit after moving out',
    remedies: [
      'Send written demand letter',
      'File complaint with housing authority',
      'Sue for double or triple damages (varies by state)',
      'Recover attorney fees'
    ],
    timeframe: '30-60 days',
    cost: 'Small claims court fees ($50-200)',
    successRate: 'Very High (85-95%)'
  },
  {
    id: 3,
    category: 'business',
    title: 'Goods Not Delivered',
    description: 'Supplier fails to deliver goods as per contract',
    situation: 'A supplier didn\'t deliver goods you paid for',
    remedies: [
      'Demand specific performance',
      'Claim cover damages (difference in price)',
      'Seek incidental damages',
      'Cancel contract and seek refund'
    ],
    timeframe: '3-12 months',
    cost: 'Medium to High',
    successRate: 'High (75-85%)'
  },
  {
    id: 4,
    category: 'business',
    title: 'Service Contract Breach',
    description: 'Service provider fails to perform as agreed',
    situation: 'A contractor didn\'t complete work as specified in contract',
    remedies: [
      'Demand completion of work',
      'Hire another contractor and claim difference',
      'Seek damages for delays',
      'Withhold payment for incomplete work'
    ],
    timeframe: '2-8 months',
    cost: 'Medium',
    successRate: 'Medium to High (70-80%)'
  },
  {
    id: 5,
    category: 'loan',
    title: 'Predatory Lending',
    description: 'Unfair or deceptive lending practices',
    situation: 'You were charged excessive fees or interest rates',
    remedies: [
      'File complaint with consumer protection agency',
      'Seek damages under consumer protection laws',
      'Demand loan modification',
      'Sue for violations of lending laws'
    ],
    timeframe: '6-18 months',
    cost: 'Medium',
    successRate: 'Medium (60-70%)'
  },
  {
    id: 6,
    category: 'employment',
    title: 'Wrongful Termination',
    description: 'Termination that violates employment contract or law',
    situation: 'You were fired in violation of your employment contract',
    remedies: [
      'File unemployment benefits claim',
      'Sue for wrongful termination',
      'Seek reinstatement if applicable',
      'Claim lost wages and benefits'
    ],
    timeframe: '6-24 months',
    cost: 'Medium to High',
    successRate: 'Medium (55-70%)'
  }
];

class RightsLibrary {
  constructor() {
    this.library = this.validateLibrary(rightsLibrary);
  }

  validateLibrary(data) {
    data.forEach(item => {
      const { error } = rightsSchema.validate(item);
      if (error) {
        throw new Error(`Invalid data in rights library: ${error.message}`);
      }
    });
    return data;
  }

  getLibrary(filters = {}) {
    let result = this.library;

    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.remedies.some(remedy => remedy.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = result.slice(start, end);

    return {
      data: paginated,
      total: result.length,
      page,
      limit
    };
  }

  searchRights(query) {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query is required');
    }
    return this.getLibrary({ search: query }).data;
  }

  getByCategory(category) {
    return this.getLibrary({ category }).data;
  }

  getById(id) {
    const item = this.library.find(item => item.id === parseInt(id));
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }
}

module.exports = new RightsLibrary();