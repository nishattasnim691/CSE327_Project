import { apiRequest } from "./ApiClient";

export type ConsultationSender = "patient" | "doctor";

export type SharedChatMessage = ConsultationMessageDto;

export type ConsultationMessageDto = {
  id: string;
  patientId: string;
  sender: ConsultationSender;
  text: string;
  time: string;
  createdAt: string;
};

export function fetchConsultationMessages(patientId: string) {
  return apiRequest<ConsultationMessageDto[]>(
    `/api/patients/${patientId}/messages`
  );
}

export function sendConsultationMessage(
  patientId: string,
  body: { sender: ConsultationSender; text: string }
) {
  return apiRequest<ConsultationMessageDto>(
    `/api/patients/${patientId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(body)
    }
  );
}


export const getConsultationMessages = fetchConsultationMessages;