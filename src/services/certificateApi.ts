import { apiFetch } from "./httpClient";
import type { CertStatus, CertificateSummary, MyCertificate } from "../types";

export interface IssueCertificatePayload { studentId: string; fullName: string; degree: string; grade: string; issueDate: string; faculty: string; }
export interface IssueTxResult { certId?: string; txHash: string; issueTxHash?: string; status: CertStatus; blockNumber?: number; errorMessage?: string; }
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean; }
interface BackendCertificate {
  id?: number | string; certId?: string; studentId?: string; fullName?: string; degree?: string; grade?: string; faculty?: string;
  issueDate?: string; issuedBy?: string; issueTxHash?: string; revokeTxHash?: string; status?: string; revokeReason?: string;
  createdAt?: string; confirmedAt?: string; revokedAt?: string; errorMessage?: string; blockNumber?: number;
}

const normalizeStatus = (status?: string): CertStatus => {
  const s = (status ?? "PENDING").toLowerCase();
  if (s.includes("revoke")) return "revoked";
  if (s.includes("confirm") || s === "active" || s === "issued" || s === "success") return "confirmed";
  if (s.includes("fail") || s.includes("error")) return "failed";
  return "pending";
};
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "—";
const toSummary = (c: BackendCertificate): CertificateSummary => ({
  id: String(c.certId ?? c.id ?? "—"), certId: c.certId, student: c.fullName ?? "—", studentId: c.studentId,
  degree: c.degree ?? "—", date: formatDate(c.issueDate), issueDate: c.issueDate, status: normalizeStatus(c.status),
  txHash: c.issueTxHash, faculty: c.faculty,
});

export async function issueCertificate(payload: IssueCertificatePayload): Promise<IssueTxResult> {
  const result = await apiFetch<{ certId?: string; issueTxHash?: string; txHash?: string; status?: string; blockNumber?: number; errorMessage?: string }>("/api/certificates", { method: "POST", body: payload });
  return { ...result, txHash: result.issueTxHash ?? result.txHash ?? "", issueTxHash: result.issueTxHash, status: normalizeStatus(result.status) };
}

export async function waitForConfirmation(txHash: string, attempts = 20, intervalMs = 3000): Promise<IssueTxResult> {
  let latest: IssueTxResult = { txHash, status: "pending" };
  for (let i = 0; i < attempts; i++) {
    const result = await apiFetch<{ txHash?: string; status?: string; blockNumber?: number; errorMessage?: string }>(`/api/certificates/${encodeURIComponent(txHash)}/status`);
    latest = { ...result, txHash: result.txHash ?? txHash, status: normalizeStatus(result.status) };
    if (latest.status === "confirmed" || latest.status === "revoked" || latest.status === "failed") return latest;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  return latest;
}

export interface VerifyResult { id: string; holder: string; degree: string; issuedBy: string; issueDate: string; faculty: string; txHash: string; ipfsDoc: string; status: CertStatus; blockchainMatched?: boolean; }
export async function verifyCertificate(query: string): Promise<VerifyResult | null> {
  if (!query.trim()) return null;
  const c = await apiFetch<{ certId?: string; holder?: string; degree?: string; issuedBy?: string; issueDate?: string; faculty?: string; issueTxHash?: string; ipfsDoc?: string; status?: string; blockchainMatched?: boolean }>(`/api/certificates/verify?query=${encodeURIComponent(query)}`);
  if (!c) return null;
  return { id: c.certId ?? query, holder: c.holder ?? "—", degree: c.degree ?? "—", issuedBy: c.issuedBy ?? "—", issueDate: formatDate(c.issueDate), faculty: c.faculty ?? "—", txHash: c.issueTxHash ?? "—", ipfsDoc: c.ipfsDoc ?? "—", status: normalizeStatus(c.status), blockchainMatched: c.blockchainMatched };
}

export async function revokeCertificate(certId: string, reason: string): Promise<{ certId?: string; revokeTxHash?: string; status?: string }> {
  return apiFetch(`/api/certificates/${encodeURIComponent(certId)}/revoke`, { method: "POST", body: { reason } });
}
export async function getCertificatesPage(page = 0, size = 20): Promise<PageResponse<CertificateSummary>> {
  const result = await apiFetch<PageResponse<BackendCertificate>>(`/api/certificates?page=${page}&size=${size}`);
  return { ...result, content: (result.content ?? []).map(toSummary) };
}
export async function getAllCertificates(): Promise<CertificateSummary[]> { return (await getCertificatesPage(0, 100)).content; }
export async function getCertificatesByStudent(studentId: string): Promise<MyCertificate[]> {
  const result = await apiFetch<BackendCertificate[]>(`/api/certificates/student/${encodeURIComponent(studentId)}`);
  return (result ?? []).map(c => ({ id: String(c.certId ?? c.id ?? "—"), title: c.degree ?? "Chứng chỉ", institution: c.faculty ?? c.issuedBy ?? "CTUT University", date: formatDate(c.issueDate), grade: c.grade ?? "—", hash: c.issueTxHash ?? "Chưa có txHash", status: normalizeStatus(c.status) }));
}
