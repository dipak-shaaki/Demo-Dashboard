const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// FD summary
router.get('/fd-summary', async (req, res) => {
  try {
    const data = await AnalyticsService.getInvestmentSummary();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Investment by province
router.get('/by-province', async (req, res) => {
  try {
    const data = await AnalyticsService.getInvestmentSummary();
    res.json(data.byProvince);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
