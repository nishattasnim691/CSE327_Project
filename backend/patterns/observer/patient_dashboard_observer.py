from __future__ import annotations

from patterns.observer.health_record import (
    VitalObserver,
    VitalRecord,
)
from realtime.websocket_manager import WebSocketManager


class PatientDashboardObserver(VitalObserver):
    """
    CONCRETE OBSERVER.

    HealthRecord calls update() automatically after a vital is added.
    This observer converts the update into a real-time event that the
    React Patient Dashboard and Doctor Portal can listen to.
    """

    def __init__(
        self,
        publisher: WebSocketManager,
    ) -> None:
        self._publisher = publisher

    async def update(
        self,
        patient_id: str,
        vitals: list[VitalRecord],
    ) -> None:
        await self._publisher.broadcast(
            patient_id,
            {
                "event": "vitals.updated",
                "patientId": patient_id,
                "vitals": [
                    vital.to_frontend_dict()
                    for vital in vitals
                ],
            },
        )
