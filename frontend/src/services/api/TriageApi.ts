import type { TriageLevel } from "../TriageStore";
import { apiRequest } from "./ApiClient";

export type TriageRequest = {
  patientId: string;
  symptoms: string[];
  description: string;
  duration: string;
};

export type TriageResponse = {
  category: TriageLevel;
};

const VALID_CATEGORIES: TriageLevel[] = [
  "Critical",
  "Urgent",
  "Routine",
  "Self-Care",
];

function isTriageLevel(
  value: unknown
): value is TriageLevel {
  return (
    typeof value === "string" &&
    VALID_CATEGORIES.includes(
      value as TriageLevel
    )
  );
}

/*
  Member 3 frontend adapter only.
  Member 2 owns the real Chain-of-Responsibility TriageEngine.
*/
export async function submitTriage(
  request: TriageRequest
): Promise<TriageResponse> {
  const data = await apiRequest<{
    category?: unknown;
  }>("/api/triage", {
    method: "POST",
    body: JSON.stringify(request),
  });

  if (!isTriageLevel(data.category)) {
    throw new Error(
      "Triage API returned an invalid category."
    );
  }

  return {
    category: data.category,
  };
}