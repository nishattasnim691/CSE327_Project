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


        db.execute_query(
            """
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
            """,
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
            "role": "patient"
        }




    if role == "doctor":

        doctor_id = str(uuid.uuid4())


        db.execute_query(
            """
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
            """,
            (
                doctor_id,
                user["name"],
                user["email"],
                user["password"],
                user["licenseNumber"],
                user.get("specialty","General")
            )
        )


        return {
            "userId": doctor_id,
            "role": "doctor"
        }




    if role == "dispatcher":

        dispatcher_id = str(uuid.uuid4())


        db.execute_query(
            """
            INSERT INTO Dispatchers
            (
                DispatcherID,
                Name,
                Email,
                Password
            )
            VALUES (?, ?, ?, ?)
            """,
            (
                dispatcher_id,
                user["name"],
                user["email"],
                user["password"]
            )
        )


        return {
            "userId": dispatcher_id,
            "role": "dispatcher"
        }




@router.post("/login")
def login(user: dict):

    role = user.get("role","patient")


    if role == "patient":

        query = """
        SELECT PatientID, Name, Email
        FROM Patients
        WHERE Email=? AND Password=?
        """



    elif role == "doctor":

        query = """
        SELECT DoctorID, Name, Email, LicenseNumber, Specialty
        FROM Doctors
        WHERE Email=? AND Password=?
        """



    elif role == "dispatcher":

        query = """
        SELECT DispatcherID, Name, Email
        FROM Dispatchers
        WHERE Email=? AND Password=?
        """



    else:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )



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
        "token":"demo-token"

    }

    if role == "doctor":
        response.update({
            "licenseNumber": account[3],
            "specialty": account[4],
        })

    return response