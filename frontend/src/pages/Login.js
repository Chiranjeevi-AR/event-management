import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../utils/api';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login(formData.email, formData.password, formData.role);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@techuni.edu.in', role: 'admin', name: 'College Admin' },
    { email: 'rahul.sharma@techuni.edu.in', role: 'student', name: 'Rahul Sharma' },
    { email: 'priya.patel@techuni.edu.in', role: 'student', name: 'Priya Patel' },
    { email: 'arjun.singh@techuni.edu.in', role: 'student', name: 'Arjun Singh' }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Campus Event Portal</h1>
          <p>Webknot Technologies</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Login as</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="signup-links">
          <p>Don't have an account? <Link to="/signup">Create one here</Link></p>
        </div>
        
        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <p>Password for all accounts: <strong>demo123</strong></p>
          <div className="demo-list">
            {demoAccounts.map((account, index) => (
              <div key={index} className="demo-account">
                <strong>{account.name}</strong> ({account.role})
                <br />
                <span className="demo-email">{account.email}</span>
                <button 
                  type="button"
                  className="quick-login"
                  onClick={() => {
                    setFormData({
                      email: account.email,
                      password: 'demo123',
                      role: account.role
                    });
                  }}
                >
                  Quick Login
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
