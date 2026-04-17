#!/bin/bash

echo "🏔️ Nepal Insurance Dashboard - Setup Script"
echo "==========================================="
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""

# Setup Backend
echo "Setting up Backend..."
cd backend
npm install
echo "Backend dependencies installed!"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed!"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create MySQL database: mysql -u root -p < backend/database/schema.sql"
echo "2. Seed mock data: cd backend && npm run seed"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
