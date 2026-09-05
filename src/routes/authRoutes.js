/**
 * Authentication Routes Module
 * Defines routes for user authentication and profile management
 */

import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount,
  getAllUsersController,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema } from '../middleware/validation.js';
import { authRateLimiter } from '../middleware/security.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  login
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged-in user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/v1/auth/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', protect, updateProfile);

/**
 * @route   DELETE /api/v1/auth/me
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/me', protect, deleteAccount);

/**
 * @route   GET /api/v1/auth/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/users', protect, restrictTo('admin'), getAllUsersController);

export default router;