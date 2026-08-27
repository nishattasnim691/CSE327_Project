from datetime import datetime, timezone
import json
import uuid

from fastapi import APIRouter
from pydantic import BaseModel

from database.database_manager import DatabaseConnectionPool

# Chain of Responsibility imports
from patterns.chain.critical_emergency_check import CriticalEmergencyCheck
from patterns.chain.urgent_care_check import UrgentCareCheck
from patterns.chain.routine_check import RoutineCheck


router = APIRouter()


class TriageRequest(BaseModel):
    patientId: str
    symptoms: list[str]
    description: str
    duration: str


def run_triage_engine(
    symptoms: list[str],
    description: str = "",
) -> str:
    """
    Chain of Responsibility:
    Critical -> Urgent -> Routine -> Self-Care
    """

    triage_chain = CriticalEmergencyCheck()

    triage_chain \
        .set_next(UrgentCareCheck()) \
        .set_next(RoutineCheck())

    symptom_text = " ".join(
        [*symptoms, description]
    )

    return triage_chain.handle(symptom_text)


@router.post("/api/triage")
def submit_triage(request: TriageRequest):

    # Use Chain of Responsibility instead of temporary if/else logic
    category = run_triage_engine(
        request.symptoms,
        request.description,
    )

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
            SET Symptoms = ?,
                Description = ?,
                Duration = ?,
                Category = ?,
                SubmittedAt = ?,
                Status = 'Waiting'
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
            (
                CaseID,
                PatientID,
                Symptoms,
                Description,
                Duration,
                Category,
                SubmittedAt
            )
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
            SET DoctorID = 'unassigned',
                AssignedAt = ?,
                Status = 'Pending'
            WHERE PatientID = ?
            """,
            (
                submitted_at,
                request.patientId,
            ),
        )

    else:

        db.execute_query(
            """
            INSERT INTO DoctorAssignments
            (
                AssignmentID,
                DoctorID,
                PatientID,
                AssignedAt,
                Status
            )
            VALUES (?, 'unassigned', ?, ?, 'Pending')
            """,
            (
                str(uuid.uuid4()),
                request.patientId,
                submitted_at,
            ),
        )


    return {
        "category": category,
        "message": "Triage submitted successfully"
    }