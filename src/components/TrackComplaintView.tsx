import React, { useState, useEffect } from "react";
import { QueueItem } from "./OfficerConsoleView";
import { ComplaintTrackingStatus } from "../types";
import {
  Search,
  CheckCircle2,
  Clock,
  Camera,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Building2,
  MapPin,
  Tag,
  X,
  Eye,
  Image as ImageIcon,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";

interface TrackComplaintViewProps {
  queue: QueueItem[];
  initialTrackingId?: string | null;
  onSelectQueueItem?: (item: QueueItem) => void;
  onSwitchToReportIssue?: () => void;
  onSwitchToOfficerConsole?: (item?: QueueItem) => void;
}

const TIMELINE_STAGES: {
  key: ComplaintTrackingStatus;
  label: string;
  description: string;
  stageNumber: number;
}[] = [
  {
    key: "Received",
    label: "Received",
    description: "Complaint safely registered into municipal intake queue.",
    stageNumber: 1,
  },
  {
    key: "Under AI Review",
    label: "Under AI Review",
    description: "Gemini multilingual classification, priority triage, and incident clustering completed.",
    stageNumber: 2,
  },
  {
    key: "Assigned to Department",
    label: "Assigned to Department",
    description: "Work order confirmed and dispatched to zonal maintenance unit.",
    stageNumber: 3,
  },
  {
    key: "Field Team Evidence Uploaded",
    label: "Field Team Evidence Uploaded",
    description: "Maintenance crew completed site remediation and submitted after-action photo evidence.",
    stageNumber: 4,
  },
  {
    key: "Officer Verification Pending",
    label: "Officer Verification Pending",
    description: "Comparative multimodal review ready; awaiting authorised supervisory inspection.",
    stageNumber: 5,
  },
  {
    key: "Closed",
    label: "Closed",
    description: "Final resolution inspected and signed off by authorised municipal officer (Prototype simulation).",
    stageNumber: 6,
  },
];

const STAGE_ORDER: Record<ComplaintTrackingStatus, number> = {
  Received: 1,
  "Under AI Review": 2,
  "Assigned to Department": 3,
  "Field Team Evidence Uploaded": 4,
  "Officer Verification Pending": 5,
  Closed: 6,
};

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  queue,
  initialTrackingId,
  onSelectQueueItem,
  onSwitchToReportIssue,
  onSwitchToOfficerConsole,
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialTrackingId || "");
  const [selectedTicket, setSelectedTicket] = useState<QueueItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialTrackingId));
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);

  // If initialTrackingId is provided or changes (e.g. from citizen report receipt), locate ticket
  useEffect(() => {
    if (initialTrackingId) {
      setSearchInput(initialTrackingId);
      const found = queue.find(
        (q) => q.referenceId.trim().toUpperCase() === initialTrackingId.trim().toUpperCase()
      );
      if (found) {
        setSelectedTicket(found);
        setHasSearched(true);
      }
    }
  }, [initialTrackingId, queue]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    setHasSearched(true);
    const found = queue.find(
      (q) =>
        q.referenceId.trim().toUpperCase() === query ||
        q.id.toUpperCase() === query
    );
    setSelectedTicket(found || null);
  };

  const handleCopyTrackingId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Determine current stage index for the selected ticket
  // Default to Received (stage 1) if unspecified so newly submitted complaints start at Received
  const currentStatus: ComplaintTrackingStatus = selectedTicket?.trackingStatus || "Received";
  const currentStageNum = STAGE_ORDER[currentStatus] || 1;

  // Has reached Field Team Evidence Uploaded stage or beyond
  const hasReachedFieldEvidence =
    currentStageNum >= 4 ||
    Boolean(selectedTicket?.result?.proofOfAction) ||
    currentStatus === "Field Team Evidence Uploaded" ||
    currentStatus === "Officer Verification Pending" ||
    currentStatus === "Closed";

  // Check if closed/verified by officer
  const isResolvedAndVerified =
    currentStatus === "Closed" ||
    Boolean(selectedTicket?.result?.beforeAfterReview?.officerSignedOff);

  // Upload time resolution
  const fieldEvidenceUploadTime =
    selectedTicket?.result?.proofOfAction?.uploadedAt ||
    selectedTicket?.timelineTimestamps?.evidenceUploadedAt ||
    selectedTicket?.timelineTimestamps?.verificationPendingAt ||
    "09:10 AM";

  // Get timestamp for each stage
  const getStageTimestamp = (stageKey: ComplaintTrackingStatus): string | null => {
    if (!selectedTicket) return null;
    const timestamps = selectedTicket.timelineTimestamps;
    const baseTime = selectedTicket.timestamp;

    switch (stageKey) {
      case "Received":
        return timestamps?.receivedAt || baseTime;
      case "Under AI Review":
        return timestamps?.aiReviewedAt || (currentStageNum >= 2 ? baseTime : null);
      case "Assigned to Department":
        return timestamps?.assignedAt || (currentStageNum >= 3 ? selectedTicket.result?.dispatchedAt || null : null);
      case "Field Team Evidence Uploaded":
        return timestamps?.evidenceUploadedAt || (currentStageNum >= 4 ? selectedTicket.result?.proofOfAction?.uploadedAt || null : null);
      case "Officer Verification Pending":
        return timestamps?.verificationPendingAt || (currentStageNum >= 5 ? selectedTicket.result?.beforeAfterReview ? "10:40 AM" : null : null);
      case "Closed":
        return timestamps?.closedAt || (currentStageNum >= 6 ? selectedTicket.result?.beforeAfterReview?.signedOffAt || null : null);
      default:
        return null;
    }
  };

  // Fallback after photo if proof dataUrl is not set but reached stage
  const defaultAfterPhotoUrl =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><rect width='320' height='240' fill='%23f0fdf4'/><rect x='40' y='40' width='240' height='160' fill='%23dcfce7' rx='8'/><circle cx='160' cy='120' r='30' fill='%2322c55e' opacity='0.25'/><path d='M130 120 L 150 140 L 190 100' stroke='%2316a34a' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='160' y='180' font-family='sans-serif' font-size='11' font-weight='bold' fill='%2315803d' text-anchor='middle'>Field Remediation Completion Proof</text></svg>";

  const citizenBeforeMediaUrl =
    selectedTicket?.formData.visualEvidence?.dataUrl ||
    selectedTicket?.result?.visualEvidenceSummary?.mediaPreviewUrl;

  const fieldAfterMediaUrl =
    selectedTicket?.result?.proofOfAction?.dataUrl || defaultAfterPhotoUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Transparent Tracking Notice */}
      <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D6CDF] block mb-1">
              Public Transparency Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17365D]">
              Track Complaint Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enter your complaint tracking ID to inspect real-time progress, dispatch timeline, and verified completion evidence.
            </p>
          </div>

          {/* New Report Shortcut */}
          {onSwitchToReportIssue && (
            <button
              type="button"
              onClick={onSwitchToReportIssue}
              className="self-start sm:self-center px-3.5 py-2 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#17365D] text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#2D6CDF]" />
              <span>Report an Issue</span>
            </button>
          )}
        </div>

        {/* Mandatory Demo Tracking Notice */}
        <div className="bg-[#EFF6FF] border-l-4 border-[#2D6CDF] p-3.5 rounded-[6px] text-xs text-[#1F2937]">
          <p className="font-semibold text-[#17365D]">
            Demo tracking only. This prototype does not create an official municipal ticket.
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Demonstrates transparent citizen progress updates across intake, AI triage, dispatch, field action proof, and supervisory sign-off.
          </p>
        </div>

        {/* Search Bar - Citizen must enter their specific tracking ID */}
        <form onSubmit={handleSearch} className="pt-2">
          <label htmlFor="input-tracking-id" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
            Enter Complaint Tracking ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="input-tracking-id"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. CP-DEMO-2026-XXXX"
                className="w-full text-sm font-mono uppercase rounded-[8px] border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-[#1F2937] placeholder:text-slate-400 focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSelectedTicket(null);
                    setHasSearched(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              id="btn-track-submit"
              className="px-5 py-2.5 rounded-[8px] bg-[#17365D] hover:bg-[#0F2440] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint</span>
            </button>
          </div>
        </form>

        {/* Informational Privacy Note: Strictly no public list or personal data */}
        <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
          <span>
            <strong>Confidential Grievance Retrieval:</strong> Citizens can view resolution progress and evidence only by providing their own tracking ID. No public list or personal identities are exposed.
          </span>
        </div>
      </div>

      {/* Ticket Tracking Details & Timeline Card */}
      {selectedTicket ? (
        <div className="space-y-6">
          {/* Main Status & Metadata Card */}
          <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header: Tracking ID, Current Status, and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#CBD5E1]">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Complaint Tracking Reference
                </span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono font-bold text-lg text-[#17365D]">
                    {selectedTicket.referenceId}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyTrackingId(selectedTicket.referenceId)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
                    title="Copy Tracking ID"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold text-[11px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span className="text-[11px]">Copy ID</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[#E0E7FF] text-[#1E40AF]">
                    Citizen Portal Demo
                  </span>
                </div>
              </div>

              {/* Status Badge & "View Before & After Evidence" Button */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visible Button: "View Before & After Evidence" when reached Field Team Evidence Uploaded */}
                {hasReachedFieldEvidence && (
                  <button
                    type="button"
                    id="btn-view-before-after-header"
                    onClick={() => setShowEvidenceModal(true)}
                    className="px-3.5 py-2 rounded-[8px] bg-[#17365D] hover:bg-[#0F2440] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>View Before &amp; After Evidence</span>
                  </button>
                )}

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border text-xs font-bold bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]">
                  <span className="w-2 h-2 rounded-full bg-[#2D6CDF] animate-pulse" />
                  <span>{currentStatus}</span>
                </div>
              </div>
            </div>

            {/* Strictly Compliant Summary Grid:
                "Show only city, ward, issue category, status, and timestamps.
                 Do not collect or show names, phone numbers, addresses, or personal data." */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-4 text-xs">
              {/* 1. City */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  City / Municipality
                </span>
                <p className="font-bold text-sm text-[#1F2937]">
                  {selectedTicket.formData.city}
                </p>
              </div>

              {/* 2. Ward */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  Ward / Locality
                </span>
                <p className="font-bold text-sm text-[#1F2937]">
                  {selectedTicket.formData.ward || "General Area"}
                </p>
              </div>

              {/* 3. Issue Category */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  Issue Category
                </span>
                <p className="font-bold text-sm text-[#1F2937]">
                  {selectedTicket.result?.category || "Processing..."}
                </p>
              </div>

              {/* 4. Timestamps */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  Intake &amp; Timestamps
                </span>
                <p className="font-semibold text-xs text-[#1F2937]">
                  Received: {selectedTicket.timelineTimestamps?.receivedAt || selectedTicket.timestamp}
                </p>
                <p className="text-[11px] text-slate-500">
                  Last update: {getStageTimestamp(currentStatus) || selectedTicket.timestamp}
                </p>
              </div>
            </div>

            {/* Privacy Compliance Banner */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] px-3.5 py-2 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                <strong>Privacy by Design:</strong> In strict compliance with citizen privacy protocols, no personal names, phone numbers, or private residential addresses are collected or displayed.
              </span>
            </div>

            {/* Status Timeline Section */}
            <div className="pt-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2D6CDF]" />
                    Resolution Lifecycle Timeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chronological progression from intake to supervisory closure.
                  </p>
                </div>

                {/* Visible Button in timeline if reached Field Team Evidence Uploaded */}
                {hasReachedFieldEvidence && (
                  <button
                    type="button"
                    onClick={() => setShowEvidenceModal(true)}
                    className="self-start sm:self-center px-3 py-1.5 rounded-[6px] bg-[#2D6CDF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>View Before &amp; After Evidence</span>
                  </button>
                )}
              </div>

              {/* Timeline Stepper: Only completed or current stages are marked; upcoming are pending */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#CBD5E1]">
                {TIMELINE_STAGES.map((stage) => {
                  const stageNum = stage.stageNumber;
                  const isCompleted =
                    stageNum < currentStageNum ||
                    (stageNum === currentStageNum && stage.key === "Closed");
                  const isCurrent = stageNum === currentStageNum && stage.key !== "Closed";
                  const isUpcoming = stageNum > currentStageNum;
                  const stageTime = getStageTimestamp(stage.key);

                  return (
                    <div key={stage.key} className="relative group">
                      {/* Step Indicator Dot / Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-[#16A34A] text-white ring-4 ring-emerald-50"
                            : isCurrent
                            ? "bg-[#2D6CDF] text-white ring-4 ring-blue-100 animate-pulse"
                            : "bg-white border-2 border-[#CBD5E1] text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        ) : (
                          <span className="text-[10px] font-bold">{stageNum}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div
                        className={`rounded-[8px] border p-4 transition-all ${
                          isCurrent
                            ? "bg-[#EFF6FF] border-[#BFDBFE] shadow-2xs"
                            : isCompleted
                            ? "bg-white border-[#E2E8F0]"
                            : "bg-[#F8FAFC]/50 border-dashed border-[#CBD5E1] opacity-75"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? "text-[#1E40AF]"
                                  : isCompleted
                                  ? "text-[#17365D]"
                                  : "text-slate-500"
                              }`}
                            >
                              {stage.label}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-[4px] bg-[#2D6CDF] text-white text-[10px] font-bold">
                                Current Stage
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                Completed ✓
                              </span>
                            )}
                          </div>

                          {/* Timestamp display */}
                          {stageTime && (isCompleted || isCurrent) ? (
                            <span className="text-[11px] font-medium font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {stageTime}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Pending previous stage
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {stage.description}
                        </p>

                        {/* Extra contextual details for active stage */}
                        {stage.key === "Assigned to Department" && isCompleted && (
                          <div className="mt-2 text-[11px] text-blue-800 bg-blue-50/70 p-2 rounded border border-blue-200">
                            <strong>Dispatch Plan:</strong> Confirmed by municipal officer. Zonal vehicle and field workforce assigned.
                          </div>
                        )}

                        {/* When stage 4 is reached or completed, provide quick action */}
                        {stage.key === "Field Team Evidence Uploaded" && (isCompleted || isCurrent) && (
                          <div className="mt-3 p-3 rounded-[6px] bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <Camera className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>Field crew after-action evidence uploaded</span>
                              </div>
                              <span className="text-[11px] font-mono text-indigo-700">
                                {fieldEvidenceUploadTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-indigo-800">
                              Site remediation photograph submitted by the maintenance crew is available for comparative citizen inspection.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowEvidenceModal(true)}
                              className="px-3 py-1.5 rounded-[6px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Before &amp; After Evidence</span>
                            </button>
                          </div>
                        )}

                        {stage.key === "Officer Verification Pending" && isCurrent && (
                          <div className="mt-2 text-[11px] text-purple-800 bg-purple-50/70 p-2 rounded border border-purple-200">
                            Supervisory review in progress. Final closure requires authorised municipal officer approval.
                          </div>
                        )}

                        {stage.key === "Closed" && isCompleted && (
                          <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                            Resolution certified satisfactory. Prototype work order closed.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test / Simulation Helper Box */}
            <div className="mt-6 pt-4 border-t border-[#CBD5E1] bg-[#F8FAFC] p-4 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-[#17365D]">Want to test officer workflow updates live?</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  In the <strong>Officer Console (Demo)</strong>, confirming dispatch, uploading field photo proof, or signing off verification instantly updates this tracking timeline.
                </p>
              </div>

              {onSwitchToOfficerConsole && (
                <button
                  type="button"
                  onClick={() => onSwitchToOfficerConsole(selectedTicket)}
                  className="px-3.5 py-2 rounded-[6px] bg-[#17365D] hover:bg-[#0F2440] text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <span>Open in Officer Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        /* No Complaint Found State */
        <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-8 text-center space-y-4 shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#17365D]">No Complaint Found</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              We could not find any active complaint with tracking ID{" "}
              <strong className="font-mono text-[#17365D]">{searchInput}</strong> in this browser session.
            </p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-4 max-w-md mx-auto text-left text-xs space-y-2 text-slate-600">
            <p className="font-semibold text-[#17365D] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#2D6CDF]" />
              Tracking Tips:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Verify the tracking format matches <strong className="font-mono">CP-DEMO-2026-XXXX</strong>.</li>
              <li>If you recently submitted an issue, use the tracking ID from your confirmation receipt.</li>
              <li>Grievance tracking records are maintained strictly within this browser session memory.</li>
            </ul>
          </div>
          {onSwitchToReportIssue && (
            <button
              type="button"
              onClick={onSwitchToReportIssue}
              className="px-4 py-2 rounded-[8px] bg-[#17365D] hover:bg-[#0F2440] text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Report a New Issue</span>
            </button>
          )}
        </div>
      ) : (
        /* Default Empty State when visiting Track Complaint without an ID */
        <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-8 text-center space-y-5 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center mx-auto text-[#2D6CDF]">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-[#17365D]">
              Enter Your Complaint Tracking ID
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens can inspect their resolution timeline, dispatch status, and field-team before &amp; after photographic proof only after entering their unique tracking ID.
            </p>
          </div>

          {/* Privacy & Confidentiality Guarantee Box */}
          <div className="max-w-lg mx-auto bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-[#17365D] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>Confidentiality &amp; Anonymity Assured</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              In accordance with municipal privacy by design principles, no public directory of all grievances is shown. Only the authorized citizen possessing the tracking reference code can view progress.
            </p>
            <div className="border-t border-[#E2E8F0] pt-2 text-[11px] text-slate-500">
              <strong className="text-slate-700">Prototype Demo Helper:</strong> You can submit a new grievance in the <em>Report an Issue</em> tab to generate a tracking ID, or test with sample code <span className="font-mono font-bold text-[#17365D] bg-slate-100 px-1 py-0.5 rounded cursor-pointer" onClick={() => { setSearchInput("CP-DEMO-2026-3150"); }} title="Click to insert">CP-DEMO-2026-3150</span> (Water Supply in Bellandur).
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Side-by-Side Comparison Modal: Before & After Evidence
          - Before: citizen-submitted evidence
          - After: field-team completion evidence
          - Upload time & clear status:
            "Evidence uploaded — officer verification pending"
            or
            "Resolved — verified by authorised officer"
          - Only viewable after entering complaint tracking ID
          - No personal data, prototype/demo workflow
         ========================================================================= */}
      {showEvidenceModal && selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="bg-white rounded-[12px] border border-[#CBD5E1] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#17365D] text-white px-5 py-4 flex items-center justify-between gap-3 border-b border-[#122B4A]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-[8px] bg-[#2D6CDF] text-white">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Before &amp; After Evidence Review
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Tracking ID: <span className="font-mono font-bold">{selectedTicket.referenceId}</span> • {selectedTicket.formData.city}, {selectedTicket.formData.ward || "Zonal Ward"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="p-1.5 rounded-[6px] hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Close comparison"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Prominent Status Banner */}
              <div
                className={`p-4 rounded-[8px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isResolvedAndVerified
                    ? "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]"
                    : "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isResolvedAndVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-[#2D6CDF] shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-sm block">
                      {isResolvedAndVerified
                        ? "Resolved — verified by authorised officer"
                        : "Evidence uploaded — officer verification pending"}
                    </span>
                    <p className="text-[11px] opacity-80 mt-0.5">
                      {isResolvedAndVerified
                        ? "Field completion evidence has been audited, approved, and officially signed off by the municipal supervisory officer."
                        : "Field maintenance crew has submitted post-remediation evidence. Awaiting final supervisory verification approval."}
                    </p>
                  </div>
                </div>

                {/* Upload Time Badge */}
                <div className="shrink-0 bg-white/90 border border-current px-3 py-1.5 rounded-[6px] text-right font-mono text-[11px]">
                  <span className="text-[10px] block opacity-75 font-sans">Evidence Upload Time</span>
                  <strong>{fieldEvidenceUploadTime}</strong>
                </div>
              </div>

              {/* Side-by-Side Evidence Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Column 1: Before Evidence */}
                <div className="rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#2D6CDF]" />
                      Before: Citizen-Submitted Evidence
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Report Intake
                    </span>
                  </div>

                  {/* Media Visual Frame */}
                  <div className="relative rounded-[8px] overflow-hidden border border-[#CBD5E1] bg-slate-100 flex items-center justify-center min-h-[190px] max-h-[220px]">
                    {citizenBeforeMediaUrl ? (
                      <img
                        src={citizenBeforeMediaUrl}
                        alt="Citizen submitted evidence"
                        className="w-full h-full object-cover max-h-[220px]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-4 text-center space-y-2 text-slate-500">
                        <FileText className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-xs font-semibold">Text Grievance Report</p>
                        <p className="text-[11px] text-slate-400 italic">
                          No photographic media was attached during initial intake.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Description / Caption */}
                  <div className="flex-1 space-y-1.5 text-[11px] text-slate-600 bg-white p-3 rounded-[6px] border border-[#E2E8F0]">
                    <p className="font-semibold text-slate-700">Reported Issue Summary:</p>
                    <p className="line-clamp-3 leading-relaxed">
                      {selectedTicket.result?.visualEvidenceSummary?.visibleCivicIssue ||
                        selectedTicket.formData.complaint}
                    </p>
                    <div className="pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-slate-400">
                      <span>Category: {selectedTicket.result?.category}</span>
                      <span>Recorded: {selectedTicket.timelineTimestamps?.receivedAt || selectedTicket.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: After Evidence */}
                <div className="rounded-[10px] border border-[#CBD5E1] bg-[#F8FAFC] p-4 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#17365D] uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#16A34A]" />
                      After: Field-Team Completion Evidence
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Field Remediation
                    </span>
                  </div>

                  {/* Media Visual Frame */}
                  <div className="relative rounded-[8px] overflow-hidden border border-[#CBD5E1] bg-slate-100 flex items-center justify-center min-h-[190px] max-h-[220px]">
                    <img
                      src={fieldAfterMediaUrl}
                      alt="Field team completion proof"
                      className="w-full h-full object-cover max-h-[220px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Field Team Notes & Upload Info */}
                  <div className="flex-1 space-y-1.5 text-[11px] text-slate-600 bg-white p-3 rounded-[6px] border border-[#E2E8F0]">
                    <p className="font-semibold text-slate-700">Field Workforce Action Report:</p>
                    <p className="line-clamp-3 leading-relaxed">
                      {selectedTicket.result?.proofOfAction?.fieldNotes ||
                        "Physical rectification, site clearance, and operational restoration completed on site by dispatched municipal crew."}
                    </p>
                    <div className="pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] text-slate-400">
                      <span>File: {selectedTicket.result?.proofOfAction?.name || "field_remediation.jpg"}</span>
                      <span className="font-mono text-slate-500 font-medium">Uploaded: {fieldEvidenceUploadTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparative Assessment Insights if available */}
              {selectedTicket.result?.beforeAfterReview && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#17365D]">
                    <Sparkles className="w-4 h-4 text-[#2D6CDF]" />
                    <span>Multimodal Comparative Assessment</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {selectedTicket.result.beforeAfterReview.visibleImprovementOrUnresolved}
                  </p>
                  <div className="flex items-center gap-4 text-[11px] pt-1 text-slate-500 flex-wrap">
                    <span>
                      Addresses Problem:{" "}
                      <strong className="text-emerald-700">
                        {selectedTicket.result.beforeAfterReview.actionAddressesProblem ? "Yes — Verified" : "Under Review"}
                      </strong>
                    </span>
                    <span>
                      Confidence:{" "}
                      <strong className="text-[#17365D]">
                        {selectedTicket.result.beforeAfterReview.confidence}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Mandatory Municipal Authority & Privacy Disclaimer */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-[6px] p-3 text-[11px] text-amber-900 space-y-1">
                <p className="font-semibold">
                  Final closure requires authorised municipal officer approval.
                </p>
                <p className="text-amber-800">
                  Prototype demo review. Media is synthetic/demo-only and not permanently stored. Zero citizen personal data (no names, phones, or private addresses) is collected or displayed.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-[#CBD5E1] px-5 py-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                Tracking ID: {selectedTicket.referenceId}
              </span>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="px-4 py-2 rounded-[6px] bg-[#17365D] hover:bg-[#0F2440] text-white font-semibold text-xs transition cursor-pointer shadow-2xs"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
