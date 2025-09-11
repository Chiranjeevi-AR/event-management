import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Campus Event Portal</Link>
      </div>

      <div className="nav-links">
        {user.role === 'admin' ? (
          <>
            <Link 
              to="/admin" 
              className={isActive('/admin') ? 'nav-link active' : 'nav-link'}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/events" 
              className={isActive('/admin/events') ? 'nav-link active' : 'nav-link'}
            >
              Events
            </Link>
            <Link 
              to="/admin/attendance" 
              className={isActive('/admin/attendance') ? 'nav-link active' : 'nav-link'}
            >
              Attendance
            </Link>
            <Link 
              to="/admin/reports" 
              className={isActive('/admin/reports') ? 'nav-link active' : 'nav-link'}
            >
              Reports
            </Link>
          </>
        ) : (
          <>
            <Link 
              to="/student" 
              className={isActive('/student') && location.pathname === '/student' ? 'nav-link active' : 'nav-link'}
            >
              Dashboard
            </Link>
            <Link 
              to="/student/events" 
              className={isActive('/student/events') ? 'nav-link active' : 'nav-link'}
            >
              Events
            </Link>
            <Link 
              to="/student/feedback" 
              className={isActive('/student/feedback') ? 'nav-link active' : 'nav-link'}
            >
              Feedback
            </Link>
          </>
        )}
      </div>

      <div className="nav-user">
        <span className="user-info">
          Welcome, {user.name}
          <small>({user.role})</small>
        </span>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navigation;
