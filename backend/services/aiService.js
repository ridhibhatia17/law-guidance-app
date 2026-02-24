const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is required in .env');
    }
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { response_mime_type: 'application/json' }
    });
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

      const result = await this.model.generateContent(prompt);
      const jsonResponse = result.response.text();

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
        disclaimer: 'This is AI-generated guidance and not professional legal advice. Consult with a qualified attorney for your specific situation.'
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw new Error('Failed to analyze breach with AI');
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

      const result = await this.model.generateContent(prompt);
      const jsonResponse = result.response.text();

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
        estimatedSuccess: parsed.estimatedSuccess
      };
    } catch (error) {
      console.error('Gemini case type error:', error);
      throw new Error('Failed to find case types with AI');
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

      const result = await this.model.generateContent(prompt);
      const jsonResponse = result.response.text();

      let parsed;
      try {
        parsed = JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response');
      }

      return parsed;
    } catch (error) {
      console.error('Gemini case details error:', error);
      throw new Error('Failed to fetch case details with AI');
    }
  }
}

module.exports = new AIService();