import { apiRequest } from "./ApiClient";


export interface PatientProfile {
    patientId: string;
    name: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    bloodGroup: string;
}


export const getPatientProfile = async (
    patientId: string
): Promise<PatientProfile> => {

    return await apiRequest<PatientProfile>(
        `/api/patients/${patientId}`
    );

};