from .triage_handler import TriageHandler


class RoutineCheck(TriageHandler):

    def handle(self, symptoms):
        symptoms = symptoms.lower()

        routine_keywords = [
            "cough",
            "cold",
            "mild fever",
            "headache"
        ]

        for keyword in routine_keywords:
            if keyword in symptoms:
                return "Routine"

        return super().handle(symptoms)