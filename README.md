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

## Alert Logic

The system triggers an alert when `officeCount > 5`:
- A red banner appears at the top of the dashboard
- The "In Office" summary card turns red with an ⚠️ OVER LIMIT tag
- A snackbar notification pops up
- The alert also triggers on the API response so any integration can react to it
