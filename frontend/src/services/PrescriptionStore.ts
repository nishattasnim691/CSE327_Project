export type PrescriptionMedicine = {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  unitPrice: number;
};

export type DigitalPrescription = {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  status: "Approved";
  note: string;
  issuedAt: string;
  medicines: PrescriptionMedicine[];
};

const STORAGE_KEY = "virtualClinicDigitalPrescriptions";
const EVENT_NAME = "virtual-clinic-prescription-update";

function readAllPrescriptions(): DigitalPrescription[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved) as DigitalPrescription[];
  } catch {
    return [];
  }
}

function writeAllPrescriptions(
  prescriptions: DigitalPrescription[]
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(prescriptions)
  );

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME)
  );
}

export function savePrescription(
  prescription: DigitalPrescription
): void {
  const current = readAllPrescriptions();

  const withoutSamePatient = current.filter(
    (item) =>
      item.patientId !== prescription.patientId
  );

  writeAllPrescriptions([
    ...withoutSamePatient,
    prescription,
  ]);
}

export function getPrescriptionForPatient(
  patientId: string
): DigitalPrescription | null {
  const matches = readAllPrescriptions()
    .filter(
      (item) => item.patientId === patientId
    )
    .sort(
      (a, b) =>
        new Date(b.issuedAt).getTime() -
        new Date(a.issuedAt).getTime()
    );

  return matches[0] ?? null;
}

export function subscribeToPrescriptions(
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