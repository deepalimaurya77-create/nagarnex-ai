import React, { useState } from "react";
import {
  IncidentCluster,
  ComplaintFormData,
  AnalysisResult,
  HistoricalComplaintRecord,
} from "../types";
import {
  Layers,
  Globe2,
  AlertTriangle,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  MapPin,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Send,
  Database,
  Repeat,
  Info,
  Sparkles,
} from "lucide-react";

interface IncidentIntelligenceSectionProps {
  cluster: IncidentCluster | null;
  formData: ComplaintFormData;
  result: AnalysisResult;
  datasetCount?: number;
  isDispatched?: boolean;
  dispatchedAt?: string | null;
  onDispatchChange?: (dispatched: boolean, timestamp?: string | null, notes?: string) => void;
}

export const IncidentIntelligenceSection: React.FC<IncidentIntelligenceSectionProps> = ({
  cluster,
  formData,
  result,
  datasetCount = 100,
  isDispatched = false,
  dispatchedAt = null,
  onDispatchChange,
}) => {
  const [showRecordsTable, setShowRecordsTable] = useState(false);
  const [officerNotes, setOfficerNotes] = useState("");

  const effectiveCluster: IncidentCluster = cluster || {
    clusterId: `CLUST-ISOLATED-${(formData.city || "DEL").slice(0, 3).toUpperCase()}`,
    city: formData.city,
    ward: formData.ward || "All-Ward",
    category: result.category,
    relatedCount: 0,
    languagesRepresented: [formData.language || "English"],
    repeatedIssuePattern: `No related historical reports found in the synthetic dataset (${datasetCount} records scanned). This grievance is treated as an isolated single-point event.`,
    priorityDrivers: `Isolated grievance: 0 repeat reports in synthetic demo data. Priority (${result.priority}) is determined strictly by individual triage severity.`,
    priorityDriversDetail: {
      repeatReports: {
        count: 0,
        summary: `0 repeat reports in synthetic demo data (1 standalone report). No prior duplicate records detected in the active dataset.`,
      },
      severity: {
        level: result.priority,
        summary: `Assigned ${result.priority} severity based on individual citizen complaint parameters.`,
      },
      pendingDuration: {
        durationText: "New intake (0 hours)",
        summary: "Newly filed complaint; no accumulated historical backlog in the synthetic demo dataset.",
      },
    },
    recommendedDepartment:
      result.category === "Garbage/Sanitation"
        ? "Department of Solid Waste Management & Public Health"
        : result.category === "Water Supply"
        ? "Water Supply & Sewerage Board (Jal Board)"
        : "Electrical & Public Lighting Division",
    recommendedDepartmentAction:
      result.suggestedAction ||
      "Dispatch standard ward inspection crew for verification and single-point rectification.",
    matchingRecords: [],
    isIsolated: true,
  };

  const isClusterActive = effectiveCluster.relatedCount > 0;

  const handleApproveDispatch = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    onDispatchChange?.(true, time, officerNotes.trim() || undefined);
  };

  const handleRecallDispatch = () => {
    onDispatchChange?.(false, null);
  };

  return (
    <section
      id="incident-intelligence-section"
      aria-label="Incident Intelligence"
      className="rounded-[12px] border-2 border-[#1E40AF] bg-white shadow-sm overflow-hidden"
    >
      {/* 1. Header Banner */}
      <div className="bg-[#0F2942] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-[8px] bg-[#2563EB] text-white shrink-0 mt-0.5 shadow-xs">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-wide">
                Incident Intelligence
              </h2>
              {/* Synthetic demo data label */}
              <span
                id="synthetic-demo-data-badge"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
              >
                <Database className="w-3 h-3 text-[#D97706]" />
                Synthetic demo data
              </span>
              {/* Cluster active / isolated badge */}
              {isClusterActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                  <Sparkles className="w-3 h-3 text-[#2563EB]" />
                  Cluster Active ({effectiveCluster.relatedCount} Reports)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] text-[11px] font-medium bg-slate-700/80 text-slate-200 border border-slate-600">
                  Isolated Complaint
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              <strong>Purpose:</strong> Identify duplicate and related civic complaints as one
              incident cluster, instead of treating every complaint as separate.
            </p>
          </div>
        </div>

        {/* Mandatory approval notice */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/40">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            Officer Approval Mandatory Before Dispatch
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* 2. Structured Cluster Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Cluster ID */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Cluster ID
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-sm font-bold text-[#0F2942] bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
                {effectiveCluster.clusterId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isClusterActive ? "Multi-Complaint Cluster" : "Isolated Tracking Key"}
            </p>
          </div>

          {/* City & Ward */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#2563EB]" /> City and Ward
            </span>
            <div className="text-sm font-bold text-[#0F2942] truncate" title={`${effectiveCluster.city} • ${effectiveCluster.ward}`}>
              {effectiveCluster.city}
            </div>
            <p className="text-[11px] text-slate-600 truncate">{effectiveCluster.ward}</p>
          </div>

          {/* Category */}
          <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#2563EB]" /> Category
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-[#0F2942]">{effectiveCluster.category}</span>
            </div>
            <p className="text-[11px] text-slate-500">Jurisdiction Triage Category</p>
          </div>

          {/* Number of Related Complaints (Strictly from uploaded CSV records) */}
          <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
            <span className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wider flex items-center gap-1">
              <Repeat className="w-3 h-3 text-[#2563EB]" /> Related Complaints
            </span>
            <div className="text-xl font-extrabold text-[#1E40AF]">
              {effectiveCluster.relatedCount}
              <span className="text-xs font-semibold ml-1.5 text-slate-700">
                {effectiveCluster.relatedCount === 1 ? "report" : "reports"}
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium">
              Calculated from {datasetCount} synthetic demo records (no invented counts)
            </p>
          </div>
        </div>

        {/* 3. Languages Represented & Issue Convergence */}
        <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0F2942] uppercase tracking-wider">
                Languages Represented in Cluster
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                Synthetic demo data
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Multilingual Convergence Analysis
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {effectiveCluster.languagesRepresented.map((lang) => (
              <span
                key={lang}
                className="px-2.5 py-1 rounded-[6px] text-xs font-bold bg-white border border-[#94A3B8] text-[#0F2942] shadow-2xs flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                {lang}
              </span>
            ))}
            <span className="text-xs text-slate-600 ml-1">
              {isClusterActive
                ? `— Citizens from diverse linguistic communities independently reported this ${effectiveCluster.category.toLowerCase()} failure.`
                : "— Single language grievance intake."}
            </span>
          </div>

          {/* Synthesized issue pattern */}
          <div className="pt-2 mt-2 border-t border-slate-200">
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Cluster Pattern:</strong>{" "}
              {effectiveCluster.repeatedIssuePattern}
            </p>
          </div>
        </div>

        {/* 4. Priority Drivers: Repeat Reports, Severity, Pending Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#0F2942] uppercase tracking-wider">
                Priority Drivers (Cluster Evaluation)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                Synthetic demo data
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Evaluates repeat reports, severity, and pending duration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Driver 1: Repeat Reports */}
            <div className="p-4 rounded-[8px] bg-white border border-[#CBD5E1] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-[#2563EB]" /> 1. Repeat Reports
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
                  {effectiveCluster.priorityDriversDetail?.repeatReports.count ??
                    effectiveCluster.relatedCount}{" "}
                  Reports
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {effectiveCluster.priorityDriversDetail?.repeatReports.summary ||
                  `${effectiveCluster.relatedCount} repeat reports identified in synthetic demo data.`}
              </p>
            </div>

            {/* Driver 2: Severity */}
            <div className="p-4 rounded-[8px] bg-white border border-[#CBD5E1] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" /> 2. Severity
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    (effectiveCluster.priorityDriversDetail?.severity.level || result.priority) ===
                    "High"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : (effectiveCluster.priorityDriversDetail?.severity.level ||
                          result.priority) === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {effectiveCluster.priorityDriversDetail?.severity.level || result.priority}{" "}
                  Severity
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {effectiveCluster.priorityDriversDetail?.severity.summary ||
                  `Assigned ${result.priority} severity.`}
              </p>
            </div>

            {/* Driver 3: Pending Duration */}
            <div className="p-4 rounded-[8px] bg-white border border-[#CBD5E1] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> 3. Pending Duration
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {effectiveCluster.priorityDriversDetail?.pendingDuration.durationText ||
                    "24 - 48 Hours"}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {effectiveCluster.priorityDriversDetail?.pendingDuration.summary ||
                  "Derived from synthetic demo dataset records."}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Recommended Municipal Department and Action */}
        <div className="p-4.5 rounded-[10px] bg-[#F0FDF4] border-2 border-[#86EFAC] space-y-3">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-[6px] bg-[#16A34A] text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534] block">
                  Recommended Municipal Department & Action
                </span>
                <h4 className="text-sm font-extrabold text-[#14532D]">
                  {effectiveCluster.recommendedDepartment}
                </h4>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
              Unified Cluster Routing
            </span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-white border border-[#BBF7D0] space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Recommended Municipal Action Plan
            </span>
            <p className="text-xs text-[#1F2937] leading-relaxed font-medium">
              {effectiveCluster.recommendedDepartmentAction}
            </p>
          </div>
        </div>

        {/* 6. Officer Approval Mandatory Before Dispatch Section */}
        <div
          id="officer-approval-dispatch-panel"
          className={`p-5 rounded-[10px] border-2 transition ${
            isDispatched
              ? "bg-[#F0FDF4] border-[#16A34A]"
              : "bg-[#FFFBEB] border-[#F59E0B]"
          }`}
        >
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-[8px] text-white mt-0.5 ${
                  isDispatched ? "bg-[#16A34A]" : "bg-[#D97706]"
                }`}
              >
                {isDispatched ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className={`text-sm font-bold ${
                      isDispatched ? "text-[#14532D]" : "text-[#92400E]"
                    }`}
                  >
                    {isDispatched
                      ? "Field Dispatch Approved by Authorised Officer"
                      : "Officer Approval Mandatory Before Dispatch"}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      isDispatched
                        ? "bg-[#DCFCE7] text-[#166534] border-[#86EFAC]"
                        : "bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
                    }`}
                  >
                    {isDispatched ? "Dispatched" : "Pending Approval"}
                  </span>
                </div>
                <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                  {isDispatched
                    ? `Field work order dispatched and verified by authorised municipal officer at ${
                        dispatchedAt || "recent"
                      }. Municipal unit mobilized to address this incident cluster.`
                    : "Automated dispatch is strictly prohibited by municipal operational protocols. An authorised municipal officer must inspect this incident cluster and explicitly confirm field team deployment."}
                </p>
              </div>
            </div>

            {/* Interactive Dispatch / Revert Action */}
            <div className="flex items-center gap-2">
              {isDispatched ? (
                <button
                  type="button"
                  onClick={handleRecallDispatch}
                  className="text-xs font-semibold px-3 py-2 rounded-[6px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer"
                >
                  Recall / Revise Dispatch
                </button>
              ) : (
                <button
                  type="button"
                  id="officer-approve-dispatch-btn"
                  onClick={handleApproveDispatch}
                  className="text-xs font-bold px-4 py-2.5 rounded-[6px] bg-[#1E40AF] hover:bg-[#1D4ED8] text-white flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-[0.98]"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>Approve Incident Cluster & Dispatch</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional Officer Notes on Dispatch */}
          {!isDispatched && (
            <div className="mt-4 pt-3 border-t border-amber-200/80">
              <label
                htmlFor="officer-dispatch-notes"
                className="block text-[11px] font-bold text-[#92400E] uppercase tracking-wider mb-1"
              >
                Officer Operational Directive / Dispatch Notes (Optional)
              </label>
              <input
                id="officer-dispatch-notes"
                type="text"
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="e.g., Priority clearance for Ward 42 market depot; coordinate with local Sanitary Inspector."
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-amber-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          )}
        </div>

        {/* 7. Collapsible Inspection Table of Matching Records from Synthetic Demo Data */}
        <div className="pt-2 border-t border-[#CBD5E1]">
          <button
            type="button"
            onClick={() => setShowRecordsTable(!showRecordsTable)}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#1E40AF] hover:text-[#0F2942] py-2 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#2563EB]" />
              <span>
                {showRecordsTable ? "Hide" : "Inspect"}{" "}
                {effectiveCluster.matchingRecords.length} Matching Records from Synthetic Demo Data
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                Synthetic demo data
              </span>
            </div>
            {showRecordsTable ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showRecordsTable && (
            <div className="mt-3 space-y-2">
              {effectiveCluster.matchingRecords.length === 0 ? (
                <div className="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-slate-600">
                  No matching records were identified in the {datasetCount} loaded records of the
                  synthetic demo dataset. This complaint represents an isolated single grievance.
                </div>
              ) : (
                <div className="overflow-x-auto border border-[#CBD5E1] rounded-[8px] shadow-2xs">
                  <table className="min-w-full text-xs text-left divide-y divide-[#CBD5E1]">
                    <thead className="bg-[#F8FAFC] text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3 py-2.5">Complaint ID</th>
                        <th className="px-3 py-2.5">Ward</th>
                        <th className="px-3 py-2.5">Language</th>
                        <th className="px-3 py-2.5">Priority</th>
                        <th className="px-3 py-2.5">Synthetic Date</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Original & Translated Complaint</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1] bg-white">
                      {effectiveCluster.matchingRecords.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-2 font-mono font-bold text-[#0F2942]">
                            {rec.id}
                          </td>
                          <td className="px-3 py-2 text-slate-700">{rec.ward}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              {rec.language}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-bold">
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
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                            {rec.timestamp}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-700 max-w-md">
                            <p className="font-medium text-slate-900">{rec.translated_english}</p>
                            {rec.complaint_text !== rec.translated_english && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                                Original: {rec.complaint_text}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                <span>
                  All records above are strictly read from the active synthetic demo CSV. No
                  invented counts or external records are added.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
