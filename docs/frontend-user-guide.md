# SecureAPI Dashboard — Frontend User Guide

**Complete guide for public users, clients, agency owners, and administrators**

---

## Part 1: Public User & Client Guide

### 1. Getting Started

#### Accessing the Application

The SecureAPI Dashboard is a single-page web application that runs entirely in your
browser. There are two ways to access it:

| Mode | URL | When to Use |
|------|-----|-------------|
| **Local Development** | `http://localhost:5000` | Running the server on your own machine or development environment |
| **Production / Live** | `https://your-production-domain.com` | Deployed instance hosted on a live server |

> **Tip:** When you first open the app, you will see a loading spinner that says
> "Loading dashboard...". This screen briefly checks whether you have an existing
> login session before showing the login form or the dashboard.

#### Registering a New Account

If you do not yet have an account, create one in seconds:

1. On the **Welcome Back** login screen, click **"Register"** in the text link at the
   bottom of the card.
2. You will be taken to the **Create Account** page.
3. Fill in the following fields:
   - **Username** — 3–30 characters; letters, numbers, and underscores only (e.g.
     `john_doe`).
   - **Email** — A valid email address that you can access.
   - **Password** — Must meet these requirements:
     - Minimum **8 characters**
     - At least **1 uppercase** letter (A–Z)
     - At least **1 lowercase** letter (a–z)
     - At least **1 number** (0–9)
     - At least **1 special character** (`@ $ ! % * ? &` etc.)
4. Click **"Create Account"**.

If the password does not meet requirements, or if the username or email is already
taken, an error message will appear in a red banner above the form. Correct the
issue and try again.

#### Logging In

1. Enter the **email** and **password** you registered with.
2. Click **"Sign In"**.

If your credentials are valid, your JWT authentication token is stored in your
browser's `localStorage` and you are automatically taken to the **Dashboard**.
If something goes wrong (e.g. incorrect password), a red error banner appears
explaining the issue.

> **Security note:** Your token is stored in `localStorage` keyed as
> `authToken`. It is sent as a `Bearer` token in the `Authorization` header for
> all authenticated API requests. When you log out or your token expires, the
> token is removed from storage.

#### Logging Out

From anywhere in the dashboard, click the **"Logout"** button at the bottom of the
sidebar navigation. This clears your token, resets the session, and returns you to
the login screen.

---

### 2. Dashboard Overview

After logging in, you land on the **Dashboard** — your project control center.

#### Sidebar Navigation

The left-hand sidebar (dark theme) provides one-click access to every section:

| Icon | Section | Description |
|------|---------|-------------|
| 🟦 🧊 | **Dashboard** | Project statistics and overview |
| 🟦 📁 | **Projects** | Create, view, edit, and delete projects |
| 🟣 👥 | **Team Control** | View team members and agency management |
| 🟢 🏷️ | **Services & Pricing** | Pricing tiers and sales hub |
| 🟣 👤 | **Profile** | Update your account details |

> The current section is highlighted in the sidebar with a purple-blue background.
> The "Logout" button is always at the bottom of the sidebar.

#### Header Bar

At the top of every page you see:

- **Page title** — changes dynamically based on which section you're in
  (e.g. "Dashboard", "Projects", "Profile").
- **Environment indicator** — shows "Local" (green) for development or "Production
  Server" (orange) for deployed environments.
- **User initials** — a circular badge with your first two initials, derived from
  your username.

#### Project Statistics

The Dashboard home displays five statistic cards in a responsive grid:

| Card | What It Shows |
|------|---------------|
| **Total Projects** | Total number of projects in your account |
| **Pending** | Projects with status "pending" (not yet started) |
| **In Progress** | Projects with status "in-progress" |
| **Completed** | Projects with status "completed" |
| **Cancelled** | Projects with status "cancelled" |

These statistics are fetched from the backend API endpoint
`GET /api/v1/projects/stats` and update automatically each time you visit the
Dashboard.

#### Switching Between Sections

To navigate, simply click any navigation item in the sidebar. The main content
area on the right will instantly switch to show that section. There is no page
reload — the app is a single-page application (SPA).

---

### 3. Project / Task Management

The **Projects** section is your main workspace for tracking work. You can create,
view, edit, and delete projects — all from a clean tabular interface.

#### Viewing Projects

1. Click **"Projects"** in the sidebar.
2. A table appears showing all of your projects with these columns:

| Column | Description |
|--------|-------------|
| **Title** | The project name |
| **Status** | Color-coded badge: Pending (yellow), In Progress (blue), Completed (green), Cancelled (red) |
| **Priority** | Low, Medium, High, or Urgent |
| **Created** | The date the project was created |
| **Actions** | Edit (✎) and Delete (🗑) buttons |

3. If you have no projects yet, a friendly message appears: *"No projects yet.
   Create one!"*

#### Creating a New Project

1. Click the **"New Project"** button (blue, with a `+` icon) in the top-right
   of the Projects section.
2. A modal dialog appears with four fields:

