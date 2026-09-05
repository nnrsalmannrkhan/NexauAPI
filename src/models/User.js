/**
 * User Model Module
 * Handles all database operations related to users
 */

import bcrypt from 'bcrypt';
import { getDb } from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Create a new user
 * @param {Object} userData - User data (username, email, password)
 * @returns {Object} - Created user object (without password)
 */
export const createUser = async (userData) => {
  const { username, email, password } = userData;

  const db = getDb();

  // Check if username already exists
  const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existingUsername) {
    throw new ApiError('Username already exists', 409);
  }

  // Check if email already exists
  const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    throw new ApiError('Email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, 'user')
  `);

  const info = stmt.run(username, email, hashedPassword);

  // Return user without password
  return {
    id: info.lastInsertRowid,
    username,
    email,
    role: 'user',
  };
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {Object|null} - User object or null
 */
export const findUserByEmail = (email) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, username, email, password, role, created_at, updated_at
    FROM users WHERE email = ?
  `).get(email);
};

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Object|null} - User object or null
 */
export const findUserById = (id) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, username, email, role, created_at, updated_at
    FROM users WHERE id = ?
  `).get(id);
};

/**
 * Update user profile
 * @param {number} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} - Updated user object
 */
export const updateUser = (id, updateData) => {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updateData.username) {
    fields.push('username = ?');
    values.push(updateData.username);
  }

  if (updateData.email) {
    fields.push('email = ?');
    values.push(updateData.email);
  }

  if (updateData.password) {
    fields.push('password = ?');
    values.push(updateData.password);
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(...values);

  return findUserById(id);
};

/**
 * Delete user by ID
 * @param {number} id - User ID
 * @returns {boolean} - True if deleted
 */
export const deleteUser = (id) => {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
};

/**
 * Get all users (admin only)
 * @param {Object} options - Query options (limit, offset)
 * @returns {Array} - Array of user objects
 */
export const getAllUsers = (options = {}) => {
  const db = getDb();
  const { limit = 100, offset = 0 } = options;

  const stmt = db.prepare(`
    SELECT id, username, email, role, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  return stmt.all(limit, offset);
};