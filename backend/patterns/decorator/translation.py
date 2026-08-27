from .chat_interface import ChatInterface


class TranslationDecorator(ChatInterface):

    def __init__(self, chat, language="Bangla"):
        self.chat = chat
        self.language = language

    def send_message(self, message):
        message = self.chat.send_message(message)

        translations_by_language = {
            "Bangla": {
                "high blood pressure": "উচ্চ রক্তচাপ",
                "fever medicine": "জ্বরের ওষুধ",
                "swelling": "ফোলা",
                "breathing": "শ্বাস নেওয়া",
            },
        }

        translations = translations_by_language.get(self.language)
        if translations:
            for english_word, translated_word in translations.items():
                message = message.replace(english_word, translated_word)

        return message