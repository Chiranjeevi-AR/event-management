-- Campus Drive Assignment - Seed Data
-- Sample data for demo: 1 college, 3 students, 2 events

-- Insert sample colleges
INSERT INTO colleges (name, location, contact_email) VALUES
('Tech University Mumbai', 'Mumbai, Maharashtra', 'admin@techuni.edu.in'),
('Delhi Engineering College', 'New Delhi, Delhi', 'admin@dec.edu.in'),
('Bangalore Institute of Technology', 'Bangalore, Karnataka', 'admin@bit.edu.in'),
('Chennai Technical University', 'Chennai, Tamil Nadu', 'admin@ctu.edu.in'),
('Pune College of Engineering', 'Pune, Maharashtra', 'admin@pce.edu.in');

-- Insert sample students
INSERT INTO students (name, email, phone, college_id, course, year) VALUES
('Rahul Sharma', 'rahul.sharma@techuni.edu.in', '9876543210', 1, 'Computer Science Engineering', 3),
('Priya Patel', 'priya.patel@techuni.edu.in', '9876543211', 1, 'Information Technology', 2),
('Arjun Singh', 'arjun.singh@techuni.edu.in', '9876543212', 1, 'Electronics Engineering', 4);

-- Insert sample events
INSERT INTO events (title, description, event_type, date, start_time, end_time, venue, max_capacity, college_id, created_by) VALUES
('Full Stack Development Workshop', 'Comprehensive workshop on MEAN/MERN stack development covering Node.js, React, MongoDB, and deployment strategies.', 'Workshop', '2024-01-15', '10:00:00', '16:00:00', 'Computer Lab 1', 50, 1, 'Admin'),
('Annual Tech Fest 2024', 'Three-day technical festival featuring coding competitions, hackathons, tech talks, and networking opportunities.', 'Fest', '2024-02-20', '09:00:00', '18:00:00', 'Main Auditorium', 200, 1, 'Admin');

-- Insert sample registrations
INSERT INTO registrations (student_id, event_id, status) VALUES
(1, 1, 'registered'), -- Rahul for Workshop
(2, 1, 'registered'), -- Priya for Workshop
(3, 1, 'registered'), -- Arjun for Workshop
(1, 2, 'registered'), -- Rahul for Tech Fest
(2, 2, 'registered'); -- Priya for Tech Fest

-- Insert sample attendance records
INSERT INTO attendance (student_id, event_id, status, marked_by) VALUES
(1, 1, 'present', 'Admin'), -- Rahul attended Workshop
(2, 1, 'present', 'Admin'), -- Priya attended Workshop
(3, 1, 'absent', 'Admin'),  -- Arjun missed Workshop
(1, 2, 'present', 'Admin'), -- Rahul attended Tech Fest
(2, 2, 'present', 'Admin'); -- Priya attended Tech Fest

-- Insert sample feedback
INSERT INTO feedback (student_id, event_id, rating, comment) VALUES
(1, 1, 5, 'Excellent workshop! Very comprehensive and hands-on. Learned a lot about full-stack development.'),
(2, 1, 4, 'Great content and instructor. Would like more practical exercises.'),
(1, 2, 5, 'Amazing tech fest! Great networking opportunities and exciting competitions.'),
(2, 2, 4, 'Well organized event with good variety of activities. Looking forward to next year!');
