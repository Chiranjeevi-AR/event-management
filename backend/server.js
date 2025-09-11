// Campus Drive Assignment - Backend API
// Technologies: Node.js, Express, SQLite

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const database = require("./utils/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route - API info
app.get("/", (req, res) => {
  res.json({
    message: "Campus Drive API - Webknot Technologies",
    version: "1.0.0",
    status: "running",
    documentation: "See README.md for sample curl commands",
  });
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- START SERVER WITH DB INIT ---
async function startServer() {
  try {
    await database.connect();
    await database.initializeSchema();

    const hasData = await database.hasData();
    if (!hasData) {
      console.log("⚠️ No data found → Seeding...");
      await database.seedData();
    }

    // ------------------ ROUTES ------------------

    // Colleges
    app.get("/colleges", async (req, res) => {
      try {
        const colleges = await database.all(
          "SELECT id, name, location FROM colleges ORDER BY name ASC"
        );
        res.json(colleges);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch colleges" });
      }
    });

    app.post("/colleges", async (req, res) => {
      try {
        const { name, location, contact_email } = req.body;
        if (!name || !location)
          return res.status(400).json({ error: "name and location required" });

        const result = await database.run(
          `INSERT INTO colleges (name, location, contact_email) VALUES (?, ?, ?)`,
          [name, location, contact_email || null]
        );
        const college = await database.get(
          "SELECT * FROM colleges WHERE id = ?",
          [result.id]
        );
        res.status(201).json(college);
      } catch (err) {
        res.status(500).json({ error: "Failed to create college" });
      }
    });

    // Auth: Admin Signup
    app.post("/auth/signup-admin", async (req, res) => {
      try {
        const { name, email, password, college_id } = req.body;
        if (!name || !email || !password || !college_id)
          return res
            .status(400)
            .json({ error: "Name, email, password, college required" });

        if (password.length < 6)
          return res
            .status(400)
            .json({ error: "Password must be at least 6 characters long" });

        const existingAdmin = await database.get(
          "SELECT id FROM admin_users WHERE email = ?",
          [email]
        );
        if (existingAdmin)
          return res.status(409).json({ error: "Email already registered" });

        const college = await database.get(
          "SELECT id, name FROM colleges WHERE id = ?",
          [college_id]
        );
        if (!college)
          return res.status(400).json({ error: "Invalid college selected" });

        const password_hash = await bcrypt.hash(password, 10);

        const result = await database.run(
          "INSERT INTO admin_users (name, email, password_hash, college_id) VALUES (?, ?, ?, ?)",
          [name, email, password_hash, college_id]
        );

        res.status(201).json({
          success: true,
          message: "Admin account created",
          user: {
            id: result.id,
            name,
            email,
            role: "admin",
            college_id,
            college_name: college.name,
          },
        });
      } catch (err) {
        res.status(500).json({ error: "Failed to create admin account" });
      }
    });

    // Auth: Student Signup
    app.post("/auth/signup-student", async (req, res) => {
      try {
        const { name, email, password, phone, college_id, course, year } =
          req.body;

        if (!name || !email || !password || !college_id)
          return res
            .status(400)
            .json({ error: "Name, email, password, college required" });

        if (password.length < 6)
          return res
            .status(400)
            .json({ error: "Password must be at least 6 characters long" });

        const existing = await database.get(
          "SELECT id FROM student_users WHERE email = ?",
          [email]
        );
        if (existing)
          return res.status(409).json({ error: "Email already registered" });

        const college = await database.get(
          "SELECT id, name FROM colleges WHERE id = ?",
          [college_id]
        );
        if (!college)
          return res.status(400).json({ error: "Invalid college selected" });

        const password_hash = await bcrypt.hash(password, 10);

        const studentRes = await database.run(
          "INSERT INTO students (name, email, phone, college_id, course, year) VALUES (?, ?, ?, ?, ?, ?)",
          [name, email, phone || null, college_id, course || null, year || null]
        );

        await database.run(
          "INSERT INTO student_users (student_id, email, password_hash) VALUES (?, ?, ?)",
          [studentRes.id, email, password_hash]
        );

        res.status(201).json({
          success: true,
          message: "Student account created",
          user: {
            id: studentRes.id,
            name,
            email,
            role: "student",
            college_id,
            college_name: college.name,
            course,
            year,
          },
        });
      } catch (err) {
        res.status(500).json({ error: "Failed to create student account" });
      }
    });

    // Auth: Login
    app.post("/auth/login", async (req, res) => {
      try {
        const { email, password, role } = req.body;
        if (!email || !password)
          return res
            .status(400)
            .json({ error: "Email and password are required" });

        let user = null;
        if (role === "admin") {
          const admin = await database.get(
            `SELECT au.*, c.name as college_name 
             FROM admin_users au 
             LEFT JOIN colleges c ON au.college_id = c.id 
             WHERE au.email = ?`,
            [email]
          );
          if (admin && (await bcrypt.compare(password, admin.password_hash))) {
            user = {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: "admin",
              college_id: admin.college_id,
              college_name: admin.college_name,
            };
          }
        } else {
          const student = await database.get(
            `SELECT su.*, s.name, s.course, s.year, c.name as college_name
             FROM student_users su
             JOIN students s ON su.student_id = s.id
             LEFT JOIN colleges c ON s.college_id = c.id
             WHERE su.email = ?`,
            [email]
          );
          if (
            student &&
            (await bcrypt.compare(password, student.password_hash))
          ) {
            user = {
              id: student.student_id,
              name: student.name,
              email: student.email,
              role: "student",
              college_id: student.college_id,
              college_name: student.college_name,
              course: student.course,
              year: student.year,
            };
          }
        }

        if (user) res.json({ success: true, user });
        else res.status(401).json({ error: "Invalid credentials" });
      } catch (err) {
        res.status(500).json({ error: "Authentication failed" });
      }
    });

    app.post("/auth/logout", (req, res) =>
      res.json({ success: true, message: "Logged out" })
    );

    // Events
    app.get("/events", async (req, res) => {
      try {
        const events = await database.all("SELECT * FROM events ORDER BY date DESC");
        res.json(events);
      } catch {
        res.status(500).json({ error: "Failed to fetch events" });
      }
    });

    app.post("/events", async (req, res) => {
      try {
        const {
          title,
          description,
          event_type,
          date,
          start_time,
          end_time,
          venue,
          max_capacity,
          college_id,
          created_by,
        } = req.body;

        if (!title || !event_type || !date || !start_time || !end_time || !venue || !college_id)
          return res.status(400).json({ error: "Missing required fields" });

        const result = await database.run(
          `INSERT INTO events (title, description, event_type, date, start_time, end_time, venue, max_capacity, college_id, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            description || null,
            event_type,
            date,
            start_time,
            end_time,
            venue,
            max_capacity || 100,
            college_id,
            created_by || "Admin",
          ]
        );
        const event = await database.get("SELECT * FROM events WHERE id = ?", [result.id]);
        res.status(201).json(event);
      } catch {
        res.status(500).json({ error: "Failed to create event" });
      }
    });

    // Registrations
    app.post("/register", async (req, res) => {
      try {
        const { student_id, event_id } = req.body;
        if (!student_id || !event_id)
          return res.status(400).json({ error: "student_id and event_id required" });

        const event = await database.get("SELECT * FROM events WHERE id = ?", [event_id]);
        if (!event) return res.status(404).json({ error: "Event not found" });

        const count = await database.get(
          "SELECT COUNT(*) as c FROM registrations WHERE event_id = ?",
          [event_id]
        );
        if (event.max_capacity && count.c >= event.max_capacity)
          return res.status(409).json({ error: "Event capacity reached" });

        const result = await database.run(
          "INSERT INTO registrations (student_id, event_id, status) VALUES (?, ?, 'registered')",
          [student_id, event_id]
        );
        const reg = await database.get("SELECT * FROM registrations WHERE id = ?", [result.id]);
        res.status(201).json(reg);
      } catch (err) {
        if (/UNIQUE/.test(err.message))
          return res.status(409).json({ error: "Student already registered" });
        res.status(500).json({ error: "Failed to register student" });
      }
    });

    // Attendance
    app.post("/attendance", async (req, res) => {
      try {
        const { student_id, event_id, status } = req.body;
        if (!student_id || !event_id)
          return res.status(400).json({ error: "student_id and event_id required" });

        const attStatus = status && ["present", "absent"].includes(status)
          ? status
          : "present";

        try {
          await database.run(
            "INSERT INTO attendance (student_id, event_id, status) VALUES (?, ?, ?)",
            [student_id, event_id, attStatus]
          );
        } catch (e) {
          if (/UNIQUE/.test(e.message)) {
            await database.run(
              "UPDATE attendance SET status = ?, marked_at = CURRENT_TIMESTAMP WHERE student_id = ? AND event_id = ?",
              [attStatus, student_id, event_id]
            );
          } else throw e;
        }

        const att = await database.get(
          "SELECT * FROM attendance WHERE student_id = ? AND event_id = ?",
          [student_id, event_id]
        );
        res.status(201).json(att);
      } catch {
        res.status(500).json({ error: "Failed to mark attendance" });
      }
    });

    // Feedback
    app.post("/feedback", async (req, res) => {
      try {
        const { student_id, event_id, rating, comment } = req.body;
        if (!student_id || !event_id || typeof rating !== "number")
          return res
            .status(400)
            .json({ error: "student_id, event_id, rating required" });

        if (rating < 1 || rating > 5)
          return res.status(400).json({ error: "rating must be 1-5" });

        try {
          await database.run(
            "INSERT INTO feedback (student_id, event_id, rating, comment) VALUES (?, ?, ?, ?)",
            [student_id, event_id, rating, comment || null]
          );
        } catch (e) {
          if (/UNIQUE/.test(e.message)) {
            await database.run(
              "UPDATE feedback SET rating = ?, comment = ?, submitted_at = CURRENT_TIMESTAMP WHERE student_id = ? AND event_id = ?",
              [rating, comment || null, student_id, event_id]
            );
          } else throw e;
        }

        const fb = await database.get(
          "SELECT * FROM feedback WHERE student_id = ? AND event_id = ?",
          [student_id, event_id]
        );
        res.status(201).json(fb);
      } catch {
        res.status(500).json({ error: "Failed to submit feedback" });
      }
    });

    // ------------------ REPORTS ------------------

    app.get("/reports/event-popularity", async (req, res) => {
      try {
        const { type } = req.query;
        const where = type ? "WHERE e.event_type = ?" : "";
        const params = type ? [type] : [];
        const rows = await database.all(
          `SELECT e.id, e.title, e.event_type, e.date,
                  COUNT(r.id) AS registrations
           FROM events e
           LEFT JOIN registrations r ON e.id = r.event_id
           ${where}
           GROUP BY e.id
           ORDER BY registrations DESC`,
          params
        );
        res.json(rows);
      } catch {
        res.status(500).json({ error: "Failed to fetch event popularity" });
      }
    });

    app.get("/reports/attendance", async (req, res) => {
      try {
        const rows = await database.all(
          `SELECT e.id, e.title, COUNT(r.id) as registrations,
                  SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as presents,
                  CASE WHEN COUNT(r.id)=0 THEN 0
                       ELSE ROUND(100.0 * SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END)/COUNT(r.id),2)
                  END as attendance_percentage
           FROM events e
           LEFT JOIN registrations r ON r.event_id = e.id
           LEFT JOIN attendance a ON a.event_id = e.id AND a.student_id = r.student_id
           GROUP BY e.id`
        );
        res.json(rows);
      } catch {
        res.status(500).json({ error: "Failed to fetch attendance report" });
      }
    });

    app.get("/reports/student-participation", async (req, res) => {
      try {
        const rows = await database.all(
          `SELECT s.id as student_id, s.name, s.email,
                  SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as events_attended
           FROM students s
           LEFT JOIN attendance a ON s.id = a.student_id
           GROUP BY s.id
           ORDER BY events_attended DESC, s.name ASC`
        );
        res.json(rows);
      } catch {
        res.status(500).json({ error: "Failed to fetch student participation" });
      }
    });

    app.get("/reports/feedback", async (req, res) => {
      try {
        const rows = await database.all(
          `SELECT e.id, e.title,
                  ROUND(AVG(f.rating),2) as avg_rating,
                  COUNT(f.id) as feedback_count
           FROM events e
           LEFT JOIN feedback f ON e.id = f.event_id
           GROUP BY e.id
           ORDER BY avg_rating DESC`
        );
        res.json(rows);
      } catch {
        res.status(500).json({ error: "Failed to fetch feedback report" });
      }
    });

    app.get("/reports/top-students", async (req, res) => {
      try {
        const rows = await database.all(
          `SELECT s.id as student_id, s.name, s.email,
                  SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) as events_attended
           FROM students s
           LEFT JOIN attendance a ON s.id = a.student_id
           GROUP BY s.id
           ORDER BY events_attended DESC
           LIMIT 3`
        );
        res.json(rows);
      } catch {
        res.status(500).json({ error: "Failed to fetch top students" });
      }
    });

    // --------------------------------------------

    app.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
