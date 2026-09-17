import React, { useState } from "react";
import { RecommendedDispatchPlan } from "../types";
import {
  Send,
  Building2,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

interface RecommendedDispatchPlanCardProps {
  dispatchPlan: RecommendedDispatchPlan;
  city: string;
  ward: string;
  isDispatched?: boolean;
  onDispatchChange?: (dispatched: boolean, timestamp?: string | null) => void;
}

export const RecommendedDispatchPlanCard: React.FC<RecommendedDispatchPlanCardProps> = ({
  dispatchPlan,
  city,
  ward,
  isDispatched: controlledDispatched,
  onDispatchChange,
}) => {
  const [internalDispatched, setInternalDispatched] = useState<boolean>(
    controlledDispatched ?? (dispatchPlan.officerConfirmed || false)
  );
  const [dispatchedAt, setDispatchedAt] = useState<string | null>(
    dispatchPlan.confirmedAt || null
  );
  const [officerNotes, setOfficerNotes] = useState<string>("");
  const [copiedAction, setCopiedAction] = useState(false);

  const isDispatched = controlledDispatched !== undefined ? controlledDispatched : internalDispatched;

  const handleConfirmDispatch = () => {
    if (isDispatched) {
      // Revert if officer wishes
      setInternalDispatched(false);
      setDispatchedAt(null);
      onDispatchChange?.(false, null);
    } else {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setInternalDispatched(true);
      setDispatchedAt(time);
      onDispatchChange?.(true, time);
    }
  };

  const handleCopyFieldDirective = () => {
    const text = `[NAGARNEX AI DISPATCH DIRECTIVE]\nDepartment: ${dispatchPlan.department}\nJurisdiction: ${city} - ${ward}\nService Target: ${dispatchPlan.prototypeServiceTarget}\nRecommended Unit: ${dispatchPlan.recommendedUnit}\nField Action: ${dispatchPlan.suggestedAction}\nStatus: ${isDispatched ? "Approved by Officer (Prototype)" : "Pending Confirmation"}`;
    navigator.clipboard.writeText(text);
    setCopiedAction(true);
    setTimeout(() => setCopiedAction(false), 2000);
  };

  return (
    <div
      id="recommended-dispatch-plan-card"
      className="rounded-[10px] border border-[#CBD5E1] bg-white shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#17365D] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-[#2D6CDF] text-white">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Recommended Dispatch Plan
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-white/10 text-slate-200 border border-white/20">
                ULB Field Directive
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Targeted department routing and field crew mobilization protocol
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyFieldDirective}
          className="text-xs text-slate-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer"
        >
          {copiedAction ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Copied Directive</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Directive</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Core Plan Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Department */}
          <div className="p-4 rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Designated Department
            </span>
            <div className="text-sm font-bold text-[#17365D] leading-snug">
              {dispatchPlan.department}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Jurisdiction: {city} • {ward}
            </p>
          </div>

          {/* Prototype Service Target */}
          <div className="p-4 rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Prototype Service Target
            </span>
            <div className="text-sm font-bold text-[#2D6CDF] flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{dispatchPlan.prototypeServiceTarget}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Resolution SLA commitment</p>
          </div>

          {/* Recommended Crew / Unit */}
          <div className="p-4 rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Recommended Field Unit
            </span>
            <div className="text-xs font-semibold text-slate-800 flex items-start gap-1.5 mt-0.5">
              <Truck className="w-4 h-4 text-[#17365D] shrink-0 mt-0.5" />
              <span>{dispatchPlan.recommendedUnit}</span>
            </div>
          </div>
        </div>

        {/* Suggested Field Action */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
            Suggested Field Action
          </span>
          <div className="p-4 rounded-[8px] bg-white border-2 border-[#E2E8F0] text-sm text-[#1F2937] font-medium leading-relaxed shadow-2xs">
            {dispatchPlan.suggestedAction}
          </div>
        </div>

        {/* Mandatory Human Officer Confirmation Box */}
        <div className="rounded-[8px] border-2 border-[#CBD5E1] bg-[#F8FAFC] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-[6px] bg-[#17365D] text-white shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                  Mandatory Human Officer Confirmation
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Automated dispatch is disabled. An authorised municipal officer must review and confirm before work orders are queued.
                </p>
              </div>
            </div>

            {/* Confirmation Toggle Button */}
            <button
              type="button"
              id="btn-confirm-dispatch"
              onClick={handleConfirmDispatch}
              className={`px-4 py-2 rounded-[8px] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-2xs ${
                isDispatched
                  ? "bg-[#F0FDF4] text-[#166534] border border-[#86EFAC] hover:bg-emerald-100"
                  : "bg-[#2D6CDF] text-white hover:bg-[#1E56B8]"
              }`}
            >
              {isDispatched ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Assigned to Department (Prototype Simulation) ✓</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Confirm &amp; Assign (Prototype Simulation)</span>
                </>
              )}
            </button>
          </div>

          {/* Status Display when Confirmed */}
          {isDispatched && (
            <div className="p-3 rounded-[6px] bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>Confirmed by Officer:</strong> Status updated to <em>Assigned to Department</em> at{" "}
                  {dispatchedAt || "Just now"}. Prototype field directive marked active.
                </span>
              </div>
              <button
                type="button"
                onClick={handleConfirmDispatch}
                className="text-[11px] underline text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Undo / Revise
              </button>
            </div>
          )}

          {/* Strict Disclaimers */}
          <div className="pt-2 border-t border-[#CBD5E1] text-[11px] text-slate-500 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              <strong>Prototype Disclaimer:</strong> NagarNex AI operates as an advisory decision support system. No real government records or physical municipal dispatches are executed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
