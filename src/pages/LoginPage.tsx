import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Award, Wallet, AlertTriangle, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_ROUTE_BY_ROLE } from "../config/roleConfig";

export function LoginPage() {
  const [tab, setTab] = useState<"wallet" | "register">("wallet");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const { user, isConnecting, error, connectWallet, registerStudent, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    navigate(from ?? DEFAULT_ROUTE_BY_ROLE[user.role], { replace: true });
  }, [user, location.state, navigate]);

  async function handleRegister(e: FormEvent) {
    e.preventDefault(); clearError(); await registerStudent(fullName, studentId);
  }

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1d4ed8] p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8"><div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 mb-4"><Award size={32} className="text-[#F59E0B]"/></div><h1 className="text-2xl font-bold text-white">CTUT University</h1><p className="text-blue-200 text-sm mt-1">Hệ Thống Quản Lý Chứng Chỉ</p><div className="flex items-center justify-center gap-1.5 mt-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-emerald-300 text-xs font-mono">Sepolia Testnet</span></div></div>
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex border-b"><button onClick={()=>{setTab("wallet");clearError();}} className={`flex-1 py-3.5 text-sm font-medium ${tab==="wallet"?"bg-[#EFF6FF] text-[#1E3A8A] border-b-2 border-[#1E3A8A]":"text-muted-foreground"}`}>Đăng nhập MetaMask</button><button onClick={()=>{setTab("register");clearError();}} className={`flex-1 py-3.5 text-sm font-medium ${tab==="register"?"bg-[#EFF6FF] text-[#1E3A8A] border-b-2 border-[#1E3A8A]":"text-muted-foreground"}`}>Đăng ký sinh viên</button></div>
        <div className="p-6">
          {error&&<div className={`mb-4 flex gap-2.5 p-3 rounded-xl border ${error.includes("thành công")?"bg-emerald-50 border-emerald-200":"bg-red-50 border-red-200"}`}><AlertTriangle size={16} className={error.includes("thành công")?"text-emerald-600":"text-red-600"}/><p className={`text-xs ${error.includes("thành công")?"text-emerald-700":"text-red-700"}`}>{error}</p></div>}
          {tab==="wallet"?<div className="space-y-4"><p className="text-sm text-muted-foreground text-center">Kết nối MetaMask, ký nonce do backend cấp và nhận JWT theo vai trò ADMIN, ISSUER hoặc STUDENT.</p><button onClick={connectWallet} disabled={isConnecting} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#F6851B] hover:bg-[#e07516] disabled:opacity-60 text-white font-semibold shadow-lg"><Wallet size={20}/>{isConnecting?"Đang ký và đăng nhập...":"Kết nối với MetaMask"}</button></div>:<form onSubmit={handleRegister} className="space-y-4"><p className="text-sm text-muted-foreground text-center">Tài khoản mới mặc định là STUDENT và cần ADMIN duyệt trước khi đăng nhập.</p><div><label className="text-sm font-medium block mb-1.5">Họ và tên</label><input required value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border bg-muted text-sm" placeholder="Lê Thành Đạt"/></div><div><label className="text-sm font-medium block mb-1.5">Mã sinh viên</label><input required value={studentId} onChange={e=>setStudentId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border bg-muted text-sm font-mono" placeholder="2311004"/></div><button disabled={isConnecting} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm disabled:opacity-60"><UserPlus size={17}/>{isConnecting?"Đang ký yêu cầu...":"Đăng ký bằng MetaMask"}</button></form>}
        </div>
      </div><p className="text-center text-blue-200/60 text-xs mt-6">Bảo mật bởi JWT, chữ ký ví và smart contract Sepolia</p>
    </div>
  </div>;
}
