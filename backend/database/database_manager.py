import sqlite3


class DatabaseConnectionPool:

    _instance = None


    def __new__(cls):

        if cls._instance is None:

            cls._instance = super(DatabaseConnectionPool, cls).__new__(cls)

        return cls._instance



    def __init__(self):

        if not hasattr(self, "connection"):

            self._initialize_connection()



    def _initialize_connection(self):

        self.connection = sqlite3.connect(
            "virtual_clinic.db",
            check_same_thread=False
        )

        self.cursor = self.connection.cursor()

        print(
            "[System] Secure database connection initialized via Singleton."
        )

        self._create_tables()



    def execute_query(self, query, params=()):

        try:

            cursor = self.connection.cursor()

            cursor.execute(
                query,
                params
            )

            self.connection.commit()

            return cursor.fetchall()


        except sqlite3.Error as e:

            print(
                f"Query error: {e}"
            )

            return None



    def _create_tables(self):

        try:

            self.cursor.executescript("""

            CREATE TABLE IF NOT EXISTS Patients (

                PatientID TEXT PRIMARY KEY,

                Name TEXT NOT NULL,

                Email TEXT UNIQUE NOT NULL,

                Password TEXT NOT NULL,

                DOB TEXT NOT NULL,

                Gender TEXT NOT NULL,

                BloodType TEXT NOT NULL

            );


            CREATE TABLE IF NOT EXISTS Doctors (

                DoctorID TEXT PRIMARY KEY,

                Name TEXT NOT NULL,

                Email TEXT UNIQUE NOT NULL,

                Password TEXT NOT NULL,

                LicenseNumber TEXT UNIQUE NOT NULL,

                Specialty TEXT

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

            print(
                f"Database error: {e}"
            )



if __name__ == "__main__":

    db1 = DatabaseConnectionPool()

    db2 = DatabaseConnectionPool()


    print(
        f"Are db1 and db2 the exact same object? {db1 is db2}"
    )