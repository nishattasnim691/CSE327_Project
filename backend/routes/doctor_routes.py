from datetime import datetime, timezone
import uuid

import json

from fastapi import APIRouter, HTTPException, Query

from database.database_manager import DatabaseConnectionPool
from routes.triage_routes import run_triage_engine


router = APIRouter(tags=["Doctors"])


def _assignment_response(row: tuple) -> dict:
    return {
        "patientId": row[0],
        "patientName": row[1] or row[0],
        "status": row[2],
    }


@router.get("/api/doctor/pending-cases")
def get_pending_doctor_cases() -> list[dict]:
    db = DatabaseConnectionPool()
    assignments = db.execute_query(
        """
         SELECT c.PatientID, p.Name, c.Status, c.Category,
             c.Symptoms, c.Description, c.Duration
         FROM TriageCases c
         LEFT JOIN Patients p ON p.PatientID = c.PatientID
         WHERE c.Status = 'Waiting'
        ORDER BY CASE c.Category
            WHEN 'Critical' THEN 1
            WHEN 'Urgent' THEN 2
            WHEN 'Routine' THEN 3
            ELSE 4
        END, c.SubmittedAt ASC
        """
    )
    cases = [_case_response(row) for row in assignments]
    return sorted(cases, key=_priority)


@router.get("/api/doctor/accepted-cases")
def get_accepted_doctor_cases(doctor_id: str | None = Query(None)) -> list[dict]:
    db = DatabaseConnectionPool()
    assignments = db.execute_query(
        """
         SELECT c.PatientID, p.Name, c.Status, c.Category,
             c.Symptoms, c.Description, c.Duration
         FROM TriageCases c
         LEFT JOIN Patients p ON p.PatientID = c.PatientID
         WHERE EXISTS (
             SELECT 1
             FROM DoctorAssignments a
             WHERE a.PatientID = c.PatientID
                 AND a.Status = 'Active'
                 AND (? IS NULL OR a.DoctorID = ?)
         )
         ORDER BY c.SubmittedAt DESC
        """,
                (doctor_id, doctor_id),
    )
    return [_case_response(row) for row in assignments]


def _case_response(row: tuple) -> dict:
    response = _assignment_response(row)
    try:
        symptoms = json.loads(row[4])
        if not isinstance(symptoms, list):
            symptoms = [str(symptoms)]
    except (TypeError, json.JSONDecodeError):
        symptoms = [str(row[4])] if row[4] else []

    triage = run_triage_engine(
        symptoms,
        row[5] or "",
    )
    response.update({
        "triage": triage,
        "symptoms": symptoms,
        "description": row[5],
        "duration": row[6],
    })
    return response


def _priority(case: dict) -> int:
    return {
        "Critical": 1,
        "Urgent": 2,
        "Routine": 3,
        "Self-Care": 4,
    }.get(case["triage"], 4)


@router.put("/api/accept-doctor-case/{patient_id}")
def accept_doctor_case(
    patient_id: str,
    doctor_id: str = Query(...),
) -> dict:
    db = DatabaseConnectionPool()
    assignment = db.execute_query(
        """
        SELECT AssignmentID
        FROM DoctorAssignments
                WHERE PatientID = ? AND (DoctorID = ? OR DoctorID = 'unassigned')
                    AND Status = 'Pending'
        """,
        (patient_id, doctor_id),
    )

    if assignment:
        db.execute_query(
            """
            UPDATE DoctorAssignments
            SET DoctorID = ?, Status = 'Active', AssignedAt = ?
            WHERE PatientID = ? AND Status = 'Pending'
            """,
            (
                doctor_id,
                datetime.now(timezone.utc).isoformat(),
                patient_id,
            ),
        )
    else:
        raise HTTPException(
            status_code=404,
            detail="Pending doctor case not found.",
        )

    db.execute_query(
        """
        UPDATE TriageCases SET Status = 'In Review'
        WHERE PatientID = ?
        """,
        (patient_id,),
    )

    return {
        "patientId": patient_id,
        "doctorId": doctor_id,
        "status": "Active",
    }


@router.put("/api/doctor/cases/{patient_id}/complete")
def complete_doctor_case(
    patient_id: str,
    doctor_id: str = Query(...),
) -> dict:
    db = DatabaseConnectionPool()
    assignment = db.execute_query(
        """
        SELECT AssignmentID
        FROM DoctorAssignments
        WHERE PatientID = ? AND DoctorID = ? AND Status = 'Active'
        """,
        (patient_id, doctor_id),
    )

    if not assignment:
        raise HTTPException(
            status_code=404,
            detail="Active doctor case not found.",
        )

    db.execute_query(
        """
        UPDATE DoctorAssignments
        SET Status = 'Completed'
        WHERE PatientID = ? AND DoctorID = ? AND Status = 'Active'
        """,
        (patient_id, doctor_id),
    )

    db.execute_query(
        """
        UPDATE TriageCases SET Status = 'Completed'
        WHERE PatientID = ?
        """,
        (patient_id,),
    )

    return {
        "patientId": patient_id,
        "doctorId": doctor_id,
        "status": "Completed",
    }
