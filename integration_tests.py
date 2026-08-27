from database_manager import DatabaseConnectionPool
from fastapi.testclient import TestClient
from routes import app

def run_integration_tests():
    print("--- Starting Integration Testing ---")
    
    # 1. Access the shared database instance (Bottom Layer)
    db = DatabaseConnectionPool()
    
    # 2. Inject temporary test data directly into the DB 
    # (Using INSERT OR IGNORE so it doesn't crash if it exists)
    db.execute_query(
        "INSERT OR IGNORE INTO Users (id, username, password_hash, role) VALUES (999, 'integration_user', 'test_pass', 'Admin')"
    )
    print("[Integration] Injected test user into the database.")

    # 3. Simulate the Streamlit UI sending a web request (Top Layer)
    client = TestClient(app)
    response = client.post("/login?username=integration_user&password_hash=test_pass")
    
    # 4. Verify the entire communication chain (Routes -> Auth DAO -> DB)
    if response.status_code == 200 and response.json().get("role") == "Admin":
        print("✅ INTEGRATION PASSED: The web server successfully communicated with the DAO, which successfully read the Database!")
    else:
        print("❌ INTEGRATION FAILED: The modules are not communicating correctly.")
        print(f"Details: {response.json()}")

    # 5. Clean up the test data so we don't pollute the database
    db.execute_query("DELETE FROM Users WHERE username = 'integration_user'")
    print("[Integration] Cleaned up test user from the database.")

if __name__ == "__main__":
    run_integration_tests()