#!/bin/bash

# ============================================================================
# Nepal Insurance Dashboard - Production Setup Script
# This script sets up the complete dashboard system
# ============================================================================

set -e  # Exit on error

echo "🏔️ Nepal Insurance Analytics Dashboard - Production Setup"
echo "=========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed. Please install MySQL 5.7+ first.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version must be 16 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed!${NC}"
echo ""

# Step 2: Ask for MySQL credentials
echo -e "${YELLOW}Step 2: MySQL Configuration${NC}"
read -p "MySQL Host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "MySQL User (default: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "MySQL Password: " DB_PASSWORD
echo ""

read -p "Database Name (default: insurance_dashboard): " DB_NAME
DB_NAME=${DB_NAME:-insurance_dashboard}

echo ""

# Step 3: Create Database and Tables
echo -e "${YELLOW}Step 3: Creating database and tables...${NC}"

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create database. Check MySQL credentials.${NC}"
    exit 1
fi

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tables created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create tables.${NC}"
    exit 1
fi

# Step 4: Create BI Views
echo -e "${YELLOW}Step 4: Creating BI-ready views...${NC}"

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/database/views.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ BI views created! (10 views)${NC}"
else
    echo -e "${RED}❌ Failed to create views.${NC}"
    exit 1
fi

# Step 5: Create AI Feature Views
echo -e "${YELLOW}Step 5: Creating AI/ML feature views...${NC}"

mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < backend/database/ai_features.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ AI feature views created! (7 views)${NC}"
else
    echo -e "${RED}❌ Failed to create AI views.${NC}"
    exit 1
fi

# Step 6: Setup Backend
echo -e "${YELLOW}Step 6: Setting up backend...${NC}"

cd backend

cat > .env <<EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=$DB_PORT
PORT=5000
EOF

npm install --production

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed!${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies.${NC}"
    exit 1
fi

cd ..

# Step 7: Seed Mock Data
echo -e "${YELLOW}Step 7: Seeding mock data (33,857 records)...${NC}"
echo "This may take a minute..."

cd backend
npm run seed

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Mock data seeded successfully!${NC}"
else
    echo -e "${RED}❌ Failed to seed data.${NC}"
    exit 1
fi

cd ..

# Step 8: Setup Frontend
echo -e "${YELLOW}Step 8: Setting up frontend...${NC}"

cd frontend
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed!${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies.${NC}"
    exit 1
fi

cd ..

# Setup Complete
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          🎉 SETUP COMPLETE! 🎉                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}What was created:${NC}"
echo "✅ Database: $DB_NAME"
echo "✅ Tables: 7 tables created"
echo "✅ BI Views: 10 views for dashboard & Power BI/Tableau"
echo "✅ AI Views: 7 feature views for ML models"
echo "✅ Mock Data: 33,857 records"
echo "✅ Backend: Node.js API (17 endpoints)"
echo "✅ Frontend: React Dashboard (7 pages)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Start Backend Server:"
echo -e "   ${GREEN}cd backend && npm run dev${NC}"
echo "   Backend will run on: http://localhost:5000"
echo ""
echo "2. Start Frontend Dashboard (in new terminal):"
echo -e "   ${GREEN}cd frontend && npm run dev${NC}"
echo "   Dashboard will run on: http://localhost:3000"
echo ""
echo "3. Open Dashboard:"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}For Power BI / Tableau Connection:${NC}"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: Create 'bi_user' with SELECT access to v_* views"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "   README.md - Complete guide"
echo "   docs/DATA_SOURCE.md - Where data comes from"
echo "   QUICKSTART.md - Quick setup"
echo ""
echo -e "${GREEN}🏔️ Ready for POC Presentation! 🏔️${NC}"
echo ""