| Field | Required | Options / Notes |
|-------|----------|-----------------|
| **Title** | Yes | 3–200 characters |
| **Description** | No | Up to 2,000 characters |
| **Priority** | Yes | Low, Medium (default), High, Urgent |
| **Status** | Yes | Pending (default), In Progress, Completed, Cancelled |

3. Fill in the details and click **"Save"**.
4. The modal closes, and the new project appears immediately in the table. The
   Dashboard statistics also update to reflect the new project.

> If the title is too short or empty, the backend will reject the request and an
> alert will display the error message.

#### Editing an Existing Project

1. In the Projects table, find the project you want to edit.
2. Click the **✎ Edit** button in the Actions column.
3. The same modal opens, pre-filled with the project's current values.
4. Make your changes and click **"Save"**.
5. The table and Dashboard statistics update automatically.

#### Deleting a Project

1. In the Projects table, click the **🗑 Delete** button for the project.
2. A confirmation dialog asks: *"Are you sure you want to delete this project?"*
3. Click **OK** to confirm. The project is permanently deleted from your account.

> **Note:** Deleting a project is permanent and cannot be undone.

---

### 4. Account & Security

The **Profile** section lets you manage your personal account information and
security settings.

#### Viewing Your Profile

1. Click **"Profile"** in the sidebar.
2. The profile page displays:
   - A large **avatar circle** with your initials (derived from your username).
   - Your **username** and **email** as read-only display text.
   - Your **role** (typically "user"; admins see "admin").

#### Updating Your Profile

1. Below the display area, a form shows editable fields:
   - **Username** — change your display name.
   - **Email** — update the email associated with your account.
   - **New Password** — enter a new password (must meet the same requirements as
     during registration). Leave blank to keep your current password.

2. Click **"Save Changes"** (purple button with ✓ icon).
3. On success, a green banner appears: *"Profile updated successfully!"* The
   password field is cleared, and your avatar initials and display name update
   immediately.
4. If there is an error (e.g. email already in use), a red banner shows the error
   message.

#### Changing Your Password

1. Navigate to the **Profile** section.
2. Enter your new password in the **"New Password"** field.
3. Fill in **Username** and **Email** with your current values (or new values if
   you wish to change them too).
4. Click **"Save Changes"**.

> Your new password must meet the same complexity requirements as registration
> (8+ characters, uppercase, lowercase, number, special character).

#### Deleting Your Account

1. In the Profile page, click the red **"Delete Account"** button (🗑 icon).
2. A confirmation dialog asks: *"Are you sure you want to delete your account?
   This action cannot be undone."*
3. Click **OK** to confirm. Your account, all projects, and all associated data
   are permanently removed from the system. You are then automatically logged out
   and redirected to the login screen.

> **Warning:** Account deletion is irreversible. Once deleted, you cannot recover
> your username, email, projects, or any other data.

---

## Part 2: Admin, Agency Owner & Team Control Guide

### 1. Team Control Panel & Delegation

#### Accessing the Team Section

1. Click the **"Team Control"** item in the sidebar (icon: 👥, purple).
2. The Team Control panel loads, showing team statistics and a tabbed interface.

> **Admin requirement:** The Team Control panel's member list is restricted to
> **admin** users only. If you are logged in as a regular user, you will see a
> message: *"Admin access required to view team members."* This is enforced by
> the backend's `restrictTo('admin')` middleware on the `GET /auth/users`
> endpoint.

#### Team Statistics

At the top of the Team Control panel, four summary cards are displayed:

| Card | Description |
|------|-------------|
| **Total Members** | Total number of users registered in the system |
| **Admins** | Number of users with the "admin" role |
| **Active** | Number of active users |
| **Pending Invitations** | Number of pending invitations (currently 0) |

These cards update automatically when team data loads.

#### Using the Tabbed Interface

Two tabs appear at the top of the panel:

- **"Team Members"** (👥) — Lists all registered users in a table.
- **"Agencies"** (🏢) — Shows a placeholder for future agency management.

**To switch tabs:** Click either tab button. The active tab is highlighted with a
purple underline. The content area switches instantly.

#### Viewing Team Members

On the **Team Members** tab, a table displays:

| Column | Description |
|--------|-------------|
| **Member** | The user's username |
| **Email** | The user's email address |
| **Role** | Color-coded badge: "admin" (purple) or "user" (blue) |
| **Joined** | The date the user joined (formatted as locale date string) |

If there are no registered users, the message *"No team members found."* appears.

#### Agency Management (Coming Soon)

The **Agencies** tab shows: *"Agency and team management features are coming
soon. Stay tuned!"* This will be expanded in future releases for agency-level
permissions, team assignments, and delegation workflows.

#### Inviting Team Members

At the top-right of the panel, the **"Invite Member"** button (purple, `+` icon)
shows: *"Invite member feature is being developed. Stay tuned!"*

---

### 2. Services & Pricing Hub (Monetization)

#### Accessing the Services Section

1. Click the **"Services & Pricing"** item in the sidebar
   (icon: 🏷️, green).
2. The Services & Pricing hub loads, showing pricing tiers and a sales dashboard.

#### Pricing Tiers

Three pricing tiers are displayed as cards in a responsive three-column grid:

