// =============================================================================
// LỚP GỌI API XÁC THỰC (AUTH) — ĐÃ NỐI VÀO BACKEND THẬT
// -----------------------------------------------------------------------------
// Backend: Spring Boot (edu.ctut.certificate), xem AuthController.java
//   POST /api/auth/wallet-login   body: { address }        -> AuthUser
//   POST /api/auth/login          body: { email, password } -> AuthUser
// Địa chỉ API cấu hình qua biến môi trường VITE_API_BASE_URL (file .env).
// =============================================================================

import type { AuthUser, UserRole } from "../types";
import { apiFetch, API_BASE_URL } from "./httpClient";

export { API_BASE_URL };

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Đăng nhập bằng ví đã kết nối (MetaMask).
 * Backend sẽ tự tạo user mới với role "student" nếu địa chỉ ví chưa tồn tại.
 */
export async function loginWithWallet(address: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/wallet-login", {
    method: "POST",
    body: { address },
  });
}

/** Đăng nhập bằng email/mật khẩu (dành cho sinh viên). */
export async function loginWithEmail(email: string, password: string): Promise<AuthUser> {
  if (!email.includes("@")) {
    throw new Error("Email không hợp lệ");
  }
  return apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/**
 * Đăng nhập nhanh theo role — CHỈ DÙNG ĐỂ DEMO/TEST giao diện khi backend
 * chưa sẵn sàng hoặc chưa có tài khoản tương ứng trong database.
 * Có thể xoá nút demo này ở LoginPage.tsx khi không cần nữa.
 */
export async function loginAsDemoRole(role: UserRole): Promise<AuthUser> {
  await delay(300);
  const names: Record<UserRole, string> = {
    admin: "Dr. Chen Wei",
    issuer: "Prof. Maria Santos",
    student: "Amara Osei",
  };
  return {
    address: role === "student" ? null : "0x3Fa8...B2c1",
    email: role === "student" ? "a.osei@student.whitmore.edu" : null,
    name: names[role],
    role,
  };
}
