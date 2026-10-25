import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import db
from app.routers import shelves, items, users, logs

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    yield
    # Shutdown
    if db.client:
        db.client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="杉本研究室 備品管理システム API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(shelves.router, prefix="/api")
app.include_router(items.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(logs.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "storage": "mongodb" if db.is_mongo else "json_storage",
        "app": settings.PROJECT_NAME
    }

