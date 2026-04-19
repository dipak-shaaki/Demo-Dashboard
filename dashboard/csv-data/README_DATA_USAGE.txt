=============================================================
DASHBOARD DATA FILES - USAGE GUIDE
=============================================================

This document explains each CSV file, its purpose, and how to use it.

=============================================================
1. premium_collection.csv
=============================================================
PURPOSE: Track premium collection performance vs targets
USED FOR:
  - Executive Premium Analysis page
  - Target achievement charts
  - Year-over-year growth analysis
  - Province-wise performance comparison
  
COLUMNS:
  - province: Name of the province (Bagmati, Lumbini, etc.)
  - fiscal_year: Nepal fiscal year (2079/80, 2080/81, 2081/82)
  - target_amount: Planned premium collection target (in NPR)
  - actual_amount: Actual premium collected (in NPR)
  - achievement_percent: (actual/target) * 100
  - growth_percent: Year-over-year growth rate
  
CHARTS TO CREATE:
  - Bar chart: Target vs Actual by province
  - Line chart: Achievement rate trend over 3 years
  - KPI card: Total achievement percentage

=============================================================
2. new_business.csv
=============================================================
PURPOSE: Track new policy sales
USED FOR:
  - Sales & Agency page
  - New business growth tracking
  - Province-wise sales comparison
  
COLUMNS:
  - province: Province name
  - fiscal_year: Fiscal year
  - policies_count: Number of new policies sold
  - premium_amount: Premium from new policies (in NPR)
  
CHARTS TO CREATE:
  - Bar chart: New policies by province
  - Line chart: Growth trend over years
  - Stacked bar: Premium contribution by province

=============================================================
3. renewals_yearly.csv
=============================================================
PURPOSE: Track policy renewals and collection
USED FOR:
  - Renewal & Lapse Analysis page
  - Renewal rate calculation
  - Pending and lapsed policy tracking
  
COLUMNS:
  - province: Province name
  - fiscal_year: Fiscal year
  - total_renewals: Total renewals due
  - paid_renewals: Successfully renewed
  - pending_renewals: Awaiting payment
  - lapsed_renewals: Failed to renew
  - renewal_rate_percent: (paid/total) * 100
  - collection_amount: Total renewal premium collected
  
CHARTS TO CREATE:
  - Stacked bar: Paid vs Pending vs Lapsed
  - Line chart: Renewal rate trend
  - KPI card: Overall renewal rate

=============================================================
4. policy_lapse.csv
=============================================================
PURPOSE: Analyze policy lapses and premium loss
USED FOR:
  - Renewal & Lapse Analysis page
  - Risk Management page
  - Retention strategy planning
  
COLUMNS:
  - province: Province name
  - lapsed_policies: Total number of lapsed policies
  - premium_lost: Lost premium revenue (in NPR)
  - lapse_rate_percent: Lapse rate percentage
  - avg_policy_age: Average age of lapsed policies (years)
  - trend: Year-over-year trend (+/-)
  - risk_level: Low/Medium/High/Critical
  
CHARTS TO CREATE:
  - Bar chart: Lapse rate by province (color-coded)
  - KPI card: Total premium lost
  - Table with risk level badges

=============================================================
5. policy_loan.csv
=============================================================
PURPOSE: Track policy loans and NPL ratios
USED FOR:
  - Risk Management page
  - Loan portfolio analysis
  
COLUMNS:
  - province: Province name
  - total_loan_amount: Total loan disbursed (in NPR)
  - active_loans: Number of active loans
  - avg_interest_rate: Average interest rate (%)
  - npl_ratio_percent: Non-performing loan ratio (%)
  
CHARTS TO CREATE:
  - Bar chart: Loan amount by province
  - Gauge chart: Average NPL ratio
  - Table with risk indicators

=============================================================
6. surrender_analysis.csv
=============================================================
PURPOSE: Track policy surrenders
USED FOR:
  - Claims & Surrender page
  - Surrender rate analysis
  
COLUMNS:
  - province: Province name
  - total_surrender: Number of surrendered policies
  - surrender_amount: Total surrender payout (in NPR)
  - surrender_rate_percent: Surrender rate (%)
  - avg_payout: Average payout per surrender
  - trend: Year-over-year trend
  
CHARTS TO CREATE:
  - Bar chart: Surrender rate by province
  - Line chart: Surrender trend over years
  - KPI: Total surrender amount

=============================================================
7. death_claims.csv
=============================================================
PURPOSE: Track death claims
USED FOR:
  - Claims & Surrender page
  - Claims ratio analysis
  
COLUMNS:
  - province: Province name
  - total_claims: Number of death claims
  - claim_amount: Total claim payout (in NPR)
  - death_claim_rate_percent: Claims as % of total policies
  - avg_claim: Average claim amount
  - trend: Year-over-year trend
  
