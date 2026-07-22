import { FileBadge, Clock, ShieldCheck, Users, TrendingUp, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { StatusBadge } from "../components/common/StatusBadge";
import { recentActivity } from "../data/mockData";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Certificates Issued", value: "4,821", change: "+127 this month", icon: <FileBadge size={20} />, color: "text-[#1E3A8A]", bg: "bg-[#EFF6FF]" },
    { label: "Pending Requests", value: "14", change: "3 require action", icon: <Clock size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Verified This Month", value: "312", change: "+18% vs last month", icon: <ShieldCheck size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Issuers", value: "23", change: "2 added recently", icon: <Users size={20} />, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user?.name} — {today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
              <TrendingUp size={14} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/issue")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e40af] transition-all shadow-sm hover:shadow-md"
        >
          <FileBadge size={16} /> Issue Certificate
        </button>
        <button
          onClick={() => navigate("/verify")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-sm font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all"
        >
          <ShieldCheck size={16} /> Verify Certificate
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-sm font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all">
          <RefreshCw size={16} /> Sync Blockchain
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
          <button className="text-xs text-[#1E3A8A] font-medium hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Certificate ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Degree</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5"><span className="font-mono text-xs text-[#1E3A8A] font-medium">{r.id}</span></td>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{r.student}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{r.degree}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
