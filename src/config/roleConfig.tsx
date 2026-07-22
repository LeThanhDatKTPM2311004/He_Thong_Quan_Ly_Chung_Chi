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
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/issue", label: "Issue Certificate", icon: <FileBadge size={18} /> },
    { path: "/verify", label: "Verify Certificate", icon: <ShieldCheck size={18} /> },
    { path: "/admin", label: "Admin Panel", icon: <Settings size={18} /> },
  ],
  issuer: [
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/issue", label: "Issue Certificate", icon: <FileBadge size={18} /> },
    { path: "/verify", label: "Verify Certificate", icon: <ShieldCheck size={18} /> },
  ],
  student: [
    { path: "/certificates", label: "My Certificates", icon: <Award size={18} /> },
    { path: "/verify", label: "Verify Certificate", icon: <ShieldCheck size={18} /> },
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
  admin: ["/dashboard", "/issue", "/verify", "/admin", "/certificates"],
  issuer: ["/dashboard", "/issue", "/verify"],
  student: ["/certificates", "/verify"],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  issuer: "Issuer",
  student: "Student",
};
