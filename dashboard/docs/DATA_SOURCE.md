# Data Source Documentation

## 📊 Where Dashboard Data Comes From

This document explains **exactly** where each metric, chart, and table in the dashboard gets its data from.

---

## 🏗️ Data Flow Architecture

```
MySQL Database (Raw Tables)
    ↓
SQL Views (Aggregated & Transformed Data)
    ↓
Backend API (Business Logic & Filtering)
    ↓
Frontend Dashboard (Visualization)
    ↓
Future: Power BI / Tableau (Direct View Access)
Future: AI/ML Models (Feature Views)
```

---

## 📋 Source Tables → Dashboard Mapping

### 1. **Premium Collection Province-wise**
- **Dashboard Page**: Premium Collection, Executive View
- **Source Tables**: `premium_collections` + `policies` + `provinces`
- **SQL View**: `v_premium_collection_province_wise`
- **API Endpoint**: `GET /api/premium/current-fy`
- **Data Path**:
  ```
  premium_collections.amount → SUM() grouped by province → Bar Chart
  ```

### 2. **Agency Growth Rate + Top 20 Agents**
- **Dashboard Page**: Agency Analytics, Sales & Agency View
- **Source Tables**: `agents` + `policies` + `premium_collections` + `provinces`
- **SQL View**: `v_agent_performance_metrics`
- **API Endpoints**: 
  - `GET /api/agents/growth-rate`
  - `GET /api/agents/top-20`
- **Data Path**:
  ```
  agents.join_date → COUNT() by year → Growth Rate Calculation
  premium_collections.amount → SUM() by agent → Top 20 Ranking
  ```

### 3. **Total Agents (Active/Inactive/Passive)**
- **Dashboard Page**: Agency Analytics (Status Tab)
- **Source Tables**: `agents` + `provinces`
- **SQL View**: `v_agent_status_tracking`
- **API Endpoint**: `GET /api/agents/status-list?status=active`
- **Data Path**:
  ```
  agents.status → Filter & Count → Agent Lists
  agents.last_activity_date → Days calculation → Activity Classification
  ```

### 4. **Renewal Collection Year-wise**
- **Dashboard Page**: Renewal Tracking
- **Source Tables**: `renewals` + `policies` + `provinces`
- **SQL View**: `v_renewal_analysis_province_wise`
- **API Endpoint**: `GET /api/renewals/yearly-comparison`
- **Data Path**:
  ```
  renewals.amount + renewals.status → SUM() + COUNT() by province & year → Comparison Chart
  ```

### 5. **Policy Lapse/Loan Details**
- **Dashboard Page**: Policy Analysis (Lapse Tab), Risk View
- **Source Tables**: `policies` + `claims` + `provinces`
- **SQL View**: `v_policy_lapse_loan_analysis`
- **API Endpoint**: `GET /api/policies/lapse-loan`
- **Data Path**:
  ```
  policies.status = 'lapsed' → COUNT() + SUM(premium_amount) → Lapse Table
  claims.claim_type = 'loan' → COUNT() + SUM(claim_amount) → Loan Table
  ```

### 6. **Surrender Ratio & Policies**
- **Dashboard Page**: Policy Analysis (Surrender Tab), Risk View
- **Source Tables**: `policies` + `provinces`
- **SQL View**: `v_surrender_analysis`
- **API Endpoint**: `GET /api/policies/surrender`
- **Data Path**:
  ```
  policies.status = 'surrendered' → COUNT() / COUNT(total) → Surrender Ratio %
  ```

### 7. **Death Claim Ratio & Policies**
- **Dashboard Page**: Claims Management, Risk View
- **Source Tables**: `policies` + `claims` + `provinces`
- **SQL View**: `v_death_claim_analysis`
- **API Endpoints**: 
  - `GET /api/claims/death-claim-ratio`
  - `GET /api/claims/details`
- **Data Path**:
  ```
  claims.claim_type = 'death' → COUNT() / COUNT(policies) → Claim Ratio %
  claims.status → Approved/Pending/Rejected breakdown
  ```

### 8. **Maturing Policies & Investment FD**
- **Dashboard Page**: Investments, Policy Analysis (Maturing Tab)
- **Source Tables**: `policies` + `investments` + `provinces`
- **SQL View**: `v_maturing_policies_investment`
- **API Endpoints**:
  - `GET /api/policies/maturing`
  - `GET /api/investments/fd-summary`
- **Data Path**:
  ```
  policies.maturity_date → Filter next 12 months → Maturing List
  investments.investment_type = 'FD' → SUM(amount) + AVG(interest_rate) → FD Summary
  ```

---

## 🤖 AI/ML Data Sources

### AI Feature Views (Ready for ML Models)

#### 1. **Claim Probability** 
- **View**: `v_ai_claim_prediction_features`
- **Features**: policy_age, premium_amount, sum_assured, province, plan_type, payment_history
- **Label**: `has_claim` (0 or 1)
- **ML Task**: Binary Classification

#### 2. **Surrender Probability**
- **View**: `v_ai_surrender_prediction_features`
- **Features**: policy_age, payment_behavior, loan_history, agent_performance
- **Label**: `is_surrendered` (0 or 1)
- **ML Task**: Binary Classification (Churn Prediction)

