from patterns.observer.doctor_dashboard_observer import DoctorDashboardObserver
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database.database_manager import DatabaseConnectionPool
from patterns.facade.pharmacy_checkout_facade import PharmacyCheckoutFacade
from patterns.observer.health_record import HealthRecord, VitalRecord
from patterns.observer.patient_dashboard_observer import PatientDashboardObserver
from realtime.websocket_manager import websocket_manager
from schemas.member3_schemas import CheckoutRequestModel, VitalRecordModel
import uuid

router = APIRouter()

checkout_facade = PharmacyCheckoutFacade()

_health_records: dict[str, HealthRecord] = {}


def get_health_record(patient_id: str) -> HealthRecord:

    if patient_id not in _health_records:

        db = DatabaseConnectionPool()

        rows = db.execute_query(
            """
            SELECT VitalID, HeartRate, Temperature,
                   Systolic, Diastolic, Oxygen, RecordedAt
            FROM PatientVitals
            WHERE PatientID = ?
            ORDER BY RecordedAt ASC
            """,
            (patient_id,),
        )

        existing_vitals = [
            VitalRecord(
                id=index,
                recorded_at=row[6],
                heart_rate=row[1],
                temperature=row[2],
                systolic=row[3],
                diastolic=row[4],
                oxygen=row[5],
            )
            for index, row in enumerate(rows)
        ]


        health_record = HealthRecord(
            patient_id,
            existing_vitals
        )


        patient_observer = PatientDashboardObserver(
            websocket_manager
        )

        doctor_observer = DoctorDashboardObserver(
            websocket_manager
        )


        health_record.attach(patient_observer)
        health_record.attach(doctor_observer)


        _health_records[patient_id] = health_record


    return _health_records[patient_id]

@router.get("/api/member3/health")
async def member3_health() -> dict:
    return {
        "status": "ok",
        "patterns": [
            "Observer",
            "Facade",
        ],
        "language": "Python",
    }


@router.post("/api/checkout")
async def checkout(
    request: CheckoutRequestModel,
) -> dict:
    return await checkout_facade.checkout(request)


@router.get("/api/patients/{patient_id}/vitals")
async def get_patient_vitals(
    patient_id: str,
) -> list[dict]:

    db = DatabaseConnectionPool()

    rows = db.execute_query(
        """
        SELECT VitalID, HeartRate, Temperature,
               Systolic, Diastolic, Oxygen, RecordedAt
        FROM PatientVitals
        WHERE PatientID = ?
        ORDER BY RecordedAt ASC
        """,
        (patient_id,),
    )

    return [
        {
            "id": row[0],
            "heartRate": row[1],
            "temperature": row[2],
            "systolic": row[3],
            "diastolic": row[4],
            "oxygen": row[5],
            "recordedAt": row[6],
        }
        for row in rows
    ]


@router.post("/api/patients/{patient_id}/vitals")
async def add_patient_vital(
    patient_id: str,
    body: VitalRecordModel,
) -> dict:

    db = DatabaseConnectionPool()

    db.execute_query(
        """
        INSERT INTO PatientVitals
        (
            VitalID,
            PatientID,
            HeartRate,
            Temperature,
            Systolic,
            Diastolic,
            Oxygen,
            RecordedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(uuid.uuid4()),
            patient_id,
            body.heart_rate,
            body.temperature,
            body.systolic,
            body.diastolic,
            body.oxygen,
            body.recorded_at,
        ),
    )

    health_record = get_health_record(patient_id)

    vital = VitalRecord(
        id=body.id,
        recorded_at=body.recorded_at,
        heart_rate=body.heart_rate,
        temperature=body.temperature,
        systolic=body.systolic,
        diastolic=body.diastolic,
        oxygen=body.oxygen,
    )

    await health_record.add_vital(vital)

    return vital.to_frontend_dict()


@router.put("/api/patients/{patient_id}/vitals")
async def replace_patient_vitals(
    patient_id: str,
    body: list[VitalRecordModel],
) -> list[dict]:

    db = DatabaseConnectionPool()

    db.execute_query(
        """
        DELETE FROM PatientVitals
        WHERE PatientID = ?
        """,
        (patient_id,),
    )

    for item in body:
        db.execute_query(
            """
            INSERT INTO PatientVitals
            (
                VitalID,
                PatientID,
                HeartRate,
                Temperature,
                Systolic,
                Diastolic,
                Oxygen,
                RecordedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                patient_id,
                item.heart_rate,
                item.temperature,
                item.systolic,
                item.diastolic,
                item.oxygen,
                item.recorded_at,
            ),
        )

    health_record = get_health_record(patient_id)

    vitals = [
        VitalRecord(
            id=item.id,
            recorded_at=item.recorded_at,
            heart_rate=item.heart_rate,
            temperature=item.temperature,
            systolic=item.systolic,
            diastolic=item.diastolic,
            oxygen=item.oxygen,
        )
        for item in body
    ]

    await health_record.replace_vitals(vitals)

    return [
        vital.to_frontend_dict()
        for vital in health_record.get_vitals()
    ]


@router.websocket("/ws/patients/{patient_id}/vitals")
async def patient_vitals_socket(
    websocket: WebSocket,
    patient_id: str,
) -> None:

    await websocket_manager.connect(
        patient_id,
        websocket,
    )

    try:
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        websocket_manager.disconnect(
            patient_id,
            websocket,
        )
