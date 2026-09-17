import React from "react";
import { Building2, AlertCircle } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header id="civic-header" className="bg-[#17365D] text-white border-b border-[#0F2440] shadow-sm">
      {/* Top Government-Tech Notice Strip */}
      <div className="bg-[#0F2440] border-b border-[#1E3A63] px-4 py-1.5 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-semibold bg-[#17365D] text-slate-200 border border-[#2B4B75]">
              URBAN LOCAL BODIES
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">
              Municipal Grievance Intelligence &amp; Officer Dispatch System
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300 text-xs font-normal">
            <span>Gemini-assisted triage</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#2D6CDF] flex items-center justify-center text-white font-bold shrink-0 border border-white/20 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
                NagarNex <span className="text-[#93C5FD]">AI</span>
              </h1>
              <span className="text-[11px] font-medium uppercase tracking-wider bg-[#0F2440] text-slate-300 px-2 py-0.5 rounded-[6px] border border-[#2B4B75]">
                Pilot v2.4
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Evidence-to-Closure Civic Intelligence for Indian Municipal Corporations
            </p>
          </div>
        </div>

        {/* Required Advisory Note */}
        <div className="flex items-center gap-2.5 bg-[#0F2440] border border-[#D97706]/70 rounded-[10px] px-3.5 py-2 text-[#FDE68A] text-xs max-w-md shadow-xs">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
          <p className="leading-snug font-medium text-[#FDE68A]">
            Synthetic data only. AI recommendations require officer review.
          </p>
        </div>
      </div>
    </header>
  );
};

