const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    const key = process.env.GOOGLE_API_KEY;
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
      this.modelCandidates = [
        process.env.GOOGLE_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash'
      ].filter(Boolean);
    } else {
      this.genAI = null;
      this.modelCandidates = [];
      console.warn('GOOGLE_API_KEY not set - running with AI fallback responses');
    }
  }

  _getModel(modelName) {
    return this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { response_mime_type: 'application/json' }
    });
  }

  async _generateJson(prompt) {
    if (!this.genAI || this.modelCandidates.length === 0) {
      throw new Error('GOOGLE_API_KEY not configured');
    }

    let lastError = null;

    for (const modelName of this.modelCandidates) {
      try {
        const model = this._getModel(modelName);
        const result = await model.generateContent(prompt);
        return { modelName, text: result.response.text() };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to generate AI response');
  }

  async analyzeBreach(situation, contractType) {
    try {
      const prompt = `
        You are a legal AI assistant for users in India. Analyze if the situation describes a contract breach under Indian laws, such as the Indian Contract Act, 1872. Use very simple language that anyone can understand, avoiding legal jargon.
        Provide:
        - isBreach: boolean (true if likely a breach)
        - confidence: number (0 to 1)
        - explanation: string (explain in simple words why it is or isn't a breach)
        - remedies: array of strings (possible solutions in simple terms)
        - nextSteps: array of strings (easy steps to take next)

        Contract type: ${contractType}
        Situation: ${situation}

        Output ONLY as JSON object, no extra text.
      `;

      const { modelName, text: jsonResponse } = await this._generateJson(prompt);

      let parsed;
      try {
        parsed = JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response');
      }

      return {
        isBreach: parsed.isBreach,
        confidence: parsed.confidence,
        explanation: parsed.explanation,
        remedies: parsed.remedies,
        nextSteps: parsed.nextSteps,
        contractType,
        analysisDate: new Date().toISOString(),
        modelUsed: modelName,
        disclaimer: 'This is AI-generated guidance and not professional legal advice. Consult with a qualified attorney for your specific situation.'
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      // Provide a graceful fallback so the frontend can display helpful guidance
      return this._fallbackAnalyzeBreach(situation, contractType, error);
    }
  }

  async findCaseType(problemType, situation) {
    try {
      const prompt = `
        You are a legal AI assistant for users in India. Suggest case types for the problem based on Indian laws. Use very simple language that anyone can understand, avoiding legal jargon.
        Provide:
        - recommendedCases: array of objects ({type: string, description: string (in simple words), likelihood: string (High/Medium/Low), timeframe: string (how long it might take), cost: string (rough cost in INR)})
        - generalAdvice: string (simple advice for the user)
        - estimatedSuccess: number (0 to 1)

        Problem type: ${problemType}
        Situation: ${situation || 'None provided'}

        Output ONLY as JSON object, no extra text.
      `;

      const { modelName, text: jsonResponse } = await this._generateJson(prompt);

      let parsed;
      try {
        parsed = JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response');
      }

      return {
        problemType,
        recommendedCases: parsed.recommendedCases,
        generalAdvice: parsed.generalAdvice,
        estimatedSuccess: parsed.estimatedSuccess,
        modelUsed: modelName
      };
    } catch (error) {
      console.error('Gemini case type error:', error);
      return this._fallbackFindCaseType(problemType, situation, error);
    }
  }

  async getCaseDetails(problemType, caseType) {
    try {
      const prompt = `
        You are a legal AI assistant for users in India. Provide detailed information about the case type in the context of the problem, based on Indian laws. Use very simple language that anyone can understand, avoiding legal jargon.
        Provide:
        - overview: string (explain the case type in simple words)
        - benefits: array of strings (good things about this case type)
        - drawbacks: array of strings (challenges or risks)
        - steps: array of strings (step-by-step guide to fight or apply for the case)

        Problem type: ${problemType}
        Case type: ${caseType}

        Output ONLY as JSON object, no extra text.
      `;

      const { modelName, text: jsonResponse } = await this._generateJson(prompt);

      let parsed;
      try {
        parsed = JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response');
      }

      return {
        ...parsed,
        modelUsed: modelName
      };
    } catch (error) {
      console.error('Gemini case details error:', error);
      return this._fallbackGetCaseDetails(problemType, caseType, error);
    }
  }

  // Fallback helpers
  _fallbackAnalyzeBreach(situation, contractType, error) {
    const lowerSituation = String(situation || '').toLowerCase();
    const hasNonPayment = /not pay|didn't pay|did not pay|unpaid|salary|invoice|payment|money/i.test(lowerSituation);
    const hasDeliveryIssue = /deliver|delivery|service not|failed|breach|cancel/i.test(lowerSituation);
    const likelyBreach = hasNonPayment || hasDeliveryIssue;

    return {
      isBreach: likelyBreach,
      confidence: likelyBreach ? 0.68 : 0.32,
      explanation: likelyBreach
        ? 'Based on the details you shared, this looks like it may be a contract problem, especially if someone did not pay, did not deliver, or did not do what was promised.'
        : 'Based on the details you shared, it is not clear yet whether this is a contract problem. More facts could change the answer.',
      remedies: [
        'Try to resolve it directly with the other party first',
        'Send a clear written message asking for payment, delivery, or performance',
        'Save messages, invoices, contracts, screenshots, and dates'
      ],
      nextSteps: [
        'Write down the timeline of events',
        'Collect proof of the promise and what went wrong',
        'Speak with a lawyer or legal aid clinic if the issue continues'
      ],
      contractType,
      analysisDate: new Date().toISOString(),
      disclaimer: 'This is local guidance because the AI service is unavailable. It is NOT a substitute for legal advice.' ,
      aiAvailable: false,
      originalError: String(error && error.message ? error.message : error)
    };
  }

  _fallbackFindCaseType(problemType, situation, error) {
    const normalizedProblemType = String(problemType || '').toLowerCase();
    const normalizedSituation = String(situation || '').toLowerCase();

    if (/design|copied|stolen|logo|artwork|photo|image|content|copyright|trademark|plagiar/i.test(normalizedSituation)) {
      return {
        problemType,
        recommendedCases: [
          { type: 'Copyright or design infringement complaint', description: 'For someone copying your design, artwork, logo, or content without permission', likelihood: 'High', timeframe: 'Weeks to months', cost: 'Low to moderate' },
          { type: 'Cease-and-desist notice', description: 'A written legal warning asking them to stop using your work', likelihood: 'High', timeframe: 'Days to weeks', cost: 'Low' }
        ],
        generalAdvice: 'Your situation sounds more like an intellectual property dispute than a job issue. Save proof that you created the design, such as source files, drafts, timestamps, and messages.',
        estimatedSuccess: 0.72,
        aiAvailable: false,
        fallbackSource: 'local-rules',
        originalError: String(error && error.message ? error.message : error)
      };
    }

    const templates = {
      employment: {
        cases: [
          { type: 'Labour complaint', description: 'For unpaid salary, wrongful firing, or workplace disputes', likelihood: 'High', timeframe: 'A few weeks to a few months', cost: 'Low to moderate' },
          { type: 'Mediation or settlement', description: 'For a quicker out-of-court resolution', likelihood: 'Medium', timeframe: 'Days to weeks', cost: 'Low' }
        ],
        advice: 'Keep pay slips, offer letters, emails, and messages. If salary was delayed or you were fired without proper process, this may fit a labour or employment dispute.'
      },
      rental: {
        cases: [
          { type: 'Tenant-landlord dispute', description: 'For deposit issues, repairs, eviction, or rent conflicts', likelihood: 'High', timeframe: 'A few weeks to a few months', cost: 'Low to moderate' },
          { type: 'Civil complaint', description: 'If the landlord broke agreed terms in writing', likelihood: 'Medium', timeframe: 'Weeks to months', cost: 'Moderate' }
        ],
        advice: 'Save the lease, rent receipts, repair requests, and eviction notices. Many rental problems can start with a written notice or mediation.'
      },
      business: {
        cases: [
          { type: 'Breach of contract', description: 'For broken business promises, unpaid invoices, or missing services', likelihood: 'High', timeframe: 'Weeks to months', cost: 'Moderate' },
          { type: 'Commercial mediation', description: 'For a business settlement before court', likelihood: 'Medium', timeframe: 'Days to weeks', cost: 'Low to moderate' }
        ],
        advice: 'Contracts, purchase orders, invoices, and delivery proofs matter most here. If money or goods were withheld, a contract claim may be available.'
      },
      loan: {
        cases: [
          { type: 'Recovery or repayment dispute', description: 'For missed installments, unfair charges, or repayment disagreements', likelihood: 'High', timeframe: 'Weeks to months', cost: 'Moderate' },
          { type: 'Consumer or banking complaint', description: 'If the lender or bank handled the issue unfairly', likelihood: 'Medium', timeframe: 'Weeks', cost: 'Low' }
        ],
        advice: 'Keep loan agreements, bank statements, repayment records, and all notices from the lender.'
      },
      consumer: {
        cases: [
          { type: 'Consumer complaint', description: 'For defective products, bad service, or warranty issues', likelihood: 'High', timeframe: 'Weeks to months', cost: 'Low' },
          { type: 'Refund or replacement demand', description: 'For a quick written refund or replacement request', likelihood: 'High', timeframe: 'Days to weeks', cost: 'Low' }
        ],
        advice: 'Keep bills, warranty cards, chat screenshots, and complaint numbers. Consumer disputes often work well with a written complaint first.'
      },
      insurance: {
        cases: [
          { type: 'Insurance claim dispute', description: 'For claim denials, underpayment, or delay', likelihood: 'High', timeframe: 'Weeks to months', cost: 'Low to moderate' },
          { type: 'Consumer complaint', description: 'If the insurer is not following the policy terms', likelihood: 'Medium', timeframe: 'Weeks', cost: 'Low' }
        ],
        advice: 'Keep the policy, claim forms, denial letters, and medical or repair documents. A complaint to the insurer in writing is a good first step.'
      }
    };

    const selectedTemplate = templates[normalizedProblemType] || {
      cases: [
        { type: 'Civil dispute', description: 'For a general disagreement where someone broke a promise or caused a loss', likelihood: 'Medium', timeframe: 'Weeks to months', cost: 'Moderate' },
        { type: 'Mediation or legal notice', description: 'To try a faster solution before filing a case', likelihood: 'High', timeframe: 'Days to weeks', cost: 'Low' }
      ],
      advice: 'Use the facts, any written promise, and proof of loss to decide the best legal path.'
    };

    const situationBoost = /design|copied|stolen|invoice|paid|payment|refund|delivery|salary|fired|eviction|warranty/i.test(normalizedSituation)
      ? 0.1
      : 0;

    return {
      problemType,
      recommendedCases: selectedTemplate.cases,
      generalAdvice: selectedTemplate.advice,
      estimatedSuccess: Math.min(0.85, 0.55 + situationBoost),
      aiAvailable: false,
      fallbackSource: 'local-rules',
      originalError: String(error && error.message ? error.message : error)
    };
  }

  _fallbackGetCaseDetails(problemType, caseType, error) {
    return {
      overview: 'AI service unavailable. Detailed case guidance is not available right now.',
      benefits: [],
      drawbacks: [],
      steps: ['Consult a lawyer for specific steps'],
      aiAvailable: false,
      originalError: String(error && error.message ? error.message : error)
    };
  }
}

module.exports = new AIService();