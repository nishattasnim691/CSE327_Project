import { apiRequest } from "./ApiClient";

export type VitalRecordDto = {
  id: number;
  recordedAt: string;
  heartRate: number;
  temperature: number;
  systolic: number;
  diastolic: number;
  oxygen: number;
};

export async function fetchPatientVitals(
  patientId: string
): Promise<VitalRecordDto[]> {
  return apiRequest<VitalRecordDto[]>(
    `/api/patients/${encodeURIComponent(patientId)}/vitals`
  );
}

export async function createPatientVital(
  patientId: string,
  vital: VitalRecordDto
): Promise<VitalRecordDto> {
  return apiRequest<VitalRecordDto>(
    `/api/patients/${encodeURIComponent(patientId)}/vitals`,
    {
      method: "POST",
      body: JSON.stringify(vital),
    }
  );
}

export async function replacePatientVitals(
  patientId: string,
  vitals: VitalRecordDto[]
): Promise<VitalRecordDto[]> {
  return apiRequest<VitalRecordDto[]>(
    `/api/patients/${encodeURIComponent(patientId)}/vitals`,
    {
      method: "PUT",
      body: JSON.stringify(vitals),
    }
  );
}
