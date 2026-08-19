export type MessageSender = "patient" | "doctor";

export interface SharedChatMessage {
  id: string;
  patientId: string;
  sender: MessageSender;
  text: string;
  time: string;
  createdAt: string;
  pending?: boolean;
}

const STORAGE_KEY = "virtualClinicConsultationMessages";
const EVENT_NAME = "virtual-clinic-consultation-update";

const DEFAULT_MESSAGES: SharedChatMessage[] = [
  {
    id: "seed-1",
    patientId: "P001",
    sender: "doctor",
    text:
      "Hello. I have received your symptom report. I will review the information with you.",
    time: "10:24 AM",
    createdAt: "2026-08-15T10:24:00.000Z",
  },
  {
    id: "seed-2",
    patientId: "P001",
    sender: "patient",
    text:
      "Thank you, doctor. I have had fever and cough since yesterday.",
    time: "10:25 AM",
    createdAt: "2026-08-15T10:25:00.000Z",
  },
  {
    id: "seed-3",
    patientId: "P001",
    sender: "doctor",
    text:
      "Understood. Please tell me whether the symptoms are getting better, worse, or staying the same.",
    time: "10:26 AM",
    createdAt: "2026-08-15T10:26:00.000Z",
  },
  {
    id: "seed-4",
    patientId: "P002",
    sender: "patient",
    text:
      "Hello. I submitted my symptoms for review.",
    time: "10:35 AM",
    createdAt: "2026-08-15T10:35:00.000Z",
  },
];

function readAllMessages(): SharedChatMessage[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_MESSAGES)
    );
    return [...DEFAULT_MESSAGES];
  }

  try {
    return JSON.parse(saved) as SharedChatMessage[];
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_MESSAGES)
    );
    return [...DEFAULT_MESSAGES];
  }
}

function writeAllMessages(
  messages: SharedChatMessage[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(messages)
  );

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME)
  );
}

export function getMessagesForPatient(
  patientId: string
): SharedChatMessage[] {
  return readAllMessages()
    .filter(
      (message) =>
        message.patientId === patientId
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
    );
}

export function addConsultationMessage(
  patientId: string,
  sender: MessageSender,
  text: string,
  pending = false
): SharedChatMessage {
  const now = new Date();

  const message: SharedChatMessage = {
    id: `${sender}-${now.getTime()}-${Math.random()
      .toString(16)
      .slice(2)}`,
    patientId,
    sender,
    text: text.trim(),
    time: now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    createdAt: now.toISOString(),
    pending,
  };

  const messages = readAllMessages();

  writeAllMessages([
    ...messages,
    message,
  ]);

  return message;
}

export function subscribeToConsultationMessages(
  callback: () => void
): () => void {
  const handleCustomUpdate = () => {
    callback();
  };

  const handleStorage = (
    event: StorageEvent
  ) => {
    if (
      event.key === STORAGE_KEY
    ) {
      callback();
    }
  };

  window.addEventListener(
    EVENT_NAME,
    handleCustomUpdate
  );

  window.addEventListener(
    "storage",
    handleStorage
  );

  return () => {
    window.removeEventListener(
      EVENT_NAME,
      handleCustomUpdate
    );

    window.removeEventListener(
      "storage",
      handleStorage
    );
  };
}

export function resetConsultationMessages(): void {
  writeAllMessages(
    [...DEFAULT_MESSAGES]
  );
}