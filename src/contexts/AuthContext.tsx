import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AuthUser, UserRole } from "../types";
import { connectMetaMask } from "../services/walletService";
import * as authApi from "../services/authApi";

interface AuthContextValue {
  user: AuthUser | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsDemoRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const address = await connectMetaMask();
      // TODO: khi có backend, ký message xác thực trước khi gửi lên server:
      // const signature = await signAuthMessage(address, nonce);
      const profile = await authApi.loginWithWallet(address);
      setUser(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kết nối ví thất bại");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      const profile = await authApi.loginWithEmail(email, password);
      setUser(profile);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const loginAsDemoRole = useCallback(async (role: UserRole) => {
    setIsConnecting(true);
    setError(null);
    try {
      const profile = await authApi.loginAsDemoRole(role);
      setUser(profile);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, isConnecting, error, connectWallet, loginWithEmail, loginAsDemoRole, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
