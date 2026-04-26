# TaskForge

TaskForge is a full-stack task management project with a `Next.js` frontend and a `FastAPI` backend. The backend stores data in MySQL, uses Redis for session-related data, includes optional MongoDB in Docker for document storage experiments, and includes AI-assisted task generation powered by Groq.

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy, Alembic, Redis, PyMySQL
- Database: MySQL 8, MongoDB 7
- Messaging and cache tools: RabbitMQ, Redis, Redis Commander
- Database admin: phpMyAdmin, Mongo Express
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
- Google sign-in and auto-registration using environment-based configuration
- Task creation and task listing endpoints
- AI-generated tasks from a goal prompt
- AI-generated tasks from uploaded files
- Dockerized local development with MySQL, MongoDB, Redis, RabbitMQ, phpMyAdmin, Mongo Express, and Redis Commander

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
- `POST /api/auth/google`
- `POST /api/auth/logout`
- `GET /api/auth/debug-cookie`
- `POST /api/tasks/`
- `GET /api/tasks/`
- `POST /api/ai/generate-tasks`
- `POST /api/ai/upload-file-generate-tasks`

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
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback
COOKIE_DOMAIN=localhost
COOKIE_SECURE=False
COOKIE_SAMESITE=lax

# Optional Docker MongoDB settings
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=adminpass
MONGO_DB_NAME=taskforge
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=adminpass
```

Google auth uses `backend/.env` for backend verification settings and expects this request body:

```json
{
  "id_token": "google-id-token-from-frontend"
}
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

Create `frontend/.env` or `frontend/.env.local` for the Google sign-in page:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

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
- Mongo Express: `http://localhost:8082`
- RabbitMQ management: `http://localhost:15672`
- MySQL: `localhost:3306`
- MongoDB: `localhost:27017`
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
- The frontend includes a Google sign-in page that reads its client ID from the frontend env file.
- RabbitMQ is available in Docker, though the app does not yet include a wired worker service in `docker-compose.yml`.
