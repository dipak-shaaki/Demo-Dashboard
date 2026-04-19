# 🏔️ Complete Understanding Guide - Nepal Insurance Analytics Dashboard

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [How Data is Generated](#how-data-is-generated)
3. [Database Architecture](#database-architecture)
4. [How Dashboard Shows Data](#how-dashboard-shows-data)
5. [AI/ML Features](#aiml-features)
6. [Complete Data Flow](#complete-data-flow)
7. [Technology Stack](#technology-stack)
8. [Business Logic Explained](#business-logic-explained)

---

## 🎯 Project Overview

This is a **production-grade analytics dashboard** built for a life insurance company operating in Nepal. It provides **real-time business intelligence** with three main views:

- **Executive View**: High-level KPIs and company performance
- **Sales & Agency View**: Agent performance and growth tracking
- **Risk View**: Early warning system for business risks

### Key Numbers
- **33,857** mock records generated
- **7** dashboard pages
- **17** REST API endpoints
- **10** BI-ready SQL views
- **7** AI/ML feature views
- **550** agents across 7 provinces
- **5,500** insurance policies
- **15,000** premium collection transactions

---

## 🔢 How Data is Generated

### Mock Data Generator: `seed.js`

The file `/backend/database/seed.js` is responsible for generating all the mock data. Here's how it works:

#### Step-by-Step Data Generation:

**1. Provinces (7 records)**
```javascript
const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim'];
```
- Simply inserts the 7 provinces of Nepal

**2. Agents (550 records)**
```javascript
for (let i = 0; i < 550; i++) {
  // Uses Nepali names from predefined list
  // Randomly assigns province, agency, join date
  // Status distribution: 60% active, 20% inactive, 20% passive
  // Premium collected: Random between NPR 50,000 - 5,000,000
}
```

**3. Policies (5,500 records)**
```javascript
for (let i = 0; i < 5500; i++) {
  // Plan types: term, endowment, money-back, whole-life
  // Premium: NPR 10,000 - 500,000
  // Sum Assured: NPR 500,000 - 10,000,000
  // Status: 50% active, 12.5% each for lapsed/surrendered/matured/claim
  // Policy term: 5-25 years
}
```

**4. Premium Collections (15,000 records)**
```javascript
for (let i = 0; i < 15000; i++) {
  // Links to random policy
  // Dates: July 2023 - October 2024
  // Fiscal Year: Auto-calculated based on date (Nepali FY starts mid-July)
  // Amount: NPR 5,000 - 250,000
  // Payment mode: cash, cheque, bank_transfer, online
}
```

**5. Claims (800 records)**
```javascript
for (let i = 0; i < 800; i++) {
  // Types: death, maturity, surrender, loan (25% each)
  // Status: 20% pending, 60% approved, 20% rejected
  // Amount: NPR 200,000 - 8,000,000
}
```

**6. Renewals (10,000 records)**
```javascript
for (let i = 0; i < 10000; i++) {
  // Status: 60% paid, 20% pending, 20% lapsed
  // Fiscal Years: 2079/80, 2080/81, 2081/82
  // Amount: NPR 10,000 - 500,000
}
```

**7. Investments (2,000 records)**
```javascript
for (let i = 0; i < 2000; i++) {
  // Types: 60% FD, 20% bonds, 20% others
  // Interest rate: 6% - 12%
  // Duration: 1-5 years
  // Status: 50% active, 25% matured, 25% withdrawn
}
```

### Helper Functions Used:
```javascript
randomInt(min, max)        // Random integer between min and max
randomFloat(min, max)      // Random decimal with 2 decimal places
randomDate(start, end)     // Random date within range
formatDate(date)           // Converts to YYYY-MM-DD format
```

---

## 🗄️ Database Architecture

### 7 Core Tables

```
provinces (1:N) → agents (1:N) → policies (1:N) → premium_collections
                                                → claims
                                                → renewals
                                                → investments
```

#### Table Relationships:

1. **provinces** (7 rows)
   - `id` (Primary Key)
   - `name`

2. **agents** (550 rows)
   - `id` (PK)
   - `province_id` (FK → provinces)
   - `name`, `agency_name`, `join_date`, `status`, `total_premium_collected`

3. **policies** (5,500 rows)
   - `id` (PK)
   - `agent_id` (FK → agents)
   - `province_id` (FK → provinces)
   - `policy_number`, `plan_type`, `premium_amount`, `sum_assured`, `status`

4. **premium_collections** (15,000 rows)
   - `id` (PK)
   - `policy_id` (FK → policies)
   - `collection_date`, `amount`, `fiscal_year`, `payment_mode`

5. **claims** (800 rows)
   - `id` (PK)
   - `policy_id` (FK → policies)
   - `claim_type`, `claim_date`, `claim_amount`, `status`

6. **renewals** (10,000 rows)
   - `id` (PK)
   - `policy_id` (FK → policies)
   - `renewal_date`, `amount`, `fiscal_year`, `status`

7. **investments** (2,000 rows)
   - `id` (PK)
   - `policy_id` (FK → policies, nullable)
   - `investment_type`, `amount`, `interest_rate`, `start_date`, `maturity_date`

### 10 BI-Ready Views

These views aggregate raw data into business metrics:

| View Name | Purpose | Data Source |
|-----------|---------|-------------|
| `v_premium_collection_province_wise` | Revenue by province | premium_collections + policies + provinces |
| `v_agent_performance_metrics` | Agent analytics | agents + policies + premium_collections |
| `v_renewal_analysis_province_wise` | Retention metrics | renewals + policies + provinces |
| `v_policy_lapse_loan_analysis` | Risk indicators | policies + claims + provinces |
| `v_surrender_analysis` | Churn analysis | policies + claims + provinces |
| `v_death_claim_analysis` | Claim exposure | policies + claims + provinces |
| `v_maturing_policies_investment` | Cash flow planning | policies + investments + provinces |
| `v_executive_kpi_summary` | High-level KPIs | Multiple tables |
| `v_agent_status_tracking` | Workforce health | agents + provinces |
| `v_bi_export_standard` | Unified export format | All views (UNION ALL) |

### 7 AI/ML Feature Views

These views prepare labeled datasets for machine learning:

| AI View | ML Task | Features | Label |
|---------|---------|----------|-------|
| `v_ai_claim_prediction_features` | Binary Classification | policy_age, premium_amount, payment_history | has_claim (0/1) |
| `v_ai_surrender_prediction_features` | Churn Prediction | policy_age, loan_history, agent_performance | is_surrendered (0/1) |
| `v_ai_agent_business_prediction` | Regression | tenure, past_performance, active_policies | future_premium_amount |
| `v_ai_renewal_prediction_features` | Time Series | historical_renewals, seasonality | renewal_count_next_period |
| `v_ai_premium_pattern_features` | Cluster Analysis | collection_by_month, payment_modes | Patterns |
| `v_ai_agent_growth_potential` | Clustering | consistency, growth_trend, retention_rate | growth_trend |
| `v_ai_investment_analysis` | Forecasting | maturity_schedule, interest_rates | optimization |

---

## 📊 How Dashboard Shows Data

### Complete Request-Response Flow:

```
User Action (Browser)
    ↓
React Component (Frontend)
    ↓
API Service (axios call)
    ↓
Express Route (Backend)
    ↓
AnalyticsService (Business Logic)
    ↓
MySQL Query (Database)
    ↓
JSON Response
    ↓
React State Update
    ↓
Chart/Table Render
```

### Example: Loading Dashboard Overview

**Step 1: User opens http://localhost:3000**

**Step 2: React Component Mounts** (`Overview.jsx`)
```javascript
useEffect(() => {
  const fetchData = async () => {
    const [summaryRes, premiumRes] = await Promise.all([
      dashboardAPI.getSummary(),           // GET /api/dashboard/summary
      dashboardAPI.getPremiumByProvince(), // GET /api/dashboard/premium-by-province
    ]);
    setSummary(summaryRes.data);
    setPremiumData(premiumRes.data);
  };
  fetchData();
}, []);
```

**Step 3: API Service Call** (`api.js`)
```javascript
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getPremiumByProvince: (fiscalYear) => 
    api.get('/dashboard/premium-by-province', { params: { fiscalYear } }),
};
```

**Step 4: Express Route Handler** (`routes/dashboard.js`)
```javascript
router.get('/summary', async (req, res) => {
  const summary = await AnalyticsService.getDashboardSummary();
  res.json(summary);
});
```

**Step 5: Analytics Service** (`services/analyticsService.js`)
```javascript
static async getDashboardSummary() {
  // Query 1: Total premium for current fiscal year
  const [totalPremium] = await pool.query(
    'SELECT SUM(amount) as total FROM premium_collections WHERE fiscal_year = "2081/82"'
  );
  
  // Query 2: Count active agents
  const [activeAgents] = await pool.query(
    'SELECT COUNT(*) as count FROM agents WHERE status = "active"'
  );
  
  // Query 3: Count active policies
  const [totalPolicies] = await pool.query(
    'SELECT COUNT(*) as count FROM policies WHERE status = "active"'
  );
  
  // Query 4: Claims approval ratio
  const [claimsRatio] = await pool.query(
    'SELECT (COUNT(CASE WHEN status = "approved" THEN 1 END) * 100.0 / COUNT(*)) as ratio FROM claims'
  );
  
  return {
    totalPremium: totalPremium[0].total || 0,
    activeAgents: activeAgents[0].count || 0,
    totalPolicies: totalPolicies[0].count || 0,
    claimsRatio: claimsRatio[0].ratio || 0
  };
}
```

**Step 6: MySQL Database Executes Queries**
```sql
SELECT SUM(amount) as total FROM premium_collections WHERE fiscal_year = '2081/82';
-- Returns: 2,500,000,000 (example)

SELECT COUNT(*) as count FROM agents WHERE status = 'active';
-- Returns: 330

SELECT COUNT(*) as count FROM policies WHERE status = 'active';
-- Returns: 2,750

SELECT (COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*)) as ratio FROM claims;
-- Returns: 75.5 (75.5% approval rate)
```

**Step 7: JSON Response Sent to Frontend**
```json
{
  "totalPremium": 2500000000,
  "activeAgents": 330,
  "totalPolicies": 2750,
  "claimsRatio": 75.5
}
```

**Step 8: React Updates State**
```javascript
setSummary(summaryRes.data); // Updates React state
```

**Step 9: Components Re-render with Data**
```javascript
<KPICard
  title="Total Premium Collection"
  value={formatCurrency(summary?.totalPremium || 0)}
  // Displays: "NPR 25.00 Crore"
/>
```

### Data Visualization Flow:

**Charts** (using Recharts library):
```javascript
<DataChart
  type="bar"
  data={premiumData}        // Array of province data
  xKey="province"           // X-axis: Province names
  yKeys={['total_premium']} // Y-axis: Premium amounts
  title="Premium Collection by Province"
/>
```

**Tables** (with search, sort, pagination):
```javascript
<DataTable
  data={agentList}
  columns={['name', 'province', 'premium_collected', 'status']}
  searchable={true}
  sortable={true}
  paginated={true}
/>
```

---

## 🤖 AI/ML Features

### Current Status: **READY BUT NOT ACTIVE**

The AI features are **prepared but not yet implemented**. Here's what exists:

#### 1. Feature Engineering Views (✅ Complete)

All 7 AI feature views are created in the database (`ai_features.sql`). These views:
- Extract relevant features from raw data
- Create labeled datasets (0/1 for classification, continuous for regression)
- Aggregate historical patterns
- Calculate derived metrics

**Example: Claim Prediction Features**
```sql
CREATE VIEW v_ai_claim_prediction_features AS
SELECT 
    pol.id as policy_id,
    pol.plan_type,
    pol.premium_amount,
    pol.sum_assured,
    DATEDIFF(CURDATE(), pol.issue_date) / 365.0 as policy_age_years,
    (SELECT COUNT(*) FROM premium_collections WHERE policy_id = pol.id) as total_payments_made,
    CASE WHEN (SELECT COUNT(*) FROM claims WHERE policy_id = pol.id) > 0 THEN 1 ELSE 0 END as has_claim
FROM policies pol;
```

This creates a dataset like:
```
policy_id | plan_type | premium | sum_assured | age_years | payments | has_claim
----------|-----------|---------|-------------|-----------|----------|----------
1001      | endowment | 50000   | 2000000     | 3.5       | 7        | 0
1002      | term      | 30000   | 5000000     | 5.2       | 10       | 1
1003      | money-back| 40000   | 3000000     | 2.1       | 4        | 0
```

#### 2. ML Integration Points (⏳ Placeholders)

The architecture supports ML integration but models are not yet trained:

**What's Ready:**
- ✅ Feature views in database
- ✅ Labeled datasets (historical data with outcomes)
- ✅ API route placeholders
- ✅ Documentation for ML pipeline

**What Needs to be Built:**
- ⏳ Python ML service (Flask/FastAPI)
- ⏳ Model training scripts
- ⏳ Model deployment infrastructure
- ⏳ Frontend display of predictions

#### 3. Future AI Implementation Steps:

**Step 1: Export Features to Python**
```python
import pandas as pd
import mysql.connector

# Connect to database
conn = mysql.connector.connect(
    host='localhost',
    user='ml_user',
    password='password',
    database='insurance_dashboard'
)

# Load features
query = "SELECT * FROM v_ai_claim_prediction_features"
df = pd.read_sql(query, conn)
```

**Step 2: Train ML Model**
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Prepare data
X = df[['policy_age_years', 'premium_amount', 'sum_assured', 'total_payments_made']]
y = df['has_claim']

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

# Save model
import joblib
joblib.dump(model, 'claim_prediction_model.pkl')
```

**Step 3: Create Prediction API**
```python
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)
model = joblib.load('claim_prediction_model.pkl')

@app.route('/predict/claim', methods=['POST'])
def predict_claim():
    data = request.json
    prediction = model.predict([[
        data['policy_age_years'],
        data['premium_amount'],
        data['sum_assured'],
        data['total_payments_made']
    ]])
    return jsonify({'claim_probability': float(prediction[0])})
```

**Step 4: Display in Dashboard**
```javascript
// In React component
const prediction = await fetch('http://localhost:5001/predict/claim', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(policyData)
});

const { claim_probability } = await prediction.json();
// Display: "Claim Risk: 75%"
```

### 7 AI Use Cases Prepared:

1. **Claim Probability Prediction** (Binary Classification)
   - Predicts if a policy will result in a claim
   - Features: policy age, premium, sum assured, payment history
   - Label: has_claim (0 or 1)

2. **Surrender Prediction** (Churn Prediction)
   - Predicts if a policy will be surrendered
   - Features: policy age, loan history, agent performance
   - Label: is_surrendered (0 or 1)

3. **Agent Business Forecast** (Regression)
   - Predicts future premium collection by agent
   - Features: tenure, past performance, active policies
   - Target: future_premium_amount

4. **Renewal Prediction** (Time Series)
   - Forecasts renewal counts by period
   - Features: historical renewals, seasonality, province
   - Target: renewal_count_next_period

5. **Agent Growth Potential** (Clustering)
   - Groups agents by growth potential
   - Features: consistency, growth trend, retention rate
   - Output: agent clusters (high/medium/low potential)

6. **Premium Pattern Analysis** (Cluster Analysis)
   - Identifies collection patterns
   - Features: monthly collections, payment modes, plan types
   - Output: seasonal patterns, payment preferences

7. **Investment Optimization** (Forecasting)
   - Optimizes investment strategy
   - Features: maturity schedule, interest rates, payout obligations
   - Output: optimal investment allocation

---

## 🔄 Complete Data Flow

### End-to-End Example: Premium Collection Page

**1. User Action**
- User clicks "Premium Collection" in navigation

**2. Frontend Routing**
```javascript
// App.jsx
<Route path="/premium" element={<PremiumCollection />} />
```

**3. Component Mounts**
```javascript
// PremiumCollection.jsx
useEffect(() => {
  const fetchData = async () => {
    const data = await premiumAPI.getCurrentFY();
    setPremiumData(data);
  };
  fetchData();
}, []);
```

**4. API Call**
```javascript
// api.js
getCurrentFY: () => api.get('/premium/current-fy')
```

**5. Backend Route**
```javascript
// routes/premium.js
router.get('/current-fy', async (req, res) => {
  const data = await AnalyticsService.getPremiumByProvince('2081/82');
  res.json(data);
});
```

**6. Service Layer**
```javascript
// analyticsService.js
static async getPremiumByProvince(fiscalYear = '2081/82') {
  const [results] = await pool.query(
    `SELECT p.name as province, SUM(pc.amount) as total_premium
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
```

**7. Database Query**
```sql
SELECT p.name as province, SUM(pc.amount) as total_premium
FROM premium_collections pc
JOIN policies pol ON pc.policy_id = pol.id
JOIN provinces p ON pol.province_id = p.id
WHERE pc.fiscal_year = '2081/82'
GROUP BY p.id, p.name
ORDER BY total_premium DESC;
```

**8. Query Result**
```
province    | total_premium
------------|--------------
Bagmati     | 850,000,000
Lumbini     | 620,000,000
Gandaki     | 480,000,000
Koshi       | 350,000,000
Madhesh     | 280,000,000
Sudurpashchim| 180,000,000
Karnali     | 120,000,000
```

**9. JSON Response**
```json
[
  {"province": "Bagmati", "total_premium": 850000000},
  {"province": "Lumbini", "total_premium": 620000000},
  {"province": "Gandaki", "total_premium": 480000000},
  ...
]
```

**10. Frontend Display**
```javascript
<DataChart
  type="bar"
  data={premiumData}
  xKey="province"
  yKeys={['total_premium']}
  title="Premium Collection by Province (NPR)"
/>
```

**11. User Sees**
- Bar chart showing premium collection by province
- Bagmati province has highest bar (NPR 8.50 Crore)
- Karnali province has lowest bar (NPR 1.20 Crore)

---

## 🛠️ Technology Stack

### Frontend (User Interface)
- **React 18**: Component-based UI framework
- **Vite 5**: Fast build tool and dev server
- **Recharts 2.10**: Charting library for data visualization
- **Axios 1.6**: HTTP client for API calls
- **React Router 6.21**: Client-side routing
- **Lucide React**: Icon library

### Backend (API Server)
- **Node.js 16+**: JavaScript runtime
- **Express.js 4.18**: Web framework
- **MySQL2 3.6**: Database driver with connection pooling
- **Dotenv 16.3**: Environment variable management

### Database
- **MySQL 5.7+**: Relational database
- **7 Tables**: Core data storage
- **10 Views**: Business logic aggregation
- **7 AI Views**: ML feature engineering
- **Indexes**: Performance optimization

### Future Technologies
- **Python 3.9+**: For ML model training
- **scikit-learn**: Machine learning library
- **Flask/FastAPI**: ML prediction API
- **Redis**: Caching layer
- **Docker**: Containerization

---

## 💼 Business Logic Explained

### Key Metrics Calculations:

**1. Year-over-Year Growth Rate**
```sql
ROUND(((Current FY Premium - Previous FY Premium) / Previous FY Premium) * 100, 2)
```
Example: ((2.5B - 2.2B) / 2.2B) * 100 = 13.64% growth

**2. Renewal Rate**
```sql
(Paid Renewals / Total Renewals) * 100
```
Example: (6,000 / 10,000) * 100 = 60% renewal rate

**3. Claims Approval Ratio**
```sql
(Approved Claims / Total Claims) * 100
```
Example: (480 / 800) * 100 = 60% approval rate

**4. Lapse Rate**
```sql
(Lapsed Policies / Total Policies) * 100
```
Example: (550 / 5,500) * 100 = 10% lapse rate

**5. Surrender Ratio**
```sql
(Surrendered Policies / Total Policies) * 100
```
Example: (275 / 5,500) * 100 = 5% surrender rate

**6. Agent Status Classification**
```sql
CASE 
  WHEN status = 'active' AND days_since_activity <= 30 THEN 'Recently Active'
  WHEN status = 'active' AND days_since_activity > 30 THEN 'Reactivated'
  WHEN status = 'passive' THEN 'Passive'
  WHEN status = 'inactive' THEN 'Inactive'
END
```

### Nepali Fiscal Year Logic:

Nepali fiscal year runs from **mid-July to mid-July**:
- **2081/82**: July 16, 2024 - July 15, 2025
- **2080/81**: July 16, 2023 - July 15, 2024
- **2079/80**: July 16, 2022 - July 15, 2023

```javascript
// Auto-determine fiscal year based on date
const fiscalYear = collectionDate >= '2024-07-16' ? '2081/82' : '2080/81';
```

### Currency Formatting:

NPR amounts are displayed in **Lakh** (100,000) and **Crore** (10,000,000):

```javascript
const formatCurrency = (value) => {
  return `NPR ${(value / 10000000).toFixed(2)} Crore`;
};
// 2,500,000,000 → "NPR 25.00 Crore"
```

---

## 🎓 Summary: How Everything Works Together

### The Complete Picture:

1. **Data Generation** → `seed.js` creates 33,857 realistic records
2. **Storage** → MySQL stores data in 7 tables with relationships
3. **Aggregation** → 10 SQL views transform raw data into business metrics
4. **API Layer** → Express routes handle requests and call service functions
5. **Business Logic** → AnalyticsService executes queries and formats data
6. **Frontend** → React components fetch data via API and display it
7. **Visualization** → Recharts renders interactive charts and graphs
8. **AI Ready** → 7 feature views prepare data for future ML models

### Data Flow Summary:
```
MySQL Tables (Raw Data)
    ↓
SQL Views (Business Logic)
    ↓
AnalyticsService (Query Execution)
    ↓
Express Routes (API Endpoints)
    ↓
Axios (HTTP Requests)
    ↓
React State (Data Storage)
    ↓
Components (UI Rendering)
    ↓
Charts/Tables (Visualization)
```

### AI/ML Flow (Future):
```
SQL AI Views (Feature Engineering)
    ↓
Python Script (Data Export)
    ↓
ML Model (Training)
    ↓
Prediction API (Flask/FastAPI)
    ↓
Frontend Call (React)
    ↓
Prediction Display (Dashboard)
```

---

## 📚 Additional Resources

- **Database Schema**: `/backend/database/schema.sql`
- **SQL Views**: `/backend/database/views.sql`
- **AI Features**: `/backend/database/ai_features.sql`
- **Data Generator**: `/backend/database/seed.js`
- **API Routes**: `/backend/src/routes/`
- **Service Layer**: `/backend/src/services/analyticsService.js`
- **Frontend Pages**: `/frontend/src/pages/`
- **API Client**: `/frontend/src/services/api.js`

---

**Created**: April 17, 2026  
**Version**: 1.0.0  
**Purpose**: Complete understanding guide for Nepal Insurance Analytics Dashboard
