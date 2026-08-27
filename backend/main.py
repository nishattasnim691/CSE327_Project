from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes import patient_routes
from routes.member3_routes import router as member3_router
from database.database_manager import DatabaseConnectionPool
from routes import triage_routes
from routes.doctor_routes import router as doctor_router
from routes import pharmacy_routes


app = FastAPI(
    title="Virtual Clinic System API",
    version="0.1.0",
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


# Register API routers
app.include_router(auth_router)
app.include_router(member3_router)
app.include_router(patient_routes.router)
app.include_router(triage_routes.router)
app.include_router(doctor_router)
app.include_router(pharmacy_routes.router)

@app.get("/")
async def root():
    return {
        "message": "Virtual Clinic backend is running."
    }


@app.get("/api/database-test")
def database_test():

    db = DatabaseConnectionPool()

    tables = db.execute_query(
        "SELECT name FROM sqlite_master WHERE type='table';"
    )

    return {
        "status": "Database connected",
        "tables": tables
    }


app = CORSMiddleware(
    app=app,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
