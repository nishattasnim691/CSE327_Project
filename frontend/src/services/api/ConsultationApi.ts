import { apiRequest } from "./ApiClient";

export type ConsultationSender =
  | "patient"
  | "doctor";

export type ConsultationMessageDto = {
  id: string;
  patientId: string;
  sender: ConsultationSender;
  text: string;
  time: string;
  createdAt: string;
  pending?: boolean;
};

export type SendConsultationMessageRequest = {
  sender: ConsultationSender;
  text: string;
};

/*
  Frontend API adapter.
  Member 1 can persist messages and provide offline synchronization.
  The UI should not implement the Command-pattern queue here.
*/
export async function fetchConsultationMessages(
  patientId: string
): Promise<ConsultationMessageDto[]> {
  return apiRequest<ConsultationMessageDto[]>(
    `/api/patients/${encodeURIComponent(patientId)}/messages`
  );
}

export async function sendConsultationMessage(
  patientId: string,
  request: SendConsultationMessageRequest
): Promise<ConsultationMessageDto> {
  return apiRequest<ConsultationMessageDto>(
    `/api/patients/${encodeURIComponent(patientId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify(request),
    }
  );
}