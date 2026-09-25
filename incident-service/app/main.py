import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import users_collection
from app.routers import auth, incidents


app = FastAPI(
    title="ResQLink Incident Service",
    version="1.0.0",
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(incidents.router)


@app.get("/")
def root():
    return {
        "service": "ResQLink Incident Service",
        "status": "running",
    }


@app.get("/health")
def health():
    try:
        users_collection.database.command("ping")

        return {
            "status": "healthy",
            "service": "incident-service",
        }

    except Exception:
        return {
            "status": "unhealthy",
            "service": "incident-service",
        }
