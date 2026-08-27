from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from database.database_manager import DatabaseConnectionPool
from patterns.state.order_registry import orders
from patterns.state.pharmacy_order import PharmacyOrder
from schemas.member3_schemas import CheckoutRequestModel


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

        order_id = f"ORD-{uuid4().hex[:8].upper()}"
        created_at = datetime.now(timezone.utc).isoformat()
        pharmacy_order = PharmacyOrder()

        orders[order_id] = {
            "order": pharmacy_order,
            "patientId": request.patient_id,
        }

        DatabaseConnectionPool().execute_query(
            """
            INSERT INTO PharmacyOrders
            (
                OrderID,
                PatientID,
                Medicine,
                Quantity,
                Status,
                Total,
                CreatedAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order_id,
                request.patient_id,
                ", ".join(item.medicine for item in request.items),
                sum(item.quantity for item in request.items),
                "Processing",
                total,
                created_at,
            ),
        )

        return {
            "orderId": order_id,
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
            "createdAt": created_at,
        }
