import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Components
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/AdminDashboard';
import StudentPortal from './pages/StudentPortal';
import Navigation from './components/Navigation';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (localStorage)
    const savedUser = localStorage.getItem('campus_drive_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('campus_drive_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campus_drive_user');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Campus Event Portal...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Navigation user={user} onLogout={logout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/signup" 
            element={!user ? <SignUp onLogin={login} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/admin/*" 
            element={
              user && user.role === 'admin' ? 
              <AdminDashboard user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/student/*" 
            element={
              user && user.role === 'student' ? 
              <StudentPortal user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          
          <Route 
            path="/" 
            element={
              user ? 
                (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/student" />) :
                <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
