/**
 * Error Handling Middleware Module
 * Centralized error handling for the application
 */

/**
 * Custom Error class for API errors
 * Extends Error with status code and operational flag
 */
export class ApiError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle JWT errors
 * @param {Error} error - The error object
 * @returns {ApiError} - Formatted API error
 */
const handleJWTError = (error) => {
  return new ApiError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT expired errors
 * @param {Error} error - The error object
 * @returns {ApiError} - Formatted API error
 */
const handleJWTExpiredError = (error) => {
  return new ApiError('Your token has expired. Please log in again.', 401);
};

/**
 * Handle duplicate field errors (e.g., duplicate email)
 * @param {Error} error - The error object
 * @returns {ApiError} - Formatted API error
 */
const handleDuplicateFieldsError = (error) => {
  // better-sqlite3 constraint error message format:
  // "UNIQUE constraint failed: users.username"
  // Extract the field name from the error message
  const match = error.message.match(/UNIQUE constraint failed: \w+\.(\w+)/);
  const field = match ? match[1] : 'field';
  const message = `Duplicate field value: ${field}. Please use another value.`;
  return new ApiError(message, 409);
};

/**
 * Handle validation errors
 * @param {Error} error - The error object
 * @returns {ApiError} - Formatted API error
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(message, 400);
};

/**
 * Send error response in development mode
 * Includes full error details
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response in production mode
 * Hides sensitive error details
 * @param {Error} err - The error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong!',
    });
  }
};

/**
 * Global error handling middleware
 * Catches all errors and sends appropriate responses
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    if (error.code === 'SQLITE_CONSTRAINT') error = handleDuplicateFieldsError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    sendErrorProd(error, res);
  }
};

/**
 * 404 handler for unmatched routes
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};