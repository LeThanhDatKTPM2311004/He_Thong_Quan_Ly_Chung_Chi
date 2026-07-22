import { useState } from "react";
import { Search, Filter, Download, ExternalLink, XCircle, Users, UserCog, AlertTriangle } from "lucide-react";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import { allCerts, users } from "../data/mockData";
import * as certificateApi from "../services/certificateApi";

export function AdminPage() {
  const [filter, setFilter] = useState("");
  const [revokeModal, setRevokeModal] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [roleTab, setRoleTab] = useState<"certs" | "users">("certs");
  const [revoking, setRevoking] = useState(false);
  const [revokedIds, setRevokedIds] = useState<string[]>([]);

  const filtered = allCerts
    .map((c) => (revokedIds.includes(c.id) ? { ...c, status: "revoked" as const } : c))
    .filter(
      (c) =>
        c.student.toLowerCase().includes(filter.toLowerCase()) ||
        c.id.toLowerCase().includes(filter.toLowerCase()) ||
        c.degree.toLowerCase().includes(filter.toLowerCase())
    );

  async function handleRevoke() {
    if (!revokeModal) return;
    setRevoking(true);
    try {
      await certificateApi.revokeCertificate(revokeModal, revokeReason);
      setRevokedIds((ids) => [...ids, revokeModal]);
    } finally {
      setRevoking(false);
      setRevokeModal(null);
      setRevokeReason("");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage all certificates and user roles across the institution.</p>
      </div>

      <div className="flex border-b border-border">
        {(["certs", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setRoleTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${roleTab === t ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "certs" ? "All Certificates" : "User & Role Management"}
          </button>
        ))}
      </div>

      {roleTab === "certs" ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by name, ID, or degree..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Certificate ID", "Student", "Degree", "Issuer", "Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-[#1E3A8A] font-medium">{c.id}</span></td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground">{c.student}</p>
                      <p className="text-xs text-muted-foreground font-mono">{c.sid}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.degree}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.issuer}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.date}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-muted-foreground hover:text-[#1E3A8A] transition-colors" title="View on chain">
                          <ExternalLink size={13} />
                        </button>
                        {c.status !== "revoked" && (
                          <button
                            onClick={() => setRevokeModal(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Revoke"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filtered.length} of {allCerts.length} certificates</p>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === 1 ? "bg-[#1E3A8A] text-white" : "hover:bg-muted text-muted-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">Users & Roles</h3>
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-medium hover:bg-[#1e40af] transition-colors">
              <Users size={13} /> Invite User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["User", "Email", "Role", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.email} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name[0]}
                        </div>
                        <span className="text-sm font-medium text-foreground">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === "Admin" ? "bg-[#1E3A8A] text-white" :
                        u.role === "Issuer" ? "bg-violet-100 text-violet-700 border border-violet-200" :
                        u.role === "Student" ? "bg-[#EFF6FF] text-[#1E3A8A] border border-blue-200" :
                        "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-3.5">
                      <button className="flex items-center gap-1 text-xs text-[#1E3A8A] font-medium hover:underline">
                        <UserCog size={12} /> Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!revokeModal} onClose={() => setRevokeModal(null)} title="Revoke Certificate">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 leading-relaxed">
              <strong>This will permanently revoke certificate {revokeModal}.</strong> The revocation will be recorded on-chain. The certificate holder will be notified and the certificate will no longer pass verification.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Reason for Revocation</label>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g., Awarded in error — duplicate entry found."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60 transition-all"
            >
              {revoking ? "Đang thu hồi..." : "Revoke Certificate"}
            </button>
            <button
              onClick={() => setRevokeModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
