const express = require('express');
const router = express.Router();
const AnalyticsService = require('../services/analyticsService');

// Death claim ratio
router.get('/death-claim-ratio', async (req, res) => {
  try {
    const data = await AnalyticsService.getDeathClaimRatio();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Claim details
router.get('/details', async (req, res) => {
  try {
    const pool = require('../config/database');
    const [results] = await pool.query(
      `SELECT c.*, pol.policy_number, p.name as province
       FROM claims c
       JOIN policies pol ON c.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       ORDER BY c.claim_date DESC
       LIMIT 100`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
