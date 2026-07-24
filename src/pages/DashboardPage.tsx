import { useEffect, useState } from "react";
import { FileBadge, Clock, ShieldCheck, Users, RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { StatusBadge } from "../components/common/StatusBadge";
import * as certificateApi from "../services/certificateApi";
import * as usersApi from "../services/usersApi";
import type { CertificateSummary } from "../types";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [certs, setCerts] = useState<CertificateSummary[]>([]);
  const [issuerCount, setIssuerCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [certList, users] = await Promise.all([
        certificateApi.getAllCertificates(),
        usersApi.getUsers().catch(() => []), // không chặn dashboard nếu API user lỗi
      ]);
      setCerts(certList);
      setIssuerCount(users.filter((u) => u.role === "issuer").length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải dữ liệu từ máy chủ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalCerts = certs.length;
  const pendingCount = certs.filter((c) => c.status === "pending").length;
  const confirmedCount = certs.filter((c) => c.status === "confirmed").length;

  const stats = [
    { label: "Tổng số chứng chỉ đã cấp", value: String(totalCerts), icon: <FileBadge size={20} />, color: "text-[#1E3A8A]", bg: "bg-[#EFF6FF]" },
    { label: "Yêu cầu đang chờ xử lý", value: String(pendingCount), icon: <Clock size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Đã xác nhận trên chuỗi", value: String(confirmedCount), icon: <ShieldCheck size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Người cấp (Issuer) đang hoạt động", value: issuerCount === null ? "—" : String(issuerCount), icon: <Users size={20} />, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const today = new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });
  const recentActivity = [...certs].reverse().slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bảng điều khiển</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Chào mừng trở lại, {user?.name} — {today}</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-[#1E3A8A] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${s.bg} ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-foreground">{loading ? "…" : s.value}</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/issue")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1e40af] transition-all shadow-sm hover:shadow-md"
        >
          <FileBadge size={16} /> Cấp chứng chỉ
        </button>
        <button
          onClick={() => navigate("/verify")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-border text-sm font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-all"
        >
          <ShieldCheck size={16} /> Tra cứu chứng chỉ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Hoạt động gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mã chứng chỉ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sinh viên</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Bằng cấp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ngày cấp</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!loading && recentActivity.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Chưa có chứng chỉ nào được cấp.
                  </td>
                </tr>
              )}
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
