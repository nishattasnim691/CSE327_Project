from .order_state import OrderState


class ProcessingState(OrderState):

    def process(self, order):
        print("Order is already being processed.")

    def ship(self, order):
        from .shipped_state import ShippedState

        print("Order has been shipped.")
        order.set_state(ShippedState())

    def deliver(self, order):
        print("Order must be shipped before delivery.")