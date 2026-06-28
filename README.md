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
- verified email signup/login APIs and user-scoped saved workspace

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
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
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
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_TOKEN_TTL_MS=43200000
EMAIL_VERIFICATION_TTL_MINUTES=15
EMAIL_DELIVERY_MODE=console
CORS_ORIGINS=http://localhost:5173,https://sher-singh-1.github.io
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

## Production deployment flow

The public project URL should stay on GitHub Pages:

```text
https://sher-singh-1.github.io/portfolio-builder/
```

The backend must run on a backend host because GitHub Pages cannot run Express or MongoDB. This repo includes `render.yaml` for deploying `server/` as a Node web service. Use a hosted MongoDB connection string, such as MongoDB Atlas, for `MONGO_URI`.

Production backend environment variables:

```bash
MONGO_URI=mongodb+srv://...
AUTH_SECRET=long-random-secret
EMAIL_DELIVERY_MODE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Portfolio Builder <no-reply@example.com>
CORS_ORIGINS=https://sher-singh-1.github.io
```

After the backend is deployed, copy its public URL, for example:

```text
https://portfolio-builder-api.example.com
```

Then open the GitHub repo settings and add an Actions variable:

```text
Name: VITE_API_BASE
Value: https://portfolio-builder-api.example.com
```

Re-run the GitHub Pages action. The GitHub Pages site will remain the visible project link, while login, email verification, and saved portfolio data will use the live backend.

### No-card backend option: Vercel

If Render asks for payment details, deploy the backend on Vercel instead:

1. Import the GitHub repo into Vercel.
2. Set the project root directory to `server`.
3. Add environment variables:

```bash
MONGO_URI=mongodb+srv://.../portfolio_builder?retryWrites=true&w=majority
AUTH_SECRET=long-random-secret
EMAIL_DELIVERY_MODE=console
CORS_ORIGINS=https://sher-singh-1.github.io
```

4. Deploy.
5. Open `/api/health` on the Vercel backend URL.
6. Add the Vercel backend URL as the GitHub Actions variable `VITE_API_BASE`, then rerun the GitHub Pages workflow.

## GitHub Pages and backend hosting

GitHub Pages can host only the static React frontend. It cannot run the Express API or MongoDB. For real login, verified email, and saved portfolio data, deploy the backend and MongoDB separately, then build the frontend with:

```bash
VITE_API_BASE=https://your-backend-domain.example npm --prefix client run build
```

The GitHub Pages workflow should use the same `VITE_API_BASE` value after the backend is live.

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
- users must verify a 6-digit email code before login
- `EMAIL_DELIVERY_MODE=console` logs/returns the code for local testing
- production sends verification codes through SMTP when `EMAIL_DELIVERY_MODE=smtp`
- Google login is not implemented yet

## Verification

Recommended checks after install:

```bash
cd /home/shersingh/automation
npm run client:build
docker compose up --build -d
docker compose ps
curl -I http://portfolio.localhost
```
