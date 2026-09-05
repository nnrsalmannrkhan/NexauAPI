# Secure REST API

A production-ready, highly secure REST API backend for a real-world web application built with Node.js, Express.js, and SQLite.

## Features

- **User Authentication**: Secure registration, login with JWT, and protected routes
- **Project Management**: Full CRUD operations for projects with pagination and filtering
- **Security**: Helmet.js, CORS, rate limiting, input validation, and error handling
- **Database**: SQLite with better-sqlite3 for fast, reliable local persistence
- **Validation**: Joi-based input validation for all endpoints
- **Architecture**: Clean MVC pattern with modular structure

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (ES Modules)
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Security**: Helmet.js, CORS, express-rate-limit
- **Logging**: Morgan

## Project Structure

```
secure-rest-api/
├── server.js                    # Main entry point
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables
├── database.sqlite              # SQLite database file (auto-created)
├── README.md                    # This file
└── src/
    ├── config/
    │   └── database.js          # Database configuration
    ├── middleware/
    │   ├── security.js          # Helmet, CORS, rate limiting
    │   ├── errorHandler.js      # Error handling middleware
    │   ├── validation.js        # Input validation (Joi)
    │   └── auth.js              # JWT authentication middleware
    ├── models/
    │   ├── User.js              # User model
    │   └── Project.js           # Project model
    ├── controllers/
    │   ├── authController.js    # Authentication controller
    │   └── projectController.js # Project controller
    └── routes/
        ├── authRoutes.js        # Authentication routes
        └── projectRoutes.js     # Project routes
```

## Installation

1. **Clone the repository** (or use the existing code):
   ```bash
   cd g:\New\ folder\claude\ code\ openrouter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Edit the `.env` file to set your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production_1234567890
   JWT_EXPIRES_IN=7d
   DB_PATH=./database.sqlite
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register a new user | Public |
| POST | `/api/v1/auth/login` | Login and get JWT token | Public |
| GET | `/api/v1/auth/me` | Get current user profile | Private |
| PUT | `/api/v1/auth/me` | Update user profile | Private |
| DELETE | `/api/v1/auth/me` | Delete user account | Private |
| GET | `/api/v1/auth/users` | Get all users | Admin |

### Projects

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/projects` | Create a new project | Private |
| GET | `/api/v1/projects` | Get all projects (with pagination) | Private |
| GET | `/api/v1/projects/stats` | Get project statistics | Private |
| GET | `/api/v1/projects/:id` | Get a single project | Private |
| PUT | `/api/v1/projects/:id` | Update a project | Private |
| DELETE | `/api/v1/projects/:id` | Delete a project | Private |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server health |

## Usage Examples

### Register a New User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Create a Project

```bash
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My First Project",
    "description": "This is a sample project",
    "priority": "high",
    "due_date": "2024-12-31"
  }'
```

### Get All Projects

```bash
curl -X GET http://localhost:5000/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update a Project

```bash
curl -X PUT http://localhost:5000/api/v1/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "in-progress"
  }'
```

### Delete a Project

```bash
curl -X DELETE http://localhost:5000/api/v1/projects/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

1. **Helmet.js**: Sets various HTTP headers to secure the app
2. **CORS**: Configurable cross-origin resource sharing
3. **Rate Limiting**: Prevents brute force attacks (5 attempts per 15 minutes for auth endpoints)
4. **Password Hashing**: bcrypt with 12 salt rounds
5. **JWT Authentication**: Secure token-based authentication
6. **Input Validation**: Joi schemas validate all incoming data
7. **Error Handling**: Centralized error handling with no sensitive data leakage
8. **Request Size Limiting**: Limits request body size to 10kb

## Validation Rules

### User Registration
- **username**: 3-30 characters, alphanumeric and underscores only
- **email**: Valid email format
- **password**: Minimum 8 characters, must include uppercase, lowercase, number, and special character

### Project Creation
- **title**: 3-200 characters (required)
- **description**: Up to 2000 characters (optional)
- **status**: pending, in-progress, completed, cancelled (default: pending)
- **priority**: low, medium, high, urgent (default: medium)
- **due_date**: Must be a future date (optional)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5000 |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `DB_PATH` | SQLite database path | ./database.sqlite |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | 100 |

## License

MIT