import { apiRequest } from "./ApiClient";

export type PrescriptionMedicineDto = {
  id: number;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
  unitPrice: number;
};

export type DigitalPrescriptionDto = {
  prescriptionId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  status: "Approved";
  note: string;
  issuedAt: string;
  medicines: PrescriptionMedicineDto[];
};

/*
  Member 3 owns the prescription UI and API integration.
  Database persistence belongs to Member 1.
*/
export async function createPrescription(
  prescription: DigitalPrescriptionDto
): Promise<DigitalPrescriptionDto> {
  return apiRequest<DigitalPrescriptionDto>(
    "/api/prescriptions",
    {
      method: "POST",
      body: JSON.stringify(prescription),
    }
  );
}

export async function fetchLatestPrescription(
  patientId: string
): Promise<DigitalPrescriptionDto | null> {
  return apiRequest<DigitalPrescriptionDto | null>(
    `/api/patients/${encodeURIComponent(patientId)}/prescriptions/latest`
  );
}