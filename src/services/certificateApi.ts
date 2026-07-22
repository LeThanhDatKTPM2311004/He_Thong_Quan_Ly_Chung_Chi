// =============================================================================
// LỚP GIẢ LẬP API CHỨNG CHỈ (CERTIFICATE)
// -----------------------------------------------------------------------------
// Các hàm dưới đây mô phỏng việc gọi backend ASP.NET Core, backend sẽ dùng
// Nethereum để gọi smart contract Solidity thật. Khi có backend, thay phần
// bên trong mỗi hàm bằng fetch() gọi đúng endpoint, ví dụ:
//
//   export async function issueCertificate(data: IssueCertificatePayload) {
//     const res = await fetch(`${API_BASE_URL}/api/certificates`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//     });
//     if (!res.ok) throw new Error("Không thể phát hành chứng chỉ");
//     return (await res.json()) as { txHash: string };
//   }
//
// Backend sau khi nhận request sẽ gọi Nethereum -> ký giao dịch -> gửi lên
// smart contract -> trả về txHash để frontend theo dõi trạng thái.
// =============================================================================

import { API_BASE_URL } from "./authApi";
import type { CertStatus } from "../types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface IssueCertificatePayload {
  studentId: string;
  fullName: string;
  degree: string;
  grade: string;
  issueDate: string;
  faculty: string;
  fileName?: string | null;
}

export interface IssueTxResult {
  txHash: string;
  status: "pending" | "confirmed";
}

/** Phát hành chứng chỉ mới lên blockchain (qua backend). */
export async function issueCertificate(_payload: IssueCertificatePayload): Promise<IssueTxResult> {
  await delay(1200); // mô phỏng thời gian gửi giao dịch
  return { txHash: "0xf3e9...a1b2", status: "pending" };
}

/** Poll trạng thái giao dịch cho tới khi được xác nhận trên chain (mô phỏng). */
export async function waitForConfirmation(_txHash: string): Promise<IssueTxResult> {
  await delay(2500);
  return { txHash: _txHash, status: "confirmed" };
}

export interface VerifyResult {
  id: string;
  holder: string;
  degree: string;
  issuedBy: string;
  issueDate: string;
  faculty: string;
  txHash: string;
  ipfsDoc: string;
  status: CertStatus;
}

/** Tra cứu / xác minh chứng chỉ theo mã hoặc transaction hash. */
export async function verifyCertificate(query: string): Promise<VerifyResult | null> {
  await delay(800);
  if (!query.trim()) return null;
  return {
    id: "CERT-2024-0891",
    holder: "Amara Osei",
    degree: "BSc Computer Science — First Class Honours",
    issuedBy: "Whitmore University",
    issueDate: "July 18, 2024",
    faculty: "Faculty of Engineering & Computing",
    txHash: "0xab12...f3e9",
    ipfsDoc: "ipfs://Qm3Fa8...",
    status: "confirmed",
  };
}

/** Thu hồi chứng chỉ (chỉ Admin). */
export async function revokeCertificate(_certId: string, _reason: string): Promise<{ success: boolean }> {
  await delay(1000);
  return { success: true };
}

void API_BASE_URL; // giữ import để dùng khi nối API thật
