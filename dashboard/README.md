# Nepal Insurance Analytics Dashboard - Production POC

## 🏔️ Business-Ready Insurance Dashboard for Single Company

A **production-grade** analytics dashboard built for a life insurance company operating in Nepal. This system provides **real-time business intelligence** with clear data sourcing, BI tool integration readiness, and AI/ML pipeline architecture.

---

## 🎯 What This Dashboard Does

### For Business Managers
- **Track premium collections** province-wise in real-time
- **Monitor agent performance** and identify top performers
- **Identify risks** (lapses, surrenders, claims) before they escalate
- **Forecast renewals** for cash flow planning
- **Make data-driven decisions** with actionable insights

### For Executives
- **Executive view** with high-level KPIs
- **Province performance heatmap** across Nepal's 7 provinces
- **Year-over-year growth tracking**
- **Risk exposure monitoring**

### For Future AI/ML
- **Predictive analytics ready** - 7 ML use cases pre-engineered
- **Feature engineering views** - Labeled datasets ready for training
- **Scalable architecture** - Supports model deployment pipeline

---

## 📊 Three Dashboard Views

### 1. Executive View
**Purpose**: High-level company performance monitoring

**KPIs Displayed**:
- Total Premium vs Target (Fiscal Year 2081/82)
- Active Agents Count
- Active Policies Count  
- Claims Approval Ratio
- Year-over-Year Growth Rate

**Visualizations**:
- Province Performance Heatmap
- Premium Collection Trend
- Quick Statistics Panel

### 2. Sales & Agency View
**Purpose**: Sales force performance and growth tracking

**Metrics**:
- Agency Growth Rate by Province
- Top 20 Agents (by premium collected + retention rate)
- Active/Inactive/Passive Agent Breakdown
- Passive-to-Active Agent Funnel

**Insights**:
- Which provinces are growing fastest?
- Who are the star agents?
- Are agents consistent or one-time performers?

### 3. Risk View
**Purpose**: Early warning system for business risks

**Monitors**:
- Policy Lapse Rate by Province
- Policy Loan Patterns (early surrender indicator)
- Surrender Ratio Trends
- Death Claim Ratio & Financial Exposure

**Alerts**:
- High lapse provinces
- Increasing policy loans
- Abnormal surrender patterns

---

## 🗄️ Data Architecture

### Where Dashboard Data Comes From

```
MySQL Database (7 Tables)
    ↓
10 SQL Views (Aggregated Business Logic)
    ↓
17 REST API Endpoints (Business Rules + Filters)
    ↓
React Dashboard (Visualization - 7 Pages)
```

### Source Tables (Raw Data)
1. `provinces` - 7 provinces of Nepal
2. `agents` - 550+ insurance agents
3. `policies` - 5,500+ insurance policies
4. `premium_collections` - 15,000+ payment transactions
5. `claims` - 800+ claim records
6. `renewals` - 10,000+ renewal records
7. `investments` - 2,000+ FD/investment records

### BI-Ready Views (Business Logic)
1. `v_premium_collection_province_wise` - Revenue tracking
2. `v_agent_performance_metrics` - Agent analytics
3. `v_renewal_analysis_province_wise` - Retention metrics
4. `v_policy_lapse_loan_analysis` - Risk indicators
5. `v_surrender_analysis` - Churn analysis
6. `v_death_claim_analysis` - Claim exposure
7. `v_maturing_policies_investment` - Cash flow planning
8. `v_executive_kpi_summary` - High-level KPIs
9. `v_agent_status_tracking` - Workforce health
10. `v_bi_export_standard` - Unified BI export format

### AI/ML Feature Views (Ready for Training)
1. `v_ai_claim_prediction_features` - Claim probability
2. `v_ai_surrender_prediction_features` - Surrender/churn prediction
3. `v_ai_agent_business_prediction` - Agent performance forecasting
4. `v_ai_renewal_prediction_features` - Renewal time series
5. `v_ai_premium_pattern_features` - Collection pattern clustering
6. `v_ai_agent_growth_potential` - Agent propensity scoring
7. `v_ai_investment_analysis` - Investment optimization

---

## 🔌 Power BI / Tableau Integration

