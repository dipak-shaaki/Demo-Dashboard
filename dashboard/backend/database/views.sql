-- ============================================================================
-- Nepal Insurance Company - Production Database Views
-- Purpose: BI-Ready Views for Dashboard, Power BI, Tableau, and AI/ML
-- Company: Single Insurance Company (Life Insurance)
-- ============================================================================

USE insurance_dashboard;

-- ============================================================================
-- VIEW 1: v_premium_collection_province_wise
-- Source: premium_collections + policies + provinces
-- Used By: Dashboard Requirement #1, Executive View
-- ============================================================================
CREATE OR REPLACE VIEW v_premium_collection_province_wise AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    pc.fiscal_year,
    COUNT(DISTINCT pc.policy_id) as total_policies,
    COUNT(DISTINCT pc.id) as total_transactions,
    SUM(pc.amount) as total_premium_collected,
    AVG(pc.amount) as avg_transaction_amount,
    MIN(pc.collection_date) as first_collection_date,
    MAX(pc.collection_date) as last_collection_date,
    pc.payment_mode,
    COUNT(CASE WHEN pc.payment_mode = 'online' THEN 1 END) as online_count,
    COUNT(CASE WHEN pc.payment_mode = 'cash' THEN 1 END) as cash_count,
    COUNT(CASE WHEN pc.payment_mode = 'bank_transfer' THEN 1 END) as bank_transfer_count
FROM premium_collections pc
INNER JOIN policies pol ON pc.policy_id = pol.id
INNER JOIN provinces p ON pol.province_id = p.id
GROUP BY p.id, p.name, pc.fiscal_year, pc.payment_mode;

-- ============================================================================
-- VIEW 2: v_agent_performance_metrics
-- Source: agents + policies + premium_collections + provinces
-- Used By: Dashboard Requirement #2, #3, Sales & Agency View
-- ============================================================================
CREATE OR REPLACE VIEW v_agent_performance_metrics AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    a.agency_name,
    p.id as province_id,
    p.name as province_name,
    a.status as agent_status,
    a.join_date,
    a.last_activity_date,
    DATEDIFF(CURDATE(), a.join_date) as tenure_days,
    COUNT(DISTINCT pol.id) as total_policies_sold,
    COUNT(DISTINCT CASE WHEN pol.status = 'active' THEN pol.id END) as active_policies,
    SUM(DISTINCT a.total_premium_collected) as total_premium_collected,
    AVG(pol.premium_amount) as avg_premium_per_policy,
    SUM(pol.sum_assured) as total_sum_assured,
    COUNT(CASE WHEN pol.plan_type = 'endowment' THEN 1 END) as endowment_count,
    COUNT(CASE WHEN pol.plan_type = 'term' THEN 1 END) as term_count,
    COUNT(CASE WHEN pol.plan_type = 'money-back' THEN 1 END) as money_back_count,
    COUNT(CASE WHEN pol.plan_type = 'whole-life' THEN 1 END) as whole_life_count,
    YEAR(a.join_date) as join_year
FROM agents a
INNER JOIN provinces p ON a.province_id = p.id
LEFT JOIN policies pol ON a.id = pol.agent_id
GROUP BY a.id, a.name, a.agency_name, p.id, p.name, a.status, a.join_date, a.last_activity_date;

-- ============================================================================
-- VIEW 3: v_renewal_analysis_province_wise
-- Source: renewals + policies + provinces
-- Used By: Dashboard Requirement #4, Retention Analysis
-- ============================================================================
CREATE OR REPLACE VIEW v_renewal_analysis_province_wise AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    r.fiscal_year,
    COUNT(DISTINCT r.policy_id) as total_renewals,
    COUNT(CASE WHEN r.status = 'paid' THEN 1 END) as paid_renewals,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_renewals,
    COUNT(CASE WHEN r.status = 'lapsed' THEN 1 END) as lapsed_renewals,
    SUM(CASE WHEN r.status = 'paid' THEN r.amount ELSE 0 END) as total_renewal_amount,
    ROUND(COUNT(CASE WHEN r.status = 'paid' THEN 1 END) * 100.0 / COUNT(r.id), 2) as renewal_rate,
    YEAR(r.renewal_date) as renewal_year,
    QUARTER(r.renewal_date) as renewal_quarter
FROM renewals r
INNER JOIN policies pol ON r.policy_id = pol.id
INNER JOIN provinces p ON pol.province_id = p.id
GROUP BY p.id, p.name, r.fiscal_year, YEAR(r.renewal_date), QUARTER(r.renewal_date);

