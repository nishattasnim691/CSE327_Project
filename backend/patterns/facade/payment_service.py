from __future__ import annotations

from dataclasses import dataclass
from uuid import uuid4


@dataclass(frozen=True)
class PaymentResult:
    success: bool
    transaction_id: str
    message: str


class PaymentService:
    """Simulated payment service for the course prototype."""

    async def process_payment(
        self,
        total: float,
    ) -> PaymentResult:
        if total <= 0:
            return PaymentResult(
                success=False,
                transaction_id="",
                message="Invalid checkout total.",
            )

        return PaymentResult(
            success=True,
            transaction_id=f"TXN-{uuid4().hex[:10].upper()}",
            message="Simulated payment approved.",
        )
