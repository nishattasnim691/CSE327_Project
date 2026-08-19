from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from backend.schemas.member3_schemas import CheckoutRequestModel


class OrderService:
    """
    Order adapter used by the Facade.

    This only creates the initial prototype order record.
    Member 2's OrderState implementation should own later state
    transitions such as Processing -> Shipped -> Delivered.
    """

    def create_order(
        self,
        request: CheckoutRequestModel,
        transaction_id: str,
    ) -> dict:
        subtotal = sum(
            item.unit_price * item.quantity
            for item in request.items
        )

        total = subtotal + request.delivery_fee

        return {
            "orderId": f"ORD-{uuid4().hex[:8].upper()}",
            "status": "Processing",
            "prescriptionId": request.prescription_id,
            "patientId": request.patient_id,
            "subtotal": subtotal,
            "deliveryFee": request.delivery_fee,
            "total": total,
            "address": request.address,
            "items": [
                item.model_dump(by_alias=True)
                for item in request.items
            ],
            "transactionId": transaction_id,
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }
