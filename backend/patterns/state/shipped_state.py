from .order_state import OrderState


class ShippedState(OrderState):

    def process(self, order):
        print("Order has already been processed.")

    def ship(self, order):
        print("Order has already been shipped.")

    def deliver(self, order):
        from .delivered_state import DeliveredState

        print("Order has been delivered.")
        order.set_state(DeliveredState())