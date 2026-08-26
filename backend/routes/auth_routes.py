from fastapi import APIRouter, HTTPException
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


    if role == "doctor":

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
            "role": "doctor",
            "licenseNumber": user["licenseNumber"]
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
        SELECT DoctorID, Name, Email, LicenseNumber, Specialty
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

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    account = result[0]

    response = {
        "userId": account[0],
        "name": account[1],
        "email": account[2],
        "role": role,
        "token": "demo-token"
    }

    if role == "doctor":
        response["licenseNumber"] = account[3]
        response["specialty"] = account[4]

    return response