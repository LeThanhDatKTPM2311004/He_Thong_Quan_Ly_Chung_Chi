import { LayoutDashboard, FileBadge, Award, ShieldCheck, Settings } from "lucide-react";
import type { ReactNode } from "react";
import type { UserRole } from "../types";

export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}

// Menu điều hướng riêng cho từng role
export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  admin: [
    { path: "/dashboard", label: "Bảng điều khiển", icon: <LayoutDashboard size={18} /> },
    { path: "/issue", label: "Cấp chứng chỉ", icon: <FileBadge size={18} /> },
    { path: "/verify", label: "Tra cứu chứng chỉ", icon: <ShieldCheck size={18} /> },
    { path: "/admin", label: "Quản trị", icon: <Settings size={18} /> },
  ],
  issuer: [
    { path: "/dashboard", label: "Bảng điều khiển", icon: <LayoutDashboard size={18} /> },
    { path: "/issue", label: "Cấp chứng chỉ", icon: <FileBadge size={18} /> },
    { path: "/verify", label: "Tra cứu chứng chỉ", icon: <ShieldCheck size={18} /> },
  ],
  student: [
    { path: "/certificates", label: "Chứng chỉ của tôi", icon: <Award size={18} /> },
    { path: "/verify", label: "Tra cứu chứng chỉ", icon: <ShieldCheck size={18} /> },
  ],
};

// Trang mặc định sau khi đăng nhập theo từng role
export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  admin: "/dashboard",
  issuer: "/dashboard",
  student: "/certificates",
};

// Danh sách route mà mỗi role được phép truy cập (dùng cho ProtectedRoute)
export const ALLOWED_ROUTES_BY_ROLE: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/issue", "/verify", "/admin", "/certificates", "/profile"],
  issuer: ["/dashboard", "/issue", "/verify", "/profile"],
  student: ["/certificates", "/verify", "/profile"],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  issuer: "Người cấp chứng chỉ",
  student: "Sinh viên",
};
