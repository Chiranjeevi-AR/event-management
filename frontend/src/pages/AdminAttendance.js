import React, { useEffect, useState } from 'react';
import { apiService } from '../utils/api';

function AdminAttendance() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const eventsRes = await apiService.getEvents();
        setEvents(eventsRes.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, []);

  useEffect(() => {
    const loadRegistrations = async () => {
      if (!selectedEvent) return;
      try {
        const regs = await apiService.getRegistrations();
        setRegistrations(regs.data.filter(r => r.event_id === parseInt(selectedEvent)));
      } catch (err) {
        console.error('Failed to load registrations', err);
      }
    };
    loadRegistrations();
  }, [selectedEvent]);

  const mark = async (studentId, status) => {
    try {
      setSaving(true);
      await apiService.markAttendance({ student_id: studentId, event_id: parseInt(selectedEvent), status });
      alert(`Marked ${status} for student ${studentId}`);
    } catch (err) {
      console.error('Failed to mark attendance', err);
      alert('Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading attendance module...</div>;
  }

  return (
    <div className="admin-attendance">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <div className="filter-section">
          <label>Select Event</label>
          <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
            <option value="">Choose event...</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} - {ev.date}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedEvent ? (
        <p>Please select an event to mark attendance.</p>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length > 0 ? (
                registrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.student_name}</td>
                    <td>{reg.email}</td>
                    <td>
                      <button className="btn-primary" disabled={saving} onClick={() => mark(reg.student_id, 'present')}>Mark Present</button>
                      <span style={{ margin: '0 8px' }}></span>
                      <button className="btn-secondary" disabled={saving} onClick={() => mark(reg.student_id, 'absent')}>Mark Absent</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No registrations for this event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAttendance;
