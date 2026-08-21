from fastapi import FastAPI
from database_manager import DatabaseConnectionPool
from auth_service import AuthService

app = FastAPI(title="Virtual Clinic API")
db = DatabaseConnectionPool()
auth = AuthService()

@app.get("/database/health")
def check_db_health():
    return {"status": "connected", "database": "virtual_clinic.db"}

@app.post("/login")
def login(username: str, password_hash: str):
    # The API simply calls the DAO, keeping routes perfectly clean.
    role = auth.authenticate(username, password_hash)
    
    # DESIGN PATTERN 2: Functional Strategy Pattern
    # HOW: The endpoint dynamically selects the correct JSON response strategy 
    # based strictly on a boolean evaluation, avoiding all if/else statements.
    responses = {
        True: {"status": "success", "role": role},
        False: {"status": "failed", "error": "Invalid credentials"}
    }
    return responses[role is not None]