from .chat_interface import ChatInterface


class JargonSimplifierDecorator(ChatInterface):

    def __init__(self, chat):
        self.chat = chat

    def send_message(self, message):
        message = self.chat.send_message(message)

        replacements = {
            "hypertension": "high blood pressure",
            "antipyretic": "fever medicine",
            "edema": "swelling",
            "respiratory": "breathing"
        }

        for medical_word, simple_word in replacements.items():
            message = message.replace(medical_word, simple_word)

        return message