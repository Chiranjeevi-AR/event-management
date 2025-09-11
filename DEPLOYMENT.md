# Deployment Guide

## Backend Deployment (Render)

### Steps:
1. Go to [Render Dashboard](https://render.com/)
2. Create new Web Service from GitHub repo: `https://github.com/Chiranjeevi-AR/event-management.git`
3. Configuration:
   - **Name**: `webknot-campus-backend`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`

### Expected URL: 
`https://webknot-campus-backend.onrender.com`

## Frontend Deployment (Vercel)

### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Import GitHub repo: `https://github.com/Chiranjeevi-AR/event-management.git`
3. Configuration:
   - **Framework**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Environment Variables (auto-configured):
- `REACT_APP_API_URL`: `https://webknot-campus-backend.onrender.com`

## Post-Deployment Tasks

### 1. Update API URL
Once backend is deployed, update the actual Render URL in:
- `frontend/.env.production`
- `frontend/vercel.json`
- Redeploy frontend

### 2. Test Backend Endpoints
Test these key endpoints:
```bash
# Health check
curl https://webknot-campus-backend.onrender.com/health

# Get colleges
curl https://webknot-campus-backend.onrender.com/colleges

# API info
curl https://webknot-campus-backend.onrender.com/
```

### 3. Test Frontend
- Visit deployed Vercel URL
- Test user registration
- Test login functionality
- Test admin dashboard
- Test student portal

### 4. Update CORS (if needed)
If you encounter CORS errors, update backend CORS configuration to include your Vercel domain.

## Troubleshooting

### Common Issues:
1. **Database errors**: First deployment may take time to initialize SQLite
2. **CORS errors**: Update CORS origins in backend
3. **Build failures**: Check logs in Render/Vercel dashboards
4. **API connection**: Verify environment variables are correct

### Logs:
- **Render**: Check deployment logs in Render dashboard
- **Vercel**: Check function logs in Vercel dashboard

## Development vs Production

### Local Development:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

### Production:
- Backend: `https://webknot-campus-backend.onrender.com`
- Frontend: `https://your-project-name.vercel.app`

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

