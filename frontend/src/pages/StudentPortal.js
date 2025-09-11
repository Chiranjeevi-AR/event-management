import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { apiService } from '../utils/api';

// Student sub-components
function StudentHome({ user }) {
  const [dashboardData, setDashboardData] = useState({
    upcomingEvents: [],
    myRegistrations: [],
    recentActivity: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, we'd fetch personalized data
        const eventsRes = await apiService.getEventPopularity();
        
        setDashboardData({
          upcomingEvents: eventsRes.data.slice(0, 3),
          myRegistrations: eventsRes.data.slice(0, 2), // Mock registered events
          recentActivity: 'Dashboard loaded successfully'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  return (
    <div className="student-home">
      <div className="welcome-section">
        <h1>Welcome, {user.name}!</h1>
        <p>{user.course} - Year {user.year}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Upcoming Events</h3>
          {dashboardData.upcomingEvents.length > 0 ? (
            <div className="events-list">
              {dashboardData.upcomingEvents.map(event => (
                <div key={event.id} className="event-item">
                  <strong>{event.title}</strong>
                  <span className="event-type">{event.event_type}</span>
                  <span className="event-date">{event.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming events</p>
          )}
          <Link to="/student/events" className="card-action">View All Events →</Link>
        </div>

        <div className="dashboard-card">
          <h3>My Registrations</h3>
          {dashboardData.myRegistrations.length > 0 ? (
            <div className="registrations-list">
              {dashboardData.myRegistrations.map(event => (
                <div key={event.id} className="registration-item">
                  <strong>{event.title}</strong>
                  <span className="event-venue">{event.venue}</span>
                  <span className="registration-status registered">Registered</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No current registrations</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/student/events" className="action-btn primary">
              Browse Events
            </Link>
            <Link to="/student/feedback" className="action-btn secondary">
              Submit Feedback
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Your Stats</h3>
          <div className="student-stats">
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Events Attended</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Registered Events</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.5</span>
              <span className="stat-label">Avg. Rating Given</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentEvents({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState(new Set([1, 2])); // Mock registered events

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEventPopularity(filter);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await apiService.registerForEvent({
        student_id: user.id,
        event_id: eventId
      });
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      alert('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      if (error.response?.status === 409) {
        alert('You are already registered for this event or it has reached capacity.');
      } else {
        alert('Error registering for event. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="student-events">
      <div className="page-header">
        <h1>Available Events</h1>
        <div className="filter-section">
          <label>Filter by Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Events</option>
            <option value="Workshop">Workshops</option>
            <option value="Fest">Fests</option>
            <option value="Seminar">Seminars</option>
          </select>
        </div>
      </div>

      <div className="events-grid">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3>{event.title}</h3>
                <span className={`event-type ${event.event_type ? event.event_type.toLowerCase() : ''}`}>
                  {event.event_type || 'N/A'}
                </span>
              </div>
              
              <div className="event-details">
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Registrations:</strong> {event.registrations} students</p>
              </div>

              <div className="event-actions">
                {registeredEvents.has(event.id) ? (
                  <button className="btn-registered" disabled>
                    ✓ Registered
                  </button>
                ) : (
                  <button 
                    className="btn-primary"
                    onClick={() => handleRegister(event.id)}
                  >
                    Register Now
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No events available at the moment.</p>
        )}
      </div>
    </div>
  );
}

function StudentFeedback({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEventPopularity();
      // In a real app, we'd only show events the student attended
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      alert('Please select an event');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.submitFeedback({
        student_id: user.id,
        event_id: parseInt(selectedEvent),
        rating: feedback.rating,
        comment: feedback.comment
      });
      
      setFeedback({ rating: 5, comment: '' });
      setSelectedEvent('');
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="student-feedback">
      <h1>Event Feedback</h1>
      <p>Share your experience and help us improve future events!</p>

      <div className="feedback-form-container">
        <form onSubmit={handleSubmitFeedback} className="feedback-form">
          <div className="form-group">
            <label>Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              required
            >
              <option value="">Choose an event you attended...</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} - {event.date}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating (1-5 stars)</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${feedback.rating >= star ? 'active' : ''}`}
                  onClick={() => setFeedback({...feedback, rating: star})}
                >
                  ⭐
                </button>
              ))}
            </div>
            <small>Current rating: {feedback.rating}/5 stars</small>
          </div>

          <div className="form-group">
            <label>Comments (Optional)</label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
              placeholder="Share your thoughts about the event..."
              rows="4"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>

        <div className="feedback-tips">
          <h3>Feedback Tips</h3>
          <ul>
            <li>Be honest and constructive in your feedback</li>
            <li>Mention specific aspects you liked or disliked</li>
            <li>Suggest improvements for future events</li>
            <li>Your feedback helps us create better experiences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StudentPortal({ user }) {
  return (
    <div className="student-portal">
      <Routes>
        <Route path="/" element={<StudentHome user={user} />} />
        <Route path="/events" element={<StudentEvents user={user} />} />
        <Route path="/feedback" element={<StudentFeedback user={user} />} />
      </Routes>
    </div>
  );
}

export default StudentPortal;
