import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import resources


app = FastAPI(
    title="ResQLink Resource Service",
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


app.include_router(resources.router)


@app.get("/")
def root():
    return {
        "service": "ResQLink Resource Service",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "resource-service",
    }
