#!/bin/bash
# CancerShield AI — Quick Start Script

set -e

echo ""
echo "🎗️  CancerShield AI — Early Breast Cancer Screening Assistant"
echo "============================================================"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Created backend/.env — add your OPENROUTER_API_KEY there!"
fi

pip install -r requirements.txt --break-system-packages -q
echo "✅ Backend dependencies installed"

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd ../frontend

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install --silent
echo "✅ Frontend dependencies installed"

echo ""
echo "🚀 Starting services..."
echo ""
echo "  Backend  → http://localhost:5000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Start backend in background
cd ../backend
python app.py &
BACKEND_PID=$!

# Start frontend dev server
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait and handle Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servers stopped.'; exit 0" SIGINT SIGTERM
wait
