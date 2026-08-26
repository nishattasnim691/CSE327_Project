from .processing_state import ProcessingState


class PharmacyOrder:

    def __init__(self):
        self.state = ProcessingState()

    def set_state(self, state):
        self.state = state

    def process(self):
        self.state.process(self)

    def ship(self):
        self.state.ship(self)

    def deliver(self):
        self.state.deliver(self)

    def get_state(self):
        return self.state.__class__.__name__