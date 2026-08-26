from datetime import datetime, timezone
import uuid

import json

from fastapi import APIRouter, HTTPException, Query

from database.database_manager import DatabaseConnectionPool


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
        ORDER BY c.SubmittedAt ASC
        """
    )
    return [_case_response(row) for row in assignments]


@router.get("/api/doctor/accepted-cases")
def get_accepted_doctor_cases() -> list[dict]:
    db = DatabaseConnectionPool()
    assignments = db.execute_query(
        """
         SELECT c.PatientID, p.Name, c.Status, c.Category,
             c.Symptoms, c.Description, c.Duration
         FROM TriageCases c
         LEFT JOIN Patients p ON p.PatientID = c.PatientID
         JOIN DoctorAssignments a ON a.PatientID = c.PatientID
         WHERE a.Status = 'Active'
         ORDER BY a.AssignedAt DESC
        """
    )
    return [_case_response(row) for row in assignments]


def _case_response(row: tuple) -> dict:
    response = _assignment_response(row)
    response.update({
        "triage": row[3],
        "symptoms": json.loads(row[4]),
        "description": row[5],
        "duration": row[6],
    })
    return response


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