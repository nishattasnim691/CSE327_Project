import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database_manager import DatabaseConnectionPool

def seed_database():
    db = DatabaseConnectionPool()
    
    print("[Seed] Planting dummy data...")
    
    # Using INSERT OR IGNORE so it doesn't crash if run twice
    db.execute_query("INSERT OR IGNORE INTO Users (id, username, password_hash, role) VALUES (1, 'dr_smith', 'hashed_pw_123', 'Doctor')")
    db.execute_query("INSERT OR IGNORE INTO Users (id, username, password_hash, role) VALUES (2, 'nurse_joy', 'hashed_pw_456', 'Nurse')")
    
    db.execute_query("INSERT OR IGNORE INTO Prescriptions (id, patient_id, doctor_id, medication, instructions) VALUES (1, 1, 1, 'Amoxicillin', 'Take twice daily')")
    db.execute_query("INSERT OR IGNORE INTO PharmacyOrders (id, prescription_id, status) VALUES (1, 1, 'Pending')")
    
    # INDENTED CORRECTLY: This forces the save before the function ends
    db.connection.commit()
    print("[Seed] Dummy data successfully injected into the matrix!")

if __name__ == "__main__":
    seed_database()