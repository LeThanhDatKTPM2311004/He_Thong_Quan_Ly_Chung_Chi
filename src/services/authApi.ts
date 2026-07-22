// =============================================================================
// LỚP GIẢ LẬP API XÁC THỰC (AUTH)
// -----------------------------------------------------------------------------
// File này hiện đang MÔ PHỎNG phản hồi từ backend để frontend chạy được ngay.
// Khi backend ASP.NET Core (Nethereum) đã sẵn sàng, chỉ cần thay nội dung bên
// trong 2 hàm loginWithWallet() và loginWithEmail() bằng lời gọi API thật,
// ví dụ:
//
//   export async function loginWithWallet(address: string, signature: string) {
//     const res = await fetch(`${API_BASE_URL}/api/auth/wallet-login`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ address, signature }),
//     });
//     if (!res.ok) throw new Error("Đăng nhập thất bại");
//     return (await res.json()) as AuthUser;
//   }
//
// Giao diện (interface) trả về giữ nguyên để không phải sửa lại UI.
// =============================================================================

import type { AuthUser, UserRole } from "../types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Bảng ánh xạ địa chỉ ví -> role, TẠM THỜI hardcode để demo khi chưa có backend.
// Sau này bảng này sẽ nằm trong database/smart contract, backend sẽ trả về role tương ứng.
const DEMO_WALLET_ROLES: Record<string, { role: UserRole; name: string }> = {
  "0x3fa8c9a9e2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f7": { role: "admin", name: "Dr. Chen Wei" },
};

/**
 * Đăng nhập bằng ví đã kết nối. Trong thực tế, backend sẽ:
 * 1. Kiểm tra chữ ký (signature) khớp với địa chỉ ví.
 * 2. Tra cứu role của địa chỉ ví (trong DB hoặc smart contract AccessControl).
 * 3. Trả về JWT token + thông tin user.
 */
export async function loginWithWallet(address: string): Promise<AuthUser> {
  await delay(500); // mô phỏng độ trễ mạng
  const normalized = address.toLowerCase();
  const found = DEMO_WALLET_ROLES[normalized];
  return {
    address,
    email: null,
    name: found?.name ?? "Người dùng mới",
    // Mặc định demo: ví chưa có trong bảng ánh xạ -> gán role student
    role: found?.role ?? "student",
  };
}

/** Đăng nhập bằng email/mật khẩu (dành cho sinh viên) */
export async function loginWithEmail(email: string, _password: string): Promise<AuthUser> {
  await delay(500);
  if (!email.includes("@")) {
    throw new Error("Email không hợp lệ");
  }
  return {
    address: null,
    email,
    name: email.split("@")[0],
    role: "student",
  };
}

/** Đăng nhập nhanh theo role — CHỈ DÙNG ĐỂ DEMO/TEST UI khi chưa có backend thật. */
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
