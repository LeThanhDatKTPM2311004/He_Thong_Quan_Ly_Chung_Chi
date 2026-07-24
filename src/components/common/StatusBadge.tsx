import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed: { label: "Đã xác nhận", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    pending: { label: "Đang chờ", cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    revoked: { label: "Đã thu hồi", cls: "bg-red-50 text-red-600 border border-red-200" },
    active: { label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {status === "confirmed" || status === "active" ? (
        <CheckCircle2 size={10} />
      ) : status === "pending" ? (
        <Clock size={10} />
      ) : (
        <XCircle size={10} />
      )}
      {s.label}
    </span>
  );
}
