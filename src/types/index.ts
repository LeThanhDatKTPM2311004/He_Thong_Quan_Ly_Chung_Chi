// Các kiểu dữ liệu dùng chung trong toàn bộ ứng dụng

export type UserRole = "admin" | "issuer" | "student";

export interface AuthUser {
  address: string | null; // địa chỉ ví, null nếu đăng nhập bằng email
  email: string | null;
  name: string;
  role: UserRole;
}

export type CertStatus = "confirmed" | "pending" | "revoked";

export interface CertificateSummary {
  id: string;
  student: string;
  degree: string;
  date: string;
  status: CertStatus;
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
}

export interface AppUser {
  name: string;
  email: string;
  role: "Admin" | "Issuer" | "Student" | "Verifier";
  status: "active" | "pending";
}

// Danh sách route hợp lệ trong app (dùng cho sidebar/nav)
export type ScreenPath =
  | "/dashboard"
  | "/issue"
  | "/certificates"
  | "/verify"
  | "/admin";
