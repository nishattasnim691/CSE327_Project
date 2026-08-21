from fastapi import APIRouter
from database.database_manager import DatabaseConnectionPool
import uuid


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


db = DatabaseConnectionPool()



@router.post("/signup")
def signup(user: dict):

    role = user.get("role", "patient")


    # -------------------------
    # PATIENT REGISTRATION
    # -------------------------

    if role == "patient":

        patient_id = str(uuid.uuid4())


        query = """
        INSERT INTO Patients
        (
            PatientID,
            Name,
            Email,
            Password,
            DOB,
            Gender,
            BloodType
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """


        db.execute_query(
            query,
            (
                patient_id,
                user["name"],
                user["email"],
                user["password"],
                user["dob"],
                user["gender"],
                user["bloodGroup"]
            )
        )


        return {

            "userId": patient_id,
            "name": user["name"],
            "email": user["email"],
            "role": "patient"

        }



    # -------------------------
    # DOCTOR REGISTRATION
    # -------------------------

    else:

        doctor_id = str(uuid.uuid4())


        query = """
        INSERT INTO Doctors
        (
            DoctorID,
            Name,
            Email,
            Password,
            LicenseNumber,
            Specialty
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """


        db.execute_query(
            query,
            (
                doctor_id,
                user["name"],
                user["email"],
                user["password"],
                user["licenseNumber"],
                user.get("specialty", "General")
            )
        )


        return {

            "userId": doctor_id,
            "name": user["name"],
            "email": user["email"],
            "role": "doctor"

        }




@router.post("/login")
def login(user: dict):

    role = user.get("role", "patient")


    if role == "patient":

        query = """
        SELECT PatientID, Name, Email
        FROM Patients
        WHERE Email=? AND Password=?
        """


    else:

        query = """
        SELECT DoctorID, Name, Email
        FROM Doctors
        WHERE Email=? AND Password=?
        """



    result = db.execute_query(
        query,
        (
            user["email"],
            user["password"]
        )
    )


    if result:

        account = result[0]


        return {

            "userId": account[0],
            "name": account[1],
            "email": account[2],
            "role": role,
            "token": "demo-token"

        }


    return {

        "message": "Invalid email or password"

    }