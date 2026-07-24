import { useState, type FormEvent } from "react";
import { CheckCircle2, Copy, Mail, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_LABELS } from "../config/roleConfig";

export function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const initial = (user.name || "?").charAt(0).toUpperCase();
  const isDirty = name.trim() !== "" && name.trim() !== user.name;

  function handleCopyAddress() {
    if (!user?.address) return;
    navigator.clipboard.writeText(user.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!isDirty) return;
    updateProfile({ name: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Cài đặt hồ sơ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quản lý thông tin tài khoản của bạn trong Hệ Thống Quản Lý Chứng Chỉ.
        </p>
      </div>

      {/* Card thông tin định danh */}
      <div className="bg-white rounded-2xl border border-border p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3b82f6] flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[user.role]} · CTUT University
          </p>
        </div>
      </div>

      {/* Form chỉnh sửa tên hiển thị */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserRound size={16} className="text-[#1E3A8A]" />
          <h2 className="text-sm font-semibold text-foreground">Thông tin cá nhân</h2>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Tên hiển thị</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!isDirty}
            className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            Lưu thay đổi
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
              <CheckCircle2 size={14} /> Đã lưu
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/60">
          Lưu ý: backend hiện chưa có API lưu thông tin hồ sơ xuống database, nên
          thay đổi tên hiển thị chỉ áp dụng cho phiên đăng nhập hiện tại và sẽ mất
          khi bạn tải lại trang. Cần bổ sung endpoint{" "}
          <code className="bg-muted px-1 py-0.5 rounded">PUT /api/users/me</code> ở
          backend để lưu vĩnh viễn.
        </p>
      </form>

      {/* Phương thức đăng nhập / định danh */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#1E3A8A]" />
          <h2 className="text-sm font-semibold text-foreground">Phương thức xác thực</h2>
        </div>

        {user.address ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Wallet size={16} className="text-[#1E3A8A] shrink-0" />
              <span className="text-sm font-mono text-[#1E3A8A] truncate">{user.address}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="text-xs text-[#1E3A8A] hover:underline flex items-center gap-1 shrink-0"
            >
              <Copy size={12} /> {copied ? "Đã chép" : "Chép"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
            <Mail size={16} className="text-[#1E3A8A] shrink-0" />
            <span className="text-sm text-[#1E3A8A]">{user.email}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          {user.address
            ? "Tài khoản này gắn với địa chỉ ví trên. Muốn đăng nhập bằng ví khác, hãy đăng xuất, đổi tài khoản đang active trong MetaMask rồi kết nối lại."
            : "Tài khoản sinh viên đăng nhập bằng email/mật khẩu, không gắn với ví blockchain."}
        </p>
      </div>
    </div>
  );
}
