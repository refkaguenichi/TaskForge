# Start the dependency-build stage from the slim Python 3.12 image.
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Create an isolated virtual environment for app dependencies.
RUN python -m venv /opt/venv

# Copy only the dependency manifest first to improve Docker layer caching.
COPY requirements.txt .

# Upgrade pip tooling, then install the exact pinned Python dependencies.
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt


# Start the lightweight runtime stage from the slim Python 3.12 image.
FROM python:3.12-slim AS runtime

# Prevent Python from writing `.pyc` files at runtime.
ENV PYTHONDONTWRITEBYTECODE=1
# Keep runtime logs unbuffered so they appear immediately in container logs.
ENV PYTHONUNBUFFERED=1
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy the prebuilt virtual environment from the builder stage.
COPY --from=builder /opt/venv /opt/venv
# Copy the application source code into the runtime image.
COPY . .

# Document that the app listens on port 8000.
EXPOSE 8000

# Start the FastAPI app with Uvicorn when the container launches.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