-- ============================================================================
-- VIEW 4: v_policy_lapse_loan_analysis
-- Source: policies + claims + provinces
-- Used By: Dashboard Requirement #5, Risk View
-- ============================================================================
CREATE OR REPLACE VIEW v_policy_lapse_loan_analysis AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    COUNT(DISTINCT CASE WHEN pol.status = 'lapsed' THEN pol.id END) as lapsed_policies,
    COUNT(DISTINCT CASE WHEN c.claim_type = 'loan' THEN c.id END) as policy_loans,
    SUM(CASE WHEN pol.status = 'lapsed' THEN pol.premium_amount ELSE 0 END) as premium_lost_lapse,
    SUM(CASE WHEN c.claim_type = 'loan' THEN c.claim_amount ELSE 0 END) as total_loan_amount,
    ROUND(COUNT(DISTINCT CASE WHEN pol.status = 'lapsed' THEN pol.id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT pol.id), 0), 2) as lapse_rate,
    COUNT(DISTINCT CASE WHEN pol.status = 'lapsed' AND c.claim_type = 'loan' THEN pol.id END) as lapsed_with_loan
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
LEFT JOIN claims c ON pol.id = c.policy_id AND c.claim_type = 'loan'
GROUP BY p.id, p.name;

-- ============================================================================
-- VIEW 5: v_surrender_analysis
-- Source: policies + claims + provinces
-- Used By: Dashboard Requirement #6, Risk View, AI Surrender Prediction
-- ============================================================================
CREATE OR REPLACE VIEW v_surrender_analysis AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    COUNT(DISTINCT pol.id) as total_policies,
    COUNT(DISTINCT CASE WHEN pol.status = 'surrendered' THEN pol.id END) as surrendered_policies,
    SUM(CASE WHEN pol.status = 'surrendered' THEN pol.premium_amount ELSE 0 END) as surrendered_premium,
    SUM(CASE WHEN pol.status = 'surrendered' THEN pol.sum_assured ELSE 0 END) as surrendered_sum_assured,
    ROUND(COUNT(DISTINCT CASE WHEN pol.status = 'surrendered' THEN pol.id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT pol.id), 0), 2) as surrender_ratio,
    AVG(CASE WHEN pol.status = 'surrendered' THEN DATEDIFF(pol.maturity_date, pol.issue_date) / 365.0 END) as avg_surrender_years
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
GROUP BY p.id, p.name;

-- ============================================================================
-- VIEW 6: v_death_claim_analysis
-- Source: policies + claims + provinces
-- Used By: Dashboard Requirement #7, Risk View, AI Claim Prediction
-- ============================================================================
CREATE OR REPLACE VIEW v_death_claim_analysis AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    COUNT(DISTINCT pol.id) as total_policies,
    COUNT(DISTINCT CASE WHEN c.claim_type = 'death' THEN c.id END) as death_claims,
    SUM(CASE WHEN c.claim_type = 'death' THEN c.claim_amount ELSE 0 END) as total_death_claims_amount,
    COUNT(DISTINCT CASE WHEN c.claim_type = 'death' AND c.status = 'approved' THEN c.id END) as approved_claims,
    COUNT(DISTINCT CASE WHEN c.claim_type = 'death' AND c.status = 'pending' THEN c.id END) as pending_claims,
    COUNT(DISTINCT CASE WHEN c.claim_type = 'death' AND c.status = 'rejected' THEN c.id END) as rejected_claims,
    ROUND(COUNT(DISTINCT CASE WHEN c.claim_type = 'death' THEN c.id END) * 100.0 / 
          NULLIF(COUNT(DISTINCT pol.id), 0), 2) as death_claim_ratio,
    ROUND(SUM(CASE WHEN c.claim_type = 'death' THEN c.claim_amount ELSE 0 END) * 100.0 / 
          NULLIF(SUM(pol.premium_amount), 0), 2) as claim_to_premium_ratio
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
LEFT JOIN claims c ON pol.id = c.policy_id
GROUP BY p.id, p.name;

-- ============================================================================
-- VIEW 7: v_maturing_policies_investment
-- Source: policies + investments + provinces
-- Used By: Dashboard Requirement #8, Cash Flow Planning
-- ============================================================================
CREATE OR REPLACE VIEW v_maturing_policies_investment AS
SELECT 
    p.id as province_id,
    p.name as province_name,
    COUNT(DISTINCT CASE WHEN pol.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH) THEN pol.id END) as maturing_next_12_months,
    SUM(CASE WHEN pol.maturity_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 12 MONTH) THEN pol.sum_assured ELSE 0 END) as maturity_payout_liability,
    COUNT(DISTINCT inv.id) as total_investments,
    SUM(CASE WHEN inv.investment_type = 'FD' THEN inv.amount ELSE 0 END) as fd_investments,
    SUM(CASE WHEN inv.investment_type = 'bonds' THEN inv.amount ELSE 0 END) as bond_investments,
    AVG(CASE WHEN inv.investment_type = 'FD' THEN inv.interest_rate END) as avg_fd_interest_rate,
    SUM(CASE WHEN inv.status = 'active' THEN inv.amount ELSE 0 END) as active_investment_amount
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
LEFT JOIN investments inv ON pol.id = inv.policy_id
GROUP BY p.id, p.name;

