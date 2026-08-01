import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search, XCircle, AlertTriangle } from "lucide-react";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import * as certificateApi from "../services/certificateApi";
import type { CertificateSummary } from "../types";
import { useAuth } from "../contexts/AuthContext";

const EXPLORER = import.meta.env.VITE_BLOCK_EXPLORER_URL ?? "https://sepolia.etherscan.io";

export function ManageCertificatesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CertificateSummary[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<CertificateSummary | null>(null);
  const [reason, setReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try { setItems(await certificateApi.getAllCertificates()); }
    catch (e) { setError(e instanceof Error ? e.message : "Không tải được danh sách chứng chỉ"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => items.filter(c => [c.id,c.student,c.studentId,c.degree,c.txHash].some(v => v?.toLowerCase().includes(query.toLowerCase()))), [items, query]);

  async function revoke() {
    if (!target || !reason.trim()) return;
    setRevoking(true); setError(null);
    try { await certificateApi.revokeCertificate(target.certId ?? target.id, reason.trim()); setTarget(null); setReason(""); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Thu hồi thất bại"); }
    finally { setRevoking(false); }
  }

  return <div className="p-6 space-y-5">
    <div className="flex items-start justify-between gap-3"><div><h1 className="text-xl font-bold">Quản lý chứng chỉ</h1><p className="text-sm text-muted-foreground mt-1">Theo dõi giao dịch, mở Etherscan và thu hồi chứng chỉ trên Sepolia.</p></div><button onClick={load} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"><RefreshCw size={14} className={loading?"animate-spin":""}/>Làm mới</button></div>
    {error && <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex gap-2"><AlertTriangle size={17} className="text-red-600"/><span className="text-sm text-red-700">{error}</span></div>}
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b"><div className="relative max-w-xl"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm mã chứng chỉ, MSSV, sinh viên, txHash..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm"/></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px]"><thead className="bg-muted/40"><tr>{["Mã","Sinh viên","Bằng cấp","Ngày cấp","Trạng thái","Blockchain","Thao tác"].map(h=><th key={h} className="text-left px-4 py-3 text-xs uppercase text-muted-foreground">{h}</th>)}</tr></thead><tbody className="divide-y">
        {!loading && !filtered.length && <tr><td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu.</td></tr>}
        {filtered.map(c=><tr key={`${c.id}-${c.txHash}`} className="hover:bg-muted/20"><td className="px-4 py-3 font-mono text-xs text-[#1E3A8A]">{c.id}</td><td className="px-4 py-3"><p className="text-sm font-medium">{c.student}</p><p className="text-xs text-muted-foreground">{c.studentId ?? "—"}</p></td><td className="px-4 py-3 text-sm">{c.degree}</td><td className="px-4 py-3 text-sm text-muted-foreground">{c.issueDate ?? c.date}</td><td className="px-4 py-3"><StatusBadge status={c.status}/></td><td className="px-4 py-3">{c.txHash?<a className="inline-flex items-center gap-1 text-xs text-[#1E3A8A] hover:underline" href={`${EXPLORER}/tx/${c.txHash}`} target="_blank" rel="noreferrer"><ExternalLink size={13}/>Etherscan</a>:<span className="text-xs text-muted-foreground">Chưa có txHash</span>}</td><td className="px-4 py-3">{user?.role==="admin" && c.status!=="revoked"?<button onClick={()=>setTarget(c)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg"><XCircle size={14}/>Thu hồi</button>:<span className="text-xs text-muted-foreground">—</span>}</td></tr>)}
      </tbody></table></div>
    </div>
    <Modal open={!!target} onClose={()=>setTarget(null)} title="Thu hồi chứng chỉ"><div className="space-y-4"><p className="text-sm">Chứng chỉ <b>{target?.id}</b> sẽ được gửi giao dịch thu hồi lên smart contract.</p><textarea rows={4} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Nhập lý do thu hồi..." className="w-full border rounded-xl p-3 text-sm"/><div className="flex gap-2"><button onClick={revoke} disabled={revoking||!reason.trim()} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white disabled:opacity-50">{revoking?"Đang gửi giao dịch...":"Xác nhận thu hồi"}</button><button onClick={()=>setTarget(null)} className="flex-1 py-2.5 rounded-xl border">Hủy</button></div></div></Modal>
  </div>;
}
