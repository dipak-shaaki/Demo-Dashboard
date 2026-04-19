const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Yearly comparison by province with optional fiscal year filter
router.get('/yearly-comparison', async (req, res) => {
  try {
    const { fiscalYear } = req.query;
    const data = await AnalyticsService.getRenewalYearlyComparison(fiscalYear);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
