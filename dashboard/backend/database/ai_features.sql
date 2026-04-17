-- ============================================================================
-- AI/ML Feature Engineering Views
-- Purpose: Prepare labeled datasets for Machine Learning Models
-- These views extract features needed for AI predictions
-- ============================================================================

USE insurance_dashboard;

-- ============================================================================
-- AI FEATURE VIEW 1: Claim Prediction Features
-- ML Task: Binary Classification (Will this policy result in a claim?)
-- Features: policy_age, premium_amount, sum_assured, province, plan_type, payment_history
-- Label: has_claim (0 or 1)
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_claim_prediction_features AS
SELECT 
    pol.id as policy_id,
    pol.policy_number,
    pol.plan_type,
    pol.premium_amount,
    pol.sum_assured,
    pol.status,
    p.name as province_name,
    a.name as agent_name,
    a.status as agent_status,
    DATEDIFF(CURDATE(), pol.issue_date) / 365.0 as policy_age_years,
    pol.premium_amount / NULLIF(pol.sum_assured, 0) as premium_to_sa_ratio,
    (SELECT COUNT(*) FROM premium_collections pc WHERE pc.policy_id = pol.id) as total_payments_made,
    (SELECT SUM(amount) FROM premium_collections pc WHERE pc.policy_id = pol.id) as total_amount_paid,
    (SELECT COUNT(*) FROM claims c WHERE c.policy_id = pol.id) as claim_count,
    (SELECT COUNT(*) FROM claims c WHERE c.policy_id = pol.id AND c.claim_type = 'death') as death_claim_count,
    CASE WHEN (SELECT COUNT(*) FROM claims c WHERE c.policy_id = pol.id) > 0 THEN 1 ELSE 0 END as has_claim,
    CASE WHEN (SELECT COUNT(*) FROM claims c WHERE c.policy_id = pol.id AND c.claim_type = 'death') > 0 THEN 1 ELSE 0 END as has_death_claim
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
INNER JOIN agents a ON pol.agent_id = a.id;

-- ============================================================================
-- AI FEATURE VIEW 2: Surrender Prediction Features
-- ML Task: Binary Classification (Will this policy be surrendered?)
-- Features: policy_age, premium_amount, lapse_history, loan_history, agent_performance
-- Label: is_surrendered (0 or 1)
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_surrender_prediction_features AS
SELECT 
    pol.id as policy_id,
    pol.policy_number,
    pol.plan_type,
    pol.premium_amount,
    pol.sum_assured,
    pol.status,
    p.name as province_name,
    DATEDIFF(CURDATE(), pol.issue_date) / 365.0 as policy_age_years,
    DATEDIFF(pol.maturity_date, pol.issue_date) / 365.0 as policy_term_years,
    pol.premium_amount / NULLIF(pol.sum_assured, 0) as premium_to_sa_ratio,
    
    -- Payment behavior features
    (SELECT COUNT(*) FROM premium_collections pc WHERE pc.policy_id = pol.id) as payment_count,
    (SELECT MAX(collection_date) FROM premium_collections pc WHERE pc.policy_id = pol.id) as last_payment_date,
    DATEDIFF(CURDATE(), (SELECT MAX(collection_date) FROM premium_collections pc WHERE pc.policy_id = pol.id)) as days_since_last_payment,
    
    -- Loan and lapse history
    (SELECT COUNT(*) FROM claims c WHERE c.policy_id = pol.id AND c.claim_type = 'loan') as loan_count,
    (SELECT SUM(claim_amount) FROM claims c WHERE c.policy_id = pol.id AND c.claim_type = 'loan') as total_loan_amount,
    
    -- Agent performance
    a.total_premium_collected as agent_total_premium,
    a.status as agent_status,
    DATEDIFF(CURDATE(), a.join_date) / 365.0 as agent_tenure_years,
    
    -- Label
    CASE WHEN pol.status = 'surrendered' THEN 1 ELSE 0 END as is_surrendered
FROM policies pol
INNER JOIN provinces p ON pol.province_id = p.id
INNER JOIN agents a ON pol.agent_id = a.id;

