import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService, apiService } from '../utils/api';

function SignUp({ onLogin }) {
  const [formData, setFormData] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college_id: '',
    course: '',
    year: ''
  });
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await apiService.getColleges();
      console.log('Colleges response:', response); // Debug log
      setColleges(response.data || response); // Handle both response formats
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError('Failed to load colleges');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Clear student-specific fields when switching to admin
      ...(role === 'admin' && { phone: '', course: '', year: '' })
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (!formData.college_id) {
      return 'Please select a college';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      const signupData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        college_id: parseInt(formData.college_id)
      };

      if (formData.role === 'admin') {
        response = await authService.signupAdmin(signupData);
      } else {
        // Add student-specific fields
        signupData.phone = formData.phone.trim();
        signupData.course = formData.course.trim();
        signupData.year = formData.year ? parseInt(formData.year) : null;
        response = await authService.signupStudent(signupData);
      }

      setSuccess(response.message);
      
      // Auto-login the user after successful registration
      setTimeout(() => {
        onLogin(response.user);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Join Campus Event Portal</h1>
          <p>Create your account</p>
        </div>

        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${formData.role === 'student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('student')}
          >
            Student
          </button>
          <button
            type="button"
            className={`role-btn ${formData.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="college_id">College *</label>
              <select
                id="college_id"
                name="college_id"
                value={formData.college_id}
                onChange={handleChange}
                required
              >
                <option value="">Select your college</option>
                {colleges.map(college => (
                  <option key={college.id} value={college.id}>
                    {college.name} - {college.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label htmlFor="course">Course</label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="form-group half-width">
                  <label htmlFor="year">Year</label>
                  <select
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                minLength="6"
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
                minLength="6"
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Creating Account...' : `Create ${formData.role === 'admin' ? 'Admin' : 'Student'} Account`}
          </button>
        </form>

        <div className="signup-links">
          <p>Already have an account? <Link to="/login">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
