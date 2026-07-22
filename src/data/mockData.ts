// Dữ liệu giả lập (mock) — sau này sẽ thay bằng dữ liệu thật lấy từ backend/blockchain
import type { CertificateSummary, CertificateFull, MyCertificate, AppUser } from "../types";

export const recentActivity: CertificateSummary[] = [
  { id: "CERT-2024-0891", student: "Amara Osei", degree: "BSc Computer Science", date: "2024-07-18", status: "confirmed" },
  { id: "CERT-2024-0890", student: "Lena Hoffmann", degree: "MSc Data Engineering", date: "2024-07-17", status: "confirmed" },
  { id: "CERT-2024-0889", student: "Rafael Torres", degree: "BEng Electrical Eng.", date: "2024-07-16", status: "pending" },
  { id: "CERT-2024-0888", student: "Yuki Tanaka", degree: "MBA Finance", date: "2024-07-15", status: "confirmed" },
  { id: "CERT-2024-0887", student: "Priya Nair", degree: "BSc Biotechnology", date: "2024-07-14", status: "revoked" },
];

export const allCerts: CertificateFull[] = [
  { id: "CERT-2024-0891", student: "Amara Osei", sid: "STU-10234", degree: "BSc Computer Science", issuer: "Dr. Chen Wei", date: "2024-07-18", status: "confirmed" },
  { id: "CERT-2024-0890", student: "Lena Hoffmann", sid: "STU-10201", degree: "MSc Data Engineering", issuer: "Prof. Maria Santos", date: "2024-07-17", status: "confirmed" },
  { id: "CERT-2024-0889", student: "Rafael Torres", sid: "STU-10189", degree: "BEng Electrical Eng.", issuer: "Dr. James Okafor", date: "2024-07-16", status: "pending" },
  { id: "CERT-2024-0888", student: "Yuki Tanaka", sid: "STU-10176", degree: "MBA Finance", issuer: "Prof. Anna Kowalski", date: "2024-07-15", status: "confirmed" },
  { id: "CERT-2024-0887", student: "Priya Nair", sid: "STU-10165", degree: "BSc Biotechnology", issuer: "Dr. Liu Yang", date: "2024-07-14", status: "revoked" },
  { id: "CERT-2024-0882", student: "Omar Diallo", sid: "STU-10150", degree: "LLB Law", issuer: "Prof. Sarah Mitchell", date: "2024-07-10", status: "confirmed" },
];

export const myCerts: MyCertificate[] = [
  { id: "CERT-2024-0891", title: "BSc Computer Science", institution: "Whitmore University", date: "July 18, 2024", grade: "First Class Honours", hash: "0xab12...f3e9" },
  { id: "CERT-2021-0412", title: "A-Level Mathematics", institution: "Whitmore University", date: "August 22, 2021", grade: "A*", hash: "0xcd45...a7b2" },
  { id: "CERT-2019-0205", title: "GCSE Science Bundle", institution: "Whitmore University", date: "September 10, 2019", grade: "Distinction", hash: "0xef78...c1d4" },
];

export const users: AppUser[] = [
  { name: "Dr. Chen Wei", email: "c.wei@whitmore.edu", role: "Issuer", status: "active" },
  { name: "Prof. Maria Santos", email: "m.santos@whitmore.edu", role: "Issuer", status: "active" },
  { name: "Amara Osei", email: "a.osei@student.whitmore.edu", role: "Student", status: "active" },
  { name: "Lena Hoffmann", email: "l.hoffmann@student.whitmore.edu", role: "Student", status: "active" },
  { name: "TechCorp HR", email: "hr@techcorp.com", role: "Verifier", status: "active" },
];
