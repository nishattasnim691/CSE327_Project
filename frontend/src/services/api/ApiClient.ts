const rawApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ?? "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export function isBackendConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!isBackendConfigured()) {
    throw new Error(
      "Backend API is not configured. Add VITE_API_BASE_URL to frontend/.env."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    }
  );

  if (!response.ok) {
    let message =
      `API request failed with status ${response.status}.`;

    try {
      const body = (await response.json()) as {
        message?: string;
        detail?: string;
      };

      message =
        body.message ??
        body.detail ??
        message;
    } catch {
      // Keep the generic HTTP error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}