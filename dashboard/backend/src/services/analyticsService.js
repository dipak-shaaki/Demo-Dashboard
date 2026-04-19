const pool = require('../config/database');

class AnalyticsService {
  // Get dashboard summary
  static async getDashboardSummary() {
    const [totalPremium] = await pool.query(
      'SELECT SUM(amount) as total FROM premium_collections WHERE fiscal_year = "2081/82"'
    );
    
    const [activeAgents] = await pool.query(
      'SELECT COUNT(*) as count FROM agents WHERE status = "active"'
    );
    
    const [totalPolicies] = await pool.query(
      'SELECT COUNT(*) as count FROM policies WHERE status = "active"'
    );
    
    const [claimsRatio] = await pool.query(
      'SELECT (COUNT(CASE WHEN status = "approved" THEN 1 END) * 100.0 / COUNT(*)) as ratio FROM claims WHERE fiscal_year = "2081/82"'
    );
    
    return {
      totalPremium: totalPremium[0].total || 0,
      activeAgents: activeAgents[0].count || 0,
      totalPolicies: totalPolicies[0].count || 0,
      claimsRatio: claimsRatio[0].ratio || 0
    };
  }

  // Premium collection by province
  static async getPremiumByProvince(fiscalYear = '2081/82') {
    const [results] = await pool.query(
      `SELECT p.name as province, SUM(pc.amount) as total_premium, COUNT(DISTINCT pc.policy_id) as policy_count
       FROM premium_collections pc
       JOIN policies pol ON pc.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE pc.fiscal_year = ?
       GROUP BY p.id, p.name
       ORDER BY total_premium DESC`,
      [fiscalYear]
    );
    return results;
  }

  // Comparative premium collection
  static async getComparativePremium(startDate, endDate) {
    const [results] = await pool.query(
      `SELECT p.name as province, SUM(pc.amount) as total_premium, pc.fiscal_year
       FROM premium_collections pc
       JOIN policies pol ON pc.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE pc.collection_date BETWEEN ? AND ?
       GROUP BY p.id, p.name, pc.fiscal_year
       ORDER BY pc.fiscal_year, total_premium DESC`,
      [startDate, endDate]
    );
    return results;
  }

  // Agency growth rate by province
  static async getAgencyGrowthByProvince() {
    const [results] = await pool.query(
      `SELECT p.name as province, 
              COUNT(CASE WHEN YEAR(a.join_date) = 2024 THEN 1 END) as new_agents_2024,
              COUNT(CASE WHEN YEAR(a.join_date) = 2023 THEN 1 END) as new_agents_2023,
              COUNT(*) as total_agents,
              ROUND((COUNT(CASE WHEN YEAR(a.join_date) = 2024 THEN 1 END) - COUNT(CASE WHEN YEAR(a.join_date) = 2023 THEN 1 END)) * 100.0 / 
              NULLIF(COUNT(CASE WHEN YEAR(a.join_date) = 2023 THEN 1 END), 0), 2) as growth_rate
       FROM agents a
       JOIN provinces p ON a.province_id = p.id
       GROUP BY p.id, p.name
       ORDER BY growth_rate DESC`
    );
    return results;
  }

  // Top 20 agents year-wise
  static async getTop20Agents(year = 2024) {
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    const [results] = await pool.query(
      `SELECT a.name, a.agency_name, p.name as province, SUM(pc.amount) as total_collected, COUNT(DISTINCT pc.policy_id) as policies_count
       FROM agents a
       JOIN premium_collections pc ON a.id = (SELECT agent_id FROM policies WHERE id = pc.policy_id)
       JOIN policies pol ON pc.policy_id = pol.id
       JOIN provinces p ON a.province_id = p.id
       WHERE pc.collection_date BETWEEN ? AND ?
       GROUP BY a.id, a.name, a.agency_name, p.name
       ORDER BY total_collected DESC
       LIMIT 20`,
      [startDate, endDate]
    );
    return results;
  }

  // Agent status lists
  static async getAgentsByStatus(status) {
    const [results] = await pool.query(
      `SELECT a.*, p.name as province
       FROM agents a
       JOIN provinces p ON a.province_id = p.id
       WHERE a.status = ?
       ORDER BY a.total_premium_collected DESC`,
      [status]
    );
    return results;
  }

  // Passive to active agents
  static async getPassiveToActive() {
    const [results] = await pool.query(
      `SELECT a.*, p.name as province
       FROM agents a
       JOIN provinces p ON a.province_id = p.id
       WHERE a.status = 'active' 
       AND a.last_activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       AND a.join_date < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
       ORDER BY a.last_activity_date DESC`
    );
    return results;
  }

  // Renewal yearly comparison by province
  static async getRenewalYearlyComparison(fiscalYear = null) {
    let query = `
      SELECT p.name as province, 
              r.fiscal_year,
              SUM(r.amount) as total_renewal,
              COUNT(CASE WHEN r.status = 'paid' THEN 1 END) as paid_count,
              COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_count,
              COUNT(CASE WHEN r.status = 'lapsed' THEN 1 END) as lapsed_count
       FROM renewals r
       JOIN policies pol ON r.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id`;
    
    const params = [];
    
    if (fiscalYear) {
      query += ' WHERE r.fiscal_year = ?';
      params.push(fiscalYear);
    }
    
    query += ' GROUP BY p.id, p.name, r.fiscal_year ORDER BY r.fiscal_year DESC, total_renewal DESC';
    
    const [results] = await pool.query(query, params);
    return results;
  }

