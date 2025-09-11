# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the **Webknot Campus Platform** - a full-stack web application for campus event management built for the Webknot Technologies campus drive assignment. The platform handles authentication, event management, attendance tracking, feedback systems, and comprehensive reporting.

**Scale**: Designed to handle ~50 colleges × 500 students × 20 events/semester

## Architecture

**Full-Stack Structure:**
- **Frontend**: React 18 (Create React App) with React Router, Axios
- **Backend**: Node.js + Express.js REST API
- **Database**: SQLite with ACID compliance (production-ready with migration path to PostgreSQL/MySQL)
- **Authentication**: Demo authentication system with bcrypt password hashing

**Key Components:**
- Admin Dashboard for event creation and management  
- Student Portal for event registration and feedback
- Comprehensive reporting system with 5 different report types
- Role-based access control (Admin/Student)

## Common Development Commands

### Backend Development
```bash
cd backend
npm install                    # Install dependencies
npm run init-db               # Initialize SQLite database with schema and sample data  
npm start                     # Start production server (port 3000)
npm run dev                   # Start development server with nodemon
```

### Frontend Development  
```bash
cd frontend
npm install                    # Install dependencies
npm start                     # Start development server (port 3001)
npm run build                 # Create production build
npm test                      # Run tests
```

### Testing & Debugging
```bash
# Backend API testing (Windows PowerShell)
cd backend && .\test-api.ps1   # Test all API endpoints

# Manual database initialization if needed
cd backend && node utils/initDatabase.js

# Debug seeding
cd backend && node debug-seed.js
```

### Full Development Startup
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run init-db && npm start

# Terminal 2 - Frontend  
cd frontend && npm install && npm start
```

## Database Architecture

**Core Tables:**
- `colleges` - Institution data
- `students` - Student profiles linked to colleges
- `events` - Campus events (Workshops, Fests, Seminars)
- `registrations` - Student event registrations with capacity limits
- `attendance` - Present/absent tracking per event
- `feedback` - 1-5 ratings and comments per event
- `admin_users` & `student_users` - Authentication tables

**Key Relationships:**
- Students belong to colleges (FK relationship)
- Events are college-specific 
- Registrations link students to events with UNIQUE constraints
- Attendance and feedback are tied to registrations

**Database Location**: `backend/data/campus_drive.db`

## API Structure

**Authentication Endpoints:**
- `POST /auth/login` - Login for both admin and student roles
- `POST /auth/signup-admin` - Admin account creation  
- `POST /auth/signup-student` - Student account creation

**Core Data Endpoints:**
- `GET|POST /colleges` - College management
- `GET|POST /events` - Event management  
- `POST /register` - Student event registration
- `POST /attendance` - Attendance marking
- `POST /feedback` - Feedback submission

**Reporting Endpoints:**
- `GET /reports/event-popularity` - Event registration counts
- `GET /reports/attendance` - Attendance percentages
- `GET /reports/student-participation` - Individual student activity
- `GET /reports/feedback` - Average ratings per event
- `GET /reports/top-students` - Most active students

## Frontend Structure

**Route-Based Architecture:**
- `/login` & `/signup` - Public authentication pages
- `/admin/*` - Admin dashboard (protected route)
- `/student/*` - Student portal (protected route)
- Navigation component with role-based menu rendering

**State Management:**
- User authentication state in localStorage
- API service layer in `src/utils/api.js`
- Role-based component rendering

## Demo Accounts

**Admin Login:**
- Email: `admin@techuni.edu.in`
- Password: `demo123`

**Student Logins:**
- `rahul.sharma@techuni.edu.in` / `demo123`
- `priya.patel@techuni.edu.in` / `demo123`  
- `arjun.singh@techuni.edu.in` / `demo123`

## Production Deployment

**Docker Deployment:**
- Multi-stage Dockerfile provided for containerized deployment
- Health check endpoint: `/health`
- Non-root user security configuration

**Environment Configuration:**
- Backend port: `PORT=3000` (configurable)
- Frontend API URL: `REACT_APP_API_URL` for production backend URL
- Database path: `backend/data/campus_drive.db`

**Scaling Considerations:**
- SQLite suitable for demo/small scale
- Migration path to PostgreSQL/MySQL documented in `PRODUCTION-DEPLOYMENT.md`  
- Database schema includes proper indexes for performance

## Key Files to Understand

**Backend Core:**
- `backend/server.js` - Main Express server with all routes
- `backend/utils/database.js` - SQLite wrapper class with connection pooling
- `backend/sql/schema.sql` - Complete database schema
- `backend/sql/seed.sql` - Sample data for development

**Frontend Core:**
- `frontend/src/App.js` - Main routing and authentication logic
- `frontend/src/utils/api.js` - API service layer with error handling
- `frontend/src/pages/AdminDashboard.js` - Admin interface
- `frontend/src/pages/StudentPortal.js` - Student interface

## Security Notes

**Current Implementation:**
- Demo authentication (not production-ready)
- Bcrypt password hashing
- Basic CORS configuration
- SQLite with foreign key constraints enabled

**Production Security Requirements:**
- Replace demo auth with JWT-based system
- Add rate limiting and input validation
- Configure CORS for specific domains  
- Add HTTPS/TLS certificates
- Implement proper session management
