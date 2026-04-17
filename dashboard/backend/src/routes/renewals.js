const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Yearly comparison by province
router.get('/yearly-comparison', async (req, res) => {
  try {
    const data = await AnalyticsService.getRenewalYearlyComparison();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