#### 3. **Agent Business Prediction**
- **View**: `v_ai_agent_business_prediction`
- **Features**: tenure, past_performance, active_policies, renewal_rate
- **Target**: `current_fy_premium`
- **ML Task**: Regression

#### 4. **Renewal Prediction**
- **View**: `v_ai_renewal_prediction_features`
- **Features**: historical_renewals, seasonality, province, plan_type
- **Target**: `renewal_count_next_period`
- **ML Task**: Time Series Forecasting

#### 5. **Premium Collection Patterns**
- **View**: `v_ai_premium_pattern_features`
- **Features**: monthly_collections, plan_type_distribution, payment_modes
- **ML Task**: Time Series + Cluster Analysis

#### 6. **Agent Growth Potential**
- **View**: `v_ai_agent_growth_potential`
- **Features**: consistency, growth_trend, retention_rate
- **ML Task**: Clustering + Propensity Scoring

#### 7. **Investment Analysis**
- **View**: `v_ai_investment_analysis`
- **Features**: maturity_schedule, interest_rates, payout_obligations
- **ML Task**: Optimization + Forecasting

---

## 🔌 Power BI / Tableau Integration

### Direct Database Connection
Power BI and Tableau can connect **directly to SQL views** without going through the API:

```
Power BI / Tableau
    ↓ Direct Connection
MySQL Views (v_*)
    ↓
Raw Tables
```

### BI User Setup
```sql
-- Create dedicated BI user (read-only)
CREATE USER 'bi_user'@'%' IDENTIFIED BY 'secure_password';

-- Grant access to all views
GRANT SELECT ON insurance_dashboard.v_* TO 'bi_user'@'%';

-- No access to raw tables or write operations
FLUSH PRIVILEGES;
```

### Standard Export View
- **View**: `v_bi_export_standard`
- **Purpose**: Unified format for all BI tools
- **Contains**: All metrics in single standardized format

---

## 📊 Executive View Data Sources

### KPIs (Top Cards)
| KPI | Source View | Calculation |
|-----|------------|-------------|
| Total Premium (FY 2081/82) | `v_executive_kpi_summary` | `SUM(premium_collections.amount)` |
| Active Agents | `v_executive_kpi_summary` | `COUNT(agents) WHERE status='active'` |
| Active Policies | `v_executive_kpi_summary` | `COUNT(policies) WHERE status='active'` |
| Claims Approval Ratio | `v_executive_kpi_summary` | `approved_claims / total_claims * 100` |
| YoY Growth Rate | `v_executive_kpi_summary` | `(current_fy - previous_fy) / previous_fy * 100` |

### Province Heatmap
- **Source**: `v_premium_collection_province_wise`
- **Metric**: `total_premium_collected` by `province_name`

---

## 📈 Sales & Agency View Data Sources

### Top 20 Agents
- **Source**: `v_agent_performance_metrics`
- **Ranking**: By `total_premium_collected` (descending)
- **Additional Metrics**: Retention rate, active policies count

### Passive to Active Funnel
- **Source**: `v_agent_status_tracking`
- **Logic**: `status='active' AND days_since_last_activity <= 30`

---

## ⚠️ Risk View Data Sources

### Lapse/Loan Watch
- **Source**: `v_policy_lapse_loan_analysis`
- **Alert Triggers**:
  - Lapse rate > 10%
  - Loan count increasing month-over-month

### Surrender Risk
- **Source**: `v_surrender_analysis`
- **Alert**: Surrender ratio > industry benchmark

### Death Claim Exposure
- **Source**: `v_death_claim_analysis`
- **Metric**: `claim_to_premium_ratio`

---

## 🔄 Data Update Frequency

| Component | Update Frequency | Method |
|-----------|-----------------|--------|
| Raw Tables | Real-time (transactions) | Application writes |
| SQL Views | Real-time (computed on query) | Database engine |
| API Cache | 5-15 minutes | Redis (future) |
| Dashboard | Auto-refresh every 5 min | Frontend polling |
| AI Models | Daily/Weekly batch | ML pipeline |

---

## 🎯 Data Quality Checks

### Province Data Integrity
```sql
-- Ensure all policies have valid province
SELECT COUNT(*) FROM policies WHERE province_id IS NULL;

-- Ensure all agents have valid province
SELECT COUNT(*) FROM agents WHERE province_id IS NULL;
```

### Payment Consistency
```sql
-- Check for negative amounts
SELECT COUNT(*) FROM premium_collections WHERE amount < 0;

-- Check for future dates
SELECT COUNT(*) FROM premium_collections WHERE collection_date > CURDATE();
```

---

## 📝 Notes for Developers

1. **All dashboard data comes from SQL views**, not direct table queries
2. **Views are the single source of truth** - if metrics need changing, update the view
3. **API layer adds business logic** (filters, date ranges, formatting)
4. **Frontend only visualizes** - no calculations on client side
5. **BI tools connect to views directly** - bypass API for better performance
6. **AI models use feature views** - pre-engineered datasets ready for training

---

**Last Updated**: 2024-11-15  
**Maintained By**: Data Engineering Team
