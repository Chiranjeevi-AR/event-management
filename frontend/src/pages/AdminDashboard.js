import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { apiService } from '../utils/api';
import AdminAttendance from './AdminAttendance';

// Admin sub-components
function AdminHome({ user }) {
  const [stats, setStats] = useState({
    events: [],
    topStudents: [],
    recentActivity: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, studentsRes] = await Promise.all([
          apiService.getEventPopularity(),
          apiService.getTopStudents()
        ]);
        
        setStats({
          events: eventsRes.data.slice(0, 5), // Top 5 events
          topStudents: studentsRes.data,
          recentActivity: 'Dashboard loaded successfully'
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({
          events: [],
          topStudents: [],
          recentActivity: 'Error loading data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-home">
      <div className="welcome-section">
        <h1>Welcome back, {user.name}!</h1>
        <p>College: {user.college_name}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Popular Events</h3>
          {stats.events.length > 0 ? (
            <div className="events-list">
              {stats.events.map(event => (
                <div key={event.id} className="event-item">
                  <strong>{event.title}</strong>
                  <span className="event-type">{event.event_type}</span>
                  <span className="event-registrations">{event.registrations} registered</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No events found</p>
          )}
          <Link to="/admin/events" className="card-action">Manage Events →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Top Active Students</h3>
          {stats.topStudents.length > 0 ? (
            <div className="students-list">
              {stats.topStudents.map((student, index) => (
                <div key={student.student_id} className="student-item">
                  <span className="rank">#{index + 1}</span>
                  <strong>{student.name}</strong>
                  <span className="attendance">{student.events_attended} events</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No student data available</p>
          )}
          <Link to="/admin/reports" className="card-action">View Reports →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/admin/events/create" className="action-btn primary">
              Create New Event
            </Link>
            <Link to="/admin/reports" className="action-btn secondary">
              View Reports
            </Link>
            <Link to="/admin/attendance" className="action-btn secondary">
              Mark Attendance
            </Link>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>System Status</h3>
          <div className="system-status">
            <div className="status-item">
              <span className="status-label">API Status:</span>
              <span className="status-value online">Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">Database:</span>
              <span className="status-value online">Connected</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Update:</span>
              <span className="status-value">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'Workshop',
    date: '',
    start_time: '',
    end_time: '',
    venue: '',
    max_capacity: 100,
    college_id: 1
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiService.getEventPopularity();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await apiService.createEvent(newEvent);
      setNewEvent({
        title: '',
        description: '',
        event_type: 'Workshop',
        date: '',
        start_time: '',
        end_time: '',
        venue: '',
        max_capacity: 100,
        college_id: 1
      });
      setShowCreateForm(false);
      fetchEvents(); // Refresh the list
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="admin-events">
      <div className="page-header">
        <h1>Event Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-event-form">
          <h2>Create New Event</h2>
          <form onSubmit={handleCreateEvent}>
            <div className="form-grid">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({...newEvent, event_type: e.target.value})}
                >
                  <option value="Workshop">Workshop</option>
                  <option value="Fest">Fest</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Capacity</label>
                <input
                  type="number"
                  value={newEvent.max_capacity}
                  onChange={(e) => setNewEvent({...newEvent, max_capacity: parseInt(e.target.value)})}
                  min="1"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                rows="3"
              />
            </div>

            <button type="submit" className="btn-primary">Create Event</button>
          </form>
        </div>
      )}

      <div className="events-list">
        <h2>All Events</h2>
        {events.length > 0 ? (
          <div className="events-grid">
            {events.map(event => (
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
                  <p><strong>Registrations:</strong> {event.registrations}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No events found. Create your first event!</p>
        )}
      </div>
    </div>
  );
}

function AdminReports() {
  const [activeReport, setActiveReport] = useState('popularity');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchReport = async (reportType) => {
    setLoading(true);
    try {
      let response;
      switch (reportType) {
        case 'popularity':
          response = await apiService.getEventPopularity(filter);
          break;
        case 'attendance':
          response = await apiService.getAttendanceReport();
          break;
        case 'participation':
          response = await apiService.getStudentParticipation();
          break;
        case 'feedback':
          response = await apiService.getFeedbackReport();
          break;
        default:
          response = await apiService.getEventPopularity();
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeReport);
  }, [activeReport, filter]);

  const reportTypes = [
    { key: 'popularity', label: 'Event Popularity' },
    { key: 'attendance', label: 'Attendance Report' },
    { key: 'participation', label: 'Student Participation' },
    { key: 'feedback', label: 'Feedback Report' }
  ];

  return (
    <div className="admin-reports">
      <h1>Reports & Analytics</h1>
      
      <div className="report-tabs">
        {reportTypes.map(report => (
          <button
            key={report.key}
            className={activeReport === report.key ? 'tab active' : 'tab'}
            onClick={() => setActiveReport(report.key)}
          >
            {report.label}
          </button>
        ))}
      </div>

      {activeReport === 'popularity' && (
        <div className="filter-section">
          <label>Filter by Event Type:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Workshop">Workshop</option>
            <option value="Fest">Fest</option>
            <option value="Seminar">Seminar</option>
          </select>
        </div>
      )}

      <div className="report-content">
        {loading ? (
          <div className="loading">Loading report...</div>
        ) : (
          <div className="report-data">
            {reportData && reportData.length > 0 ? (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      {activeReport === 'popularity' && (
                        <>
                          <th>Event</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Venue</th>
                          <th>Registrations</th>
                        </>
                      )}
                      {activeReport === 'attendance' && (
                        <>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Registrations</th>
                          <th>Present</th>
                          <th>Attendance %</th>
                        </>
                      )}
                      {activeReport === 'participation' && (
                        <>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Events Attended</th>
                        </>
                      )}
                      {activeReport === 'feedback' && (
                        <>
                          <th>Event</th>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Average Rating</th>
                          <th>Feedback Count</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <tr key={index}>
                        {activeReport === 'popularity' && (
                          <>
                            <td>{item.title}</td>
                            <td><span className={`type-badge ${item.event_type ? item.event_type.toLowerCase() : ''}`}>{item.event_type || 'N/A'}</span></td>
                            <td>{item.date}</td>
                            <td>{item.venue}</td>
                            <td><strong>{item.registrations}</strong></td>
                          </>
                        )}
                        {activeReport === 'attendance' && (
                          <>
                            <td>{item.title}</td>
                            <td>{item.date}</td>
                            <td>{item.registrations}</td>
                            <td>{item.presents}</td>
                            <td><strong>{item.attendance_percentage}%</strong></td>
                          </>
                        )}
                        {activeReport === 'participation' && (
                          <>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td><strong>{item.events_attended}</strong></td>
                          </>
                        )}
                        {activeReport === 'feedback' && (
                          <>
                            <td>{item.title}</td>
                            <td><span className={`type-badge ${item.event_type ? item.event_type.toLowerCase() : ''}`}>{item.event_type || 'N/A'}</span></td>
                            <td>{item.date}</td>
                            <td>
                              {item.avg_rating ? (
                                <span className="rating">⭐ {item.avg_rating}/5</span>
                              ) : (
                                <span className="no-rating">No ratings</span>
                              )}
                            </td>
                            <td>{item.feedback_count}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available for this report.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ user }) {
  return (
    <div className="admin-dashboard">
      <Routes>
        <Route path="/" element={<AdminHome user={user} />} />
        <Route path="/events/*" element={<AdminEvents />} />
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/attendance" element={<AdminAttendance />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;
