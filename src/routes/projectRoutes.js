/**
 * Project Routes Module
 * Defines routes for project CRUD operations
 */

import express from 'express';
import {
  createNewProject,
  getAllProjects,
  getProject,
  updateExistingProject,
  deleteProjectById,
  getProjectStatistics,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { projectSchema, projectUpdateSchema, paginationSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post(
  '/',
  protect,
  validate(projectSchema),
  createNewProject
);

/**
 * @route   GET /api/v1/projects
 * @desc    Get all projects for the authenticated user
 * @access  Private
 */
router.get(
  '/',
  protect,
  validate(paginationSchema, 'query'),
  getAllProjects
);

/**
 * @route   GET /api/v1/projects/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get('/stats', protect, getProjectStatistics);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
router.get('/:id', protect, getProject);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put(
  '/:id',
  protect,
  validate(projectUpdateSchema),
  updateExistingProject
);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete('/:id', protect, deleteProjectById);

export default router;