# Sher Singh Portfolio Platform

A Docker-ready React + Express + MongoDB portfolio platform for Sher Singh with:

- premium animated landing page
- AI assistant and job matcher placeholders
- resume timeline and downloadable profile
- projects case studies with filters and detail panel
- DevOps dashboard and GitHub analytics sections
- blog engine UI
- developer terminal mode
- global command palette with `Ctrl+K`
- contact form and success toast
- certifications and testimonials
- placeholder admin panel
- real user model foundation with register/login APIs and user-scoped saved workspace

## Stack

- `client/`: React + Vite
- `server/`: Express + MongoDB
- `docker-compose.yml`: client, server, mongo, caddy

## API foundation

The backend now exposes:

- `GET /api/site-content`
- `GET /api/projects`
- `GET /api/blogs`
- `GET /api/skills`
- `GET /api/resume`
- `GET /api/github/analytics`
- `GET /api/dashboard/metrics`
- `POST /api/contact`
- `POST /api/ai/assistant`
- `POST /api/ai/job-match`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/user/portfolio`
- `PUT /api/user/portfolio`
- placeholder admin CRUD routes under `/api/admin/...`

## Local run

### 1. Install dependencies

```bash
cd /home/shersingh/automation/client && npm install
cd /home/shersingh/automation/server && npm install
```

### 2. Configure backend env

Create `server/.env` from `server/.env.example`.

Example:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/portfolio_builder
PORT=5000
AUTH_SECRET=change-this-secret
```

### 3. Start the apps

```bash
cd /home/shersingh/automation
npm run server:dev
npm run client:dev
```

Manual local development uses the Vite proxy at `http://localhost:5173/api`, which forwards to `http://localhost:5000` by default.

## Docker run

Open the site at:

```text
http://portfolio.localhost
```

No `/etc/hosts` entry is required because `*.localhost` resolves locally in modern browsers.

### Start the stack

```bash
cd /home/shersingh/automation
docker compose up --build
```

Services:

- `portfolio.localhost` -> Caddy reverse proxy
- `client` -> Vite app
- `server` -> Express API
- `mongo` -> MongoDB

The Docker client container uses:

- local manual mode -> `http://localhost:5000`
- Docker mode -> `http://server:5000`

## Helper scripts

```bash
cd /home/shersingh/automation
./scripts/setup-portfolio-local.sh
./scripts/start-portfolio-local.sh
./scripts/stop-portfolio-local.sh
```

## Sample user flows

### Public portfolio

- open `http://portfolio.localhost`
- browse sections from the top navigation
- use `Ctrl+K` for the command palette
- use the terminal page for typed commands

### Real user foundation

- open the `Admin` page
- create an account with email and password
- sign in
- load the user workspace from the auth-backed API foundation

Current auth notes:

- password auth is real on the backend
- Google login is not implemented yet
- welcome email is a placeholder response point, ready for a mail provider integration

## Verification

Recommended checks after install:

```bash
cd /home/shersingh/automation
npm run client:build
docker compose up --build -d
docker compose ps
curl -I http://portfolio.localhost
```
