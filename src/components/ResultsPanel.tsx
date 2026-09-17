import React, { useState } from "react";
import {
  AnalysisResult,
  ComplaintFormData,
  ProofOfActionItem,
  BeforeAfterReview,
  ComplaintTrackingStatus,
  ComplaintTimelineTimestamps,
} from "../types";
import { IncidentIntelligenceSection } from "./IncidentIntelligenceSection";
import { IncidentClusterCard } from "./IncidentClusterCard";
import { ExplainablePriorityCard } from "./ExplainablePriorityCard";
import { RecommendedDispatchPlanCard } from "./RecommendedDispatchPlanCard";
import { VisualEvidenceSummaryCard } from "./VisualEvidenceSummaryCard";
import { ProofOfActionSection } from "./ProofOfActionSection";
import { BeforeAfterReviewCard } from "./BeforeAfterReviewCard";
import {
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Droplets,
  Lightbulb,
  Copy,
  Check,
  Code2,
  Clock,
  Layers,
} from "lucide-react";

interface ResultsPanelProps {
  result: AnalysisResult;
  formData: ComplaintFormData;
  timestamp: string;
  datasetCount?: number;
  onUpdateResult?: (
    updated: Partial<AnalysisResult>,
    trackingStatus?: ComplaintTrackingStatus,
    timelineTimestamps?: Partial<ComplaintTimelineTimestamps>
  ) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  formData,
  timestamp,
  datasetCount = 100,
  onUpdateResult,
}) => {
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [showRawJSON, setShowRawJSON] = useState(false);

  // Dispatch & Proof-of-Action workflow state
  const [isDispatched, setIsDispatched] = useState<boolean>(
    result.isDispatched ?? (result.dispatchPlan?.officerConfirmed || false)
  );
  const [proofOfAction, setProofOfAction] = useState<ProofOfActionItem | null>(
    result.proofOfAction || null
  );
  const [beforeAfterReview, setBeforeAfterReview] = useState<BeforeAfterReview | null>(
    result.beforeAfterReview || null
  );

  const handleDispatchChange = (
    dispatched: boolean,
    time?: string | null,
    notes?: string
  ) => {
    setIsDispatched(dispatched);
    const now = time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const trackingStatus: ComplaintTrackingStatus = dispatched
      ? "Assigned to Department"
      : "Under AI Review";
    onUpdateResult?.(
      {
        isDispatched: dispatched,
        dispatchedAt: dispatched ? now : null,
      },
      trackingStatus,
      { assignedAt: dispatched ? now : null }
    );
  };

  const handleVerificationComplete = (
    proof: ProofOfActionItem,
    review: BeforeAfterReview
  ) => {
    setProofOfAction(proof);
    setBeforeAfterReview(review);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const trackingStatus: ComplaintTrackingStatus = review.officerSignedOff
      ? "Closed"
      : "Officer Verification Pending";
    onUpdateResult?.(
      {
        proofOfAction: proof,
        beforeAfterReview: review,
      },
      trackingStatus,
      {
        evidenceUploadedAt: proof.uploadedAt || now,
        verificationPendingAt: now,
        closedAt: review.officerSignedOff ? now : null,
      }
    );
  };

  const handleUpdateReview = (updated: BeforeAfterReview) => {
    setBeforeAfterReview(updated);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const trackingStatus: ComplaintTrackingStatus = updated.officerSignedOff
      ? "Closed"
      : updated.verificationStatus === "Re-inspection Requested"
      ? "Field Team Evidence Uploaded"
      : "Officer Verification Pending";
    onUpdateResult?.(
      {
        beforeAfterReview: updated,
      },
      trackingStatus,
      {
        verificationPendingAt:
          updated.verificationStatus === "Needs officer verification" ? now : undefined,
        closedAt: updated.officerSignedOff ? updated.signedOffAt || now : null,
      }
    );
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "Garbage/Sanitation":
        return {
          icon: Trash2,
          color: "text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]",
          badge: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
          dept: "Department of Solid Waste Management & Public Health",
        };
      case "Water Supply":
        return {
          icon: Droplets,
          color: "text-[#2D6CDF] bg-[#EFF6FF] border-[#BFDBFE]",
          badge: "bg-[#EFF6FF] text-[#2D6CDF] border-[#BFDBFE]",
          dept: "Water Supply & Sewerage Board (Jal Board)",
        };
      case "Streetlights":
        return {
          icon: Lightbulb,
          color: "text-[#D97706] bg-[#FEF3C7] border-[#FDE68A]",
          badge: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
          dept: "Electrical & Public Lighting Division",
        };
      default:
        return {
          icon: Layers,
          color: "text-slate-700 bg-slate-50 border-[#CBD5E1]",
          badge: "bg-slate-100 text-slate-800 border-[#CBD5E1]",
          dept: "General Municipal Services",
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "High":
        return {
          badge: "bg-[#FDF2F2] text-[#C2413B] border-[#F87171]",
          icon: AlertTriangle,
          dotColor: "bg-[#C2413B]",
          sla: "Prototype target: 4 - 8 Hours (High Priority Emergency)",
        };
      case "Medium":
        return {
          badge: "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]",
          icon: Clock,
          dotColor: "bg-[#D97706]",
          sla: "Prototype target: 24 - 48 Hours (Standard Civic Triage)",
        };
      case "Low":
      default:
        return {
          badge: "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]",
          icon: CheckCircle2,
          dotColor: "bg-[#16A34A]",
          sla: "Prototype target: 48 - 72 Hours (Routine Maintenance)",
        };
    }
  };

  const categoryCfg = getCategoryConfig(result.category);
  const priorityCfg = getPriorityConfig(result.priority);
  const CategoryIcon = categoryCfg.icon;
  const PriorityIcon = priorityCfg.icon;

  const rawJsonOutput = JSON.stringify(
    {
      category: result.category,
      priority: result.priority,
      reason: result.reason,
      suggestedAction: result.suggestedAction,
      ...(result.detectedLanguage ? { detectedLanguage: result.detectedLanguage } : {}),
      ...(result.translatedEnglishSummary ? { translatedEnglishSummary: result.translatedEnglishSummary } : {}),
      city: formData.city,
      ward: formData.ward || "Unspecified",
      triageTimestamp: timestamp,
      incidentCluster: result.incidentCluster
        ? {
            clusterId: result.incidentCluster.clusterId,
            relatedCount: result.incidentCluster.relatedCount,
            languagesRepresented: result.incidentCluster.languagesRepresented,
            repeatedIssuePattern: result.incidentCluster.repeatedIssuePattern,
            priorityDrivers: result.incidentCluster.priorityDrivers,
            recommendedDepartmentAction: result.incidentCluster.recommendedDepartmentAction,
            matchingRecordsCount: result.incidentCluster.matchingRecords.length,
          }
        : null,
      explainablePriority: result.explainablePriority || null,
      dispatchPlan: result.dispatchPlan || null,
      visualEvidenceSummary: result.visualEvidenceSummary || null,
      isDispatched,
      proofOfAction: proofOfAction || null,
      beforeAfterReview: beforeAfterReview || null,
    },
    null,
    2
  );

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(rawJsonOutput);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  return (
    <div id="results-panel" className="bg-white rounded-[10px] shadow-sm border border-[#CBD5E1] overflow-hidden">
      {/* Top Banner */}
      <div className="bg-[#17365D] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#CBD5E1]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Layers className="w-4 h-4 text-slate-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base text-white">
                Multilingual Civic Incident Intelligence
              </h2>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-[4px] bg-white/10 text-slate-200 border border-white/20">
                Gemini AI + Dataset Engine
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Jurisdiction: {formData.city} • {formData.ward || "All-Ward Queue"} • Triaged {timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRawJSON(!showRawJSON)}
            className="text-xs px-2.5 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center gap-1.5 transition border border-white/20 cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-300" />
            <span>{showRawJSON ? "Hide JSON" : "View Intelligence JSON"}</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Core Triage Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Card */}
          <div className="rounded-[10px] border border-[#CBD5E1] p-4 bg-white hover:bg-slate-50/50 transition shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Assigned Category
            </span>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-[8px] border ${categoryCfg.color}`}>
                <CategoryIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#1F2937]">{result.category}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{categoryCfg.dept}</p>
              </div>
            </div>
          </div>

          {/* Priority Card */}
          <div className="rounded-[10px] border border-[#CBD5E1] p-4 bg-white hover:bg-slate-50/50 transition shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Assigned Priority
            </span>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-[8px] border flex items-center justify-center font-bold text-base ${priorityCfg.badge}`}
              >
                <PriorityIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-bold border ${priorityCfg.badge}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${priorityCfg.dotColor}`} />
                    {result.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 font-medium">{priorityCfg.sla}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Evidence Summary (Multimodal Gemini verification of citizen-submitted photo or short video frame) */}
        <VisualEvidenceSummaryCard summary={result.visualEvidenceSummary} />

        {/* Incident Intelligence Section (Cluster Identification & Recurrence Analysis) */}
        <IncidentIntelligenceSection
          cluster={result.incidentCluster || null}
          formData={formData}
          result={result}
          datasetCount={datasetCount}
          isDispatched={isDispatched}
          dispatchedAt={result.dispatchedAt || (isDispatched ? timestamp : null)}
          onDispatchChange={handleDispatchChange}
        />

        {/* 2. Explainable Priority Section */}
        {result.explainablePriority ? (
          <ExplainablePriorityCard explainablePriority={result.explainablePriority} />
        ) : (
          <div className="rounded-[10px] border border-[#CBD5E1] p-4 bg-white shadow-2xs">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#17365D]">Triage Reason</h3>
            </div>
            <p className="text-sm text-[#1F2937] leading-relaxed font-sans pl-3.5 border-l-2 border-[#2D6CDF]">
              {result.reason}
            </p>
          </div>
        )}

        {/* 3. Recommended Dispatch Plan Section (With mandatory human officer confirmation) */}
        {result.dispatchPlan && (
          <RecommendedDispatchPlanCard
            dispatchPlan={result.dispatchPlan}
            city={formData.city}
            ward={formData.ward || "All-Ward"}
            isDispatched={isDispatched}
            onDispatchChange={handleDispatchChange}
          />
        )}

        {/* 4. Proof of Action & Before vs After Evidence Review (Revealed after officer confirms dispatch) */}
        {isDispatched && (
          <div className="space-y-5">
            <ProofOfActionSection
              category={result.category}
              complaint={formData.complaint}
              city={formData.city}
              ward={formData.ward || "All-Ward"}
              beforeEvidenceDataUrl={formData.visualEvidence?.dataUrl}
              beforeEvidenceType={formData.visualEvidence?.type}
              initialProof={proofOfAction}
              onVerificationComplete={handleVerificationComplete}
            />

            {beforeAfterReview && proofOfAction && (
              <BeforeAfterReviewCard
                review={beforeAfterReview}
                proofOfAction={proofOfAction}
                category={result.category}
                complaint={formData.complaint}
                beforeEvidenceDataUrl={formData.visualEvidence?.dataUrl}
                beforeEvidenceType={formData.visualEvidence?.type}
                onUpdateReview={handleUpdateReview}
              />
            )}
          </div>
        )}

        {/* Translation & Multilingual Summary (If complaint was in Hindi or Hinglish) */}
        {(result.translatedEnglishSummary || result.detectedLanguage) && (
          <div className="rounded-[10px] border border-[#CBD5E1] p-4 bg-white text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#17365D] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6CDF]" />
                Linguistic Analysis &amp; English Translation
              </span>
              {result.detectedLanguage && (
                <span className="px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-slate-700 font-medium text-[11px] border border-[#CBD5E1]">
                  Detected Language: {result.detectedLanguage}
                </span>
              )}
            </div>
            {result.translatedEnglishSummary && (
              <p className="text-[#1F2937] italic bg-[#F8FAFC] p-2.5 rounded-[6px] border border-[#CBD5E1] leading-relaxed">
                "{result.translatedEnglishSummary}"
              </p>
            )}
          </div>
        )}

        {/* Structured JSON Output */}
        {showRawJSON && (
          <div className="rounded-[10px] border border-[#CBD5E1] bg-[#0F2440] p-4 text-white overflow-hidden shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#234570]">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Code2 className="w-4 h-4 text-[#93C5FD]" />
                <span>Structured Incident Intelligence JSON (Gemini + Synthetic Search)</span>
              </div>
              <button
                type="button"
                onClick={handleCopyJSON}
                className="text-xs px-2.5 py-1 rounded-[6px] bg-[#1E3A63] hover:bg-[#2B4B75] text-slate-200 hover:text-white flex items-center gap-1 transition border border-[#2B4B75] cursor-pointer"
              >
                {copiedJSON ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-3 leading-relaxed bg-black/30 rounded-[6px] border border-[#234570]">
              {rawJsonOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
