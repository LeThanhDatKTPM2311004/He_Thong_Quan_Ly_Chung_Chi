// =============================================================================
// LỚP GỌI API CHỨNG CHỈ (CERTIFICATE) — ĐÃ NỐI VÀO BACKEND THẬT
// -----------------------------------------------------------------------------
// Backend: Spring Boot (edu.ctut.certificate), xem CertificateController.java
//   POST /api/certificates                  body: {studentId, fullName, degree, grade, issueDate, faculty}
//   GET  /api/certificates/{txHash}/status
//   GET  /api/certificates/verify?query=...
//   POST /api/certificates/{certId}/revoke  body: {reason}
//   GET  /api/certificates                  -> danh sách tất cả (Dashboard/Admin)
//   GET  /api/certificates/student/{id}     -> chứng chỉ theo mã sinh viên
// =============================================================================

import { apiFetch } from "./httpClient";
import type { CertStatus, CertificateSummary, MyCertificate } from "../types";

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
export async function issueCertificate(payload: IssueCertificatePayload): Promise<IssueTxResult> {
  const { fileName: _fileName, ...body } = payload;
  return apiFetch<IssueTxResult>("/api/certificates", {
    method: "POST",
    body,
  });
}

/** Kiểm tra trạng thái giao dịch theo txHash cho tới khi được xác nhận trên chain. */
export async function waitForConfirmation(txHash: string): Promise<IssueTxResult> {
  return apiFetch<IssueTxResult>(`/api/certificates/${encodeURIComponent(txHash)}/status`);
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
  if (!query.trim()) return null;
  return apiFetch<VerifyResult | null>(`/api/certificates/verify?query=${encodeURIComponent(query)}`);
}

/** Thu hồi chứng chỉ (chỉ Admin). */
export async function revokeCertificate(certId: string, reason: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/certificates/${encodeURIComponent(certId)}/revoke`, {
    method: "POST",
    body: { reason },
  });
}

/** Lấy toàn bộ chứng chỉ — dùng cho Dashboard / Admin Panel. */
export async function getAllCertificates(): Promise<CertificateSummary[]> {
  return apiFetch<CertificateSummary[]>("/api/certificates");
}

/**
 * Lấy chứng chỉ theo mã sinh viên — dùng cho trang "Chứng chỉ của tôi".
 * Lưu ý: hiện tại backend chưa trả về studentId khi đăng nhập (AuthUser chỉ có
 * address/email/name/role), nên trang MyCertificatesPage tạm suy ra mã sinh
 * viên từ email. Khi backend bổ sung studentId vào response đăng nhập, nên
 * thay bằng giá trị đó cho chính xác.
 */
export async function getCertificatesByStudent(studentId: string): Promise<MyCertificate[]> {
  return apiFetch<MyCertificate[]>(`/api/certificates/student/${encodeURIComponent(studentId)}`);
}
