@echo off
echo 🏔️ Nepal Insurance Dashboard - Setup Script
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
echo ✅ Backend dependencies installed!
echo.

REM Setup Frontend
echo 📦 Setting up Frontend...
cd ..\frontend
call npm install
echo ✅ Frontend dependencies installed!
echo.

echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Create MySQL database: mysql -u root -p ^< backend\database\schema.sql
echo 2. Seed mock data: cd backend ^&^& npm run seed
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
pause
