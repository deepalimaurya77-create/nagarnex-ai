import React from "react";
import { ExplainablePriority } from "../types";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Maximize2,
  HelpCircle,
} from "lucide-react";

interface ExplainablePriorityCardProps {
  explainablePriority: ExplainablePriority;
}

export const ExplainablePriorityCard: React.FC<ExplainablePriorityCardProps> = ({
  explainablePriority,
}) => {
  const isHigh = explainablePriority.level === "High";
  const isMedium = explainablePriority.level === "Medium";

  const getPriorityStyle = () => {
    if (isHigh) {
      return {
        badge: "bg-[#FDF2F2] text-[#C2413B] border-[#F87171]",
        accent: "border-[#C2413B]",
        dot: "bg-[#C2413B]",
        title: "High Priority Incident",
      };
    }
    if (isMedium) {
      return {
        badge: "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]",
        accent: "border-[#D97706]",
        dot: "bg-[#D97706]",
        title: "Medium Priority Incident",
      };
    }
    return {
      badge: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]",
      accent: "border-[#16A34A]",
      dot: "bg-[#16A34A]",
      title: "Low Priority Incident",
    };
  };

  const style = getPriorityStyle();

  return (
    <div
      id="explainable-priority-card"
      className="rounded-[10px] border border-[#CBD5E1] bg-white shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#CBD5E1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-[6px] bg-[#17365D] text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
              Explainable Priority Assessment
            </h3>
            <p className="text-[11px] text-slate-500">
              Audit-ready rationale synthesized from hazard severity &amp; historical dataset recurrence
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-bold border ${style.badge}`}
        >
          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
          {explainablePriority.level} Priority
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Primary Clear Rationale Statement */}
        <div className="p-4 rounded-[8px] bg-[#F8FAFC] border-l-4 border-l-[#17365D] border border-[#E2E8F0]">
          <span className="text-[11px] font-bold text-[#17365D] uppercase tracking-wider block mb-1">
            Why is this {explainablePriority.level} Priority?
          </span>
          <p className="text-sm text-[#1F2937] font-medium leading-relaxed">
            {explainablePriority.primaryReason}
          </p>
        </div>

        {/* 4 Evaluation Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Pillar 1: Health & Safety */}
          <div className="p-3 rounded-[8px] border border-[#CBD5E1] bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Public Health &amp; Safety Hazard
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-[4px] border ${
                  explainablePriority.healthSafetyImpact === "High"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : explainablePriority.healthSafetyImpact === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {explainablePriority.healthSafetyImpact} Impact
              </span>
              <span className="text-[11px] text-slate-600">
                {explainablePriority.healthSafetyImpact === "High"
                  ? "Acute hazard / contamination risk"
                  : explainablePriority.healthSafetyImpact === "Medium"
                  ? "Quality of life / transit disruption"
                  : "Routine minor maintenance"}
              </span>
            </div>
          </div>

          {/* Pillar 2: Geographic Scope */}
          <div className="p-3 rounded-[8px] border border-[#CBD5E1] bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Infrastructure Scope
            </span>
            <div className="text-xs font-semibold text-[#17365D] mt-1">
              {explainablePriority.infrastructureScope}
            </div>
          </div>

          {/* Pillar 3: Recurrence & Cluster Factor */}
          <div className="p-3 rounded-[8px] border border-[#CBD5E1] bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              3. Synthetic Dataset Recurrence
            </span>
            <p className="text-xs text-slate-700 mt-1 leading-snug">
              {explainablePriority.recurrenceClusterFactor}
            </p>
          </div>

          {/* Pillar 4: Prototype SLA Target */}
          <div className="p-3 rounded-[8px] border border-[#CBD5E1] bg-white">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              4. Prototype Resolution SLA
            </span>
            <div className="text-xs font-semibold text-[#2D6CDF] mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{explainablePriority.slaRationale}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
