import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, Wallet, AlertTriangle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE } from "../config/roleConfig";
import type { UserRole } from "../types";

export function LoginPage() {
  const [tab, setTab] = useState<"wallet" | "email">("wallet");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    user,
    isConnecting,
    error,
    connectWallet,
    loginWithEmail,
    loginAsDemoRole,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu đã đăng nhập, chuyển thẳng tới trang mặc định của role đó
  if (user) {
    const from = (location.state as { from?: { pathname?: string } } | null)
      ?.from?.pathname;
    navigate(from ?? DEFAULT_ROUTE_BY_ROLE[user.role], { replace: true });
  }

  async function handleWalletConnect() {
    clearError();
    await connectWallet();
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    clearError();
    await loginWithEmail(email, password);
  }

  async function handleDemoLogin(role: UserRole) {
    clearError();
    await loginAsDemoRole(role);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1d4ed8] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4">
            <Award size={32} className="text-[#F59E0B]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            CTUT University
          </h1>
          <p className="text-blue-200 text-sm mt-1">
            Certificate Management System
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-mono">
              Ethereum Mainnet
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => {
                setTab("wallet");
                clearError();
              }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${tab === "wallet" ? "bg-[#EFF6FF] text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : "text-muted-foreground hover:text-foreground"}`}
            >
              Connect Wallet
            </button>
            <button
              onClick={() => {
                setTab("email");
                clearError();
              }}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${tab === "email" ? "bg-[#EFF6FF] text-[#1E3A8A] border-b-2 border-[#1E3A8A]" : "text-muted-foreground hover:text-foreground"}`}
            >
              Email Login
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
                <AlertTriangle
                  size={16}
                  className="text-red-600 shrink-0 mt-0.5"
                />
                <p className="text-xs text-red-700 leading-relaxed">{error}</p>
              </div>
            )}

            {tab === "wallet" ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  Connect your wallet to access the blockchain certificate
                  system. Admin and Issuer roles require wallet authentication.
                </p>
                <button
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#F6851B] hover:bg-[#e07516] disabled:opacity-60 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                    alt="MetaMask"
                    className="w-6 h-6"
                  />
                  {isConnecting ? "Đang kết nối..." : "Connect with MetaMask"}
                </button>
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <button
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-border hover:border-[#1E3A8A] disabled:opacity-60 text-foreground font-medium transition-colors text-sm"
                >
                  <Wallet size={16} className="text-[#1E3A8A]" />
                  WalletConnect
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  For students accessing their certificates.
                </p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@student.whitmore.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isConnecting ? "Đang đăng nhập..." : "Sign In"}
                </button>
                <p className="text-xs text-center text-muted-foreground">
                  <a href="#" className="text-[#1E3A8A] hover:underline">
                    Forgot password?
                  </a>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Demo role switcher — chỉ hiện khi chưa có backend thật */}
        <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-blue-200 mb-2.5 text-center">
            Demo — đăng nhập nhanh để xem UI theo từng role (xoá khi có backend
            thật)
          </p>
          <div className="flex gap-2">
            {(["admin", "issuer", "student"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={isConnecting}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white text-xs font-medium capitalize transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          Secured by Ethereum blockchain &bull; ERC-1155 Certificates
        </p>
      </div>
    </div>
  );
}
