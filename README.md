# TaskForge

TaskForge is a full-stack task management project with a `Next.js` frontend and a `FastAPI` backend. The backend stores data in MySQL, uses Redis for session-related data, and includes AI-assisted task generation powered by Groq.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy, Alembic, Redis, PyMySQL
- Database: MySQL 8
- Messaging and cache tools: RabbitMQ, Redis, Redis Commander
- Database admin: phpMyAdmin
- Containerization: Docker Compose, multi-stage Docker build
- CI/CD: GitLab CI

## Project Structure

```text
TaskForge/
├── backend/              # FastAPI app, models, services, migrations
├── frontend/             # Next.js app
├── docker-compose.yml    # Local multi-service development stack
├── .gitlab-ci.yml        # GitLab pipeline for backend image builds
└── README.md
```

## Features

- User registration and login with cookie-based auth flow
- Task creation and task listing endpoints
- AI-generated tasks from a goal prompt
- AI-generated tasks from uploaded files
- Memory-aware task generation flow
- Dockerized local development with MySQL, Redis, RabbitMQ, phpMyAdmin, and Redis Commander

## Backend API

Base URL in local development:

```text
http://localhost:8000
```

Main routes:

- `GET /` - backend health greeting
- `GET /health` - simple health check
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/debug-cookie`
- `POST /api/tasks/`
- `GET /api/tasks/`
- `POST /api/ai/generate-tasks`
- `POST /api/ai/upload-file-generate-tasks`
- `POST /api/ai/generate-with-memory`

## Environment Variables

Create `backend/.env` from `backend/.env.example` and fill in your values.

Important variables:

```env
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
SECRET_KEY=
ALGORITHM=HS256
TOKEN_NAME=access_token
REDIS_HOST=
REDIS_PORT=
REDIS_DB=
COOKIE_DOMAIN=localhost
COOKIE_SECURE=False
COOKIE_SAMESITE=lax
```

## Local Development

### Backend

From the `backend` directory:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`.

### Frontend

From the `frontend` directory:

```bash
npm ci
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Docker Compose

Start the full local stack from the project root:

```bash
docker compose up --build
```

Available services:

- Backend: `http://localhost:8000`
- Frontend: not yet included in `docker-compose.yml`
- phpMyAdmin: `http://localhost:8080`
- Redis Commander: `http://localhost:8081`
- RabbitMQ management: `http://localhost:15672`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`

## Database Migrations

From the `backend` directory:

```bash
alembic upgrade head
```

## GitLab CI/CD

The project includes a GitLab pipeline that:

- Builds the backend Docker image
- Tags it with the commit SHA
- Pushes both the commit tag and `latest` to the GitLab container registry

Pipeline file:

- [.gitlab-ci.yml](./.gitlab-ci.yml)

## Notes

- The backend currently allows CORS for `http://localhost:3000`.
- The frontend still contains some default Next.js starter content and can be expanded to consume the backend APIs.
- RabbitMQ is available in Docker, though the app does not yet include a wired worker service in `docker-compose.yml`.