CHARTS TO CREATE:
  - Bar chart: Claims by province
  - KPI: Total claims paid
  - Table: Claim details

=============================================================
8. investment_summary.csv
=============================================================
PURPOSE: Track overall investment portfolio
USED FOR:
  - Investment & Maturity page
  - ROI analysis
  
COLUMNS:
  - province: Province name
  - total_fd_amount: Total fixed deposit investment (in NPR)
  - fd_count: Number of FD accounts
  - avg_interest_rate: Average FD interest rate (%)
  - maturity_next_12_months: FDs maturing in next 12 months
  
CHARTS TO CREATE:
  - Bar chart: FD amount by province
  - Pie chart: Investment distribution
  - KPI: Overall ROI

=============================================================
9. fd_maturity_schedule.csv
=============================================================
PURPOSE: Track upcoming FD maturities
USED FOR:
  - Investment & Maturity page
  - Maturity planning
  
COLUMNS:
  - policy_number: Policy reference number
  - policyholder: Policyholder name
  - province: Province name
  - fd_amount: FD investment amount (in NPR)
  - interest_rate: FD interest rate (%)
  - maturity_date: FD maturity date (YYYY-MM-DD)
  - days_to_maturity: Days until maturity
  - policy_sum_assured: Policy coverage amount
  
CHARTS TO CREATE:
  - Table: Upcoming maturities (sorted by date)
  - Timeline chart: Maturity distribution
  - Alert: Maturities within 30/60/90 days

=============================================================
10. maturing_policies.csv
=============================================================
PURPOSE: Track policies maturing soon
USED FOR:
  - Investment & Maturity page
  - Policy Analysis page
  - Maturity obligation planning
  
COLUMNS:
  - province: Province name
  - maturing_policies: Number of policies maturing
  - total_maturity_amount: Total payout required (in NPR)
  - next_30_days: Maturing in next 30 days
  - next_90_days: Maturing in next 90 days
  - has_investment: Policies with linked investments
  
CHARTS TO CREATE:
  - Bar chart: Maturities by province
  - KPI: Total maturity obligation
  - Timeline: 30/60/90 day breakdown

=============================================================
11. agent_performance.csv
=============================================================
PURPOSE: Track agent performance metrics
USED FOR:
  - Agent Performance page
  - Sales & Agency page
  - Agent ranking and incentives
  
COLUMNS:
  - province: Province name
  - total_agents: Total registered agents
  - active_agents: Currently active agents
  - inactive_agents: Inactive agents
  - active_rate_percent: (active/total) * 100
  - avg_performance_percent: Average performance score
  
CHARTS TO CREATE:
  - Bar chart: Active vs Inactive agents
  - Line chart: Agent count trend
  - KPI: Overall active rate
  - Table: Province-wise ranking

=============================================================
12. monthly_premium_trend.csv
=============================================================
PURPOSE: Monthly premium collection patterns
USED FOR:
  - Executive page
  - Seasonality analysis
  - Cash flow planning
  
COLUMNS:
  - month: Nepali month name
  - amount: Premium collected (in NPR)
  
CHARTS TO CREATE:
  - Area chart: Monthly trend
  - Bar chart: Month-wise comparison
  - Insights: Peak and low months

=============================================================
HOW TO USE THESE FILES:
=============================================================

1. LOAD INTO DATABASE:
   - Import CSV files into MySQL/PostgreSQL
   - Use for live dashboard data

2. USE IN EXCEL/SPREADSHEET:
   - Open in Excel, Google Sheets
   - Create pivot tables and charts
   - Perform data analysis

3. USE IN PYTHON/DATA SCIENCE:
   import pandas as pd
   df = pd.read_csv('premium_collection.csv')
   # Analyze and visualize

4. USE IN JAVASCRIPT/REACT:
   - Parse CSV to JSON
   - Feed to Chart.js or Recharts
   - Display in dashboard components

5. USE IN REPORTS:
   - Generate PDF reports
   - Create executive summaries
   - Present to stakeholders

=============================================================
DATA RELATIONSHIPS:
=============================================================

premium_collection + new_business + renewals_yearly
  → Total revenue analysis

policy_lapse + surrender_analysis + death_claims
  → Risk assessment

investment_summary + fd_maturity_schedule + maturing_policies
  → Investment portfolio management

agent_performance + new_business
  → Sales effectiveness

=============================================================
IMPORTANT NOTES:
=============================================================

- All amounts are in Nepali Rupees (NPR)
- 1 Lakh = 100,000
- 1 Crore = 10,000,000
- Nepal Fiscal Year: Mid-July to Mid-July
- Fiscal years: 2079/80, 2080/81, 2081/82
- Data is for demonstration/testing purposes
- Replace with actual data for production use

=============================================================
