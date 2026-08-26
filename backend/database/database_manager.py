import sqlite3


class DatabaseConnectionPool:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnectionPool, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "connection"):
            self.connection = sqlite3.connect(
                "virtual_clinic.db",
                check_same_thread=False
            )
            self.cursor = self.connection.cursor()
            self._create_tables()

    def execute_query(self, query, params=()):
        cursor = self.connection.cursor()
        cursor.execute(query, params)
        self.connection.commit()
        return cursor.fetchall()

    def _create_tables(self):

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS Patients(
            PatientID TEXT PRIMARY KEY,
            Name TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL,
            DOB TEXT NOT NULL,
            Gender TEXT NOT NULL,
            BloodType TEXT NOT NULL
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS Doctors(
            DoctorID TEXT PRIMARY KEY,
            Name TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Password TEXT NOT NULL,
            LicenseNumber TEXT NOT NULL,
            Specialty TEXT NOT NULL
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS TriageCases(
            CaseID TEXT PRIMARY KEY,
            PatientID TEXT NOT NULL,
            Symptoms TEXT NOT NULL,
            Description TEXT NOT NULL,
            Duration TEXT NOT NULL,
            Category TEXT NOT NULL,
            SubmittedAt TEXT NOT NULL,
            Status TEXT DEFAULT 'Waiting'
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS ConsultationMessages(
            MessageID TEXT PRIMARY KEY,
            PatientID TEXT NOT NULL,
            Sender TEXT NOT NULL,
            MessageText TEXT NOT NULL,
            CreatedAt TEXT NOT NULL
        )
        """)

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS DoctorAssignments(
            AssignmentID TEXT PRIMARY KEY,
            DoctorID TEXT NOT NULL,
            PatientID TEXT NOT NULL,
            AssignedAt TEXT NOT NULL,
            Status TEXT DEFAULT 'Pending'
        )
        """)

        self.connection.commit()