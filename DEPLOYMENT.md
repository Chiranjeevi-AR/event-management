# Webknot Campus Platform - Full Stack

This is a deployable full-stack prototype suitable for college rollout.

Contents:
- Backend: Node.js + Express + SQLite
- Frontend: React (Admin Dashboard + Student Portal)

Quick Start (Development)
- Backend:
  1) cd backend
  2) npm install
  3) npm run init-db
  4) npm start (http://localhost:3000)
- Frontend:
  1) open new terminal
  2) cd frontend
  3) npm install
  4) npm start (http://localhost:3001 by CRA or http://localhost:3000 via proxy)

Demo Login Accounts
- Admin: admin@techuni.edu.in / demo123
- Student: rahul.sharma@techuni.edu.in / demo123
- Student: priya.patel@techuni.edu.in / demo123
- Student: arjun.singh@techuni.edu.in / demo123

Production Build
1) Backend: remains as Node + Express with SQLite file
2) Frontend: cd frontend && npm run build
3) Serve frontend statically via backend (optional step below)

Optional: Serve React build from Express
- Copy frontend/build into backend/public and enable static serving in server.js
- Or set up a reverse proxy (nginx/IIS) mapping /api to backend and / to frontend build

Notes
- Authentication is simplified (demo only). For production, integrate JWT-based auth.
- SQLite can be replaced with PostgreSQL/MySQL for larger scale.
- CORS is enabled in development and can be restricted in production.

