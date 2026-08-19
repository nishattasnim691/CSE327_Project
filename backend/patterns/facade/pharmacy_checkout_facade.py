from __future__ import annotations

from backend.patterns.facade.inventory_service import InventoryService
from backend.patterns.facade.order_service import OrderService
from backend.patterns.facade.payment_service import PaymentService
from backend.schemas.member3_schemas import CheckoutRequestModel


class PharmacyCheckoutFacade:
    """
    FACADE pattern.

    Checkout clients call one method: checkout().

    The Facade hides the collaboration between:
      1. inventory checking,
      2. simulated payment processing,
      3. inventory reservation,
      4. order creation.

    It does not implement Member 2's State pattern or Member 1's database.
    """

    def __init__(
        self,
        inventory_service: InventoryService | None = None,
        payment_service: PaymentService | None = None,
        order_service: OrderService | None = None,
    ) -> None:
        self._inventory_service = (
            inventory_service or InventoryService()
        )
        self._payment_service = (
            payment_service or PaymentService()
        )
        self._order_service = (
            order_service or OrderService()
        )

    async def checkout(
        self,
        request: CheckoutRequestModel,
    ) -> dict:
        if (
            not request.prescription_id.strip()
            or not request.patient_id.strip()
        ):
            return {
                "success": False,
                "message": (
                    "Prescription or patient information is missing."
                ),
            }

        if len(request.address.strip()) < 8:
            return {
                "success": False,
                "message": "Please enter a complete delivery address.",
            }

        if not request.items:
            return {
                "success": False,
                "message": (
                    "No medicines were found in the prescription."
                ),
            }

        if not self._inventory_service.check_availability(
            request.items
        ):
            return {
                "success": False,
                "message": (
                    "One or more prescribed medicines are out of stock."
                ),
            }

        subtotal = sum(
            item.unit_price * item.quantity
            for item in request.items
        )

        total = subtotal + request.delivery_fee

        payment_result = (
            await self._payment_service.process_payment(total)
        )

        if not payment_result.success:
            return {
                "success": False,
                "message": payment_result.message,
            }

        self._inventory_service.reserve_items(
            request.items
        )

        order = self._order_service.create_order(
            request,
            payment_result.transaction_id,
        )

        return {
            "success": True,
            "order": order,
        }
