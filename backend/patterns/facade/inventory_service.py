from __future__ import annotations

from backend.schemas.member3_schemas import PharmacyItemModel


class InventoryService:
    """
    Demo inventory adapter used by PharmacyCheckoutFacade.

    Member 1 can later replace this implementation with database-backed
    inventory queries without changing the Facade interface.
    """

    def check_availability(
        self,
        items: list[PharmacyItemModel],
    ) -> bool:
        return bool(items) and all(
            item.in_stock and item.quantity > 0
            for item in items
        )

    def reserve_items(
        self,
        items: list[PharmacyItemModel],
    ) -> None:
        # Prototype reservation hook.
        # Database persistence belongs to Member 1.
        _ = items
