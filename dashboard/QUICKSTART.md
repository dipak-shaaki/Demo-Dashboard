# Quick Start Guide - Nepal Insurance Dashboard

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install Dependencies

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Run this SQL command:
source /path/to/dashboard/backend/database/schema.sql

# Or use command line:
mysql -u root -p < backend/database/schema.sql
```

### Step 3: Seed Mock Data

```bash
cd backend
npm run seed
```

This will populate your database with:
- ✅ 7 provinces
- ✅ 550 agents
- ✅ 5,500 policies
- ✅ 15,000 premium collections
- ✅ 800 claims
- ✅ 10,000 renewals
- ✅ 2,000 investments

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on: http://localhost:3000

### Step 5: Open Dashboard

Open your browser and navigate to: **http://localhost:3000**

---

## 📋 What You'll See

### 1. Dashboard Overview
- Total Premium Collection (NPR)
- Active Agents count
- Active Policies
- Claims Approval Ratio
- Premium by Province chart

### 2. Premium Collection
- Current fiscal year data
- Date range comparison
- Province-wise breakdown

### 3. Agency Analytics
- Growth rate by province
- Top 20 agents
- Active/Inactive/Passive lists
- Passive to Active conversions

### 4. Renewal Tracking
- Year-wise comparison
- Paid/Pending/Lapsed status

### 5. Policy Analysis
- Lapse & Loan details
- Surrender ratio
- Maturing policies

### 6. Claims Management
- Death claim ratio
- Claim details
- Province-wise comparison

### 7. Investments
- FD summary
- Investment by type
- Province-wise breakdown

---

## 🔧 Troubleshooting

### MySQL Connection Error
1. Check your `.env` file in `backend/`
2. Ensure MySQL is running
3. Verify database credentials

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=insurance_dashboard
DB_PORT=3306
```

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change `port` in `frontend/vite.config.js`

### Dependencies Issue
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

---

## 📊 API Testing

Test the backend API directly:

```bash
# Health check
curl http://localhost:5000/api/health

# Dashboard summary
curl http://localhost:5000/api/dashboard/summary

# Premium by province
curl http://localhost:5000/api/dashboard/premium-by-province

# Top 20 agents
curl http://localhost:5000/api/agents/top-20
```

---

## 🎯 Next Steps

1. **Explore the Dashboard**: Navigate through all 7 pages
2. **Test Filters**: Use date pickers, dropdowns, and search
3. **View Charts**: Interactive charts with hover details
4. **Check Tables**: Sortable, searchable, paginated tables
5. **Mobile View**: Test responsive design on mobile

---

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Development mode with hot reload
npm start        # Production mode
npm run seed     # Reseed database
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 📝 Important Notes

- **Fiscal Year**: Nepal FY runs from mid-July to mid-July
- **Currency**: All amounts in NPR (Nepalese Rupee)
- **Mock Data**: All data is randomly generated for demonstration

---

## 🆘 Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review API endpoints in `backend/src/routes/`
- Inspect frontend pages in `frontend/src/pages/`

---

**Happy Dashboarding! 🏔️**
