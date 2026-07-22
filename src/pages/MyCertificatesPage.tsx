import { Award, CheckCircle2, Hash, Share2, Download, ExternalLink } from "lucide-react";
import { myCerts } from "../data/mockData";

export function MyCertificatesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">My Certificates</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your blockchain-verified academic credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {myCerts.map((cert) => (
          <div key={cert.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="h-36 bg-gradient-to-br from-[#1E3A8A] to-[#1d4ed8] relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute rounded-full border border-white" style={{ width: `${80 + i * 40}px`, height: `${80 + i * 40}px`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Award size={32} className="text-[#F59E0B] mb-2" />
                <p className="text-xs font-medium text-blue-200">WHITMORE UNIVERSITY</p>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 size={11} /> Verified
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

              <div className="flex gap-2 mt-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">
                  <Share2 size={12} /> Share
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors">
                  <Download size={12} /> Download
                </button>
                <button className="flex items-center justify-center px-2.5 py-2 rounded-lg border border-border text-xs font-medium hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition-colors" title="View on Etherscan">
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
