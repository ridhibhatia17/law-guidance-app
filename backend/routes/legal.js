const express = require('express');
const router = express.Router();
const Joi = require('joi');
const aiService = require('../services/aiService');

// Schemas for validation
const breachSchema = Joi.object({
  situation: Joi.string().min(1).required(),
  contractType: Joi.string().required()
});

const caseTypeSchema = Joi.object({
  problemType: Joi.string().required(),
  situation: Joi.string().optional() // Fixed typo: optionaacl -> optional
});

const caseDetailsSchema = Joi.object({
  problemType: Joi.string().required(),
  caseType: Joi.string().required()
});

// Analyze contract breach situation
router.post('/analyze-breach', async (req, res) => {
  try {
    const { error } = breachSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { situation, contractType } = req.body;
    const analysis = await aiService.analyzeBreach(situation, contractType);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing breach:', error);
    res.status(500).json({ error: 'Failed to analyze breach situation' });
  }
});

// Find appropriate case type
router.post('/find-case-type', async (req, res) => {
  try {
    const { error } = caseTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { problemType, situation } = req.body;
    const caseTypes = await aiService.findCaseType(problemType, situation);
    res.json(caseTypes);
  } catch (error) {
    console.error('Error finding case type:', error);
    res.status(500).json({ error: 'Failed to find appropriate case type' });
  }
});

// Get case details
router.post('/get-case-details', async (req, res) => {
  try {
    const { error } = caseDetailsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { problemType, caseType } = req.body;
    const details = await aiService.getCaseDetails(problemType, caseType);
    res.json(details);
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({ error: 'Failed to fetch case details' });
  }
});

module.exports = router;