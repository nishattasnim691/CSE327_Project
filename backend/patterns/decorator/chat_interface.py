class ChatInterface:

    def send_message(self, message: str) -> str:
        """Send a message and return the message visible to the recipient."""
        return message