### Direct Database Connection

Power BI and Tableau can connect **directly to MySQL views** without API:

```
Power BI / Tableau
    ↓ (ODBC/JDBC Connection)
MySQL Views (v_*)
    ↓
Database Tables
```

### Setup BI Connection

```sql
-- Create read-only BI user
CREATE USER 'bi_user'@'%' IDENTIFIED BY 'secure_password';

-- Grant access to views only
GRANT SELECT ON insurance_dashboard.v_* TO 'bi_user'@'%';

-- BI tools can now query views directly
-- Example: SELECT * FROM v_premium_collection_province_wise;
```

### Benefits
✅ **No API bottleneck** - Direct database access  
✅ **Real-time data** - Views compute on query  
✅ **Secure** - Read-only access, no raw table exposure  
✅ **Standardized** - Single source of truth via views  

---

## 🚀 Quick Start (10 Minutes)

### Prerequisites
- MySQL 5.7+ installed
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Create Database

```bash
mysql -u root -p < backend/database/schema.sql
```

### Step 2: Create Views

```bash
mysql -u root -p < backend/database/views.sql
mysql -u root -p < backend/database/ai_features.sql
```

### Step 3: Seed Mock Data

```bash
cd backend
npm install
npm run seed
```

This creates **33,857 realistic records** for a single insurance company.

### Step 4: Start Backend

```bash
cd backend
npm run dev
```

✅ Backend running: http://localhost:5000

### Step 5: Start Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Dashboard running: http://localhost:3000

### Step 6: Open Dashboard

Navigate to **http://localhost:3000**

---

## 📁 Production Folder Structure

```
dashboard/
├── backend/                          # Node.js API Server
│   ├── database/
│   │   ├── schema.sql               ✅ Raw table definitions
│   │   ├── views.sql                ✅ BI-ready views (10 views)
│   │   ├── ai_features.sql          ✅ ML feature views (7 views)
│   │   └── seed.js                  ✅ Mock data generator
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          ✅ MySQL connection pool
│   │   ├── controllers/             ✅ Request handlers
│   │   ├── models/                  ✅ Data access layer
│   │   ├── routes/                  ✅ API endpoints (7 files)
│   │   ├── services/
│   │   │   └── analyticsService.js  ✅ Business logic
│   │   ├── middleware/              ✅ Auth, validation (future)
│   │   └── server.js                ✅ Express app
│   ├── .env                         ✅ Environment config
│   └── package.json
│
├── frontend/                         # React Dashboard
│   ├── src/
│   │   ├── components/              ✅ Reusable UI (KPICard, DataChart, DataTable)
│   │   ├── pages/                   ✅ 7 dashboard pages
│   │   │   ├── Overview.jsx         ✅ Executive view
│   │   │   ├── PremiumCollection.jsx
│   │   │   ├── AgencyAnalytics.jsx  ✅ Sales & agency view
│   │   │   ├── RenewalTracking.jsx
│   │   │   ├── PolicyAnalysis.jsx   ✅ Risk view
│   │   │   ├── ClaimsManagement.jsx
│   │   │   └── Investments.jsx
│   │   ├── services/
│   │   │   └── api.js               ✅ API integration
│   │   ├── hooks/                   ✅ Custom React hooks (future)
│   │   ├── utils/                   ✅ Helper functions (future)
│   │   ├── config/                  ✅ App configuration (future)
│   │   ├── App.jsx                  ✅ Router & layout
│   │   └── index.css                ✅ Nepali theme styling
│   └── package.json
│
├── docs/                             ✅ Documentation
│   └── DATA_SOURCE.md               ✅ Where data comes from
│
├── README.md                         ✅ This file
├── QUICKSTART.md                     ✅ 5-minute setup
└── PROJECT_SUMMARY.md                ✅ Feature list
```

---

## 🎯 Dashboard Requirements Coverage

### ✅ All 8 Basic Requirements

