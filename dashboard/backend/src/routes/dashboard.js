const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await AnalyticsService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get premium by province
router.get('/premium-by-province', async (req, res) => {
  try {
    const fiscalYear = req.query.fiscalYear || '2081/82';
    const data = await AnalyticsService.getPremiumByProvince(fiscalYear);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
