from fastapi import FastAPI
from app.api.router import api_router


app = FastAPI()

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "FastAPI is running 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok"}