import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { AuthUser } from "../types";
import { connectMetaMask, onAccountsChanged, onChainChanged, signAuthMessage, ensureSepoliaNetwork } from "../services/walletService";
import * as authApi from "../services/authApi";
import { clearSession, loadStoredUser, storeSession } from "../services/session";

interface AuthContextValue {
  user: AuthUser | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  registerStudent: (fullName: string, studentId: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (patch: Partial<Pick<AuthUser, "name">>) => void;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commitUser = useCallback((profile: AuthUser) => { setUser(profile); storeSession(profile, profile.token); }, []);

  const getSignedChallenge = useCallback(async (address: string) => {
    const challenge = await authApi.getWalletNonce(address);
    const signature = await signAuthMessage(address, challenge.message);
    return { address, signature, nonce: challenge.nonce };
  }, []);

  const walletLogin = useCallback(async (address: string) => {
    const signed = await getSignedChallenge(address);
    commitUser(await authApi.loginWithWallet(signed.address, signed.signature, signed.nonce));
  }, [commitUser, getSignedChallenge]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true); setError(null);
    try { await walletLogin(await connectMetaMask()); }
    catch (e) { setError(e instanceof Error ? e.message : "Kết nối ví thất bại"); }
    finally { setIsConnecting(false); }
  }, [walletLogin]);

  const registerStudent = useCallback(async (fullName: string, studentId: string) => {
    setIsConnecting(true); setError(null);
    try {
      const address = await connectMetaMask();
      const signed = await getSignedChallenge(address);
      await authApi.registerStudent({ ...signed, fullName: fullName.trim(), studentId: studentId.trim() });
      setError("Đăng ký thành công. Tài khoản đang chờ ADMIN duyệt.");
    } catch (e) { setError(e instanceof Error ? e.message : "Đăng ký thất bại"); }
    finally { setIsConnecting(false); }
  }, [getSignedChallenge]);

  const logout = useCallback(() => { clearSession(); setUser(null); }, []);
  const clearError = useCallback(() => setError(null), []);
  const updateProfile = useCallback((patch: Partial<Pick<AuthUser, "name">>) => {
    setUser(prev => { if (!prev) return prev; const next = { ...prev, ...patch }; storeSession(next, next.token); return next; });
  }, []);

  const userRef = useRef(user); userRef.current = user;
  useEffect(() => {
    const offAccounts = onAccountsChanged(async accounts => {
      const current = userRef.current;
      if (!current?.address) return;
      if (!accounts.length) return logout();
      if (accounts[0].toLowerCase() === current.address.toLowerCase()) return;
      setIsConnecting(true);
      try { await walletLogin(accounts[0]); } catch (e) { setError(e instanceof Error ? e.message : "Không thể đổi tài khoản ví"); logout(); }
      finally { setIsConnecting(false); }
    });
    const offChain = onChainChanged(async () => {
      if (!userRef.current?.address) return;
      try { await ensureSepoliaNetwork(); } catch (e) { setError(e instanceof Error ? e.message : "Sai mạng blockchain"); }
    });
    return () => { offAccounts(); offChain(); };
  }, [logout, walletLogin]);

  return <AuthContext.Provider value={{ user, isConnecting, error, connectWallet, registerStudent, logout, clearError, updateProfile }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error("useAuth phải nằm trong AuthProvider"); return ctx; }
