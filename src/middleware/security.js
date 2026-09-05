/**
 * Security Middleware Module
 * Configures Helmet, CORS, rate limiting, and other security headers
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helmet configuration for security headers
 * Sets various HTTP headers to secure the app
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
        directives: {
      defaultSrc: ["'self'"],
      // Allow local CSS + CDN styles (FontAwesome, Tailwind)
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.tailwindcss.com",
        "https://fonts.googleapis.com",
      ],
      // Allow CDN scripts (Tailwind CSS, etc.)
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.tailwindcss.com",
        "https://cdnjs.cloudflare.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://cdnjs.cloudflare.com",
        "https://cdn.tailwindcss.com",
      ],
      connectSrc: ["'self'"],
      // Allow CDN fonts (FontAwesome)
      fontSrc: [
        "'self'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.tailwindcss.com",
        "data:",
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
});

/**
 * CORS configuration
 * Restricts cross-origin requests to allowed origins
 */
export const corsConfig = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // In production, you would check against a whitelist of allowed origins
        const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com', 'https://api.yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});

/**
 * Rate limiting middleware
 * Prevents brute force attacks and DoS
 */
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiting for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});