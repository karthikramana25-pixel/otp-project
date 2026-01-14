# OTP App

Simple OTP-based login demo (Postgres + Node backend + React frontend).

## Requirements

- Docker & Docker Compose (recommended)
- Node.js and npm (for local development)

## Run with Docker (recommended)

1. Build and start services:

```bash
docker-compose up --build
```

2. Services:
- Backend: http://localhost:4000
- Frontend: http://localhost

The Postgres service initializes the DB using `db/db.sql` as configured in `docker-compose.yml`.

## Run locally (without Docker)

### Backend

1. Copy the example env file:

```bash
cp .env.example .env
```

2. Install dependencies and start:

```bash
cd backend
npm install
npm start
```

> Note: `dotenv` is required by the backend; make sure to run `npm install` in the `backend` folder (I couldn't run it in this environment).

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend expects the backend to be available at `/send-otp` and `/verify-otp` on the same origin; if running separately, you may need to configure a proxy or set the backend URL explicitly.

## Environment

- See `.env.example` for variables used by the backend (DB host, user, pass, name, PORT).

## Notes

- I added a `.gitignore` to exclude `node_modules`, build artifacts, and `.env` files.
- If `npm` is not available on your machine, install Node.js (which includes npm) or use Docker to run the app.

---

## CI / Docker Hub (GitHub Actions) 🔁

A GitHub Actions workflow is included to build images for the backend and frontend and push them to Docker Hub when you push to `main` (or trigger manually).

Required repository secrets:
- `DOCKERHUB_USERNAME` — your Docker Hub username
- `DOCKERHUB_TOKEN` — a Docker Hub access token (recommended) or password

Image names used by the workflow (defaults):
- `${{ secrets.DOCKERHUB_USERNAME }}/otp-backend` (tags: `latest` (main), tag name (on tag push), commit SHA)
- `${{ secrets.DOCKERHUB_USERNAME }}/otp-frontend` (tags: `latest` (main), tag name (on tag push), commit SHA)

To trigger: push to `main`, push a Git tag matching `v*` (e.g., `v1.2.3`) to publish a versioned image and create a GitHub release, or use the Actions tab → **Build and Publish Docker images** → **Run workflow**.

If you'd like, I can also add a development script to run backend and frontend concurrently or a short `Makefile` with common commands. Let me know which you prefer.
