import React, { useState } from "react";
import { CityOption, LanguageOption, ComplaintFormData, SampleComplaint } from "../types";
import { SAMPLE_COMPLAINTS } from "../data/sampleComplaints";
import { VisualEvidenceUploader } from "./VisualEvidenceUploader";
import {
  MapPin,
  Building,
  Languages,
  FileText,
  Send,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Camera,
  Copy,
  Check,
  Search,
} from "lucide-react";

interface CitizenReportViewProps {
  formData: ComplaintFormData;
  onChange: (data: Partial<ComplaintFormData>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onSelectSample: (sample: SampleComplaint) => void;
  submissionReceipt: {
    referenceId: string;
    timestamp: string;
    city: string;
    ward: string;
    language: string;
    complaint: string;
    hasVisualEvidence?: boolean;
    visualEvidenceType?: "image" | "video";
    visualEvidencePreviewUrl?: string;
  } | null;
  onResetSubmission: () => void;
  onSwitchToOfficerConsole: () => void;
  onTrackComplaint?: (trackingId: string) => void;
}

const CITIES: CityOption[] = [
  "Ahmedabad",
  "Bengaluru",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kochi",
  "Kolkata",
  "Mumbai",
];

const LANGUAGES: { value: LanguageOption; label: string; subtext: string }[] = [
  { value: "Hindi", label: "Hindi (हिंदी)", subtext: "Devanagari script" },
  { value: "Hinglish", label: "Hinglish", subtext: "Hindi written in English" },
  { value: "English", label: "English", subtext: "Standard English" },
];

export const CitizenReportView: React.FC<CitizenReportViewProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  error,
  onSelectSample,
  submissionReceipt,
  onResetSubmission,
  onSwitchToOfficerConsole,
  onTrackComplaint,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // If citizen has successfully submitted, show the confirmation screen
  if (submissionReceipt) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Confirmation Card */}
        <div
          id="citizen-receipt-card"
          className="bg-white rounded-[10px] border border-[#CBD5E1] p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#86EFAC] text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#166534] bg-[#F0FDF4] px-2.5 py-0.5 rounded-[4px] border border-[#86EFAC]">
                Submission Received
              </span>
              <h2 className="text-xl font-bold text-[#17365D]">
                Thank You for Reporting
              </h2>
            </div>
          </div>

          {/* Mandatory Prototype Notice */}
          <div className="bg-[#EFF6FF] border-l-4 border-[#2D6CDF] p-4 rounded-[6px] text-sm text-[#1F2937]">
            <p className="font-semibold text-[#17365D]">
              “Your complaint has been received for municipal review. This is a prototype and does not create an official government ticket.”
            </p>
          </div>

          {/* Demo Tracking ID Highlight Card */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-xs font-semibold text-[#1E40AF] block">
                Demo Tracking ID
              </span>
              <span className="font-mono font-bold text-xl sm:text-2xl text-[#17365D] tracking-wide">
                {submissionReceipt.referenceId}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Keep this tracking ID to follow municipal resolution progress in the Track Complaint portal.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="btn-copy-receipt-tracking-id"
                onClick={() => handleCopyRef(submissionReceipt.referenceId)}
                className="px-3 py-2 rounded-[6px] bg-white hover:bg-slate-50 text-[#17365D] border border-[#CBD5E1] text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Copy demo tracking ID"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied ID!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#2D6CDF]" />
                    <span>Copy Tracking ID</span>
                  </>
                )}
              </button>

              {onTrackComplaint && (
                <button
                  type="button"
                  id="btn-track-receipt-complaint"
                  onClick={() => onTrackComplaint(submissionReceipt.referenceId)}
                  className="px-3.5 py-2 rounded-[6px] bg-[#2D6CDF] hover:bg-[#1E56B8] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Complaint</span>
                </button>
              )}
            </div>
          </div>

          {/* Submitted Summary Details */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-4 sm:p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 block text-[11px]">City</span>
                <span className="font-semibold text-[#1F2937]">{submissionReceipt.city}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Ward / Locality</span>
                <span className="font-semibold text-[#1F2937]">
                  {submissionReceipt.ward || "General Area"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Language / Submitted</span>
                <span className="font-semibold text-[#1F2937]">
                  {submissionReceipt.language} • {submissionReceipt.timestamp}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#CBD5E1]">
              <span className="text-slate-500 block text-[11px] mb-1">Your Complaint Text:</span>
              <p className="text-slate-700 bg-white p-3 rounded-[6px] border border-[#CBD5E1] italic leading-relaxed">
                "{submissionReceipt.complaint}"
              </p>
            </div>

            {submissionReceipt.hasVisualEvidence && (
              <div className="pt-2 border-t border-[#CBD5E1] flex items-center gap-3">
                {submissionReceipt.visualEvidencePreviewUrl && (
                  <img
                    src={submissionReceipt.visualEvidencePreviewUrl}
                    alt="Attached evidence"
                    className="w-12 h-12 object-cover rounded-[6px] border border-[#CBD5E1]"
                  />
                )}
                <div>
                  <span className="text-xs font-bold text-[#17365D] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#2D6CDF]" />
                    Visual Evidence Attached ({submissionReceipt.visualEvidenceType === "video" ? "Short Video Frame" : "Photo"})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Included in multimodal analysis • Processed in-session only
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Public Citizen Tracking Guidance */}
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[8px] p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#17365D]">Public Citizen Grievance Intake Confirmed</p>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Your complaint has been queued for municipal departmental assignment. Use your demo tracking ID anytime in the <strong>Track Complaint</strong> tab to view progress timeline and verified before/after resolution evidence.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              id="btn-report-another-issue"
              onClick={onResetSubmission}
              className="w-full sm:w-auto px-4 py-2.5 rounded-[8px] border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#1F2937] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Another Issue</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onTrackComplaint && (
                <button
                  type="button"
                  id="btn-track-this-complaint"
                  onClick={() => onTrackComplaint(submissionReceipt.referenceId)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-[#17365D] hover:bg-[#0F2440] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Status Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#93C5FD]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Citizen Reporting Form
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Intro Citizen Banner */}
      <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-[8px] bg-[#17365D] text-white shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#17365D]">
              Report a Civic Issue
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit problems regarding garbage collection, drinking water supply, or streetlights in your neighborhood directly to your municipal corporation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Complaint Form */}
      <div className="bg-white rounded-[10px] border border-[#CBD5E1] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#17365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#CBD5E1]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-200" />
            <h3 className="font-semibold text-sm text-white">Citizen Grievance Details</h3>
          </div>
          <span className="text-[11px] text-slate-300">Simple 1-minute submission</span>
        </div>

        {/* Quick Sample Complaints for Demonstration */}
        <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-5 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-[#17365D]">
              Need an example? Click any sample to fill:
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">Demonstration presets</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_COMPLAINTS.slice(0, 4).map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSelectSample(sample)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-[6px] bg-white hover:bg-[#EFF6FF] text-[#1F2937] hover:text-[#2D6CDF] border border-[#CBD5E1] hover:border-[#2D6CDF] transition font-medium disabled:opacity-50 text-left cursor-pointer"
              >
                {sample.badge}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Row 1: City & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label htmlFor="citizen-city-select" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2D6CDF]" />
                  City <span className="text-[#C2413B]">*</span>
                </span>
              </label>
              <select
                id="citizen-city-select"
                value={formData.city}
                onChange={(e) => onChange({ city: e.target.value as CityOption })}
                disabled={isLoading}
                className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100"
                required
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">Select your city or municipality</p>
            </div>

            {/* Ward */}
            <div>
              <label htmlFor="citizen-ward-input" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
                Ward or Locality <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                id="citizen-ward-input"
                value={formData.ward}
                onChange={(e) => onChange({ ward: e.target.value })}
                placeholder="e.g. Ward 42, Karol Bagh, or Sector 9"
                disabled={isLoading}
                maxLength={60}
                className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] placeholder:text-slate-400 focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">Your neighborhood or area name</p>
            </div>
          </div>

          {/* Row 2: Language */}
          <div>
            <label htmlFor="citizen-language-select" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-[#2D6CDF]" />
                Language <span className="text-[#C2413B]">*</span>
              </span>
            </label>
            <select
              id="citizen-language-select"
              value={formData.language}
              onChange={(e) => onChange({ language: e.target.value as LanguageOption })}
              disabled={isLoading}
              className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100"
              required
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label} - {lang.subtext}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              You can write your grievance in Hindi, Hinglish, or English
            </p>
          </div>

          {/* Row 3: Complaint Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="citizen-complaint-textarea" className="block text-xs font-semibold text-[#1F2937]">
                Complaint Text <span className="text-[#C2413B]">*</span>
              </label>
              <span className="text-[11px] text-slate-500">{formData.complaint.length} / 1500 chars</span>
            </div>
            <textarea
              id="citizen-complaint-textarea"
              rows={5}
              value={formData.complaint}
              onChange={(e) => onChange({ complaint: e.target.value })}
              placeholder="Describe what is wrong and where. For example: 'Kachra pichle teen din se nahi uthaya gaya hai market ke samne...' or 'Tap water is muddy and foul-smelling since morning...' or 'Streetlights on Station Road are not working...'"
              disabled={isLoading}
              maxLength={1500}
              required
              className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white p-3 text-[#1F2937] placeholder:text-slate-400 focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100 font-sans leading-relaxed resize-y"
            />
          </div>

          {/* Optional Visual Evidence Uploader */}
          <VisualEvidenceUploader
            value={formData.visualEvidence}
            onChange={(evidence) => onChange({ visualEvidence: evidence })}
            disabled={isLoading}
          />

          {/* Privacy Notice */}
          <div className="rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] p-3.5 flex items-start gap-2.5 text-xs text-[#1F2937]">
            <ShieldCheck className="w-4 h-4 text-[#2D6CDF] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#17365D]">Privacy &amp; Anonymity Protection</p>
              <p className="text-[11px] text-slate-600 leading-normal">
                NagarNex AI does not collect citizen name, phone number, personal residence, or identifying credentials. Only your issue description and city/ward are processed for municipal classification.
              </p>
            </div>
          </div>

          {/* Active Loading Notification */}
          {isLoading && (
            <div className="rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] p-4 flex items-center gap-3 text-xs text-[#17365D]">
              <div className="w-4 h-4 border-2 border-[#2D6CDF]/30 border-t-[#2D6CDF] rounded-full animate-spin shrink-0" />
              <div>
                <p className="font-semibold text-sm text-[#17365D]">Analysing your complaint with Gemini…</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Categorising grievance, assessing priority target, and preparing municipal triage.</p>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {error && !isLoading && (
            <div className="rounded-[8px] bg-[#FDF2F2] border border-[#F87171] p-4 flex items-start gap-3 text-xs text-[#991B1B]">
              <AlertCircle className="w-4 h-4 text-[#C2413B] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-[#991B1B]">{error}</p>
                <p className="text-[11px] text-slate-600">
                  Please check your issue description and click Submit for Review again.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button - Saffron/Orange with "Submit for Review" */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-submit-review"
              disabled={isLoading || !formData.complaint.trim()}
              className="w-full py-3.5 px-5 rounded-[10px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analysing your complaint with Gemini…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for Review</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Advisory prototype • Does not contact live emergency services
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