| Tier | Price | Icon | Key Features |
|------|-------|------|--------------|
| **Basic** | $9 / month | ⚡ | Up to 10 projects, 5GB storage, basic analytics. No priority support. |
| **Pro** | $29 / month | 👑 | **Most Popular** — Unlimited projects, 50GB storage, advanced analytics, priority support. |
| **Enterprise** | Custom | 🏢 | Unlimited everything, dedicated support, custom integrations, SLA guarantee. |

Each card includes a button:

- **Basic / Pro:** "Get Started" — currently shows a placeholder alert:
  *"Add service feature is being developed. Stay tuned!"*
- **Enterprise:** "Contact Sales" — initiates contact flow (placeholder alert).

#### Sales & Leads Dashboard

Below the pricing cards, a **"Sales & Leads"** section displays three summary cards:

| Card | Description |
|------|-------------|
| **Active Deals** | Number of currently active sales deals |
| **This Month** | Number of deals closed this month |
| **Revenue** | Total revenue generated |

These cards are currently placeholders showing zeros. They will be connected to
live sales data in future releases.

#### Adding a New Service

At the top-right of the Services section, the **"Add Service"** button (green,
`+` icon) shows: *"Add service feature is being developed. Stay tuned!"* This will
allow admin users to create and manage custom service offerings in future releases.

---

### 3. Connecting External Sites to This API

#### Overview

The SecureAPI Dashboard frontend (`public/`) is designed to work with any backend
deployment that serves the same REST API at `/api/v1`. The frontend configuration
lives in a single file: **`public/config.js`**.

#### Configuring the API Base URL

Open `public/config.js`:

```javascript
// Environment switcher
const ENVIRONMENT = 'LOCAL'; // Change to 'PRODUCTION' for live deployment

const API_CONFIGS = {
    LOCAL: {
        name: 'Local Development',
        baseUrl: 'http://localhost:5000/api/v1',
        healthUrl: 'http://localhost:5000/health',
        environment: 'development'
    },
    PRODUCTION: {
        name: 'Production Server',
        baseUrl: 'https://your-production-domain.com/api/v1',
        healthUrl: 'https://your-production-domain.com/health',
        environment: 'production'
    }
};
```

**To connect an external website or client frontend:**

1. Set `ENVIRONMENT = 'PRODUCTION'`.
2. Update `baseUrl` and `healthUrl` in the `PRODUCTION` config to point to your
   deployed backend API:
   ```javascript
   baseUrl: 'https://secure-api.example.com/api/v1',
   healthUrl: 'https://secure-api.example.com/health',
   ```
3. Update the backend CORS configuration in `src/middleware/security.js` to allow
   your frontend's domain:
   ```javascript
   const allowedOrigins = process.env.NODE_ENV === 'production'
     ? ['https://yourdomain.com', 'https://api.yourdomain.com', 'https://client-frontend.com']
     : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];
   ```
4. Save the file. The frontend will use the updated URL on the next page load.

> **Runtime switching:** You can also switch environments at runtime by calling
> `window.setEnvironment('PRODUCTION')` from the browser console. The environment
> indicator in the header updates instantly and persists across page reloads via
> `localStorage`.

#### Environment Indicator

The header bar always shows the current environment:

- **Green "Local"** — when `ENVIRONMENT = 'LOCAL'`
- **Orange "Production Server"** — when `ENVIRONMENT = 'PRODUCTION'`

#### Deploying to Render.com (Full-Stack Deployment)

To deploy both the frontend and backend together on Render.com:

1. **Push your repository** to GitHub, GitLab, or connect directly to Render.

2. **Create a Web Service** on Render and configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node.js

3. **Set environment variables** in the Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your_strong_random_secret_here   # openssl rand -base64 32
   JWT_EXPIRES_IN=7d
   DB_PATH=./database.sqlite
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   ```

4. **Update `config.js`** to point to your Render domain:
   ```javascript
   ENVIRONMENT = 'PRODUCTION';
   PRODUCTION: {
       baseUrl: 'https://your-app.onrender.com/api/v1',
       healthUrl: 'https://your-app.onrender.com/health',
   }
   ```

5. **Update CORS** in `src/middleware/security.js` to allow your Render domain:
   ```javascript
   const allowedOrigins = process.env.NODE_ENV === 'production'
     ? ['https://your-app.onrender.com']
     : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'];
   ```

6. **Deploy** — Render will automatically build and start your server. The Express
   `server.js` serves both the API (`/api/v1/*`) and the frontend (`/`,
   `/app.js`, `/config.js`, `/styles.css`) from the same origin.

> **Why this works:** `server.js` uses `express.static()` to serve the `public/`
> folder and an `app.get('*')` catch-all route to serve `index.html` for SPA
> routing. Both frontend and API share the same origin, eliminating CORS issues.

#### Verifying Your Deployment

Once deployed or running locally:

1. Visit `http://localhost:5000` (or your production URL).
2. You should see the loading screen, then the login page.
3. Register a new account or log in.
4. Navigate through all sidebar sections to verify full connectivity.
5. Open browser DevTools → Network tab and confirm API calls to `/api/v1/*`
   return JSON with `success: true`.

