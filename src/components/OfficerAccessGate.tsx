import React from "react";
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  FileText,
  Layers,
  Building2,
  AlertTriangle,
  BarChart3,
  Search,
  CheckCircle2,
  Users,
} from "lucide-react";

interface OfficerAccessGateProps {
  onEnterOfficerDemo: () => void;
  onReturnToCitizen: () => void;
  citizenQueueCount?: number;
}

export const OfficerAccessGate: React.FC<OfficerAccessGateProps> = ({
  onEnterOfficerDemo,
  onReturnToCitizen,
  citizenQueueCount = 0,
}) => {
  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Access Gate Main Card */}
      <div
        id="officer-access-gate-card"
        className="bg-white rounded-[12px] border-2 border-[#1E3A63] shadow-md overflow-hidden"
      >
        {/* Navy Header Strip */}
        <div className="bg-[#0F2440] text-white px-6 py-5 border-b border-[#1E3A63] flex items-start gap-4">
          <div className="w-12 h-12 rounded-[10px] bg-[#1E3A63] border border-[#3B82F6]/30 flex items-center justify-center shrink-0 text-[#93C5FD] shadow-xs">
            <Lock className="w-6 h-6 text-[#93C5FD]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <ShieldAlert className="w-3 h-3 text-amber-300" />
                Authorised Personnel Only
              </span>
              <span className="text-xs text-slate-400">ULB Internal Section</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Restricted municipal staff access — Demo simulation
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              This supervisory interface is restricted to municipal corporation officers, zonal
              engineers, sanitary inspectors, and administrative evaluators.
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Strict Separation Notice */}
          <div className="bg-[#EFF6FF] border-l-4 border-[#2563EB] p-4 rounded-[6px] space-y-2 text-xs text-[#1F2937]">
            <div className="flex items-center gap-2 font-bold text-[#1E40AF]">
              <AlertTriangle className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span>Role-Based Access Separation</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              NagarNex AI enforces strict separation between public citizen interfaces and
              internal municipal administration. Citizens must not access municipal triage
              analytics, cross-case queues, incident clusters, or assignment controls.
            </p>
          </div>

          {/* Protected Internal Municipal Capabilities */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-[#0F2440] uppercase tracking-wider">
              Internal Municipal Capabilities in this Console:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2440] block">Incident Intelligence</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Clustering duplicate &amp; related complaints from the synthetic dataset.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2440] block">Workforce Dispatch Controls</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Mandatory officer sign-off before mobilizing field response units.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] flex items-start gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2440] block">Executive City Analytics</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Tableau/PowerBI dashboard tracking zonal SLAs and grievance volumes.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F2440] block">Verification &amp; Sign-off</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Multimodal before/after remediation audit and work order closure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Citizen PII Protocol</span>
            </div>
            <p>
              In compliance with municipal privacy by design standards, no citizen names, phone
              numbers, or residential addresses are collected or displayed anywhere in this system.
            </p>
          </div>

          {/* Entry Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              id="btn-return-to-citizen-portal"
              onClick={onReturnToCitizen}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Return to Public Citizen Portal</span>
            </button>

            <button
              type="button"
              id="btn-enter-officer-demo"
              onClick={onEnterOfficerDemo}
              className="w-full sm:w-auto px-6 py-3 rounded-[8px] bg-[#17365D] hover:bg-[#0F2440] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
            >
              <span>Enter Officer Demo</span>
              <ArrowRight className="w-4 h-4 text-[#93C5FD]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
