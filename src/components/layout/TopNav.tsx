import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Copy, UserCog, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ROLE_LABELS } from "../../config/roleConfig";

export function TopNav({ onMenuToggle, showMenu }: { onMenuToggle: () => void; showMenu: boolean }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const displayId = user.address ?? user.email ?? "—";
  const initial = (user.name || "?").charAt(0).toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 sticky top-0 z-30">
      <button className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground" onClick={onMenuToggle}>
        {showMenu ? <X size={18} /> : <Menu size={18} />}
      </button>
      <div className="flex-1" />

      {/* Địa chỉ ví / email */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-mono text-[#1E3A8A] font-medium">{displayId}</span>
        {user.address && (
          <button
            onClick={() => navigator.clipboard.writeText(user.address ?? "")}
            className="hover:text-[#1E3A8A] text-muted-foreground transition-colors"
          >
            <Copy size={12} />
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => {
            setNotifOpen(!notifOpen);
            setAvatarOpen(false);
          }}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full border border-white" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Thông báo</span>
            </div>
            {[
              { text: "Chưa có thông báo mới nào.", time: "" },
            ].map((n, i) => (
              <div key={i} className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-0">
                <div className="flex gap-2.5 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#1E3A8A] mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-foreground leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative">
        <button
          onClick={() => {
            setAvatarOpen(!avatarOpen);
            setNotifOpen(false);
          }}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3b82f6] flex items-center justify-center text-white text-xs font-bold">
            {initial}
          </div>
          <span className="hidden sm:block text-sm font-medium text-foreground">{user.name}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
        {avatarOpen && (
          <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]} · CTUT University
              </p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  setAvatarOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors text-foreground"
              >
                <UserCog size={14} className="text-muted-foreground" /> Cài đặt hồ sơ
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-muted transition-colors text-red-600"
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
