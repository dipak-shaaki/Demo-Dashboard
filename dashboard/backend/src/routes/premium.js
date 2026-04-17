const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Current fiscal year premium
router.get('/current-fy', async (req, res) => {
  try {
    const data = await AnalyticsService.getPremiumByProvince('2081/82');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comparative premium collection
router.get('/comparative', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const data = await AnalyticsService.getComparativePremium(startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Province trend
router.get('/province-trend', async (req, res) => {
  try {
    const data = await AnalyticsService.getPremiumByProvince(req.query.fiscalYear || '2081/82');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