-- ============================================================================
-- AI FEATURE VIEW 3: Agent Business Prediction Features
-- ML Task: Regression (How much business will this agent generate?)
-- Features: tenure, province, past_performance, active_policies, renewal_rate
-- Target: future_premium_amount
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_agent_business_prediction AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    p.name as province_name,
    a.status,
    DATEDIFF(CURDATE(), a.join_date) / 365.0 as tenure_years,
    a.total_premium_collected as historical_premium,
    
    -- Past performance (last year)
    (SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE()) - 1) as policies_sold_last_year,
    (SELECT SUM(pol.premium_amount) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE()) - 1) as premium_last_year,
    
    -- Current year performance
    (SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE())) as policies_sold_current_year,
    (SELECT SUM(pol.premium_amount) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE())) as premium_current_year,
    
    -- Portfolio quality
    (SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id AND pol.status = 'active') as active_policies,
    (SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id) as total_policies,
    ROUND((SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id AND pol.status = 'active') * 100.0 / 
          NULLIF((SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id), 0), 2) as active_policy_ratio,
    
    -- Target variable (next year premium - to be predicted)
    (SELECT SUM(pc.amount) FROM premium_collections pc 
     INNER JOIN policies pol ON pc.policy_id = pol.id 
     WHERE pol.agent_id = a.id AND pc.fiscal_year = '2081/82') as current_fy_premium
FROM agents a
INNER JOIN provinces p ON a.province_id = p.id
WHERE a.status = 'active';

-- ============================================================================
-- AI FEATURE VIEW 4: Renewal Prediction Features
-- ML Task: Time Series Forecasting (How many policies will renew?)
-- Features: historical_renewals, seasonality, province, plan_type
-- Target: renewal_count_next_period
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_renewal_prediction_features AS
SELECT 
    p.name as province_name,
    pol.plan_type,
    r.fiscal_year,
    YEAR(r.renewal_date) as renewal_year,
    QUARTER(r.renewal_date) as renewal_quarter,
    MONTH(r.renewal_date) as renewal_month,
    
    -- Historical counts
    COUNT(DISTINCT r.policy_id) as total_renewals_in_period,
    COUNT(CASE WHEN r.status = 'paid' THEN 1 END) as paid_renewals,
    COUNT(CASE WHEN r.status = 'lapsed' THEN 1 END) as lapsed_renewals,
    
    -- Financial metrics
    SUM(CASE WHEN r.status = 'paid' THEN r.amount ELSE 0 END) as renewal_amount,
    AVG(CASE WHEN r.status = 'paid' THEN r.amount END) as avg_renewal_amount,
    
    -- Renewal rate
    ROUND(COUNT(CASE WHEN r.status = 'paid' THEN 1 END) * 100.0 / COUNT(r.id), 2) as renewal_rate
FROM renewals r
INNER JOIN policies pol ON r.policy_id = pol.id
INNER JOIN provinces p ON pol.province_id = p.id
GROUP BY p.name, pol.plan_type, r.fiscal_year, YEAR(r.renewal_date), QUARTER(r.renewal_date), MONTH(r.renewal_date)
ORDER BY renewal_year, renewal_month;

-- ============================================================================
-- AI FEATURE VIEW 5: Premium Collection Pattern Features
-- ML Task: Time Series + Cluster Analysis
-- Features: collection_by_month, plan_type_distribution, province_patterns
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_premium_pattern_features AS
SELECT 
    p.name as province_name,
    pol.plan_type,
    pc.fiscal_year,
    YEAR(pc.collection_date) as collection_year,
    MONTH(pc.collection_date) as collection_month,
    QUARTER(pc.collection_date) as collection_quarter,
    
    -- Collection metrics
    COUNT(DISTINCT pc.policy_id) as policies_paid,
    COUNT(pc.id) as transaction_count,
    SUM(pc.amount) as total_collected,
    AVG(pc.amount) as avg_transaction,
    MIN(pc.amount) as min_transaction,
    MAX(pc.amount) as max_transaction,
    
    -- Payment mode distribution
    COUNT(CASE WHEN pc.payment_mode = 'online' THEN 1 END) as online_transactions,
    COUNT(CASE WHEN pc.payment_mode = 'cash' THEN 1 END) as cash_transactions,
    COUNT(CASE WHEN pc.payment_mode = 'bank_transfer' THEN 1 END) as bank_transactions
