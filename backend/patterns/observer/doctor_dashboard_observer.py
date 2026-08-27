from patterns.observer.health_record import VitalObserver, VitalRecord


class DoctorDashboardObserver(VitalObserver):

    def __init__(self, websocket_manager):
        self.websocket_manager = websocket_manager

    async def update(
        self,
        patient_id: str,
        vitals: list[VitalRecord],
    ) -> None:

        await self.websocket_manager.broadcast(
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