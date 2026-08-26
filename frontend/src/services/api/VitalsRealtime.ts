import {
  API_BASE_URL,
  isBackendConfigured,
} from "./ApiClient";
import type { VitalRecordDto } from "./VitalsApi";

type VitalsUpdatedEvent = {
  event: "vitals.updated";
  patientId: string;
  vitals: VitalRecordDto[];
};

export function connectToVitalUpdates(
  patientId: string,
  onVitals: (vitals: VitalRecordDto[]) => void,
  onConnectionChange?: (connected: boolean) => void
): () => void {
  if (!patientId || !isBackendConfigured()) {
    onConnectionChange?.(false);
    return () => undefined;
  }

  const wsBase = API_BASE_URL.replace(/^http/, "ws");

  const socket = new WebSocket(
    `${wsBase}/ws/patients/${encodeURIComponent(patientId)}/vitals`
  );

  socket.onopen = () => {
    onConnectionChange?.(true);
    socket.send("ready");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as VitalsUpdatedEvent;

      if (
        data.event === "vitals.updated" &&
        data.patientId === patientId &&
        Array.isArray(data.vitals)
      ) {
        onVitals(data.vitals);
      }
    } catch {
      console.error("Invalid websocket data");
    }
  };

  socket.onerror = () => {
    onConnectionChange?.(false);
  };

  socket.onclose = () => {
    onConnectionChange?.(false);
  };

  return () => {
    socket.close();
  };
}