import { NavLink } from "react-router-dom";
import { Award, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_BY_ROLE } from "../../config/roleConfig";

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAV_BY_ROLE[user.role];

  return (
    <>
      {/* Overlay cho mobile */}
      {open && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-20 w-60 bg-[#1E3A8A] flex flex-col h-full transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/10 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B] flex items-center justify-center">
            <Award size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">CertChain</p>
            <p className="text-blue-300 text-[10px]">Whitmore University</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? "bg-[#F59E0B] text-white shadow-md" : "text-blue-200 hover:bg-white/10 hover:text-white"}`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon}
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-white text-xs font-medium">Mainnet Connected</p>
              <p className="text-blue-300 text-[10px] font-mono">Block #20,421,883</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
