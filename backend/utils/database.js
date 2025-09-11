const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

class Database {
  constructor() {
    // Store DB inside backend/data/
    const dataDir = path.join(__dirname, "..", "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, "campus_drive.db");
    this.db = null;
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("Error connecting to database:", err.message);
          reject(err);
        } else {
          console.log("✅ Connected to SQLite database at", this.dbPath);
          this.db.run("PRAGMA foreign_keys = ON");
          resolve();
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Initialize DB schema
  async initializeSchema() {
    try {
      const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
      const schema = fs.readFileSync(schemaPath, "utf8");
      const statements = schema
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await this.run(stmt);
      }
      console.log("✅ Database schema initialized");
    } catch (error) {
      console.error("❌ Error initializing schema:", error);
      throw error;
    }
  }

  // Seed DB with sample data
  async seedData() {
    try {
      const seedPath = path.join(__dirname, "..", "sql", "seed.sql");
      if (!fs.existsSync(seedPath)) {
        console.log("⚠️ No seed.sql found, skipping seeding");
        return;
      }

      const seedData = fs.readFileSync(seedPath, "utf8");
      const statements = seedData
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        if (/^INSERT/i.test(stmt)) {
          await this.run(stmt);
        }
      }
      console.log("✅ Database seeded");
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    }
  }

  async hasData() {
    try {
      const result = await this.get("SELECT COUNT(*) as count FROM colleges");
      return result && result.count > 0;
    } catch {
      return false;
    }
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) console.error("Error closing database:", err.message);
        else console.log("Database connection closed");
      });
    }
  }
}

module.exports = new Database();
