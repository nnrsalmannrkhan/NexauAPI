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
 * CORS configuration (options-delegate form)
 * Restricts cross-origin requests to allowed origins
 * Origins can be configured via CORS_ALLOWED_ORIGINS env var (comma-separated)
 * If not set, defaults to allowing same-origin + localhost origins (production-safe when frontend uses relative URLs)
 *
 * Handles proxy headers (X-Forwarded-Proto, X-Forwarded-Host) for Render.com and similar platforms
 * where the actual user-facing URL differs from req.protocol/req.headers.host
 */
const corsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;

  // Allow requests with no origin (mobile apps, curl, Postman, etc.)
  if (!origin) return callback(null, { origin: true, credentials: true });

  // Read allowed origins from environment variable (comma-separated)
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

  // In development, allow localhost origins
  const devOrigins = ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

  // If CORS_ALLOWED_ORIGINS is explicitly set, use strict allowlist mode
  if (envOrigins.length > 0) {
    if (envOrigins.includes(origin)) {
      return callback(null, { origin: true, credentials: true });
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }

  // Fallback mode (when no env config): allow devOrigins + same-origin
  if (devOrigins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }

  // Allow same-origin requests, accounting for proxy headers (Render, load balancers, etc.)
  // On Render: X-Forwarded-Proto = https, X-Forwarded-Host = my-app.onrender.com
  // Direct requests: use req.protocol and req.headers.host
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const requestOrigin = `${protocol}://${host}`;

  if (origin === requestOrigin) {
    return callback(null, { origin: true, credentials: true });
  }

  callback(new Error('Not allowed by CORS'));
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