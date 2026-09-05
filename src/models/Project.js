/**
 * Project Model Module
 * Handles all database operations related to projects
 */

import { getDb } from '../config/database.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Create a new project
 * @param {Object} projectData - Project data
 * @param {number} userId - User ID creating the project
 * @returns {Object} - Created project object
 */
export const createProject = (projectData, userId) => {
  const { title, description, status, priority, due_date } = projectData;

  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO projects (title, description, status, priority, due_date, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    title,
    description || null,
    status || 'pending',
    priority || 'medium',
    due_date || null,
    userId
  );

  return findProjectById(info.lastInsertRowid, userId);
};

/**
 * Find project by ID (scoped to user)
 * @param {number} id - Project ID
 * @param {number} userId - User ID
 * @returns {Object|null} - Project object or null
 */
export const findProjectById = (id, userId) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, title, description, status, priority, due_date, user_id, created_at, updated_at
    FROM projects WHERE id = ? AND user_id = ?
  `).get(id, userId);
};

/**
 * Find all projects for a user with pagination
 * @param {number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} - Paginated projects
 */
export const findProjectsByUser = (userId, options = {}) => {
  const db = getDb();

  const {
    page = 1,
    limit = 10,
    sort = 'desc',
    status = null,
  } = options;

  const offset = (page - 1) * limit;
  const sortOrder = sort === 'asc' ? 'ASC' : 'DESC';

  // Build query based on filters
  let query = `
    SELECT id, title, description, status, priority, due_date, user_id, created_at, updated_at
    FROM projects WHERE user_id = ?
  `;
  const params = [userId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ` ORDER BY created_at ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const projects = db.prepare(query).all(...params);

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM projects WHERE user_id = ?';
  const countParams = [userId];

  if (status) {
    countQuery += ' AND status = ?';
    countParams.push(status);
  }

  const totalResult = db.prepare(countQuery).get(...countParams);
  const total = totalResult.total;
  const totalPages = Math.ceil(total / limit);

  return {
    projects,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
    },
  };
};

/**
 * Update a project
 * @param {number} id - Project ID
 * @param {number} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} - Updated project object
 */
export const updateProject = (id, userId, updateData) => {
  const db = getDb();

  const fields = [];
  const values = [];

  if (updateData.title !== undefined) {
    fields.push('title = ?');
    values.push(updateData.title);
  }

  if (updateData.description !== undefined) {
    fields.push('description = ?');
    values.push(updateData.description);
  }

  if (updateData.status !== undefined) {
    fields.push('status = ?');
    values.push(updateData.status);
  }

  if (updateData.priority !== undefined) {
    fields.push('priority = ?');
    values.push(updateData.priority);
  }

  if (updateData.due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(updateData.due_date);
  }

  if (fields.length === 0) {
    return findProjectById(id, userId);
  }

  values.push(id, userId);

  const stmt = db.prepare(`
    UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);

  const info = stmt.run(...values);

  if (info.changes === 0) {
    throw new ApiError('Project not found or access denied', 404);
  }

  return findProjectById(id, userId);
};

/**
 * Delete a project
 * @param {number} id - Project ID
 * @param {number} userId - User ID
 * @returns {boolean} - True if deleted
 */
export const deleteProject = (id, userId) => {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
  const info = stmt.run(id, userId);
  return info.changes > 0;
};

/**
 * Get project statistics for a user
 * @param {number} userId - User ID
 * @returns {Object} - Statistics object
 */
export const getProjectStats = (userId) => {
  const db = getDb();

  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
    FROM projects WHERE user_id = ?
  `).get(userId);

  return stats;
};