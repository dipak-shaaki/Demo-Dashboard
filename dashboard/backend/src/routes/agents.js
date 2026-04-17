const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Agency growth rate by province
router.get('/growth-rate', async (req, res) => {
  try {
    const data = await AnalyticsService.getAgencyGrowthByProvince();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Top 20 agents
router.get('/top-20', async (req, res) => {
  try {
    const year = req.query.year || 2024;
    const data = await AnalyticsService.getTop20Agents(year);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agents by status
router.get('/status-list', async (req, res) => {
  try {
    const status = req.query.status || 'active';
    const data = await AnalyticsService.getAgentsByStatus(status);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Passive to active agents
router.get('/passive-to-active', async (req, res) => {
  try {
    const data = await AnalyticsService.getPassiveToActive();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
