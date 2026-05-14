# TeamRegister
Team Register is an attendance tracking system of the month

## Overview

TeamRegister is an Angular + Node.js attendance tracking system for a team of **13 members**. Each member logs in and marks whether they're coming to the **office**, **working from home (WFH)**, or **absent** for the day.

**Key feature:** An automatic alert fires whenever **more than 5 team members** mark themselves as coming to the office on any given workday.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Angular 17 + Angular Material       |
| Backend  | Node.js + Express                   |
| Database | SQLite (via `better-sqlite3`)        |
| Auth     | JWT (JSON Web Tokens) + bcrypt      |

---

## Features

- 🔐 **Login** — Each of the 13 team members has a dedicated account
- 🏢 **Office / 🏠 WFH / ❌ Absent** — One-click attendance marking
- 📊 **Live dashboard** — Real-time team attendance view (auto-refreshes every 30s)
- ⚠️ **Alert system** — Prominent red banner + snackbar popup when >5 employees plan to come to office
- 📅 **History** — View personal attendance for the last 30 days

---

## Setup & Running

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Angular CLI 17: `npm install -g @angular/cli@17`

### 1. Start the Backend

```bash
cd backend
npm install
node server.js
# API available at http://localhost:3000
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npx ng serve --proxy-config proxy.conf.json --open
# App available at http://localhost:4200
```

---

## Team Members & Credentials

| Name            | Username | Password |
|-----------------|----------|----------|
| Alice Johnson   | alice    | pass123  |
| Bob Smith       | bob      | pass123  |
| Carol Williams  | carol    | pass123  |
| David Brown     | david    | pass123  |
| Emma Davis      | emma     | pass123  |
| Frank Miller    | frank    | pass123  |
| Grace Wilson    | grace    | pass123  |
| Henry Moore     | henry    | pass123  |
| Iris Taylor     | iris     | pass123  |
| James Anderson  | james    | pass123  |
| Karen Thomas    | karen    | pass123  |
| Liam Jackson    | liam     | pass123  |
| Mia White       | mia      | pass123  |

---

## API Endpoints

| Method | Endpoint                    | Auth | Description                          |
|--------|-----------------------------|------|--------------------------------------|
| POST   | `/api/login`                | No   | Login and receive JWT token          |
| GET    | `/api/attendance/today`     | Yes  | Get all members' attendance for today|
| POST   | `/api/attendance`           | Yes  | Mark own attendance (office/wfh/absent)|
| GET    | `/api/attendance/history`   | Yes  | Get personal history (last 30 days)  |
| GET    | `/api/users`                | Yes  | List all team members                |

---

## Hosting & Deployment

TeamRegister uses a **single-server** deployment model: the Express backend serves the compiled Angular frontend as static files, so only one process needs to run in production.

### Architecture

```
Browser  →  Express (PORT)  →  /api/*  (REST API)
                            →  /*      (Angular SPA static files)
```

### Production Build & Run

**1. Build the Angular frontend**

```bash
cd frontend
npm install
npx ng build --configuration production
# Output: frontend/dist/frontend/browser/
```

**2. Start the Express server**

```bash
cd backend
npm install
node server.js
# Serves both API and frontend at http://localhost:3000
```

### Environment Variables

| Variable     | Default  | Description                        |
|--------------|----------|------------------------------------|
| `PORT`       | `3000`   | Port the Express server listens on |
| `JWT_SECRET` | *(none)* | Secret key for signing JWT tokens — **must be set in production** |

Set these before starting the server for production:

```bash
export PORT=8080
# Generate a strong random secret (at least 32 characters):
export JWT_SECRET=$(openssl rand -base64 32)
node server.js
```

### Deploying to a Cloud Platform

The app can be deployed to any Node.js-compatible host (e.g. Render, Railway, Fly.io, Heroku).  
Set the `PORT` and `JWT_SECRET` environment variables in your platform's dashboard, push the repository, and configure the **build command** and **start command** as follows:

| Setting          | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| Build command    | `cd frontend && npm install && npx ng build --configuration production` |
| Start command    | `cd backend && npm install && node server.js`                        |

> **Note:** SQLite stores data in `backend/attendance.db`. On platforms with ephemeral file systems (e.g. Render free tier), data will reset on each redeploy. Use a persistent disk or migrate to a hosted database for long-term storage.

---

## Alert Logic

The system triggers an alert when `officeCount > 5`:
- A red banner appears at the top of the dashboard
- The "In Office" summary card turns red with an ⚠️ OVER LIMIT tag
- A snackbar notification pops up
- The alert also triggers on the API response so any integration can react to it