  // Policy lapse and loan details
  static async getLapseLoanDetails() {
    const [lapseResults] = await pool.query(
      `SELECT p.name as province, COUNT(*) as lapse_count, SUM(pol.premium_amount) as total_premium_lost
       FROM policies pol
       JOIN provinces p ON pol.province_id = p.id
       WHERE pol.status = 'lapsed'
       GROUP BY p.id, p.name
       ORDER BY lapse_count DESC`
    );
    
    const [loanResults] = await pool.query(
      `SELECT p.name as province, COUNT(*) as loan_count, SUM(c.claim_amount) as total_loan_amount
       FROM claims c
       JOIN policies pol ON c.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE c.claim_type = 'loan'
       GROUP BY p.id, p.name
       ORDER BY loan_count DESC`
    );
    
    return { lapse: lapseResults, loan: loanResults };
  }

  // Surrender ratio and policies
  static async getSurrenderDetails() {
    const [totalPolicies] = await pool.query('SELECT COUNT(*) as count FROM policies');
    const [surrenderByProvince] = await pool.query(
      `SELECT p.name as province, COUNT(*) as surrender_count, SUM(pol.premium_amount) as total_premium
       FROM policies pol
       JOIN provinces p ON pol.province_id = p.id
       WHERE pol.status = 'surrendered'
       GROUP BY p.id, p.name
       ORDER BY surrender_count DESC`
    );
    
    const surrenderRatio = (surrenderByProvince.reduce((sum, row) => sum + row.surrender_count, 0) / totalPolicies[0].count * 100).toFixed(2);
    
    return { surrenderRatio, surrenderByProvince, totalPolicies: totalPolicies[0].count };
  }

  // Death claim ratio
  static async getDeathClaimRatio() {
    const [totalPolicies] = await pool.query('SELECT COUNT(*) as count FROM policies');
    const [deathClaimsByProvince] = await pool.query(
      `SELECT p.name as province, COUNT(*) as death_claim_count, SUM(c.claim_amount) as total_claim_amount
       FROM claims c
       JOIN policies pol ON c.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE c.claim_type = 'death'
       GROUP BY p.id, p.name
       ORDER BY death_claim_count DESC`
    );
    
    const totalDeathClaims = deathClaimsByProvince.reduce((sum, row) => sum + row.death_claim_count, 0);
    const deathClaimRatio = (totalDeathClaims / totalPolicies[0].count * 100).toFixed(2);
    
    return { deathClaimRatio, deathClaimsByProvince, totalPolicies: totalPolicies[0].count };
  }

  // Maturing policies
  static async getMaturingPolicies() {
    const [results] = await pool.query(
      `SELECT pol.policy_number, pol.policyholder_name, p.name as province, pol.maturity_date, pol.sum_assured, pol.status
       FROM policies pol
       JOIN provinces p ON pol.province_id = p.id
       WHERE pol.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH)
       AND pol.status = 'active'
       ORDER BY pol.maturity_date ASC`
    );
    return results;
  }

  // Investment FD summary
  static async getInvestmentSummary() {
    const [totalInvestment] = await pool.query(
      'SELECT SUM(amount) as total, COUNT(*) as count FROM investments'
    );
    
    const [byType] = await pool.query(
      `SELECT investment_type, SUM(amount) as total_amount, COUNT(*) as count, AVG(interest_rate) as avg_rate
       FROM investments
       GROUP BY investment_type`
    );
    
    const [byProvince] = await pool.query(
      `SELECT p.name as province, SUM(i.amount) as total_investment, COUNT(*) as count
       FROM investments i
       JOIN policies pol ON i.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       GROUP BY p.id, p.name
       ORDER BY total_investment DESC`
    );
    
    return {
      total: totalInvestment[0],
      byType,
      byProvince
    };
  }

  // FD-specific summary
  static async getFDSummary() {
    const [fdTotal] = await pool.query(
      'SELECT SUM(amount) as total, COUNT(*) as count, AVG(interest_rate) as avg_rate FROM investments WHERE investment_type = "FD"'
    );
    
    const [fdByProvince] = await pool.query(
      `SELECT p.name as province, 
              SUM(i.amount) as total_fd_amount, 
              COUNT(*) as fd_count,
              AVG(i.interest_rate) as avg_interest_rate
       FROM investments i
       JOIN policies pol ON i.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE i.investment_type = 'FD'
       GROUP BY p.id, p.name
       ORDER BY total_fd_amount DESC`
    );
    
    const [fdMaturitySchedule] = await pool.query(
      `SELECT pol.policy_number,
              pol.policyholder_name,
              p.name as province,
              i.amount as fd_amount,
              i.interest_rate,
              i.maturity_date,
              DATEDIFF(i.maturity_date, CURDATE()) as days_to_maturity,
              pol.sum_assured as policy_sum_assured
       FROM investments i
       JOIN policies pol ON i.policy_id = pol.id
       JOIN provinces p ON pol.province_id = p.id
       WHERE i.investment_type = 'FD'
       AND i.status = 'active'
       AND i.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH)
       ORDER BY i.maturity_date ASC`
    );
    
    return {
      fdTotal: fdTotal[0],
      fdByProvince,
      fdMaturitySchedule
    };
  }

  // Maturing policies with investment details
  static async getMaturingPoliciesWithInvestments() {
    const [results] = await pool.query(
      `SELECT pol.policy_number, 
              pol.policyholder_name, 
              p.name as province, 
              pol.maturity_date as policy_maturity_date, 
              pol.sum_assured as policy_sum_assured, 
              pol.status,
              i.investment_type,
              i.amount as investment_amount,
              i.interest_rate,
              i.maturity_date as investment_maturity_date
       FROM policies pol
       JOIN provinces p ON pol.province_id = p.id
       LEFT JOIN investments i ON pol.id = i.policy_id AND i.status = 'active'
       WHERE pol.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH)
       AND pol.status = 'active'
       ORDER BY pol.maturity_date ASC`
    );
    return results;
  }
}

module.exports = AnalyticsService;
