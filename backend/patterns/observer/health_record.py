from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class VitalRecord:
    """Synthetic vital record used by the course prototype."""

    id: int
    recorded_at: str
    heart_rate: float
    temperature: float
    systolic: float
    diastolic: float
    oxygen: float

    def to_frontend_dict(self) -> dict[str, Any]:
        """Return the camelCase shape expected by the React frontend."""
        return {
            "id": self.id,
            "recordedAt": self.recorded_at,
            "heartRate": self.heart_rate,
            "temperature": self.temperature,
            "systolic": self.systolic,
            "diastolic": self.diastolic,
            "oxygen": self.oxygen,
        }


class VitalObserver(ABC):
    """Observer interface."""

    @abstractmethod
    async def update(
        self,
        patient_id: str,
        vitals: list[VitalRecord],
    ) -> None:
        """Receive the latest snapshot from the subject."""
        raise NotImplementedError


class VitalSubject(ABC):
    """Subject interface."""

    @abstractmethod
    def attach(self, observer: VitalObserver) -> None:
        raise NotImplementedError

    @abstractmethod
    def detach(self, observer: VitalObserver) -> None:
        raise NotImplementedError

    @abstractmethod
    async def notify(self) -> None:
        raise NotImplementedError


class HealthRecord(VitalSubject):
    """
    SUBJECT in the Observer pattern.

    When a new synthetic vital is logged, HealthRecord stores it and
    automatically notifies every attached observer.
    """

    def __init__(
        self,
        patient_id: str,
        initial_vitals: list[VitalRecord] | None = None,
    ) -> None:
        self.patient_id = patient_id
        self._observers: list[VitalObserver] = []
        self._vitals: list[VitalRecord] = list(initial_vitals or [])

    def attach(self, observer: VitalObserver) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: VitalObserver) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    async def notify(self) -> None:
        snapshot = self.get_vitals()

        for observer in list(self._observers):
            await observer.update(
                self.patient_id,
                snapshot,
            )

    async def add_vital(self, vital: VitalRecord) -> None:
        self._vitals.append(vital)
        await self.notify()

    async def replace_vitals(
        self,
        vitals: list[VitalRecord],
    ) -> None:
        self._vitals = list(vitals)
        await self.notify()

    def get_vitals(self) -> list[VitalRecord]:
        return list(self._vitals)

    def get_observer_count(self) -> int:
        return len(self._observers)
