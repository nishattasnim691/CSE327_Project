import { apiRequest } from "./ApiClient";

export async function assignDoctor(
  doctorId: string,
  patientId: string
) {
  return apiRequest("/api/assign-doctor", {
    method: "POST",
    body: JSON.stringify({
      doctorId,
      patientId,
    }),
  });
}