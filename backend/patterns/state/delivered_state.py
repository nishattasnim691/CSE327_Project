from .order_state import OrderState


class DeliveredState(OrderState):

    def process(self, order):
        print("Order has already been delivered.")

    def ship(self, order):
        print("Order has already been delivered.")

    def deliver(self, order):
        print("Order is already delivered.")