// =============================================================================
// HTTP CLIENT DÙNG CHUNG
// -----------------------------------------------------------------------------
// Địa chỉ backend lấy từ biến môi trường VITE_API_BASE_URL (xem file .env).
// Khi backend chạy qua ngrok (miễn phí), ngrok sẽ chèn một trang cảnh báo
// HTML cho MỌI request nếu không có header "ngrok-skip-browser-warning".
// Header này được thêm tự động vào mọi request bên dưới để đảm bảo luôn nhận
// được JSON thật từ API, không bị dính trang cảnh báo của ngrok.
// =============================================================================

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
}

/** Gọi API backend, tự động thêm header cần thiết và parse JSON. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Bắt buộc để bỏ qua trang cảnh báo của ngrok free tier
        "ngrok-skip-browser-warning": "true",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Không thể kết nối tới máy chủ. Kiểm tra lại đường link API trong file .env (VITE_API_BASE_URL) và đảm bảo backend + ngrok đang chạy.",
      0
    );
  }

  if (!res.ok) {
    let message = `Yêu cầu thất bại (mã lỗi ${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.message === "string") message = data.message;
    } catch {
      /* phản hồi lỗi không phải JSON, giữ message mặc định */
    }
    throw new ApiError(message, res.status);
  }

  // Một số API (vd. verify không tìm thấy) có thể trả về body rỗng
  const text = await res.text();
  if (!text) return null as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      "Phản hồi từ máy chủ không đúng định dạng JSON. Có thể ngrok đang chặn request — kiểm tra lại link API.",
      res.status
    );
  }
}
