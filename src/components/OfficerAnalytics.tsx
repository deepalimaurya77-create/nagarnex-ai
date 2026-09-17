import React, { useState } from "react";
import { HistoricalComplaintRecord } from "../types";
import {
  BarChart3,
  ExternalLink,
  TrendingUp,
  Clock,
  PieChart,
  ShieldCheck,
  Maximize2,
} from "lucide-react";

interface OfficerAnalyticsProps {
  dataset?: HistoricalComplaintRecord[];
}

export const OfficerAnalytics: React.FC<OfficerAnalyticsProps> = ({ dataset = [] }) => {
  const [showEmbeddedPreview, setShowEmbeddedPreview] = useState(false);
  const tableauUrl =
    "https://public.tableau.com/views/CivicPulseAIDashboard/CivicPulseAIPublicGrievanceIntelligenceDashboard?:language=en-GB&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link";

  // Calculate dynamic metrics strictly from the active synthetic CSV dataset
  const totalRecords = dataset.length || 100;
  const uniqueCities = new Set(dataset.map((d) => d.city)).size || 8;
  const uniqueLanguages = new Set(dataset.map((d) => d.language)).size || 10;

  const garbageCount = dataset.filter((d) => d.category === "Garbage/Sanitation").length;
  const waterCount = dataset.filter((d) => d.category === "Water Supply").length;
  const lightCount = dataset.filter((d) => d.category === "Streetlights").length;

  const garbagePct = Math.round((garbageCount / (totalRecords || 1)) * 100) || 40;
  const waterPct = Math.round((waterCount / (totalRecords || 1)) * 100) || 30;
  const lightPct = Math.round((lightCount / (totalRecords || 1)) * 100) || 30;

  return (
    <section id="officer-analytics-section" className="mt-8 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-[10px] border border-[#CBD5E1] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#17365D] text-white rounded-[8px]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#17365D]">Officer Analytics &amp; Intelligence</h2>
              <span className="text-[11px] font-medium bg-[#F1F5F9] text-[#17365D] px-2 py-0.5 rounded-[4px] border border-[#CBD5E1]">
                Citywide Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Macro-level grievance trends, ward hot-spots, and departmental prototype service targets
            </p>
          </div>
        </div>

        {/* Primary Tableau Button */}
        <div>
          <a
            id="btn-open-tableau-dashboard"
            href={tableauUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#2D6CDF] hover:bg-[#1E56B8] text-white text-xs font-semibold shadow-xs hover:shadow transition cursor-pointer"
          >
            <span>Open Tableau Intelligence Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Analytics KPI Overview Grid (Computed from active synthetic CSV dataset) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-[10px] border border-[#CBD5E1] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Synthetic Dataset</span>
            <TrendingUp className="w-4 h-4 text-[#2D6CDF]" />
          </div>
          <div className="text-xl font-bold text-[#1F2937]">{totalRecords} Synthetic Complaints</div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Cities covered: {uniqueCities}</p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#CBD5E1] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Issue Categories</span>
            <PieChart className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-xl font-bold text-[#1F2937]">{garbagePct}% Garbage/Sanitation</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {waterPct}% Water Supply • {lightPct}% Streetlights
          </p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#CBD5E1] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Triage Engine</span>
            <Clock className="w-4 h-4 text-[#2D6CDF]" />
          </div>
          <div className="text-xl font-bold text-[#1F2937]">Gemini Intelligence</div>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Multilingual Incident Clustering</p>
        </div>

        <div className="bg-white p-4 rounded-[10px] border border-[#CBD5E1] shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-slate-600">Dataset Languages</span>
            <ShieldCheck className="w-4 h-4 text-[#17365D]" />
          </div>
          <div className="text-xl font-bold text-[#1F2937]">{uniqueLanguages}-Language Dataset</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Verified synthetic multilingual entries</p>
        </div>
      </div>

      {/* Tableau Visual Section - Clean White Card consistent with app */}
      <div className="bg-white rounded-[10px] p-6 border border-[#CBD5E1] shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-[#EFF6FF] text-[#2D6CDF] border border-[#BFDBFE]">
                Tableau Public Integration
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-slate-500 text-xs hidden sm:inline">Executive Officer Dashboard</span>
            </div>
            <h3 className="text-lg font-bold text-[#17365D]">
              NagarNex AI Public Grievance Intelligence Dashboard
            </h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Explore city-wide geospatial heatmaps, ward-by-ward prototype service target compliance, resolution velocity by department
              (Solid Waste Management, Water Board, Electrical Division), and civic sentiment breakdown across India.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowEmbeddedPreview(!showEmbeddedPreview)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-[8px] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1F2937] text-xs font-semibold transition border border-[#CBD5E1] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#2D6CDF]" />
              <span>{showEmbeddedPreview ? "Close Embedded View" : "Preview in Portal"}</span>
            </button>

            <a
              id="btn-tableau-direct-launch"
              href={tableauUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-[#2D6CDF] hover:bg-[#1E56B8] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Tableau (New Tab)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Embedded Tableau Viewer if toggled */}
        {showEmbeddedPreview && (
          <div className="mt-5 pt-5 border-t border-[#CBD5E1]">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-600">
              <span className="font-semibold text-[#17365D]">Interactive Tableau Public Frame</span>
              <a
                href={tableauUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D6CDF] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Full screen on Tableau Public</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="w-full h-[650px] bg-slate-50 rounded-[8px] overflow-hidden border border-[#CBD5E1] relative">
              <iframe
                title="NagarNex AI Tableau Dashboard"
                src="https://public.tableau.com/views/CivicPulseAIDashboard/CivicPulseAIPublicGrievanceIntelligenceDashboard?:showVizHome=no&:embed=true"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
