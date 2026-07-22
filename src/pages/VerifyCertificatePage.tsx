import { useState } from "react";
import { Search, QrCode, CheckCircle2, ExternalLink, Download } from "lucide-react";
import * as certificateApi from "../services/certificateApi";
import type { VerifyResult } from "../services/certificateApi";

export function VerifyCertificatePage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const found = await certificateApi.verifyCertificate(query);
      setResult(found);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Verify Certificate</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Publicly verify any Whitmore University certificate on the blockchain.</p>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-5">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block">Certificate ID or Transaction Hash</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="CERT-2024-0891 or 0xab12..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-all font-mono"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-[#1e40af] disabled:opacity-60 transition-all shadow-sm"
            >
              {searching ? "Đang tra..." : "Verify"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-[#1E3A8A] text-sm text-muted-foreground hover:text-[#1E3A8A] transition-colors">
            <QrCode size={16} /> Scan QR Code
          </button>
        </div>

        {result && (
          <div className="border border-emerald-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-500 px-5 py-3 flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Certificate Verified</p>
                <p className="text-emerald-100 text-xs">Confirmed on Ethereum Mainnet</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-white text-xs font-mono">Block #20,421,884</p>
                <p className="text-emerald-100 text-xs">12 confirmations</p>
              </div>
            </div>
            <div className="p-5 bg-white space-y-0">
              {[
                ["Certificate ID", result.id],
                ["Holder", result.holder],
                ["Degree", result.degree],
                ["Issued By", result.issuedBy],
                ["Issue Date", result.issueDate],
                ["Issuing Faculty", result.faculty],
                ["Tx Hash", result.txHash],
                ["IPFS Document", result.ipfsDoc],
                ["Status", "Active — Not Revoked"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`font-medium text-foreground text-right max-w-xs truncate ${k === "Tx Hash" || k === "IPFS Document" ? "font-mono text-xs text-[#1E3A8A]" : ""}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 flex gap-3">
              <button className="flex items-center gap-1.5 text-xs text-[#1E3A8A] font-medium hover:underline">
                <ExternalLink size={12} /> View on Etherscan
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium hover:underline">
                <Download size={12} /> Download Certificate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