| # | Requirement | Dashboard Page | SQL View | API Endpoint |
|---|-------------|----------------|----------|--------------|
| 1 | Premium Collection Province-wise | Premium Collection | `v_premium_collection_province_wise` | `/api/premium/current-fy` |
| 2 | Agency Growth + Top 20 Agents | Agency Analytics | `v_agent_performance_metrics` | `/api/agents/growth-rate`, `/api/agents/top-20` |
| 3 | Active/Inactive/Passive Agents | Agency Analytics (Status Tab) | `v_agent_status_tracking` | `/api/agents/status-list` |
| 4 | Renewal Collection Year-wise | Renewal Tracking | `v_renewal_analysis_province_wise` | `/api/renewals/yearly-comparison` |
| 5 | Policy Lapse/Loan Details | Policy Analysis (Lapse Tab) | `v_policy_lapse_loan_analysis` | `/api/policies/lapse-loan` |
| 6 | Surrender Ratio & Comparison | Policy Analysis (Surrender Tab) | `v_surrender_analysis` | `/api/policies/surrender` |
| 7 | Death Claim Ratio & Comparison | Claims Management | `v_death_claim_analysis` | `/api/claims/death-claim-ratio` |
| 8 | Maturing Policies & Investment FD | Investments | `v_maturing_policies_investment` | `/api/policies/maturing`, `/api/investments/fd-summary` |

### ✅ All 7 AI Requirements (Architecture Ready)

| # | AI Feature | ML Task | Feature View | Status |
|---|-----------|---------|--------------|--------|
| 1 | Claim Probability | Binary Classification | `v_ai_claim_prediction_features` | ✅ Ready |
| 2 | Surrender Probability | Churn Prediction | `v_ai_surrender_prediction_features` | ✅ Ready |
| 3 | Agent Business Prediction | Regression | `v_ai_agent_business_prediction` | ✅ Ready |
| 4 | Renewal Prediction | Time Series | `v_ai_renewal_prediction_features` | ✅ Ready |
| 5 | Agent Growth Potential | Clustering | `v_ai_agent_growth_potential` | ✅ Ready |
| 6 | Premium Collection Patterns | Clustering + Forecasting | `v_ai_premium_pattern_features` | ✅ Ready |
| 7 | Investment Analysis | Optimization | `v_ai_investment_analysis` | ✅ Ready |

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.18
- **Database**: MySQL 5.7+
- **DB Driver**: MySQL2 3.6 (Connection pooling)
- **Environment**: Dotenv 16.3

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Charts**: Recharts 2.10
- **HTTP Client**: Axios 1.6
- **Routing**: React Router 6.21
- **Icons**: Lucide React

### BI Tools (Future)
- Power BI Desktop (Direct MySQL connection)
- Tableau (MySQL connector)
- Excel (ODBC connection)

### AI/ML Stack (Future)
- Python 3.9+
- scikit-learn (Classification, Regression)
- pandas (Data manipulation)
- TensorFlow/PyTorch (Deep learning)
- MLflow (Model tracking)

---

## 📊 API Endpoints (17 Total)

### Dashboard
- `GET /api/dashboard/summary` - Executive KPIs
- `GET /api/dashboard/premium-by-province` - Province breakdown

### Premium
- `GET /api/premium/current-fy` - Current fiscal year
- `GET /api/premium/comparative?startDate&endDate` - Date comparison
- `GET /api/premium/province-trend` - Trends

### Agents
- `GET /api/agents/growth-rate` - Growth by province
- `GET /api/agents/top-20?year=2024` - Top performers
- `GET /api/agents/status-list?status=active` - Agent lists
- `GET /api/agents/passive-to-active` - Reactivated agents

### Renewals
- `GET /api/renewals/yearly-comparison` - Year-wise by province

### Policies
- `GET /api/policies/lapse-loan` - Risk indicators
- `GET /api/policies/surrender` - Churn analysis
- `GET /api/policies/maturing` - Upcoming maturities

### Claims
- `GET /api/claims/death-claim-ratio` - Claim metrics
- `GET /api/claims/details` - Claim records

### Investments
- `GET /api/investments/fd-summary` - FD overview
- `GET /api/investments/by-province` - Province breakdown

---

## 🔐 Security & Access Control

### Current (POC)
✅ Environment-based configuration  
✅ SQL injection prevention (parameterized queries)  
✅ CORS configuration  
✅ Read-only BI user  

