from fastapi import APIRouter, HTTPException
from database.database_manager import DatabaseConnectionPool
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter(prefix="/api", tags=["Patients"])

class MessageCreate(BaseModel):
    sender: str
    text: str


@router.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    db = DatabaseConnectionPool()

    result = db.execute_query(
        """
        SELECT PatientID, Name, Email, DOB, Gender, BloodType
        FROM Patients
        WHERE PatientID = ?
        """,
        (patient_id,)
    )

    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")

    row = result[0]

    return {
        "patientId": row[0],
        "name": row[1],
        "email": row[2],
        "dob": row[3],
        "gender": row[4],
        "bloodGroup": row[5]
    }


@router.get("/patients/{patient_id}/messages")
def get_messages(patient_id: str):
    db = DatabaseConnectionPool()

    accepted = db.execute_query(
        """
        SELECT AssignmentID FROM DoctorAssignments
        WHERE PatientID = ? AND Status = 'Active'
        """,
        (patient_id,),
    )

    if not accepted:
        return []

    messages = db.execute_query(
        """
        SELECT MessageID, Sender, MessageText, CreatedAt
        FROM ConsultationMessages
        WHERE PatientID = ?
        ORDER BY CreatedAt ASC
        """,
        (patient_id,)
    )

    return [
        {
            "id": m[0],
            "sender": m[1],
            "text": m[2],
            "createdAt": m[3]
        }
        for m in messages
    ]


@router.post("/patients/{patient_id}/messages")
def send_message(patient_id: str, message: MessageCreate):
    db = DatabaseConnectionPool()

    accepted = db.execute_query(
        """
        SELECT AssignmentID FROM DoctorAssignments
        WHERE PatientID = ? AND Status = 'Active'
        """,
        (patient_id,),
    )

    if not accepted:
        raise HTTPException(
            status_code=403,
            detail="Conversation is available only after doctor acceptance.",
        )

    message_id = str(uuid.uuid4())
    created = datetime.now().isoformat()

    db.execute_query(
        """
        INSERT INTO ConsultationMessages
        (MessageID, PatientID, Sender, MessageText, CreatedAt)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            message_id,
            patient_id,
            message.sender,
            message.text,
            created
        )
    )

    return {
        "id": message_id,
        "patientId": patient_id,
        "sender": message.sender,
        "text": message.text,
        "createdAt": created
    }