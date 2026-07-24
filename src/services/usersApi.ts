// =============================================================================
// LỚP GỌI API NGƯỜI DÙNG — ĐÃ NỐI VÀO BACKEND THẬT
// -----------------------------------------------------------------------------
// Backend: Spring Boot (edu.ctut.certificate), xem UserController.java
//   GET /api/users -> [{ name, email, role }]
//
// Lưu ý: backend hiện chỉ trả về name/email/role (role viết thường: admin,
// issuer, student — KHÔNG có "verifier" và KHÔNG có trường "status"). Giao
// diện AdminPage hiển thị role viết hoa và badge "Đang hoạt động" mặc định
// vì backend chưa lưu trạng thái tài khoản.
// =============================================================================

import { apiFetch } from "./httpClient";

export interface BackendUser {
  name: string;
  email: string;
  role: "admin" | "issuer" | "student";
}

export async function getUsers(): Promise<BackendUser[]> {
  return apiFetch<BackendUser[]>("/api/users");
}
