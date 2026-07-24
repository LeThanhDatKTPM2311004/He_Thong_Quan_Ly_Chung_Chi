import { useState } from "react";
import { Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import * as certificateApi from "../services/certificateApi";
import type { VerifyResult } from "../services/certificateApi";

const STATUS_LABEL_VI: Record<string, string> = {
  confirmed: "Đang hoạt động — Chưa bị thu hồi",
  pending: "Đang chờ xác nhận trên chuỗi",
  revoked: "Đã bị thu hồi",
};

export function VerifyCertificatePage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const found = await certificateApi.verifyCertificate(query);
      setResult(found);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tra cứu chứng chỉ");
      setResult(null);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Tra cứu chứng chỉ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Xác minh công khai bất kỳ chứng chỉ nào của CTUT University trên blockchain.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block">Mã chứng chỉ hoặc mã giao dịch (Tx Hash)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="CERT-2024-0891 hoặc 0xab12..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-[#1e40af] disabled:opacity-60 transition-all shadow-sm"
            >
              {searching ? "Đang tra..." : "Xác minh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        )}

        {searched && !result && !error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <XCircle size={20} className="text-red-600 shrink-0" />
            <p className="text-sm text-red-800">Không tìm thấy chứng chỉ nào khớp với thông tin đã nhập.</p>
          </div>
        )}

        {result && (
          <div className="border border-emerald-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-500 px-5 py-3 flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Chứng chỉ hợp lệ</p>
                <p className="text-emerald-100 text-xs">Đã xác nhận trên blockchain</p>
              </div>
            </div>
            <div className="p-5 bg-white space-y-0">
              {[
                ["Mã chứng chỉ", result.id],
                ["Người sở hữu", result.holder],
                ["Bằng cấp", result.degree],
                ["Đơn vị cấp", result.issuedBy],
                ["Ngày cấp", result.issueDate],
                ["Khoa/Viện", result.faculty],
                ["Mã giao dịch (Tx Hash)", result.txHash],
                ["Tài liệu IPFS", result.ipfsDoc],
                ["Trạng thái", STATUS_LABEL_VI[result.status] ?? result.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`font-medium text-foreground text-right max-w-xs truncate ${k.includes("Hash") || k.includes("IPFS") ? "font-mono text-xs text-[#1E3A8A]" : ""}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
