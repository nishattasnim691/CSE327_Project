from fastapi import APIRouter, HTTPException
from database.database_manager import DatabaseConnectionPool
from patterns.decorator.chat_interface import ChatInterface
from patterns.decorator.jargon_simplifier import JargonSimplifierDecorator
from patterns.decorator.translation import TranslationDecorator
from pydantic import BaseModel
from datetime import datetime
from typing import Literal
import uuid

router = APIRouter(prefix="/api", tags=["Patients"])

class MessageCreate(BaseModel):
    sender: Literal["patient", "doctor"]
    text: str
    simplify: bool = True
    language: Literal["English", "Bangla"] = "English"


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
            "patientId": patient_id,
            "sender": m[1],
            "text": m[2],
            "time": m[3],
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

    chat: ChatInterface = ChatInterface()
    if message.simplify:
        chat = JargonSimplifierDecorator(chat)
    if message.language == "Bangla":
        chat = TranslationDecorator(chat, language=message.language)
    enhanced_text = chat.send_message(message.text)

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
            enhanced_text,
            created
        )
    )

    return {
        "id": message_id,
        "patientId": patient_id,
        "sender": message.sender,
        "text": enhanced_text,
        "time": created,
        "createdAt": created
    }