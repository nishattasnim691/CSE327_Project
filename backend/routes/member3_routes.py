from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from patterns.facade.pharmacy_checkout_facade import (
    PharmacyCheckoutFacade,
)
from patterns.observer.health_record import (
    HealthRecord,
    VitalRecord,
)
from patterns.observer.patient_dashboard_observer import (
    PatientDashboardObserver,
)
from realtime.websocket_manager import websocket_manager
from schemas.member3_schemas import (
    CheckoutRequestModel,
    VitalRecordModel,
)

router = APIRouter()

checkout_facade = PharmacyCheckoutFacade()

_health_records: dict[str, HealthRecord] = {}


def get_health_record(
    patient_id: str,
) -> HealthRecord:
    """
    Return one in-memory HealthRecord subject per patient.

    Member 1 can later replace this registry with database persistence.
    The Observer classes do not need to change.
    """
    if patient_id not in _health_records:
        health_record = HealthRecord(patient_id)

        dashboard_observer = PatientDashboardObserver(
            websocket_manager
        )

        health_record.attach(
            dashboard_observer
        )

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
    """
    React CheckoutPage -> this endpoint -> Python Facade.
    """
    return await checkout_facade.checkout(request)


@router.get("/api/patients/{patient_id}/vitals")
async def get_patient_vitals(
    patient_id: str,
) -> list[dict]:
    health_record = get_health_record(patient_id)

    return [
        vital.to_frontend_dict()
        for vital in health_record.get_vitals()
    ]


@router.post("/api/patients/{patient_id}/vitals")
async def add_patient_vital(
    patient_id: str,
    body: VitalRecordModel,
) -> dict:
    """
    React logs a vital.

    HealthRecord.add_vital()
        -> HealthRecord.notify()
        -> PatientDashboardObserver.update()
        -> WebSocket event
        -> React chart/doctor view updates.
    """
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
    """
    Demo reset/replace endpoint.

    replace_vitals() also calls notify(), so the same Python Observer
    pipeline refreshes every connected dashboard.
    """
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


@router.websocket(
    "/ws/patients/{patient_id}/vitals"
)
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
            # The client does not need to send meaningful data.
            # Waiting here keeps the socket alive and detects disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(
            patient_id,
            websocket,
        )
