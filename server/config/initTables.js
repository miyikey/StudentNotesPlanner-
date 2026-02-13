const pool = require("./db");

async function createTables() {
  try {
    // Drop tables if they exist (in reverse dependency order)
    await pool.query(`DROP TABLE IF EXISTS assessments`);
    await pool.query(`DROP TABLE IF EXISTS assignments`);
    await pool.query(`DROP TABLE IF EXISTS grades`);
    await pool.query(`DROP TABLE IF EXISTS courses`);
    await pool.query(`DROP TABLE IF EXISTS semesters`);
    await pool.query(`DROP TABLE IF EXISTS degrees`);
    await pool.query(`DROP TABLE IF EXISTS notes`);
    await pool.query(`DROP TABLE IF EXISTS users`);

    // Users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    // Notes table
    await pool.query(`
      CREATE TABLE notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    //degree table 
    await pool.query(`
      CREATE TABLE degrees (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        name TEXT,
        total_credits_required INT,
        goal_wam NUMERIC
      );
      `);

    //semester table 
    await pool.query(`
      CREATE TABLE semesters (
        id SERIAL PRIMARY KEY,
        degree_id INT REFERENCES degrees(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        year INT,
        semester_number INT
      );
      `);


    //Courses table
    await pool.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        semester_id INT,
        name TEXT NOT NULL,
        credits INT,
        goal_grade NUMERIC,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    //assesmenrs (grade calculation) table
    await pool.query(`
      CREATE TABLE assessments (
        id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        name TEXT,
        weight NUMERIC,
        score_actual NUMERIC,
        score_out_of NUMERIC,
        due_date DATE,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `);


    // Assignments table
      await pool.query(`
        CREATE TABLE assignments (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          name TEXT,
          code TEXT,
          due_date DATE,
          created_at TIMESTAMP DEFAULT NOW()
        );
        `);

    // Grades table
    await pool.query(`
      CREATE TABLE grades (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        name VARCHAR(255),
        score NUMERIC,
        weight NUMERIC,
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
