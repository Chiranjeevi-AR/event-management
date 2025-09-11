const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
  constructor() {
    // Create database in the backend directory
    this.dbPath = path.join(__dirname, '..', 'campus_drive.db');
    this.db = null;
  }

  // Initialize database connection
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error connecting to database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          // Enable foreign key constraints
          this.db.run('PRAGMA foreign_keys = ON');
          resolve();
        }
      });
    });
  }

  // Run SQL query with parameters
  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Get single row
  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all rows
  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Initialize database with schema
  async initializeSchema() {
    try {
      const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      // Split schema by statements and execute each
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        await this.run(statement.trim());
      }

      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing schema:', error);
      throw error;
    }
  }

  // Seed database with sample data
  async seedData() {
    try {
      const seedPath = path.join(__dirname, '..', 'sql', 'seed.sql');
      const seedData = fs.readFileSync(seedPath, 'utf8');

      // Split seed data by statements and execute each
      const statements = seedData.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        // Check if statement contains INSERT (anywhere in the statement)
        if (statement.includes('INSERT')) {
          await this.run(statement.trim());
        }
      }

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }

  // Check if database has data
  async hasData() {
    try {
      const result = await this.get('SELECT COUNT(*) as count FROM colleges');
      return result.count > 0;
    } catch (error) {
      return false;
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

// Create singleton instance
const database = new Database();
module.exports = database;