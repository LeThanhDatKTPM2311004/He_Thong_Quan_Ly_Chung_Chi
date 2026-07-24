import { useState, type FormEvent } from "react";
import { Award, CheckCircle2, Hash, Search, AlertTriangle } from "lucide-react";
import * as certificateApi from "../services/certificateApi";
import type { MyCertificate } from "../types";

export function MyCertificatesPage() {
  const [studentId, setStudentId] = useState("");
  const [certs, setCerts] = useState<MyCertificate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!studentId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await certificateApi.getCertificatesByStudent(studentId.trim());
      setCerts(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chứng chỉ");
      setCerts(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Chứng chỉ của tôi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tra cứu chứng chỉ học thuật đã được xác minh trên blockchain theo mã sinh viên.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Nhập mã sinh viên (VD: STU-10234)"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-[#1e40af] disabled:opacity-60 transition-all shadow-sm"
        >
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6 max-w-md">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      {certs === null ? (
        <p className="text-sm text-muted-foreground">Nhập mã sinh viên ở trên để xem danh sách chứng chỉ.</p>
      ) : certs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Không tìm thấy chứng chỉ nào cho mã sinh viên này.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certs.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="h-36 bg-gradient-to-br from-[#1E3A8A] to-[#1d4ed8] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="absolute rounded-full border border-white" style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                  ))}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <Award size={32} className="text-[#F59E0B] mb-2" />
                  <p className="text-xs font-medium text-blue-200">CTUT UNIVERSITY</p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle2 size={11} /> Đã xác minh
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-foreground text-sm">{cert.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{cert.institution}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{cert.date}</span>
                  <span className="text-xs font-medium text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-full">{cert.grade}</span>
                </div>

                <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-center gap-1.5">
                  <Hash size={11} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] font-mono text-muted-foreground truncate">{cert.hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