FROM premium_collections pc
INNER JOIN policies pol ON pc.policy_id = pol.id
INNER JOIN provinces p ON pol.province_id = p.id
GROUP BY p.name, pol.plan_type, pc.fiscal_year, YEAR(pc.collection_date), MONTH(pc.collection_date), QUARTER(pc.collection_date)
ORDER BY collection_year, collection_month;

-- ============================================================================
-- AI FEATURE VIEW 6: Agent Growth Potential Scoring
-- ML Task: Clustering + Propensity Scoring
-- Features: consistency, growth_trend, retention_rate, province
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_agent_growth_potential AS
SELECT 
    a.id as agent_id,
    a.name as agent_name,
    p.name as province_name,
    a.status,
    DATEDIFF(CURDATE(), a.join_date) / 365.0 as tenure_years,
    
    -- Consistency metrics
    (SELECT COUNT(DISTINCT YEAR(pol.issue_date)) FROM policies pol WHERE pol.agent_id = a.id) as active_years,
    (SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id) as total_policies_sold,
    (SELECT SUM(pol.premium_amount) FROM policies pol WHERE pol.agent_id = a.id) as total_premium,
    
    -- Growth trend (current year vs last year)
    (SELECT COUNT(*) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE())) as current_year_policies,
    (SELECT COUNT(*) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE()) - 1) as last_year_policies,
    
    -- Portfolio quality
    ROUND((SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id AND pol.status = 'active') * 100.0 / 
          NULLIF((SELECT COUNT(DISTINCT pol.id) FROM policies pol WHERE pol.agent_id = a.id), 0), 2) as retention_rate,
    
    -- Agent scoring features
    a.total_premium_collected,
    DATEDIFF(CURDATE(), a.last_activity_date) as days_since_activity,
    
    -- Growth potential score (simple heuristic, ML will improve this)
    CASE 
        WHEN (SELECT COUNT(*) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE())) > 
             (SELECT COUNT(*) FROM policies pol WHERE pol.agent_id = a.id AND YEAR(pol.issue_date) = YEAR(CURDATE()) - 1)
        THEN 'Growing'
        ELSE 'Declining'
    END as growth_trend
FROM agents a
INNER JOIN provinces p ON a.province_id = p.id
WHERE a.status IN ('active', 'passive');

-- ============================================================================
-- AI FEATURE VIEW 7: Investment Analysis Features
-- ML Task: Optimization + Forecasting
-- Features: investment_maturity_schedule, interest_rates, payout_obligations
-- ============================================================================
CREATE OR REPLACE VIEW v_ai_investment_analysis AS
SELECT 
    inv.investment_type,
    inv.status,
    p.name as province_name,
    
    -- Investment details
    inv.amount as investment_amount,
    inv.interest_rate,
    inv.start_date,
    inv.maturity_date,
    DATEDIFF(inv.maturity_date, inv.start_date) / 365.0 as investment_term_years,
    
    -- Maturity schedule
    YEAR(inv.maturity_date) as maturity_year,
    QUARTER(inv.maturity_date) as maturity_quarter,
    MONTH(inv.maturity_date) as maturity_month,
    
    -- Expected returns
    inv.amount * (inv.interest_rate / 100.0) * (DATEDIFF(inv.maturity_date, inv.start_date) / 365.0) as expected_return,
    inv.amount + (inv.amount * (inv.interest_rate / 100.0) * (DATEDIFF(inv.maturity_date, inv.start_date) / 365.0)) as maturity_value,
    
    -- Payout obligations (maturing policies in same period)
    (SELECT COUNT(*) FROM policies pol 
     WHERE pol.maturity_date BETWEEN inv.start_date AND inv.maturity_date 
     AND pol.province_id = (SELECT province_id FROM policies WHERE id = inv.policy_id)) as maturing_policies_in_period,
    (SELECT SUM(pol.sum_assured) FROM policies pol 
     WHERE pol.maturity_date BETWEEN inv.start_date AND inv.maturity_date 
     AND pol.province_id = (SELECT province_id FROM policies WHERE id = inv.policy_id)) as total_payout_obligation
FROM investments inv
LEFT JOIN policies pol ON inv.policy_id = pol.id
LEFT JOIN provinces p ON pol.province_id = p.id
WHERE inv.policy_id IS NOT NULL;
