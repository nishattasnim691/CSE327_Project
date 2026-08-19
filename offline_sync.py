from abc import ABC, abstractmethod
from database_manager import DatabaseConnectionPool

class Command(ABC):
    """
    DESIGN PATTERN 2: COMMAND
    The Command interface declares a method for executing a specific action.
    """
    @abstractmethod
    def execute(self):
        pass

class SaveSymptomLogCommand(Command):
    """Concrete Command for saving a patient's symptoms."""
    def __init__(self, patient_id, symptoms, triage_level):
        self.patient_id = patient_id
        self.symptoms = symptoms
        self.triage_level = triage_level
        self.db = DatabaseConnectionPool() # Uses your Singleton!

    def execute(self):
        print(f"[Executing Command] Saving symptoms for Patient: {self.patient_id}")
        query = "INSERT INTO Encounters (EncounterID, PatientID, TriageLevel, SymptomsText) VALUES (?, ?, ?, ?)"
        # Using a dummy ID for the demo
        self.db.execute_query(query, ("ENC-999", self.patient_id, self.triage_level, self.symptoms))

class SendChatMessageCommand(Command):
    """Concrete Command for sending a text message."""
    def __init__(self, sender, message):
        self.sender = sender
        self.message = message

    def execute(self):
        # In a full app, this would route to the chat server
        print(f"[Executing Command] Routing message from {self.sender}: '{self.message}'")

class OfflineSyncManager:
    """
    The Invoker class. It holds commands in a list when internet is down,
    and executes them all sequentially when connectivity is restored.
    """
    def __init__(self):
        self.command_queue = []
        self.is_online = False

    def simulate_connection_drop(self):
        self.is_online = False
        print("\n[Warning] Internet connection lost! Switching to offline mode.")

    def add_action(self, command: Command):
        if self.is_online:
            command.execute()
        else:
            self.command_queue.append(command)
            print("[Queued] Action saved locally due to lack of network.")

    def simulate_connection_restored(self):
        self.is_online = True
        print("\n[Success] Network restored! Syncing queued data to central database...")
        while self.command_queue:
            # Pop the first command off the queue and execute it
            command = self.command_queue.pop(0)
            command.execute()
        print("[System] Sync complete. Queue is empty.")

# --- Example Usage (Simulating the Kiosk losing internet) ---
if __name__ == "__main__":
    sync_manager = OfflineSyncManager()
    
    # 1. Kiosk loses internet
    sync_manager.simulate_connection_drop()
    
    # 2. Patient still types in symptoms even though offline
    log_cmd = SaveSymptomLogCommand("P-001", "Severe chest pain and coughing", "Urgent")
    chat_cmd = SendChatMessageCommand("Patient", "Is anyone there? I need help.")
    
    sync_manager.add_action(log_cmd)
    sync_manager.add_action(chat_cmd)
    
    # 3. Internet comes back an hour later
    sync_manager.simulate_connection_restored()