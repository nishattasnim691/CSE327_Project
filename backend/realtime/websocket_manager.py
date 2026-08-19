from __future__ import annotations

from collections import defaultdict

from fastapi import WebSocket


class WebSocketManager:
    """
    Small transport helper.

    The Observer pattern does not depend on FastAPI directly.
    PatientDashboardObserver calls this publisher to push the
    already-created observer event to connected React views.
    """

    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(
        self,
        patient_id: str,
        websocket: WebSocket,
    ) -> None:
        await websocket.accept()
        self._connections[patient_id].add(websocket)

    def disconnect(
        self,
        patient_id: str,
        websocket: WebSocket,
    ) -> None:
        self._connections[patient_id].discard(websocket)

        if not self._connections[patient_id]:
            self._connections.pop(patient_id, None)

    async def broadcast(
        self,
        patient_id: str,
        payload: dict,
    ) -> None:
        stale: list[WebSocket] = []

        for websocket in list(
            self._connections.get(patient_id, set())
        ):
            try:
                await websocket.send_json(payload)
            except Exception:
                stale.append(websocket)

        for websocket in stale:
            self.disconnect(patient_id, websocket)


websocket_manager = WebSocketManager()