-- ============================================================================
-- VIEW 8: v_executive_kpi_summary
-- Source: Multiple tables
-- Used By: Executive View, High-level KPIs
-- ============================================================================
CREATE OR REPLACE VIEW v_executive_kpi_summary AS
SELECT 
    (SELECT COUNT(*) FROM agents WHERE status = 'active') as active_agents,
    (SELECT COUNT(*) FROM agents WHERE status = 'inactive') as inactive_agents,
    (SELECT COUNT(*) FROM agents WHERE status = 'passive') as passive_agents,
    (SELECT COUNT(*) FROM policies WHERE status = 'active') as active_policies,
    (SELECT SUM(amount) FROM premium_collections WHERE fiscal_year = '2081/82') as current_fy_premium,
    (SELECT SUM(amount) FROM premium_collections WHERE fiscal_year = '2080/81') as previous_fy_premium,
    ROUND(((SELECT SUM(amount) FROM premium_collections WHERE fiscal_year = '2081/82') - 
           (SELECT SUM(amount) FROM premium_collections WHERE fiscal_year = '2080/81')) * 100.0 / 
          NULLIF((SELECT SUM(amount) FROM premium_collections WHERE fiscal_year = '2080/81'), 0), 2) as yoy_growth_rate,
    (SELECT COUNT(*) FROM claims WHERE claim_type = 'death' AND status = 'approved') as approved_death_claims,
    (SELECT COUNT(*) FROM claims WHERE claim_type = 'death') as total_death_claims,
    (SELECT COUNT(*) FROM policies WHERE status = 'lapsed') as total_lapsed_policies,
    (SELECT COUNT(*) FROM policies WHERE status = 'surrendered') as total_surrendered_policies;

-- ============================================================================
-- VIEW 9: v_agent_status_tracking
-- Source: agents + provinces
-- Used By: Dashboard Requirement #3, Passive to Active Tracking
-- ============================================================================
CREATE OR REPLACE VIEW v_agent_status_tracking AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    p.name as province_name,
    a.status as current_status,
    a.join_date,
    a.last_activity_date,
    DATEDIFF(CURDATE(), a.last_activity_date) as days_since_last_activity,
    CASE 
        WHEN a.status = 'active' AND DATEDIFF(CURDATE(), a.last_activity_date) <= 30 THEN 'Recently Active'
        WHEN a.status = 'active' AND DATEDIFF(CURDATE(), a.last_activity_date) > 30 THEN 'Reactivated'
        WHEN a.status = 'passive' THEN 'Passive'
        WHEN a.status = 'inactive' THEN 'Inactive'
    END as activity_classification,
    a.total_premium_collected
FROM agents a
INNER JOIN provinces p ON a.province_id = p.id;

-- ============================================================================
-- VIEW 10: v_bi_export_standard
-- Source: All views
-- Used By: Power BI, Tableau, Excel Export
-- ============================================================================
CREATE OR REPLACE VIEW v_bi_export_standard AS
SELECT 
    'premium_collection' as report_type,
    province_name,
    fiscal_year,
    total_premium_collected as amount,
    total_policies as policy_count,
    NULL as claim_count,
    NULL as surrender_count,
    NULL as lapse_count,
    CURDATE() as report_date
FROM v_premium_collection_province_wise

UNION ALL

SELECT 
    'death_claims' as report_type,
    province_name,
    '2081/82' as fiscal_year,
    NULL as amount,
    total_policies as policy_count,
    death_claims as claim_count,
    NULL as surrender_count,
    NULL as lapse_count,
    CURDATE() as report_date
FROM v_death_claim_analysis

UNION ALL

SELECT 
    'surrender' as report_type,
    province_name,
    '2081/82' as fiscal_year,
    NULL as amount,
    total_policies as policy_count,
    NULL as claim_count,
    surrendered_policies as surrender_count,
    NULL as lapse_count,
    CURDATE() as report_date
FROM v_surrender_analysis;

-- ============================================================================
-- GRANT PERMISSIONS for BI Tools
-- ============================================================================
-- CREATE USER 'bi_user'@'%' IDENTIFIED BY 'secure_password';
-- GRANT SELECT ON insurance_dashboard.v_* TO 'bi_user'@'%';
-- FLUSH PRIVILEGES;
