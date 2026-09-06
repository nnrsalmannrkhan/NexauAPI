/**
 * Database Configuration Module
 * Handles SQLite database initialization and connection management
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path from environment or default
// On Render, the app directory may be read-only at runtime.
// Use /tmp/ for writable storage when DB_PATH is not explicitly set
// and we detect we're on Render (RENDER env var is set by Render.com)
const isRender = !!process.env.RENDER;
const dbPath = process.env.DB_PATH || (isRender
  ? '/tmp/database.sqlite'
  : path.join(__dirname, '../../database.sqlite'));

// Initialize database connection
let db;

try {
  db = new Database(dbPath);
  console.log(`✅ Database connected successfully at: ${dbPath}`);
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}

/**
 * Initialize database schema
 * Creates tables if they don't exist
 */
export const initializeDatabase = () => {
  try {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        due_date DATE,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    `);

        console.log('✅ Database schema initialized successfully');

    // Verify database is writable (catches read-only filesystem issues on Render)
    try {
      const testStmt = db.prepare('CREATE TABLE IF NOT EXISTS _writable_test (id INTEGER PRIMARY KEY);');
      testStmt.run();
      const cleanupStmt = db.prepare('DROP TABLE IF EXISTS _writable_test;');
      cleanupStmt.run();
    } catch (writeError) {
      const dbPathStr = typeof dbPath === 'string' ? dbPath : String(dbPath);
      console.error('❌ Database is READ-ONLY! Write operations will fail.');
      console.error('❌ This is likely because the database path is in a read-only directory.');
      console.error('❌ On Render, set DB_PATH=/tmp/database.sqlite in Environment Variables.');
      console.error('❌ Database path:', dbPathStr);
      console.error('❌ Write error:', writeError.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database schema initialization failed:', error.message);
    process.exit(1);
  }
};

/**
 * Get database instance
 * @returns {Database} SQLite database instance
 */
export const getDb = () => db;

export default db;