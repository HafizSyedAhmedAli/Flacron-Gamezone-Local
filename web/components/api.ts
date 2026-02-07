export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fgz_token");
}

export function setToken(token: string) {
  localStorage.setItem("fgz_token", token);
}

export function clearToken() {
  localStorage.removeItem("fgz_token");
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let errorMessage: string;

    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error || errorData.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }
    } else {
      try {
        errorMessage = await response.text();
      } catch {
        errorMessage = response.statusText;
      }
    }
    throw new Error(errorMessage);
  }

  // 🆕 SUCCESS PATH FIXES
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  if (!isJson) {
    const text = await response.text();
    return text as unknown as T;
  }

  return response.json();
}

export async function apiGet<T>(url: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  return handleResponse<T>(response);
}

export async function apiAuthPost<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return handleResponse<T>(response);
}
