import React, { useState } from "react";
import {
  ProofOfActionItem,
  BeforeAfterReview,
  ComplaintCategory,
} from "../types";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Maximize2,
  FileCheck,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface BeforeAfterReviewCardProps {
  review: BeforeAfterReview;
  proofOfAction: ProofOfActionItem;
  category: ComplaintCategory;
  complaint: string;
  beforeEvidenceDataUrl?: string;
  beforeEvidenceType?: "image" | "video";
  onUpdateReview?: (updated: BeforeAfterReview) => void;
}

export const BeforeAfterReviewCard: React.FC<BeforeAfterReviewCardProps> = ({
  review,
  proofOfAction,
  category,
  complaint,
  beforeEvidenceDataUrl,
  beforeEvidenceType,
  onUpdateReview,
}) => {
  const [currentReview, setCurrentReview] = useState<BeforeAfterReview>(review);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleOfficerApprove = () => {
    const updated: BeforeAfterReview = {
      ...currentReview,
      verificationStatus: "Verified & Approved by Officer",
      officerSignedOff: true,
      signedOffAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      officerNotes: "Field remediation inspected and verified satisfactory by Municipal Officer.",
    };
    setCurrentReview(updated);
    onUpdateReview?.(updated);
  };

  const handleOfficerRequestReinspection = () => {
    const updated: BeforeAfterReview = {
      ...currentReview,
      verificationStatus: "Re-inspection Requested",
      officerSignedOff: false,
      signedOffAt: undefined,
      officerNotes:
        "Field inspection flagged residual debris/issues. Work order returned to crew for re-clearing.",
    };
    setCurrentReview(updated);
    onUpdateReview?.(updated);
  };

  const handleRevertVerification = () => {
    const updated: BeforeAfterReview = {
      ...currentReview,
      verificationStatus: "Needs officer verification",
      officerSignedOff: false,
      signedOffAt: undefined,
      officerNotes: undefined,
    };
    setCurrentReview(updated);
    onUpdateReview?.(updated);
  };

  const isSignedOff = currentReview.verificationStatus === "Verified & Approved by Officer";
  const isReinspection = currentReview.verificationStatus === "Re-inspection Requested";
  const isPendingVerification =
    currentReview.verificationStatus === "Needs officer verification";

  return (
    <div
      id="before-after-evidence-review-card"
      className="rounded-[10px] border-2 border-[#17365D] bg-white shadow-sm overflow-hidden"
    >
      {/* Card Header */}
      <div className="bg-[#17365D] text-white px-5 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[8px] bg-[#2D6CDF] text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Before vs After Evidence Review
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[4px] bg-white/10 text-slate-200 border border-white/20">
                Gemini Multimodal Verification
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Comparative analysis of citizen report evidence vs field team remediation photo
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isSignedOff ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified &amp; Approved by Officer</span>
            </div>
          ) : isReinspection ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-rose-500/20 text-rose-300 border border-rose-400/40 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Re-inspection Requested</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Needs officer verification</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Core Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Status Metric */}
          <div
            className={`p-3 rounded-[8px] border ${
              isSignedOff
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : isReinspection
                ? "bg-rose-50/60 border-rose-200 text-rose-900"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Verification Status
            </span>
            <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
              {isSignedOff ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved by Officer</span>
                </>
              ) : isReinspection ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Re-inspection Requested</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Needs officer verification</span>
                </>
              )}
            </div>
            <p className="text-[10px] opacity-80 mt-0.5">
              {isSignedOff
                ? `Signed off at ${currentReview.signedOffAt || "recently"}`
                : "Awaiting municipal supervisor sign-off"}
            </p>
          </div>

          {/* Action Addresses Problem Metric */}
          <div
            className={`p-3 rounded-[8px] border ${
              currentReview.actionAddressesProblem
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
              Addresses Reported Problem
            </span>
            <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
              {currentReview.actionAddressesProblem ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Yes — Problem Remediated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Inconclusive / Incomplete</span>
                </>
              )}
            </div>
            <p className="text-[10px] opacity-80 mt-0.5">
              Based on visual comparison with reported complaint
            </p>
          </div>

          {/* Confidence Metric */}
          <div className="p-3 rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Gemini Assessment Confidence
            </span>
            <div className="text-xs font-bold text-[#17365D] mt-1 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  currentReview.confidence === "High"
                    ? "bg-emerald-500"
                    : currentReview.confidence === "Medium"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
              <span>{currentReview.confidence} Confidence</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Multimodal defect recognition fidelity
            </p>
          </div>
        </div>

        {/* Visual Side-by-Side Comparison Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
              Visual Evidence Comparison
            </span>
            <span className="text-[11px] text-slate-500">
              Click photo to enlarge
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: BEFORE Evidence */}
            <div className="rounded-[8px] border border-[#CBD5E1] bg-[#F8FAFC] overflow-hidden">
              <div className="px-3 py-2 bg-slate-200/80 border-b border-[#CBD5E1] flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  BEFORE: Citizen Grievance Evidence
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {beforeEvidenceType ? `Citizen ${beforeEvidenceType}` : "Initial Report"}
                </span>
              </div>

              <div className="p-3 space-y-2.5">
                {beforeEvidenceDataUrl ? (
                  <div
                    className="relative group rounded-[6px] overflow-hidden border border-slate-300 bg-white h-44 flex items-center justify-center cursor-pointer"
                    onClick={() => setLightboxUrl(beforeEvidenceDataUrl)}
                  >
                    <img
                      src={beforeEvidenceDataUrl}
                      alt="Before citizen report evidence"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-xs font-semibold text-white flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded">
                        <Maximize2 className="w-3 h-3" /> Enlarge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[6px] border border-dashed border-slate-300 bg-white h-44 p-4 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                    <p className="font-semibold text-slate-700 mb-1">
                      Text Grievance Only (No media attached)
                    </p>
                    <p className="text-[11px] line-clamp-3 italic text-slate-600">
                      "{complaint}"
                    </p>
                  </div>
                )}

                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                  <strong>Reported Category:</strong> {category}
                </div>
              </div>
            </div>

            {/* Right: AFTER Evidence */}
            <div className="rounded-[8px] border-2 border-emerald-300 bg-[#F0FDF4]/30 overflow-hidden">
              <div className="px-3 py-2 bg-emerald-100/80 border-b border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  AFTER: Field Team Remediation Photo
                </span>
                <span className="text-[10px] font-medium text-emerald-700">
                  {proofOfAction.uploadedAt || "Post-Action"}
                </span>
              </div>

              <div className="p-3 space-y-2.5">
                <div
                  className="relative group rounded-[6px] overflow-hidden border border-emerald-200 bg-white h-44 flex items-center justify-center cursor-pointer"
                  onClick={() => setLightboxUrl(proofOfAction.dataUrl)}
                >
                  <img
                    src={proofOfAction.dataUrl}
                    alt="After action field evidence"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-xs font-semibold text-white flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded">
                      <Maximize2 className="w-3 h-3" /> Enlarge
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-900 bg-white p-2 rounded border border-emerald-200">
                  <strong>Crew Notes:</strong> {proofOfAction.fieldNotes || "Physical site action completed."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gemini Comparative Findings */}
        <div className="space-y-3 pt-2 border-t border-[#CBD5E1]">
          {/* Visible improvement or unresolved issue */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
              Visible Improvement or Unresolved Issue
            </span>
            <div className="p-3.5 rounded-[8px] bg-[#F8FAFC] border-2 border-[#E2E8F0] text-xs text-[#1F2937] leading-relaxed font-medium">
              {currentReview.visibleImprovementOrUnresolved}
            </div>
          </div>

          {/* Whether action addresses problem explanation */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider block">
              Remediation Assessment
            </span>
            <div className="p-3.5 rounded-[8px] bg-white border border-[#CBD5E1] text-xs text-[#1F2937] leading-relaxed">
              {currentReview.actionAssessmentNote}
            </div>
          </div>
        </div>

        {/* Mandatory Human Officer Approval Protocol (NEVER AUTO-CLOSE) */}
        <div className="rounded-[8px] border-2 border-[#17365D] bg-[#F8FAFC] p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-[8px] bg-[#17365D] text-white shrink-0 mt-0.5">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-[#17365D] uppercase tracking-wider">
                Mandatory Officer Approval Protocol
              </h4>
              <p className="text-xs font-semibold text-[#17365D]">
                Final closure requires authorised municipal officer approval.
              </p>
              <p className="text-xs text-slate-600">
                In strict compliance with municipal administrative governance, NagarNex AI never automatically closes complaints. An authorised officer must inspect the visual proof and sign off.
              </p>
            </div>
          </div>

          {/* Officer Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#CBD5E1]">
            <div className="text-[11px] text-slate-500">
              {isSignedOff ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved &amp; Closed (Prototype Simulation) by Municipal Supervisor ({currentReview.signedOffAt || "Confirmed"})
                </span>
              ) : isReinspection ? (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Dispatched back to field team for re-work (Prototype Simulation)
                </span>
              ) : (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Status: Officer Verification Pending
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSignedOff ? (
                <button
                  type="button"
                  onClick={handleRevertVerification}
                  className="px-3 py-1.5 rounded-[6px] text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Revise Approval
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleOfficerRequestReinspection}
                    className="px-3.5 py-2 rounded-[8px] text-xs font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Request Re-inspection</span>
                  </button>

                  <button
                    type="button"
                    id="btn-officer-approve-resolution"
                    onClick={handleOfficerApprove}
                    className="px-4 py-2 rounded-[8px] text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white transition cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Resolution &amp; Close (Prototype Simulation)</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Strict Storage & Anti-Certainty Disclaimer */}
          <div className="pt-2 border-t border-[#CBD5E1] text-[11px] text-slate-500 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Prototype Governance Disclaimer:</strong> {currentReview.observationCaveat || "Final closure requires authorised municipal officer approval."} All media is synthetic/demo-only and is not permanently stored.
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-[10px] overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-4 py-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800">
                Evidence Inspection Preview
              </span>
              <button
                type="button"
                onClick={() => setLightboxUrl(null)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1"
              >
                Close ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh]">
              <img
                src={lightboxUrl}
                alt="Enlarged Evidence"
                className="max-h-[70vh] max-w-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
