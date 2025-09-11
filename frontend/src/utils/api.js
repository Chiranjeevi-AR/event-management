import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const apiService = {
  // Health check
  getHealth: () => api.get('/health'),

  // Colleges
  createCollege: (data) => api.post('/colleges', data),
  getColleges: () => api.get('/colleges'),
  
  // Students
  createStudent: (data) => api.post('/students', data),
  getStudents: () => api.get('/students'),
  
  // Events
  createEvent: (data) => api.post('/events', data),
  getEvents: () => api.get('/events'),
  
  // Registration
  registerForEvent: (data) => api.post('/register', data),
  getRegistrations: () => api.get('/registrations'),
  
  // Attendance
  markAttendance: (data) => api.post('/attendance', data),
  
  // Feedback
  submitFeedback: (data) => api.post('/feedback', data),
  
  // Reports
  getEventPopularity: (type = null) => {
    const url = type ? `/reports/event-popularity?type=${type}` : '/reports/event-popularity';
    return api.get(url);
  },
  getAttendanceReport: () => api.get('/reports/attendance'),
  getStudentParticipation: () => api.get('/reports/student-participation'),
  getFeedbackReport: () => api.get('/reports/feedback'),
  getTopStudents: () => api.get('/reports/top-students'),
};

// Authentication service
export const authService = {
  login: async (email, password, role) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      if (response.data.success) {
        return response.data.user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Authentication failed');
    }
  },
  
  signupAdmin: async (data) => {
    try {
      const response = await api.post('/auth/signup-admin', data);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed');
    }
  },
  
  signupStudent: async (data) => {
    try {
      const response = await api.post('/auth/signup-student', data);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed');
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout can fail silently
      console.error('Logout error:', error);
    }
  }
};

export default api;
