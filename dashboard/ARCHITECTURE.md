# System Architecture - Nepal Insurance Dashboard

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                     http://localhost:3000                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    App.jsx (Router)                       │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│          ┌────────────────┼────────────────┐                   │
│          │                │                │                   │
│          ▼                ▼                ▼                   │
│  ┌──────────┐    ┌──────────────┐   ┌──────────────┐         │
│  │ Components│    │    Pages    │   │  Services    │         │
│  │          │    │   (7 pages) │   │  (api.js)    │         │
│  │ KPICard  │    │             │   │              │         │
│  │ DataChart│    │ Overview    │   │ Axios Calls  │         │
│  │ DataTable│    │ Premium     │   │              │         │
│  │          │    │ Agency      │   │              │         │
│  │          │    │ Renewal     │   │              │         │
│  │          │    │ Policy      │   │              │         │
│  │          │    │ Claims      │   │              │         │
│  │          │    │ Investment  │   │              │         │
│  └──────────┘    └──────────────┘   └──────┬───────┘         │
│                                             │                  │
└─────────────────────────────────────────────┼──────────────────┘
                                              │
                                              │ REST API Calls
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                     │
│                     http://localhost:5000                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    server.js                             │  │
│  │              (Express App + CORS)                        │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│          ┌────────────────┼────────────────┐                   │
│          │                │                │                   │
│          ▼                ▼                ▼                   │
│  ┌──────────┐    ┌──────────────┐   ┌──────────────┐         │
│  │ Routes   │    │ Controllers  │   │  Services    │         │
│  │ (7 files)│    │ (Business    │   │ (Analytics)  │         │
│  │          │    │  Logic)      │   │              │         │
│  │ dashboard│    │              │   │ SQL Queries  │         │
│  │ premium  │    │ Data         │   │ Aggregations │         │
│  │ agents   │    │ Processing   │   │ Calculations │         │
│  │ renewals │    │              │   │              │         │
│  │ policies │    │              │   │              │         │
│  │ claims   │    │              │   │              │         │
│  │investments│   │              │   │              │         │
│  └──────────┘    └──────────────┘   └──────┬───────┘         │
│                                             │                  │
└─────────────────────────────────────────────┼──────────────────┘
                                              │
                                              │ MySQL Protocol
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              insurance_dashboard                         │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │  │
│  │  │provinces │  │ agents   │  │    policies      │      │  │
│  │  │ (7)      │→ │ (550)    │→ │    (5,500)       │      │  │
│  │  └──────────┘  └──────────┘  └────────┬─────────┘      │  │
│  │                                       │                 │  │
│  │                    ┌──────────────────┼──────────┐     │  │
│  │                    ▼                  ▼          ▼     │  │
│  │              ┌──────────┐    ┌──────────┐  ┌────────┐ │  │
│  │              │ premium  │    │ claims   │  │renewals│ │  │
│  │              │collections│   │ (800)    │  │(10,000)│ │  │
│  │              │(15,000)  │    └──────────┘  └────────┘ │  │
│  │              └──────────┘                              │  │
│  │                                                          │  │
│  │              ┌──────────────────┐                       │  │
│  │              │  investments     │                       │  │
│  │              │   (2,000)        │                       │  │
│  │              └──────────────────┘                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Total: 33,857 records                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### 1. User Request Flow
```
User Action → React Component → API Service → Express Route → 
Analytics Service → MySQL Query → Response → Chart/Table Display
```

### 2. Example: Load Dashboard Overview
```
1. User opens http://localhost:3000
2. Overview.jsx component mounts
3. Calls dashboardAPI.getSummary()
4. GET /api/dashboard/summary
5. AnalyticsService.getDashboardSummary()
6. Executes 4 SQL queries:
   - SUM(premium_collections) WHERE fiscal_year = '2081/82'
   - COUNT(agents) WHERE status = 'active'
   - COUNT(policies) WHERE status = 'active'
   - Claims approval ratio calculation
7. Returns JSON response
8. React updates state
9. KPI Cards and Charts render
```

---

## 🔗 Component Relationships

### Frontend Components

```
App.jsx (Main Router)
│
├── Overview.jsx
│   ├── KPICard (x4)
│   ├── DataChart (Bar)
│   └── Statistics Cards
│
├── PremiumCollection.jsx
│   ├── DataChart (Bar)
│   └── DataTable
│
├── AgencyAnalytics.jsx
│   ├── DataChart (Bar)
│   └── DataTable (x4 tabs)
│
├── RenewalTracking.jsx
│   ├── DataChart (Bar)
│   └── DataTable
│
├── PolicyAnalysis.jsx
│   ├── DataChart (Pie)
│   └── DataTable (x3 tabs)
│
├── ClaimsManagement.jsx
│   ├── KPICard (x3)
│   ├── DataChart (Bar)
│   └── DataTable (x2 tabs)
│
└── Investments.jsx
    ├── KPICard (x2)
    ├── DataChart (Pie + Bar)
    └── DataTable
```

