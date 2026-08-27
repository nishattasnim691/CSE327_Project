import { apiRequest } from "./ApiClient";


export type DoctorCase = {
    patientId: string;
    patientName: string;
    status: string;
    triage?: "Critical" | "Urgent" | "Routine" | "Self-Care";
    symptoms?: string[];
    description?: string;
    duration?: string;
};


export async function getPendingDoctorCases() {

    return apiRequest<DoctorCase[]>(
        "/api/doctor/pending-cases",
        {
            method: "GET"
        }
    );

}


export async function acceptDoctorCase(
    patientId:string,
    doctorId:string
){

    return apiRequest(
        `/api/accept-doctor-case/${patientId}?doctor_id=${doctorId}`,
        {
            method:"PUT"
        }
    );

}
export interface AcceptedDoctorCase {
  patientId: string;
  patientName: string;
  status: string;

  age?: number;
  triage?: "Critical" | "Urgent" | "Routine" | "Self-Care";
  symptoms?: string[];
  complaint?: string;
  duration?: string;
  description?: string;
  triageSource?: string;
  doctorName?: string;
}
export async function getAcceptedDoctorCases(
    doctorId?: string
): Promise<AcceptedDoctorCase[]> {
    return apiRequest<AcceptedDoctorCase[]>(
        doctorId
            ? `/api/doctor/accepted-cases?doctor_id=${encodeURIComponent(doctorId)}`
            : "/api/doctor/accepted-cases",
        {
            method: "GET"
        }
    );
}

export async function completeDoctorCase(
    patientId: string,
    doctorId: string
): Promise<void> {
    await apiRequest(
        `/api/doctor/cases/${encodeURIComponent(patientId)}/complete?doctor_id=${encodeURIComponent(doctorId)}`,
        { method: "PUT" }
    );
}