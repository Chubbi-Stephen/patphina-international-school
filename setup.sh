#!/bin/bash
echo ""
echo "============================================================"
echo "  Patphina International School - Setup"
echo "============================================================"
echo ""

echo "[1/3] Installing backend dependencies..."
npm install || { echo "ERROR: npm install failed"; exit 1; }

echo ""
echo "[2/3] Installing frontend dependencies..."
npm install --prefix client || { echo "ERROR: client install failed"; exit 1; }

echo ""
echo "[3/3] Setting up database with demo data..."
node server/db/seed.js || { echo "ERROR: seed failed"; exit 1; }

echo ""
echo "============================================================"
echo "  Setup Complete!"
echo "============================================================"
echo ""
echo "  Run:   npm run dev"
echo "  Open:  http://localhost:5173"
echo ""
echo "  Admin:   admin / admin123"
echo "  Teacher: TCH001 / teacher123"
echo "  Student: PIS/2024/001 / student123"
echo ""
