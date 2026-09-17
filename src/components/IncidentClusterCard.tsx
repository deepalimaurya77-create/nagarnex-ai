import React, { useState } from "react";
import { IncidentCluster, ComplaintFormData } from "../types";
import {
  Layers,
  Globe2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";

interface IncidentClusterCardProps {
  cluster: IncidentCluster | null;
  formData: ComplaintFormData;
  datasetCount?: number;
}

export const IncidentClusterCard: React.FC<IncidentClusterCardProps> = ({
  cluster,
  formData,
  datasetCount = 100,
}) => {
  const [showRecordsTable, setShowRecordsTable] = useState(false);

  // If no matching complaints exist in the uploaded synthetic dataset
  if (!cluster || cluster.relatedCount === 0) {
    return (
      <div
        id="incident-cluster-empty-card"
        className="rounded-[10px] border border-[#CBD5E1] bg-white p-5 shadow-2xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[8px] bg-slate-100 text-slate-600 border border-slate-200">
              <Layers className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17365D]">Incident Cluster Intelligence</h3>
              <p className="text-[11px] text-slate-500">
                Searched {datasetCount} historical records in the synthetic dataset
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-[6px] text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Isolated Grievance
          </span>
        </div>

        <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#2D6CDF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-[#1F2937]">
              No related historical reports found in the synthetic dataset.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              This grievance appears to be an isolated or first-instance issue for{" "}
              <strong className="text-slate-800">{formData.ward || formData.city}</strong>. No semantic
              clusters or repeated failure patterns were detected in the active synthetic complaint
              dataset. Standard individual triage protocols apply.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // When matching records exist in the synthetic dataset
  return (
    <div
      id="incident-cluster-card"
      className="rounded-[10px] border-2 border-[#2D6CDF] bg-white shadow-sm overflow-hidden"
    >
      {/* Cluster Header */}
      <div className="bg-[#17365D] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-[8px] bg-[#2D6CDF] text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-wide">Incident Cluster Intelligence</h3>
              <span className="px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#EFF6FF] text-[#17365D] border border-[#BFDBFE]">
                {cluster.relatedCount} Related Complaints
              </span>
              <span className="text-[11px] font-mono text-slate-300">[{cluster.clusterId}]</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Identified from active synthetic historical dataset ({formData.city} • {formData.ward})
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#F59E0B] text-slate-950 flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          Multi-Citizen Pattern
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Metric Ribbons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Related Count */}
          <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Related Complaint Count
            </span>
            <div className="text-xl font-bold text-[#17365D] mt-0.5 flex items-baseline gap-1.5">
              <span>{cluster.relatedCount} Reports</span>
              <span className="text-[11px] font-normal text-slate-600">in synthetic dataset</span>
            </div>
          </div>

          {/* Languages Represented */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Globe2 className="w-3 h-3 text-[#2D6CDF]" /> Languages Represented
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Multilingual Convergence</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {cluster.languagesRepresented.map((lang) => (
                <span
                  key={lang}
                  className="px-2.5 py-0.5 rounded-[4px] text-xs font-semibold bg-white border border-[#CBD5E1] text-[#17365D] shadow-2xs"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Repeated Issue Pattern */}
        <div className="p-4 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#92400E] uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Repeated Issue Pattern</span>
          </div>
          <p className="text-xs text-[#78350F] leading-relaxed font-medium">
            {cluster.repeatedIssuePattern}
          </p>
        </div>

        {/* Priority Drivers */}
        <div className="p-4 rounded-[8px] bg-slate-50 border border-[#CBD5E1] space-y-1.5">
          <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
            Priority Drivers (Cluster Recurrence)
          </span>
          <p className="text-xs text-slate-700 leading-relaxed pl-3 border-l-2 border-[#2D6CDF]">
            {cluster.priorityDrivers}
          </p>
        </div>

        {/* Recommended Department Action */}
        <div className="p-4 rounded-[8px] bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#166534] uppercase tracking-wider">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Recommended Department Action</span>
          </div>
          <p className="text-xs text-[#14532D] font-medium leading-relaxed">
            {cluster.recommendedDepartmentAction}
          </p>
        </div>

        {/* Matching Historical Records Collapsible Table */}
        <div className="pt-2 border-t border-[#CBD5E1]">
          <button
            type="button"
            onClick={() => setShowRecordsTable(!showRecordsTable)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#2D6CDF] hover:text-[#17365D] py-1.5 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>
                {showRecordsTable ? "Hide" : "Inspect"} {cluster.matchingRecords.length} Matching
                Records from Synthetic Dataset
              </span>
            </div>
            {showRecordsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRecordsTable && (
            <div className="mt-3 overflow-x-auto border border-[#CBD5E1] rounded-[8px]">
              <table className="min-w-full text-xs text-left divide-y divide-[#CBD5E1]">
                <thead className="bg-[#F8FAFC] text-slate-600 font-semibold">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Ward</th>
                    <th className="px-3 py-2">Language</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Synthetic Date</th>
                    <th className="px-3 py-2">Complaint Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] bg-white">
                  {cluster.matchingRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-2 font-mono font-medium text-[#17365D]">{rec.id}</td>
                      <td className="px-3 py-2 text-slate-700">{rec.ward}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {rec.language}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] text-[10px] ${
                            rec.priority === "High"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : rec.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {rec.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{rec.timestamp}</td>
                      <td className="px-3 py-2 text-slate-700 max-w-xs truncate" title={rec.translated_english}>
                        {rec.translated_english}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
