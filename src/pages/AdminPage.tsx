import { useEffect, useState } from "react";
import {
  Search,
  ExternalLink,
  XCircle,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Modal } from "../components/common/Modal";
import { StatusBadge } from "../components/common/StatusBadge";
import * as certificateApi from "../services/certificateApi";
import * as usersApi from "../services/usersApi";
import type { CertificateSummary } from "../types";
import type { BackendUser } from "../services/usersApi";
import type { UserRole } from "../types";
import { useAuth } from "../contexts/AuthContext";

const ROLE_LABEL_VI: Record<BackendUser["role"], string> = {
  admin: "Quản trị viên",
  issuer: "Người cấp chứng chỉ",
  student: "Sinh viên",
};

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const explorerBaseUrl = (
    import.meta.env.VITE_BLOCK_EXPLORER_URL ?? "https://sepolia.etherscan.io"
  ).replace(/\/$/, "");
  const [filter, setFilter] = useState("");
  const [revokeModal, setRevokeModal] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [roleTab, setRoleTab] = useState<"certs" | "users">("certs");
  const [revoking, setRevoking] = useState(false);

  const [certs, setCerts] = useState<CertificateSummary[]>([]);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [certList, userList] = await Promise.all([
        certificateApi.getAllCertificates(),
        usersApi.getUsers(),
      ]);
      setCerts(certList);
      setUsers(userList);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải dữ liệu từ máy chủ",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = certs.filter(
    (c) =>
      c.student.toLowerCase().includes(filter.toLowerCase()) ||
      c.id.toLowerCase().includes(filter.toLowerCase()) ||
      c.degree.toLowerCase().includes(filter.toLowerCase()),
  );

  async function handleRoleChange(targetUser: BackendUser, nextRole: UserRole) {
    if (targetUser.id == null) {
      setError("Backend phải trả về id người dùng để gán vai trò.");
      return;
    }
    if (
      targetUser.address &&
      currentUser?.address &&
      targetUser.address.toLowerCase() === currentUser.address.toLowerCase()
    ) {
      setError("Không thể tự thay đổi vai trò của tài khoản đang đăng nhập.");
      return;
    }
    if (nextRole === targetUser.role) return;
    const accepted = window.confirm(
      `Xác nhận đổi vai trò của ${targetUser.name} từ ${ROLE_LABEL_VI[targetUser.role]} sang ${ROLE_LABEL_VI[nextRole]}?`,
    );
    if (!accepted) return;
    try {
      const updated = await usersApi.updateUserRole(targetUser.id, nextRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, ...updated, role: nextRole } : u,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật vai trò");
    }
  }

  // async function handleLockUser(targetUser: BackendUser) {
  //   if (targetUser.id == null) return;
  //   if (targetUser.address && currentUser?.address && targetUser.address.toLowerCase() === currentUser.address.toLowerCase()) {
  //     setError("Không thể khóa tài khoản đang đăng nhập.");
  //     return;
  //   }
  //   const accepted = window.confirm(`Khóa tài khoản ${targetUser.name}? Backend hiện chưa có API mở khóa, nên thao tác này chưa thể hoàn tác trên giao diện.`);
  //   if (!accepted) return;
  //   try {
  //     const updated = await usersApi.lockUser(targetUser.id);
  //     setUsers((prev) => prev.map((u) => u.id === targetUser.id ? updated : u));
  //   } catch (e) { setError(e instanceof Error ? e.message : "Không thể khóa tài khoản"); }
  // }

  function openTransaction(txHash?: string) {
    if (!txHash) {
      setError(
        "Chứng chỉ chưa có mã giao dịch phát hành để mở trên Etherscan.",
      );
      return;
    }
    window.open(
      `${explorerBaseUrl}/tx/${txHash}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleRevoke() {
    if (!revokeModal) return;
    setRevoking(true);
    try {
      await certificateApi.revokeCertificate(revokeModal, revokeReason);
      await loadData(); // tải lại danh sách để cập nhật trạng thái mới nhất
    } catch (e) {
      setError(e instanceof Error ? e.message : "Thu hồi chứng chỉ thất bại");
    } finally {
      setRevoking(false);
      setRevokeModal(null);
      setRevokeReason("");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Trang quản trị</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý toàn bộ chứng chỉ và vai trò người dùng trong hệ thống.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-[#1E3A8A] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Làm
          mới
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 leading-relaxed">{error}</p>
        </div>
      )}

      <div className="flex border-b border-border">
        {(["certs", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setRoleTab(t)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${roleTab === t ? "border-[#1E3A8A] text-[#1E3A8A]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "certs"
              ? "Tất cả chứng chỉ"
              : "Quản lý người dùng & vai trò"}
          </button>
        ))}
      </div>

      {roleTab === "certs" ? (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Tìm theo tên, mã chứng chỉ, hoặc bằng cấp..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    "Mã chứng chỉ",
                    "Sinh viên",
                    "Bằng cấp",
                    "Ngày cấp",
                    "Trạng thái",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-6 text-center text-sm text-muted-foreground"
                    >
                      Không tìm thấy chứng chỉ nào.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-[#1E3A8A] font-medium">
                        {c.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground">
                        {c.student}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {c.degree}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {c.date}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openTransaction(c.txHash)}
                          disabled={!c.txHash}
                          className="p-1.5 rounded-lg hover:bg-[#EFF6FF] text-muted-foreground hover:text-[#1E3A8A] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                          title={
                            c.txHash
                              ? "Xem giao dịch phát hành trên Sepolia Etherscan"
                              : "Chưa có mã giao dịch"
                          }
                        >
                          <ExternalLink size={13} />
                        </button>
                        {c.status !== "revoked" && (
                          <button
                            onClick={() => setRevokeModal(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                            title="Thu hồi"
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
            <p className="text-xs text-muted-foreground">
              {filtered.length} / {certs.length} chứng chỉ
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border space-y-3">
            <h3 className="font-semibold text-sm">Người dùng & vai trò</h3>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>
                Đổi vai trò và khóa tài khoản đều yêu cầu xác nhận. Backend hiện
                chỉ có API khóa, chưa có API mở khóa; tài khoản đã khóa sẽ không
                thể mở lại từ FE.
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    "Người dùng",
                    "Địa chỉ ví / MSSV",
                    "Vai trò",
                    "Trạng thái",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {!loading && users.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-6 text-center text-sm text-muted-foreground"
                    >
                      Chưa có người dùng nào trong hệ thống.
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr
                    key={u.email || u.name}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#3b82f6] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.[0] ?? "?"}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      <p className="font-mono text-xs">{u.address || "—"}</p>
                      <p className="text-xs mt-1">{u.studentId || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          handleRoleChange(u, e.target.value as UserRole)
                        }
                        disabled={
                          u.id == null ||
                          u.status === "locked" ||
                          (!!u.address &&
                            !!currentUser?.address &&
                            u.address.toLowerCase() ===
                              currentUser.address.toLowerCase())
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-border bg-white text-xs font-medium disabled:opacity-50"
                        title={
                          u.id == null
                            ? "Backend chưa trả về id"
                            : u.status === "locked"
                              ? "Không thể đổi vai trò của tài khoản đã khóa"
                              : !!u.address &&
                                  !!currentUser?.address &&
                                  u.address.toLowerCase() ===
                                    currentUser.address.toLowerCase()
                                ? "Không thể tự đổi vai trò"
                                : "Chọn vai trò mới và xác nhận"
                        }
                      >
                        <option value="student">{ROLE_LABEL_VI.student}</option>
                        <option value="issuer">{ROLE_LABEL_VI.issuer}</option>
                        <option value="admin">{ROLE_LABEL_VI.admin}</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${u.status === "active" ? "bg-emerald-50 text-emerald-700" : u.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        {u.status === "active"
                          ? "Đang hoạt động"
                          : u.status === "pending"
                            ? "Chờ duyệt"
                            : "Đã khóa"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {u.status === "pending" && u.id != null && (
                          <button
                            onClick={async () => {
                              try {
                                const x = await usersApi.approveUser(u.id!);
                                setUsers((v) =>
                                  v.map((i) => (i.id === u.id ? x : i)),
                                );
                              } catch (e) {
                                setError(
                                  e instanceof Error
                                    ? e.message
                                    : "Không thể duyệt tài khoản",
                                );
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
                            title="Duyệt tài khoản"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {u.id != null &&
                          (u.status === "locked" ? (
                            <button
                              disabled
                              className="p-1.5 rounded-lg text-muted-foreground opacity-40 cursor-not-allowed"
                              title="Tài khoản đã khóa; backend chưa hỗ trợ mở khóa"
                            >
                              <Lock size={14} />
                            </button>
                          ) : (
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 "
                              title="Khóa tài khoản"
                            >
                              <Lock size={0} />
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!revokeModal}
        onClose={() => setRevokeModal(null)}
        title="Thu hồi chứng chỉ"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 leading-relaxed">
              <strong>
                Hành động này sẽ thu hồi vĩnh viễn chứng chỉ {revokeModal}.
              </strong>{" "}
              Việc thu hồi sẽ được ghi lại trên blockchain. Người sở hữu chứng
              chỉ sẽ được thông báo và chứng chỉ sẽ không còn vượt qua được bước
              xác minh.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Lý do thu hồi
            </label>
            <textarea
              rows={3}
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Ví dụ: Cấp nhầm — phát hiện trùng lặp dữ liệu."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60 transition-all"
            >
              {revoking ? "Đang thu hồi..." : "Thu hồi chứng chỉ"}
            </button>
            <button
              onClick={() => setRevokeModal(null)}
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
