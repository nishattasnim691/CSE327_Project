from database_manager import DatabaseConnectionPool

# DESIGN PATTERN 1: Data Access Object (DAO) / Service Pattern
# HOW: This class centralizes all database interactions for user authentication. 
# It hides the complex SQL queries from the rest of the application.
class AuthService:
    def __init__(self):
        # Reusing your existing Singleton pattern here!
        self.db = DatabaseConnectionPool() 

    def register_user(self, username, password_hash, role):
        try:
            self.db.execute_query(
                "INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)",
                (username, password_hash, role)
            )
            return True
        except Exception:
            return False

    def authenticate(self, username, password_hash):
        # execute_query returns a list (e.g., [('Doctor',)] if successful, or [] if failed)
        results = self.db.execute_query(
            "SELECT role FROM Users WHERE username = ? AND password_hash = ?", 
            (username, password_hash)
        )
        
        # DESIGN PATTERN: Functional Strategy Pattern
        # If the list has data, bool(results) is True. If empty, it's False.
        auth_status = {
            True: lambda: results[0][0] if results else None,
            False: lambda: None
        }
        return auth_status[bool(results)]()