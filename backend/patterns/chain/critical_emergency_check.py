from .triage_handler import TriageHandler


class CriticalEmergencyCheck(TriageHandler):

    def handle(self, symptoms):
        symptoms = symptoms.lower()

        critical_keywords = [
            "chest pain",
            "difficulty breathing",
            "severe bleeding",
            "unconscious"
        ]

        for keyword in critical_keywords:
            if keyword in symptoms:
                return "Critical"

        return super().handle(symptoms)