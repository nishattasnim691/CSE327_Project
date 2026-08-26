class OrderState:

    def process(self, order):
        print("Order cannot be processed from this state.")

    def ship(self, order):
        print("Order cannot be shipped from this state.")

    def deliver(self, order):
        print("Order cannot be delivered from this state.")