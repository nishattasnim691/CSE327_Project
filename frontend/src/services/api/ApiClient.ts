export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "http://127.0.0.1:8000";


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
      // Keep default message
    }


    throw new Error(message);
  }


  if (response.status === 204) {
    return undefined as T;
  }


  return (await response.json()) as T;
}