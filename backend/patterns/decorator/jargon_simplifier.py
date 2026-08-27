import re

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
            "respiratory": "breathing",
            "dengue": "dengue fever",
        }

        for medical_word, simple_word in replacements.items():
            message = re.sub(
                rf"\b{re.escape(medical_word)}\b",
                simple_word,
                message,
                flags=re.IGNORECASE,
            )

        return message