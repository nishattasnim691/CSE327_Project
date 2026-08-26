from .triage_handler import TriageHandler


class UrgentCareCheck(TriageHandler):

    def handle(self, symptoms):
        symptoms = symptoms.lower()

        urgent_keywords = [
            "high fever",
            "persistent vomiting",
            "severe headache",
            "dehydration"
        ]

        for keyword in urgent_keywords:
            if keyword in symptoms:
                return "Urgent"

        return super().handle(symptoms)