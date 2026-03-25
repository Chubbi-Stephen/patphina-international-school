@echo off
echo.
echo ============================================================
echo   Patphina International School - Setup
echo ============================================================
echo.

echo [1/3] Installing backend dependencies...
call npm install
if %errorlevel% neq 0 (
  echo ERROR: npm install failed. Make sure Node.js is installed.
  pause
  exit /b 1
)

echo.
echo [2/3] Installing frontend dependencies...
call npm install --prefix client
if %errorlevel% neq 0 (
  echo ERROR: client npm install failed.
  pause
  exit /b 1
)

echo.
echo [3/3] Setting up database with demo data...
call node server/db/seed.js
if %errorlevel% neq 0 (
  echo ERROR: Database seed failed.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   Setup Complete!
echo ============================================================
echo.
echo   To start the app, run:  npm run dev
echo   Then open:  http://localhost:5173
echo.
echo   Demo logins:
echo     Admin:   admin / admin123
echo     Teacher: TCH001 / teacher123
echo     Student: PIS/2024/001 / student123
echo.
pause
