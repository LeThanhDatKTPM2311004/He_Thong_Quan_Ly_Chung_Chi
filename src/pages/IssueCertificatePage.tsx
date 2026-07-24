import { useState } from "react";
import { Upload, CheckCircle2, RefreshCw, Hash, BookOpen, AlertTriangle } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<IssueCertificatePayload>({
    studentId: "",
    fullName: "",
    degree: "BSc Computer Science",
    grade: "First Class Honours",
    issueDate: new Date().toISOString().slice(0, 10),
    faculty: "",
  });

  function handleSubmit() {
    if (!form.studentId || !form.fullName || !form.issueDate) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*).");
      return;
    }
    setError(null);
    setModalOpen(true);
  }

  async function handleConfirm() {
    setModalOpen(false);
    setSubmitting(true);
    setTxStatus("pending");
    setError(null);
    try {
      const result = await certificateApi.issueCertificate({ ...form, fileName });
      setTxHash(result.txHash);
      const confirmed = await certificateApi.waitForConfirmation(result.txHash);
      setTxStatus(confirmed.status === "confirmed" ? "confirmed" : "pending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể phát hành chứng chỉ");
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
        <h1 className="text-xl font-bold text-foreground">Cấp chứng chỉ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Phát hành một chứng chỉ học thuật mới lên blockchain.</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      {txStatus && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${txStatus === "pending" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
          {txStatus === "pending" ? (
            <>
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <RefreshCw size={16} className="text-amber-600 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Giao dịch đang chờ xử lý</p>
                <p className="text-xs text-amber-600 font-mono mt-0.5">{txHash} — đang chờ xác nhận trên chuỗi...</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">Chứng chỉ đã được xác nhận trên chuỗi</p>
                <p className="text-xs text-emerald-600 font-mono mt-0.5">Mã giao dịch: {txHash}</p>
              </div>
            </>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Mã sinh viên <span className="text-red-500">*</span></label>
            <input
              value={form.studentId}
              onChange={(e) => updateField("studentId", e.target.value)}
              placeholder="VD: STU-10234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
            <input
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Bằng cấp / Chuyên ngành <span className="text-red-500">*</span></label>
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
            <label className="text-sm font-medium text-foreground block mb-1.5">Xếp loại</label>
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
            <label className="text-sm font-medium text-foreground block mb-1.5">Ngày cấp <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Khoa / Viện cấp</label>
            <input
              value={form.faculty}
              onChange={(e) => updateField("faculty", e.target.value)}
              placeholder="VD: Khoa Công nghệ Thông tin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Tài liệu chứng chỉ (PDF)</label>
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
                <p className="text-sm text-muted-foreground">Kéo & thả file PDF vào đây, hoặc <span className="text-[#1E3A8A] font-medium">chọn file</span></p>
                <p className="text-xs text-muted-foreground mt-1">PDF tối đa 10MB — sẽ được băm (hash) và lưu trữ</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/60 border border-border">
          <Hash size={14} className="text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">Chứng chỉ sẽ được băm (SHA-256) và ghi vào chuỗi khối nội bộ của hệ thống.</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookOpen size={16} /> {submitting ? "Đang xử lý..." : "Cấp lên Blockchain"}
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Xác nhận cấp chứng chỉ">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Hành động này không thể hoàn tác.</strong> Sau khi cấp, chứng chỉ sẽ được ghi lại vĩnh viễn trên blockchain.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {[["Sinh viên", `${form.fullName} (${form.studentId})`], ["Bằng cấp", form.degree], ["Xếp loại", form.grade]].map(([k, v]) => (
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
              Xác nhận & Ký giao dịch
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Huỷ
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
