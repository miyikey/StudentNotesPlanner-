const pool = require("./db");

async function createTables() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Notes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Grades table
    await pool.query(`
      CREATE TABLE grades (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        name VARCHAR(255),       -- e.g., "Math Exam 1"
        score NUMERIC,           -- the actual score
        weight NUMERIC,          -- weight of this assignment/exam
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Tables created successfully!");
    process.exit(0); // exit the script
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
}

createTables();