### Production (Future)
- JWT Authentication
- Role-based access (Admin/Manager/Agent/BI)
- API rate limiting
- HTTPS/TLS
- Audit logging

---

## 📈 Performance Optimizations

### Current
✅ MySQL connection pooling  
✅ Indexed columns for fast queries  
✅ Efficient SQL aggregations in views  
✅ Vite fast refresh  

### Production (Future)
- Redis caching (5-15 min TTL)
- API response compression
- Database query optimization
- CDN for static assets
- Pagination on large datasets

---

## 🇳🇵 Nepal-Specific Features

### Fiscal Year
- **Nepali FY**: 2081/82 (July 2024 - July 2025)
- **Bikram Sambat calendar** awareness
- **Tax year end** (Ashad) business spike consideration

### Province Segmentation
All metrics broken down by Nepal's 7 provinces:
1. Koshi
2. Madhesh
3. Bagmati
4. Gandaki
5. Lumbini
6. Karnali
7. Sudurpashchim

### Currency
- **NPR** (Nepalese Rupee)
- Formatted as **Lakh** (100,000) and **Crore** (10,000,000)

### Insurance Context
- **Life Insurance** focus (endowment, term, money-back, whole-life)
- **Regulatory compliance** ready (Beema Samiti reporting)
- **Remittance payment** tracking capability

---

## 🧪 Testing the POC

### 1. Verify Data Sources
```bash
# Test API endpoints
curl http://localhost:5000/api/dashboard/summary
curl http://localhost:5000/api/premium/current-fy
curl http://localhost:5000/api/agents/top-20
```

### 2. Check Views Directly
```sql
mysql -u root -p
USE insurance_dashboard;
SELECT * FROM v_premium_collection_province_wise LIMIT 10;
SELECT * FROM v_agent_performance_metrics LIMIT 10;
```

### 3. Dashboard Functionality
- ✅ Navigate all 7 pages
- ✅ Test date range filters
- ✅ Search in data tables
- ✅ View interactive charts
- ✅ Check responsive design

---

## 📝 Key Insights for Pitch

### Why This Dashboard?
> "Our SQL dashboard tells us we lost 10% of customers last month. Our AI Model tells us which 10% will leave **next month**, giving agents a chance to save them."

### Business Value
1. **Real-time visibility** into province performance
2. **Early risk detection** (lapses, surrenders, claims)
3. **Agent productivity tracking** (80/20 rule identification)
4. **Cash flow forecasting** (renewals + maturities)
5. **Data-driven decisions** (not gut feelings)

### AI Advantage
- **Predictive vs Reactive**: Anticipate problems before they happen
- **Retention focus**: Save 5x more by retaining vs acquiring
- **Agent optimization**: Identify hidden stars early
- **Investment planning**: Match FD maturities with payout obligations

---

## 🚀 Next Steps After POC

### Phase 1: Production Deployment
1. Deploy to cloud (AWS/GCP/Azure)
2. Setup CI/CD pipeline
3. Configure monitoring & alerts
4. Implement authentication

### Phase 2: BI Integration
1. Connect Power BI to views
2. Build executive reports
3. Schedule automated exports
4. Train business users

### Phase 3: AI/ML Implementation
1. Export feature views to Python
2. Train ML models on historical data
3. Deploy prediction APIs
4. Integrate predictions into dashboard

### Phase 4: Advanced Features
1. Real-time alerts (email/SMS)
2. Mobile app
3. Automated regulatory reports (Beema Samiti)
4. Multi-company support (if needed)

---

## 📚 Documentation

- **[DATA_SOURCE.md](docs/DATA_SOURCE.md)** - Where every metric comes from
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete feature list
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture diagrams

---

## 🆘 Support

**For POC Demo**:
1. Ensure MySQL and Node.js are installed
2. Follow Quick Start guide
3. Dashboard runs on http://localhost:3000
4. All data is mock data (33,857 records)

**For Production**:
- Contact development team
- Review architecture documentation
- Plan deployment strategy

---

## 📄 License

Built for **single insurance company** use.  
Proof of Concept - Production Ready Architecture.

---

**Built with ❤️ for Nepal's Insurance Industry**  
**Ready for POC Presentation** 🏔️
