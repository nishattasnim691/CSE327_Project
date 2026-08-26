class TriageHandler:

    def __init__(self):
        self.next_handler = None

    def set_next(self, handler):
        self.next_handler = handler
        return handler

    def handle(self, symptoms):
        if self.next_handler:
            return self.next_handler.handle(symptoms)

        return "Self-Care"