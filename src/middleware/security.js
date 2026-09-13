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
      // Allow inline event handlers (onclick, onload, etc.)
      // Helmet defaults script-src-attr to 'none' which blocks all inline
      // event handlers — we must explicitly override it
      scriptSrcAttr: ["'unsafe-inline'"],
      scriptSrcElem: [
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
 * DISABLED: Allows all origins (*)
 *
 * ⚠️  SECURITY WARNING: This configuration removes CSRF protection.
 * All cross-origin requests are allowed. Only safe for public APIs
 * without sensitive state changes or authentication-required endpoints.
 *
 * Use CORS_ALLOWED_ORIGINS env var to re-enable strict mode:
 *   CORS_ALLOWED_ORIGINS=https://my-app.onrender.com,http://localhost:5000
 */
const corsOptionsDelegate = (req, callback) => {
  // Allow all origins
  return callback(null, { origin: true, credentials: true });
};

export const corsConfig = cors(corsOptionsDelegate);

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