### Backend Routes

```
server.js
│
├── /api/dashboard
│   ├── GET /summary
│   └── GET /premium-by-province
│
├── /api/premium
│   ├── GET /current-fy
│   ├── GET /comparative
│   └── GET /province-trend
│
├── /api/agents
│   ├── GET /growth-rate
│   ├── GET /top-20
│   ├── GET /status-list
│   └── GET /passive-to-active
│
├── /api/renewals
│   └── GET /yearly-comparison
│
├── /api/policies
│   ├── GET /lapse-loan
│   ├── GET /surrender
│   └── GET /maturing
│
├── /api/claims
│   ├── GET /death-claim-ratio
│   └── GET /details
│
└── /api/investments
    ├── GET /fd-summary
    └── GET /by-province
```

---

## 🗄️ Database Relationships

```
provinces (1) ──── (M) agents (1) ──── (M) policies
                                                        │
                    ┌───────────────────────────────────┤
                    │                                   │
                    ▼                                   ▼
          premium_collections                    claims
          renewals                               investments
```

### Foreign Keys
- `agents.province_id` → `provinces.id`
- `policies.agent_id` → `agents.id`
- `policies.province_id` → `provinces.id`
- `premium_collections.policy_id` → `policies.id`
- `claims.policy_id` → `policies.id`
- `renewals.policy_id` → `policies.id`
- `investments.policy_id` → `policies.id`

---

## 🎨 Technology Stack Layers

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                  │
│  React 18 + Vite + Recharts + CSS               │
│  - Component-based UI                            │
│  - State Management (React Hooks)                │
│  - Routing (React Router)                        │
│  - Data Visualization (Recharts)                 │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              APPLICATION LAYER                   │
│  Node.js + Express.js                            │
│  - RESTful API                                   │
│  - Route Handling                                │
│  - Business Logic                                │
│  - Data Processing                               │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              DATA ACCESS LAYER                   │
│  MySQL2 + Connection Pool                        │
│  - Query Execution                               │
│  - Connection Management                         │
│  - Transaction Support                           │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│              DATABASE LAYER                      │
│  MySQL Database                                  │
│  - 7 Tables                                      │
│  - Foreign Keys                                  │
│  - Indexes                                       │
│  - 33,857 Records                                │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Request-Response Cycle

```
1. User clicks "Premium Collection" nav
2. React Router renders PremiumCollection.jsx
3. useEffect triggers fetchData()
4. axios.get('/api/premium/current-fy')
5. HTTP GET request to localhost:5000
6. Express routes to premium.js
7. Controller calls AnalyticsService
8. Service executes SQL query:
   SELECT province, SUM(amount) 
   FROM premium_collections 
   JOIN policies 
   JOIN provinces 
   WHERE fiscal_year = '2081/82'
   GROUP BY province
9. MySQL returns result set
10. Service formats data
11. Controller sends JSON response
12. Axios receives response
13. React updates state with setData()
14. Component re-renders with new data
15. DataChart displays bar chart
16. DataTable shows formatted table
```

---

## 📦 Deployment Architecture (Future)

```
┌──────────────────────────────────────────────┐
│              LOAD BALANCER                    │
│         (nginx / AWS ALB)                     │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  Frontend 1  │      │  Frontend 2  │
│  (React SPA) │      │  (React SPA) │
│  S3/CDN      │      │  S3/CDN      │
└──────────────┘      └──────────────┘
                           
┌──────────────────────────────────────────────┐
│              API SERVERS                      │
│         (Node.js + Express)                   │
│         EC2 / Docker Containers               │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  MySQL Master│ ───→ │ MySQL Slave  │
│  (Read/Write)│      │  (Read)      │
└──────────────┘      └──────────────┘
```

---

## 🔐 Security Considerations (Future)

- JWT Authentication
- Role-based Access Control
- API Rate Limiting
- Input Validation
- SQL Injection Prevention (Parameterized Queries ✅)
- CORS Configuration ✅
- HTTPS/TLS
- Environment Variables ✅

---

## 📈 Performance Optimizations

### Current
- ✅ MySQL Connection Pooling
- ✅ Indexed Columns
- ✅ Efficient SQL Queries
- ✅ React Lazy Loading (can be added)
- ✅ Vite Fast Refresh

### Future
- Redis Caching
- Query Result Caching
- Pagination on Backend
- API Response Compression
- CDN for Static Assets
- Database Query Optimization

---

**Architecture designed for scalability and future AI integration!**
