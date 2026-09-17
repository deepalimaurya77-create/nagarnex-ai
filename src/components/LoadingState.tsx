import React, { useEffect, useState } from "react";
import { Cpu, CheckCircle2, Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 700);
    const timer2 = setTimeout(() => setStep(3), 1600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div id="loading-state-card" className="bg-white rounded-[10px] shadow-sm border border-[#CBD5E1] p-6 sm:p-8 text-center space-y-6">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2D6CDF]">
          <Cpu className="w-7 h-7" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#2D6CDF] text-white flex items-center justify-center shadow-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <h3 className="text-base font-bold text-[#17365D]">Analysing Complaint with Gemini</h3>
        <p className="text-xs text-slate-500 mt-1">
          Processing multilingual syntax and extracting municipal triage parameters...
        </p>
      </div>

      {/* Progress Steps */}
      <div className="max-w-sm mx-auto space-y-2 text-left">
        <div className="flex items-center gap-2.5 text-xs">
          <CheckCircle2 className={`w-4 h-4 ${step >= 1 ? "text-[#2D6CDF]" : "text-slate-300"}`} />
          <span className={step >= 1 ? "font-semibold text-[#1F2937]" : "text-slate-400"}>
            1. Linguistic context ingestion (Hindi / Hinglish / English)
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <CheckCircle2 className={`w-4 h-4 ${step >= 2 ? "text-[#2D6CDF]" : "text-slate-300"}`} />
          <span className={step >= 2 ? "font-semibold text-[#1F2937]" : "text-slate-400"}>
            2. Category classification (Garbage / Water / Streetlights)
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <CheckCircle2 className={`w-4 h-4 ${step >= 3 ? "text-[#2D6CDF]" : "text-slate-300"}`} />
          <span className={step >= 3 ? "font-semibold text-[#1F2937]" : "text-slate-400"}>
            3. Risk priority assessment &amp; officer dispatch synthesis
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs mx-auto">
        <div className="bg-[#2D6CDF] h-full rounded-full w-3/4 animate-pulse" />
      </div>
    </div>
  );
};

