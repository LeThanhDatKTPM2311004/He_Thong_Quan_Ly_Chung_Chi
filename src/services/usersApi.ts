import { apiFetch } from "./httpClient";
import type { UserRole } from "../types";
export interface BackendUser { id?: number | string; name: string; email: string | null; address?: string | null; studentId?: string | null; role: UserRole; status?: "active" | "pending" | "locked"; }
interface RawUser { id?: number|string; walletAddress?: string|null; fullName?: string; studentId?: string|null; role?: string; status?: string; }
const role = (v?: string): UserRole => { const x=(v??"STUDENT").toLowerCase(); return x==="admin"||x==="issuer"?x:"student"; };
const status = (v?: string): BackendUser["status"] => { const x=(v??"ACTIVE").toLowerCase(); return x.includes("pending")?"pending":x.includes("lock")?"locked":"active"; };
const normalize = (u: RawUser): BackendUser => ({ id:u.id, name:u.fullName??"—", email:null, address:u.walletAddress??null, studentId:u.studentId??null, role:role(u.role), status:status(u.status) });
export async function getUsers(){ return (await apiFetch<RawUser[]>("/api/users")).map(normalize); }
export async function createUser(body:{walletAddress:string;fullName:string;role:UserRole}){ return normalize(await apiFetch<RawUser>("/api/users",{method:"POST",body:{...body,role:body.role.toUpperCase()}})); }
export async function updateUserRole(id:number|string,newRole:UserRole){ return normalize(await apiFetch<RawUser>(`/api/users/${id}/role`,{method:"PUT",body:{role:newRole.toUpperCase()}})); }
export async function approveUser(id:number|string){ return normalize(await apiFetch<RawUser>(`/api/users/${id}/approve`,{method:"PUT"})); }
export async function lockUser(id:number|string){ return normalize(await apiFetch<RawUser>(`/api/users/${id}/lock`,{method:"PUT"})); }
export const updateMyProfile=(body:{name:string})=>apiFetch<BackendUser>("/api/users/me",{method:"PUT",body});
