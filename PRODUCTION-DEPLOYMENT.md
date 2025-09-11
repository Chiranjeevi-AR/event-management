# Campus Drive Platform - Production Deployment Guide

## Overview
This is a complete full-stack web application for campus event management featuring authentication, event management, attendance tracking, feedback system, and comprehensive reporting.

## Architecture
- **Frontend**: React (Create React App) with React Router, Axios
- **Backend**: Node.js with Express.js
- **Database**: SQLite (production-ready with ACID compliance)
- **Authentication**: Demo authentication system (can be replaced with JWT/OAuth)

## Quick Start

### Development
1. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run init-db  # Initialize database with sample data
   npm start        # Runs on http://localhost:3000
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start        # Runs on http://localhost:3001
   ```

### Demo Accounts
- **Admin**: admin@techuni.edu.in / demo123
- **Students**: 
  - rahul.sharma@techuni.edu.in / demo123
  - priya.patel@techuni.edu.in / demo123
  - arjun.singh@techuni.edu.in / demo123

## Production Deployment

### Option 1: Separate Deployment (Recommended)

**Backend Deployment:**
1. Deploy backend to a server/cloud platform (Heroku, AWS, DigitalOcean)
2. Install Node.js and npm
3. Copy backend files
4. Run: `npm install --production`
5. Set environment variables if needed
6. Start with PM2 or similar process manager: `pm2 start server.js`

**Frontend Deployment:**
1. Build the React app: `npm run build`
2. Deploy the `build` folder to a static hosting service (Netlify, Vercel, S3)
3. Update API base URL in `src/utils/api.js` to point to your backend server

### Option 2: Single Server Deployment

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Serve Frontend from Express**:
   Add to `backend/server.js` after other routes:
   ```javascript
   const path = require('path');
   
   // Serve React static files
   app.use(express.static(path.join(__dirname, '../frontend/build')));
   
   // Handle React Router - serve index.html for all non-API routes
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
   });
   ```

3. **Deploy everything as a single app**

### Option 3: Docker Deployment

Create `Dockerfile` in root:
```dockerfile
# Multi-stage build
FROM node:16-alpine as build
WORKDIR /app

# Build frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Build backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci
COPY backend/ ./backend/

# Production stage
FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/backend ./backend
COPY --from=build /app/frontend/build ./frontend/build
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "start"]
```

## Database Scaling

For larger deployments, replace SQLite with PostgreSQL or MySQL:

1. Install database driver: `npm install pg` (for PostgreSQL)
2. Update `backend/utils/database.js` to use the new database
3. Convert SQL schema from SQLite to target database syntax
4. Update connection configuration

## Environment Configuration

Create `.env` file in backend directory:
```
PORT=3000
NODE_ENV=production
DB_PATH=./campus_drive.db
# Add other configuration as needed
```

## Security Considerations

### Production Hardening:
1. **Authentication**: Replace demo auth with proper JWT-based authentication
2. **CORS**: Configure CORS for your specific domains
3. **Rate Limiting**: Add rate limiting middleware
4. **Input Validation**: Add request validation middleware
5. **HTTPS**: Use SSL/TLS certificates
6. **Environment Variables**: Store sensitive data in environment variables

### Recommended Security Additions:
```bash
npm install helmet express-rate-limit joi bcryptjs jsonwebtoken
```

## Performance Optimizations

1. **Database Indexing**: Add indexes to frequently queried columns
2. **Caching**: Implement Redis or in-memory caching for reports
3. **Database Connection Pooling**: For PostgreSQL/MySQL deployments
4. **CDN**: Serve static assets through a CDN
5. **Compression**: Enable gzip compression

## Monitoring & Logging

1. **Application Monitoring**: Use PM2, Forever, or systemd
2. **Error Logging**: Implement Winston or similar logging library
3. **Health Checks**: The `/health` endpoint is already implemented
4. **Analytics**: Add application analytics if needed

## API Documentation

The backend provides comprehensive REST APIs:

### Core Endpoints:
- `POST /auth/login` - Authentication
- `POST /colleges` - Create college
- `POST /students` - Register student
- `POST /events` - Create event
- `POST /register` - Register for event
- `POST /attendance` - Mark attendance
- `POST /feedback` - Submit feedback

### Data Endpoints:
- `GET /events` - List events
- `GET /students` - List students
- `GET /registrations` - List registrations

### Reports:
- `GET /reports/event-popularity` - Event popularity
- `GET /reports/attendance` - Attendance reports
- `GET /reports/student-participation` - Student participation
- `GET /reports/feedback` - Feedback reports
- `GET /reports/top-students` - Top active students

## Backup Strategy

1. **Database Backup**: 
   - SQLite: Copy the `.db` file regularly
   - PostgreSQL/MySQL: Use database-specific backup tools

2. **Application Backup**: Version control with Git

3. **Automated Backups**: Set up cron jobs for regular backups

## Troubleshooting

### Common Issues:
1. **Port conflicts**: Change PORT in environment variables
2. **Database locked**: Ensure only one process accesses SQLite
3. **CORS errors**: Configure CORS properly for your domains
4. **Build errors**: Clear `node_modules` and reinstall dependencies

### Logs Location:
- Backend logs: Console output (configure file logging as needed)
- Frontend logs: Browser console and server logs

## Support & Maintenance

1. **Dependencies**: Regularly update npm packages
2. **Security**: Monitor for security vulnerabilities
3. **Performance**: Monitor application performance and scale as needed
4. **Backups**: Verify backup integrity regularly

## Scaling Considerations

### Horizontal Scaling:
1. Load balancer with multiple backend instances
2. Database clustering or read replicas
3. Session storage in Redis/external store
4. File storage in cloud storage (S3, etc.)

### Vertical Scaling:
1. Increase server resources (CPU, RAM)
2. Database optimization and indexing
3. Implement caching strategies

---

**Built for Webknot Technologies Campus Drive Assignment**

This platform is production-ready and can handle the specified scale of ~50 colleges × 500 students × 20 events/semester with proper deployment and infrastructure.
