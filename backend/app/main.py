from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.routers import (
    auth, municipalities, demographics, shrinkage,
    fiscal, akiya, elderly, migration
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and auto-seed data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="MachiMirai (まちミライ) — Japan Municipal Survival Intelligence Platform",
    description="Demographic intelligence, smart shrinkage simulation, fiscal sustainability early warning, akiya management, elderly welfare monitoring, and migration attraction toolkit for depopulating Japanese towns.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all Routers
app.include_router(auth.router)
app.include_router(municipalities.router)
app.include_router(demographics.router)
app.include_router(shrinkage.router)
app.include_router(fiscal.router)
app.include_router(akiya.router)
app.include_router(elderly.router)
app.include_router(migration.router)

@app.get("/")
def root():
    return {
        "system": "MachiMirai (まちミライ)",
        "status": "online",
        "domain": "GovTech / Japan Municipal Survival Intelligence",
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0",
        "service": "MachiMirai API"
    }
