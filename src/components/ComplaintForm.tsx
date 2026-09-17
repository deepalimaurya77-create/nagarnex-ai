import React from "react";
import { CityOption, LanguageOption, ComplaintFormData, SampleComplaint } from "../types";
import { SAMPLE_COMPLAINTS } from "../data/sampleComplaints";
import { MapPin, Hash, Languages, FileText, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

interface ComplaintFormProps {
  formData: ComplaintFormData;
  onChange: (data: Partial<ComplaintFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSample: (sample: SampleComplaint) => void;
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
  { value: "Hinglish", label: "Hinglish", subtext: "Romanized Hindi/Urdu" },
  { value: "English", label: "English", subtext: "Official municipal format" },
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  onSelectSample,
}) => {
  const handleReset = () => {
    onChange({
      city: "Delhi",
      ward: "",
      language: "Hindi",
      complaint: "",
    });
  };

  return (
    <div id="complaint-submission-card" className="bg-white rounded-[10px] shadow-sm border border-[#CBD5E1] overflow-hidden">
      {/* Card Header */}
      <div className="bg-[#17365D] text-white px-5 py-4 flex items-center justify-between border-b border-[#CBD5E1]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/10 text-white rounded-[6px] border border-white/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-white">Grievance Intake &amp; Triage Form</h2>
            <p className="text-xs text-slate-300">Public complaint ingestion for automated departmental routing</p>
          </div>
        </div>

        <button
          type="button"
          id="btn-reset-form"
          onClick={handleReset}
          disabled={isLoading}
          className="text-xs text-slate-200 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/10 hover:bg-white/20 border border-white/20 transition disabled:opacity-50 cursor-pointer"
          title="Reset input fields"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Quick Synthetic Examples Bar */}
      <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] px-5 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#17365D]">
            <span>Load Quick Synthetic Test Complaint:</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden md:inline">Click to pre-fill realistic field grievance</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {SAMPLE_COMPLAINTS.map((sample) => (
            <button
              key={sample.id}
              id={`sample-btn-${sample.id}`}
              type="button"
              onClick={() => onSelectSample(sample)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-[8px] bg-white hover:bg-[#EFF6FF] text-[#1F2937] hover:text-[#2D6CDF] border border-[#CBD5E1] hover:border-[#2D6CDF] transition font-medium shadow-2xs disabled:opacity-50 text-left cursor-pointer"
            >
              {sample.badge}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {/* Row: City and Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* City Dropdown */}
          <div>
            <label htmlFor="city-select" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2D6CDF]" />
                Municipal Corporation / City <span className="text-[#C2413B]">*</span>
              </span>
            </label>
            <div className="relative">
              <select
                id="city-select"
                value={formData.city}
                onChange={(e) => onChange({ city: e.target.value as CityOption })}
                disabled={isLoading}
                className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
                required
              >
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Select from 8 major Indian municipal zones</p>
          </div>

          {/* Ward Input */}
          <div>
            <label htmlFor="ward-input" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#2D6CDF]" />
                Ward / Electoral Zone <span className="text-slate-400 font-normal">(Optional)</span>
              </span>
            </label>
            <input
              type="text"
              id="ward-input"
              value={formData.ward}
              onChange={(e) => onChange({ ward: e.target.value })}
              placeholder="e.g. Ward 42, Sector 9, or South Zone"
              disabled={isLoading}
              maxLength={60}
              className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] placeholder:text-slate-400 focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Ward number or administrative sub-division</p>
          </div>
        </div>

        {/* Row: Language Dropdown */}
        <div>
          <label htmlFor="language-select" className="block text-xs font-semibold text-[#1F2937] mb-1.5">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-[#2D6CDF]" />
              Citizen Written Language <span className="text-[#C2413B]">*</span>
            </span>
          </label>
          <select
            id="language-select"
            value={formData.language}
            onChange={(e) => onChange({ language: e.target.value as LanguageOption })}
            disabled={isLoading}
            className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-2.5 text-[#1F2937] focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100 disabled:text-slate-500"
            required
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label} - {lang.subtext}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">
            Engine is optimized for Hindi (हिंदी), Hinglish (conversational), or English complaints
          </p>
        </div>

        {/* Complaint Text Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="complaint-textarea" className="block text-xs font-semibold text-[#1F2937]">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#2D6CDF]" />
                Citizen Complaint Text <span className="text-[#C2413B]">*</span>
              </span>
            </label>
            <span className="text-[11px] text-slate-500">{formData.complaint.length} / 1500 chars</span>
          </div>
          <textarea
            id="complaint-textarea"
            rows={5}
            value={formData.complaint}
            onChange={(e) => onChange({ complaint: e.target.value })}
            placeholder="Enter public grievance text here in Hindi (e.g. हमारे इलाके में कचरा गाड़ी नहीं आई...), Hinglish (e.g. Pani supply band hai, pipeline leak ho rahi hai...), or English (e.g. Streetlights not working on main junction...)"
            disabled={isLoading}
            maxLength={1500}
            required
            className="w-full text-sm rounded-[8px] border border-[#CBD5E1] bg-white p-3 text-[#1F2937] placeholder:text-slate-400 focus:border-[#2D6CDF] focus:ring-1 focus:ring-[#2D6CDF] outline-none transition disabled:bg-slate-100 disabled:text-slate-500 font-sans leading-relaxed resize-y"
          />
        </div>

        {/* Strict Data Privacy Notice (No Name, Phone, Address, Personal Data) */}
        <div className="rounded-[8px] bg-[#F8FAFC] border border-[#CBD5E1] p-3 flex items-start gap-2.5 text-xs text-[#1F2937]">
          <ShieldCheck className="w-4 h-4 text-[#2D6CDF] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-[#17365D]">Data Privacy &amp; Anonymity Protection</p>
            <p className="text-[11px] text-slate-600 leading-normal">
              NagarNex AI does not collect citizen name, phone number, personal residence, or identifying credentials.
              Only civic issue descriptions, city, and ward references are processed for departmental classification.
            </p>
          </div>
        </div>

        {/* Submit Button - Saffron/Orange for Important Action */}
        <div className="pt-2">
          <button
            type="submit"
            id="btn-analyse-gemini"
            disabled={isLoading || !formData.complaint.trim()}
            className="w-full py-3 px-4 rounded-[10px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analysing with Gemini...</span>
              </>
            ) : (
              <span>Analyse with Gemini</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

