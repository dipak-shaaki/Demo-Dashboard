const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Lapse and loan details
router.get('/lapse-loan', async (req, res) => {
  try {
    const data = await AnalyticsService.getLapseLoanDetails();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Surrender details
router.get('/surrender', async (req, res) => {
  try {
    const data = await AnalyticsService.getSurrenderDetails();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Maturing policies with investment details
router.get('/maturing', async (req, res) => {
  try {
    const data = await AnalyticsService.getMaturingPoliciesWithInvestments();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
