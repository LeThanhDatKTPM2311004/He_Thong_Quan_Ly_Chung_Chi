import { getStoredRole, getStoredToken } from "./session";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = getStoredToken();
  const role = getStoredRole();

  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(role ? { "X-User-Role": role } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Không thể kết nối backend tại ${API_BASE_URL}. Kiểm tra VITE_API_BASE_URL, CORS và backend đang chạy.`,
      0,
    );
  }

  const text = await res.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const obj =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : null;

    const message = String(
      obj?.message ??
        obj?.error ??
        (typeof data === "string" ? data : `Yêu cầu thất bại (${res.status})`),
    );

    throw new ApiError(message, res.status, data);
  }

  return data as T;
}
