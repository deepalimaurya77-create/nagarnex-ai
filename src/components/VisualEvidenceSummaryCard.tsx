import React, { useState } from "react";
import { VisualEvidenceSummary } from "../types";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Eye,
  X,
  Maximize2,
  Info,
  Film,
} from "lucide-react";

interface VisualEvidenceSummaryCardProps {
  summary: VisualEvidenceSummary | null | undefined;
}

export const VisualEvidenceSummaryCard: React.FC<VisualEvidenceSummaryCardProps> = ({
  summary,
}) => {
  const [showFullImageModal, setShowFullImageModal] = useState<boolean>(false);

  // If no visual evidence was submitted with this complaint
  if (!summary || !summary.hasVisualEvidence) {
    return (
      <div
        id="visual-evidence-empty-card"
        className="rounded-[10px] border border-[#CBD5E1] bg-white p-4 shadow-2xs space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-[6px] bg-slate-100 text-slate-500 border border-slate-200">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17365D]">
              Visual Evidence Summary
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[4px] border border-slate-200">
            No Media Attached
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pl-3 border-l-2 border-slate-300">
          No optional visual evidence was attached by the citizen. Triage classification and priority are based purely on structured text analysis.
        </p>
      </div>
    );
  }

  const confidenceBadge = () => {
    switch (summary.confidenceLevel) {
      case "High":
        return "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]";
      case "Medium":
        return "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]";
      case "Low":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      id="visual-evidence-summary-card"
      className="rounded-[10px] border border-[#CBD5E1] bg-white shadow-2xs overflow-hidden"
    >
      {/* Header */}
      <div className="bg-[#F8FAFC] px-5 py-3.5 border-b border-[#CBD5E1] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-[6px] bg-[#17365D] text-white">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#17365D]">
              Visual Evidence Summary
            </h3>
            <p className="text-[11px] text-slate-500">
              Multimodal Gemini corroboration of citizen-submitted {summary.mediaType === "video" ? "video frame" : "photograph"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-[4px] text-xs font-bold border ${confidenceBadge()}`}
          >
            Confidence: {summary.confidenceLevel}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Visual Inspection Preview & Main Observation */}
        <div className="flex flex-col sm:flex-row items-start gap-4 p-3.5 rounded-[8px] bg-slate-50 border border-[#CBD5E1]">
          {/* Media thumbnail if present */}
          {summary.mediaPreviewUrl && (
            <div className="relative group shrink-0 w-24 h-24 rounded-[6px] overflow-hidden bg-slate-200 border border-[#CBD5E1]">
              <img
                src={summary.mediaPreviewUrl}
                alt="Submitted Visual Evidence"
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition"
                onClick={() => setShowFullImageModal(true)}
              />
              <button
                type="button"
                onClick={() => setShowFullImageModal(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                title="Enlarge inspection preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-mono text-center py-0.5">
                {summary.mediaType === "video" ? "CLIP FRAME" : "PHOTO"}
              </div>
            </div>
          )}

          <div className="space-y-2 flex-1">
            {/* 1. Visible Civic Issue */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Visible Civic Issue
              </span>
              <p className="text-xs font-semibold text-[#1F2937] leading-relaxed">
                {summary.visibleCivicIssue}
              </p>
            </div>

            {/* 2. Category Support Status */}
            <div className="pt-1.5 border-t border-slate-200 flex items-start gap-2">
              {summary.supportsReportedCategory ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {summary.supportsReportedCategory
                    ? "Supports Reported Category: Yes"
                    : "Supports Reported Category: Inconclusive / Divergent"}
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {summary.supportAssessmentNote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Anti-Certainty / No Measurement Notice */}
        <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#2D6CDF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Advisory Prototype Scope:</strong>{" "}
            {summary.observationCaveat ||
              "Visual indicators are advisory only. Prototype analysis does not claim exact damage measurements, structural dimensions, or certainty from images."}
          </p>
        </div>
      </div>

      {/* Lightbox / Modal for Full Inspection Preview */}
      {showFullImageModal && summary.mediaPreviewUrl && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[10px] max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-700">
            <div className="bg-[#17365D] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold">Visual Evidence Full Inspection</span>
              <button
                type="button"
                onClick={() => setShowFullImageModal(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[70vh]">
              <img
                src={summary.mediaPreviewUrl}
                alt="Full preview"
                className="max-h-[65vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-center">
              Session media only • Not permanently stored on server
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
