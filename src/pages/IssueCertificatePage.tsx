import { useState } from "react";
import { Upload, CheckCircle2, RefreshCw, ExternalLink, Hash, BookOpen, AlertTriangle } from "lucide-react";
import { Modal } from "../components/common/Modal";
import * as certificateApi from "../services/certificateApi";
import type { IssueCertificatePayload } from "../services/certificateApi";

export function IssueCertificatePage() {
  const [txStatus, setTxStatus] = useState<null | "pending" | "confirmed">(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<IssueCertificatePayload>({
    studentId: "STU-10234",
    fullName: "Amara Osei",
    degree: "BSc Computer Science",
    grade: "First Class Honours",
    issueDate: "2024-07-22",
    faculty: "Faculty of Engineering & Computing",
  });

  function handleSubmit() {
    setModalOpen(true);
  }

  async function handleConfirm() {
    setModalOpen(false);
    setSubmitting(true);
    setTxStatus("pending");
    try {
      const result = await certificateApi.issueCertificate({ ...form, fileName });
      setTxHash(result.txHash);
      const confirmed = await certificateApi.waitForConfirmation(result.txHash);
      setTxStatus(confirmed.status === "confirmed" ? "confirmed" : "pending");
    } catch {
      setTxStatus(null);
    } finally {
      setSubmitting(false);
    }
  }

  function updateField<K extends keyof IssueCertificatePayload>(key: K, value: IssueCertificatePayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Issue Certificate</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Publish a new academic certificate to the Ethereum blockchain.</p>
      </div>

      {txStatus && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${txStatus === "pending" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
          {txStatus === "pending" ? (
            <>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RefreshCw size={16} className="text-amber-600 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Transaction Pending</p>
                <p className="text-xs text-amber-600 font-mono mt-0.5">{txHash} — awaiting block confirmation...</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Certificate Confirmed On-Chain</p>
                <p className="text-xs text-emerald-600 font-mono mt-0.5">Block #20,421,884 · 12 confirmations</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-emerald-700 hover:underline font-medium">
                View <ExternalLink size={11} />
              </button>
            </>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Student ID <span className="text-red-500">*</span></label>
            <input
              value={form.studentId}
              onChange={(e) => updateField("studentId", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Degree / Course <span className="text-red-500">*</span></label>
            <select
              value={form.degree}
              onChange={(e) => updateField("degree", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all appearance-none"
            >
              <option>BSc Computer Science</option>
              <option>MSc Data Engineering</option>
              <option>MBA Finance</option>
              <option>BEng Electrical Engineering</option>
              <option>LLB Law</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Grade / Classification</label>
            <select
              value={form.grade}
              onChange={(e) => updateField("grade", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all appearance-none"
            >
              <option>First Class Honours</option>
              <option>Upper Second (2:1)</option>
              <option>Lower Second (2:2)</option>
              <option>Third Class</option>
              <option>Pass</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Issue Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Issuing Faculty</label>
            <input
              value={form.faculty}
              onChange={(e) => updateField("faculty", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Certificate Document (PDF)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); setFileName(e.dataTransfer.files[0]?.name ?? null); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${dragOver ? "border-[#1E3A8A] bg-[#EFF6FF]" : "border-border hover:border-[#93C5FD] hover:bg-muted/30"}`}
          >
            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
            {fileName ? (
              <p className="text-sm font-medium text-[#1E3A8A]">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Drag & drop PDF here, or <span className="text-[#1E3A8A] font-medium">browse files</span></p>
                <p className="text-xs text-muted-foreground mt-1">PDF up to 10MB — will be hashed and stored on IPFS</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border">
          <Hash size={14} className="text-muted-foreground shrink-0" />
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Est. gas: <span className="font-mono text-foreground font-medium">0.0042 ETH</span></span>
            <span>≈ <span className="text-foreground font-medium">$12.40</span></span>
            <span>Network: <span className="text-emerald-600 font-medium">Mainnet</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen size={16} /> Issue to Blockchain
          </button>
          <button className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-muted-foreground">
            Save Draft
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Certificate Issuance">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>This action cannot be undone.</strong> Once issued, the certificate will be permanently recorded on the Ethereum blockchain. A gas fee will be deducted from your connected wallet.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {[["Student", `${form.fullName} (${form.studentId})`], ["Degree", form.degree], ["Grade", form.grade], ["Est. Gas", "~0.0042 ETH (~$12.40)"]].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-[#1e40af] transition-all"
            >
              Confirm & Sign Transaction
            </button>
            <button
              onClick={() => setModalOpen(false)}
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
