from database_manager import DatabaseConnectionPool
from auth_service import AuthService
from offline_sync import OfflineSyncManager, SaveSymptomLogCommand
from routes import app
from fastapi.testclient import TestClient

print("--- Initializing Unit Tests ---")

# --- MODULE 1: database_manager.py ---
def test_singleton():
    db1 = DatabaseConnectionPool()
    db2 = DatabaseConnectionPool()
    assert db1 is db2, "Singleton Failed: Multiple DB instances created!"
    print("✅ DatabaseManager: Singleton pattern passed.")

# --- MODULE 2: auth_service.py ---
def test_auth_dao():
    auth = AuthService()
    # Positive Test: Valid credentials
    assert auth.authenticate('dr_smith', 'hashed_pw_123') == 'Doctor', "Auth Failed: Valid user rejected."
    # Negative Test: Invalid credentials
    assert auth.authenticate('dr_smith', 'wrong_pass') is None, "Auth Failed: Invalid user accepted."
    print("✅ AuthService: DAO and Strategy pattern passed.")

# --- MODULE 3: offline_sync.py ---

def test_offline_command_queue():
    sync_manager = OfflineSyncManager()
    
    # 1. Force it offline for the test
    sync_manager.simulate_connection_drop()
    
    # 2. Create your specific command
    command = SaveSymptomLogCommand("P-001", "Testing Symptoms", "Routine")
    
    # 3. Add it to the queue
    sync_manager.add_action(command)
    
    # 4. Verify it was caught in the queue
    assert len(sync_manager.command_queue) == 1, "OfflineSync Failed: Command not added to queue."
    print("✅ OfflineSyncManager: Command pattern queue passed.")
    

# --- MODULE 4: routes.py ---
def test_api_routes():
    # FastAPI provides a TestClient to simulate web requests natively
    client = TestClient(app)
    response = client.post("/login?username=dr_smith&password_hash=hashed_pw_123")
    
    assert response.status_code == 200, "Routes Failed: API did not return 200 OK."
    assert response.json()["status"] == "success", "Routes Failed: API returned wrong JSON."
    print("✅ Routes: Controller endpoints passed.")

# --- EXECUTE ALL ---
if __name__ == "__main__":
    test_singleton()
    test_auth_dao()
    test_offline_command_queue()
    test_api_routes()
    print("🎉 ALL UNIT TESTS PASSED!")