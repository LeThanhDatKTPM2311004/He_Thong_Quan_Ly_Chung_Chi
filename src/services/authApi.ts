import type { AuthUser, UserRole } from "../types";
import { apiFetch, API_BASE_URL } from "./httpClient";
export { API_BASE_URL };

type BackendRole = "ADMIN" | "ISSUER" | "STUDENT" | string;
interface BackendUserDto {
  id?: number | string;
  walletAddress?: string | null;
  address?: string | null;
  fullName?: string | null;
  name?: string | null;
  studentId?: string | null;
  role?: BackendRole;
  status?: string;
}
interface BackendAuthResponse {
  token?: string;
  tokenType?: string;
  expiresInSeconds?: number;
  user?: BackendUserDto;
}

export interface AuthResponse extends AuthUser { token?: string | null; status?: string; }
export interface RegisterPayload { address: string; signature: string; nonce: string; fullName: string; studentId: string; }

const normalizeRole = (role?: string): UserRole => {
  const value = (role ?? "STUDENT").toLowerCase();
  return value === "admin" || value === "issuer" ? value : "student";
};

function normalizeUser(dto: BackendUserDto = {}, token?: string | null): AuthResponse {
  const address = dto.walletAddress ?? dto.address ?? null;
  return {
    id: dto.id,
    studentId: dto.studentId ?? null,
    address,
    email: null,
    name: dto.fullName ?? dto.name ?? (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Người dùng"),
    role: normalizeRole(dto.role),
    token: token ?? null,
    status: dto.status,
  };
}

export async function getWalletNonce(address: string): Promise<{ address?: string; nonce: string; message: string; issuedAt?: string; expiresAt?: string }> {
  return apiFetch(`/api/auth/nonce?address=${encodeURIComponent(address)}`);
}

export async function loginWithWallet(address: string, signature: string, nonce: string): Promise<AuthResponse> {
  const result = await apiFetch<BackendAuthResponse>("/api/auth/metamask-login", { method: "POST", body: { address, signature, nonce } });
  return normalizeUser(result.user, result.token);
}

export async function registerStudent(payload: RegisterPayload): Promise<AuthResponse> {
  const result = await apiFetch<BackendUserDto>("/api/auth/register", { method: "POST", body: payload });
  return normalizeUser(result);
}
