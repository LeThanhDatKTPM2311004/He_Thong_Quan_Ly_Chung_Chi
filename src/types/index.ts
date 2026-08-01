export type UserRole = "admin" | "issuer" | "student";

export interface AuthUser {
  id?: number | string;
  studentId?: string | null;
  address: string | null;
  email: string | null;
  name: string;
  role: UserRole;
  token?: string | null;
}

export type CertStatus = "confirmed" | "pending" | "revoked" | "failed";

export interface CertificateSummary {
  id: string;
  certId?: string;
  student: string;
  studentId?: string;
  degree: string;
  date: string;
  issueDate?: string;
  status: CertStatus;
  txHash?: string;
  faculty?: string;
}

export interface CertificateFull extends CertificateSummary {
  sid: string;
  issuer: string;
}

export interface MyCertificate {
  id: string;
  title: string;
  institution: string;
  date: string;
  grade: string;
  hash: string;
  status?: CertStatus;
}

export type ScreenPath = "/dashboard" | "/issue" | "/manage-certificates" | "/certificates" | "/verify" | "/admin" | "/profile";

export interface AppUser {
  name: string;
  email: string;
  role: "Admin" | "Issuer" | "Student" | "Verifier";
  status: "active" | "pending";
}
