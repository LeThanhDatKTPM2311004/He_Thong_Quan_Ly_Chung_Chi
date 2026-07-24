import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { AuthUser, UserRole } from "../types";
import { connectMetaMask, onAccountsChanged } from "../services/walletService";
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
  // Cập nhật thông tin hồ sơ (chỉ lưu ở state phía client).
  // LƯU Ý: backend (UserController) hiện chưa có endpoint PUT/PATCH để lưu
  // thay đổi này xuống database, nên sau khi refresh trang giá trị sẽ mất.
  // Khi backend có endpoint cập nhật hồ sơ, gọi API đó ở đây trước khi setUser.
  updateProfile: (patch: Partial<Pick<AuthUser, "name">>) => void;
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

  const updateProfile = useCallback((patch: Partial<Pick<AuthUser, "name">>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // Giữ user mới nhất trong ref để listener bên dưới luôn so sánh đúng địa
  // chỉ ví hiện tại, không bị "đóng băng" giá trị cũ do closure của useEffect.
  const userRef = useRef(user);
  userRef.current = user;

  // Lắng nghe khi người dùng đổi tài khoản MetaMask đang active.
  // Trước đây hàm onAccountsChanged đã được viết trong walletService.ts
  // nhưng chưa nơi nào gọi tới, nên đổi tài khoản trong MetaMask không
  // hề cập nhật lại app -> đây là phần bù đắp chỗ đó.
  useEffect(() => {
    const unsubscribe = onAccountsChanged(async (accounts) => {
      const current = userRef.current;
      // Không đăng nhập bằng ví -> không quan tâm sự kiện này
      if (!current || !current.address) return;

      if (accounts.length === 0) {
        // Người dùng khoá ví hoặc ngắt kết nối toàn bộ tài khoản trong MetaMask
        setUser(null);
        return;
      }

      const newAddress = accounts[0];
      if (newAddress.toLowerCase() === current.address.toLowerCase()) return;

      // Địa chỉ ví đổi khác -> tự động đăng nhập lại với địa chỉ mới
      setIsConnecting(true);
      setError(null);
      try {
        const profile = await authApi.loginWithWallet(newAddress);
        setUser(profile);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể chuyển sang tài khoản ví mới");
        setUser(null);
      } finally {
        setIsConnecting(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isConnecting,
        error,
        connectWallet,
        loginWithEmail,
        loginAsDemoRole,
        logout,
        clearError,
        updateProfile,
      }}
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
