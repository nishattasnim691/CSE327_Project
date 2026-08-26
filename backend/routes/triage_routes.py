from datetime import datetime, timezone
import json
import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from database.database_manager import DatabaseConnectionPool

router = APIRouter()


class TriageRequest(BaseModel):
    patientId: str
    symptoms: list[str]
    description: str
    duration: str


@router.post("/api/triage")
def submit_triage(request: TriageRequest):

    text = " ".join(request.symptoms).lower()

    if "chest pain" in text or "breathing" in text:
        category = "Critical"

    elif "fever" in text:
        category = "Routine"

    else:
        category = "Self-Care"

    db = DatabaseConnectionPool()
    submitted_at = datetime.now(timezone.utc).isoformat()
    existing_case = db.execute_query(
        "SELECT CaseID FROM TriageCases WHERE PatientID = ?",
        (request.patientId,),
    )

    if existing_case:
        db.execute_query(
            """
            UPDATE TriageCases
            SET Symptoms = ?, Description = ?, Duration = ?, Category = ?,
                SubmittedAt = ?, Status = 'Waiting'
            WHERE PatientID = ?
            """,
            (
                json.dumps(request.symptoms),
                request.description,
                request.duration,
                category,
                submitted_at,
                request.patientId,
            ),
        )
    else:
        db.execute_query(
            """
            INSERT INTO TriageCases
            (CaseID, PatientID, Symptoms, Description, Duration, Category, SubmittedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                request.patientId,
                json.dumps(request.symptoms),
                request.description,
                request.duration,
                category,
                submitted_at,
            ),
        )

    existing_assignment = db.execute_query(
        "SELECT AssignmentID FROM DoctorAssignments WHERE PatientID = ?",
        (request.patientId,),
    )

    if existing_assignment:
        db.execute_query(
            """
            UPDATE DoctorAssignments
            SET DoctorID = 'unassigned', AssignedAt = ?, Status = 'Pending'
            WHERE PatientID = ?
            """,
            (submitted_at, request.patientId),
        )
    else:
        db.execute_query(
            """
            INSERT INTO DoctorAssignments
            (AssignmentID, DoctorID, PatientID, AssignedAt, Status)
            VALUES (?, 'unassigned', ?, ?, 'Pending')
            """,
            (str(uuid.uuid4()), request.patientId, submitted_at),
        )

    return {"category": category}