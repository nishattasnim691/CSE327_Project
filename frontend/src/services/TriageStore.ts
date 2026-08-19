export type TriageLevel =
  | "Critical"
  | "Urgent"
  | "Routine"
  | "Self-Care";

export type TriageCaseStatus =
  | "Waiting"
  | "In Review";

export type TriageSource =
  | "backend"
  | "prototype-fallback";

export type TriageCase = {
  patientId: string;
  patientName: string;
  age: number;
  triage: TriageLevel;
  triageSource?: TriageSource;
  complaint: string;
  symptoms: string[];
  description: string;
  duration: string;
  status: TriageCaseStatus;
  submittedAt: string;

  // Kept optional only so older locally saved prototype records still load.
  severity?: string;
};

const STORAGE_KEY = "virtualClinicTriageCases";
const EVENT_NAME = "virtual-clinic-triage-update";

const DEFAULT_CASES: TriageCase[] = [
  {
    patientId: "P001",
    patientName: "Synthetic Patient 001",
    age: 32,
    triage: "Routine",
    triageSource: "prototype-fallback",
    complaint: "Starter synthetic symptom case.",
    symptoms: ["Demo symptom A"],
    description:
      "Synthetic starter case for the side-by-side course demonstration.",
    duration: "Demo duration",
    status: "In Review",
    submittedAt: "2026-08-15T09:30:00.000Z",
  },
  {
    patientId: "P002",
    patientName: "Synthetic Patient 002",
    age: 44,
    triage: "Routine",
    triageSource: "prototype-fallback",
    complaint: "Starter synthetic symptom case.",
    symptoms: ["Demo symptom B"],
    description: "Synthetic starter case.",
    duration: "Demo duration",
    status: "Waiting",
    submittedAt: "2026-08-15T09:45:00.000Z",
  },
];

function readCases(): TriageCase[] {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_CASES)
    );

    return DEFAULT_CASES.map((item) => ({
      ...item,
      symptoms: [...item.symptoms],
    }));
  }

  try {
    return JSON.parse(saved) as TriageCase[];
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_CASES)
    );

    return DEFAULT_CASES.map((item) => ({
      ...item,
      symptoms: [...item.symptoms],
    }));
  }
}

function writeCases(
  cases: TriageCase[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(cases)
  );

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME)
  );
}

export function getTriageQueue(): TriageCase[] {
  return readCases().sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() -
      new Date(a.submittedAt).getTime()
  );
}

export function saveTriageSubmission(
  triageCase: TriageCase
): void {
  const current = readCases();

  const withoutPatient = current.filter(
    (item) =>
      item.patientId !== triageCase.patientId
  );

  writeCases([
    ...withoutPatient,
    triageCase,
  ]);
}

export function updateTriageCaseStatus(
  patientId: string,
  status: TriageCaseStatus
): void {
  const current = readCases();

  writeCases(
    current.map((item) =>
      item.patientId === patientId
        ? {
            ...item,
            status,
          }
        : item
    )
  );
}

export function subscribeToTriageQueue(
  callback: () => void
): () => void {
  const handleCustomUpdate = () => callback();

  const handleStorage = (
    event: StorageEvent
  ) => {
    if (event.key === STORAGE_KEY) {
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