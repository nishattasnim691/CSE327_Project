import sqlite3
import threading

class DatabaseConnectionPool:
    """
    DESIGN PATTERN 1: SINGLETON
    Ensures only ONE instance of the database connection exists across the entire app.
    This uses thread-locking to prevent race conditions if multiple users hit the kiosk at once.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        # Double-checked locking for thread safety
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DatabaseConnectionPool, cls).__new__(cls)
                cls._instance._initialize_connection()
        return cls._instance

    def _initialize_connection(self):
        """Private method to set up the actual database connection."""
        # check_same_thread=False allows multiple threads to share this connection
        self.connection = sqlite3.connect("virtual_clinic.db", check_same_thread=False)
        self.cursor = self.connection.cursor()
        print("[System] Secure database connection initialized via Singleton.")
        self._create_tables()

    def _create_tables(self):
        """Creates the database schema if it doesn't already exist."""
        try:
            self.cursor.executescript("""
                CREATE TABLE IF NOT EXISTS Patients (
                    PatientID TEXT PRIMARY KEY,
                    Name TEXT NOT NULL,
                    DOB TEXT,
                    BloodType TEXT
                );
                CREATE TABLE IF NOT EXISTS Doctors (
                    DoctorID TEXT PRIMARY KEY,
                    Name TEXT NOT NULL,
                    LicenseNumber TEXT UNIQUE NOT NULL
                );
                CREATE TABLE IF NOT EXISTS Encounters (
                    EncounterID TEXT PRIMARY KEY,
                    PatientID TEXT,
                    TriageLevel TEXT,
                    SymptomsText TEXT
                );
            """)
            self.connection.commit()
            print("[System] Database schema verified.")
        except sqlite3.Error as e:
            print(f"Database error: {e}")

    def execute_query(self, query, parameters=()):
        """Method your teammates will call to insert or fetch data."""
        try:
            self.cursor.execute(query, parameters)
            self.connection.commit()
            return self.cursor.fetchall()
        except sqlite3.Error as e:
            print(f"Query error: {e}")
            return None

# --- Example Usage (How your teammates will use your code) ---
if __name__ == "__main__":
    # Even if they try to create multiple instances, they all share the exact same memory address
    db1 = DatabaseConnectionPool()
    db2 = DatabaseConnectionPool()
    
    print(f"Are db1 and db2 the exact same object? {db1 is db2}")