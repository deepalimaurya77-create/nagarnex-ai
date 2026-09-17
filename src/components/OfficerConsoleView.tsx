import React, { useState, useRef } from "react";
import {
  ComplaintFormData,
  AnalysisResult,
  HistoricalComplaintRecord,
  ComplaintTrackingStatus,
  ComplaintTimelineTimestamps,
} from "../types";
import { ResultsPanel } from "./ResultsPanel";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { OfficerAnalytics } from "./OfficerAnalytics";
import { parseCSV } from "../services/incidentIntelligence";
import {
  Shield,
  Layers,
  Inbox,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  RotateCcw,
  Search,
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
  X,
  ExternalLink,
  Table,
} from "lucide-react";

export interface QueueItem {
  id: string;
  source: "citizen" | "synthetic";
  referenceId: string;
  formData: ComplaintFormData;
  result?: AnalysisResult | null;
  timestamp: string;
  assignedStatus?: "pending" | "assigned";
  trackingStatus?: ComplaintTrackingStatus;
  timelineTimestamps?: ComplaintTimelineTimestamps;
}

interface OfficerConsoleViewProps {
  queue: QueueItem[];
  selectedItem: QueueItem | null;
  onSelectItem: (item: QueueItem) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRunAnalysis: (data: ComplaintFormData) => Promise<void>;
  dataset?: HistoricalComplaintRecord[];
  onUploadDataset?: (records: HistoricalComplaintRecord[], filename: string) => void;
  onUpdateQueueItem?: (referenceId: string, updated: Partial<QueueItem>) => void;
}

export const OfficerConsoleView: React.FC<OfficerConsoleViewProps> = ({
  queue,
  selectedItem,
  onSelectItem,
  isLoading,
  error,
  onRetry,
  onRunAnalysis,
  dataset = [],
  onUploadDataset,
  onUpdateQueueItem,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [showDatasetModal, setShowDatasetModal] = useState<boolean>(false);
  const [datasetSearchTerm, setDatasetSearchTerm] = useState<string>("");
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredQueue = queue.filter((item) => {
    if (filterCategory === "All") return true;
    if (filterCategory === "Citizen") return item.source === "citizen";
    return item.result?.category === filterCategory;
  });

  // Handle CSV file upload from officer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        try {
          const parsed = parseCSV(text);
          if (parsed.length === 0) {
            setUploadFeedback("CSV file was empty or improperly formatted.");
            return;
          }
          if (onUploadDataset) {
            onUploadDataset(parsed, file.name);
          }
          setUploadFeedback(`Successfully loaded ${parsed.length} historical records from ${file.name}!`);
          setTimeout(() => setUploadFeedback(null), 5000);
        } catch (err) {
          setUploadFeedback("Error parsing CSV. Please check formatting.");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadDataset = () => {
    window.open("/synthetic_complaints_dataset.csv", "_blank");
  };

  const filteredDatasetRecords = dataset.filter((r) => {
    if (!datasetSearchTerm) return true;
    const term = datasetSearchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.city.toLowerCase().includes(term) ||
      r.ward.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.language.toLowerCase().includes(term) ||
      r.translated_english.toLowerCase().includes(term) ||
      r.complaint_text.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Officer Console Top Banner */}
      <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-[8px] bg-[#17365D] text-white shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#17365D]">
                Multilingual Civic Incident Intelligence Console
              </h2>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-[#EFF6FF] text-[#2D6CDF] px-2 py-0.5 rounded-[4px] border border-[#BFDBFE]">
                Municipal Staff View (Demo)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Semantic incident clustering against historical dataset, explainable priority scoring, and department dispatch planning for municipal officers.
            </p>
          </div>
        </div>

        {/* Notices */}
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 text-xs">
          <div className="bg-[#FFFBEB] border border-[#FCD34D] rounded-[6px] px-3 py-1.5 text-[#92400E]">
            <p className="font-semibold text-[11px]">Synthetic Dataset Verified</p>
            <p className="text-[10px] text-[#B45309]">Clustering strictly grounded in uploaded CSV</p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-[6px] px-3 py-1.5 text-[#1F2937]">
            <p className="font-semibold text-[11px]">Mandatory Confirmation</p>
            <p className="text-[10px] text-slate-500">Human officer required before dispatch</p>
          </div>
        </div>
      </div>

      {/* Dataset Management Toolbar */}
      <div className="bg-[#F8FAFC] rounded-[10px] border border-[#CBD5E1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-[6px] bg-[#17365D] text-white">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#17365D]">Active Historical Dataset:</span>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[#2D6CDF]">
                synthetic_complaints_dataset.csv
              </span>
              <span className="text-[11px] font-semibold text-slate-600">
                ({dataset.length} synthetic records)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Source of truth for multilingual incident clustering and recurrence detection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Dataset Table Button */}
          <button
            type="button"
            onClick={() => setShowDatasetModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-50 text-[#17365D] border border-[#CBD5E1] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Table className="w-3.5 h-3.5 text-[#2D6CDF]" />
            <span>Inspect Dataset ({dataset.length})</span>
          </button>

          {/* Upload/Replace CSV Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-white hover:bg-slate-50 text-[#17365D] border border-[#CBD5E1] transition flex items-center gap-1.5 cursor-pointer"
            title="Upload a new CSV dataset to replace synthetic complaints"
          >
            <Upload className="w-3.5 h-3.5 text-[#2D6CDF]" />
            <span>Upload CSV</span>
          </button>

          {/* Download active CSV */}
          <button
            type="button"
            onClick={handleDownloadDataset}
            className="text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-[#17365D] hover:bg-[#234570] text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download synthetic CSV dataset"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div className="p-3 rounded-[8px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Officer Layout: Left Queue (5 cols), Right Triage Details (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Intake Queue & Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-[10px] border border-[#CBD5E1] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#17365D] text-white px-4 py-3 flex items-center justify-between border-b border-[#CBD5E1]">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Inbox className="w-4 h-4 text-slate-200" />
                <span>Grievance Queue ({queue.length})</span>
              </div>
              <span className="text-[11px] text-slate-300">Select to review triage</span>
            </div>

            {/* Filter Pills */}
            <div className="p-3 bg-[#F8FAFC] border-b border-[#CBD5E1] flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {["All", "Citizen", "Garbage/Sanitation", "Water Supply", "Streetlights"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium transition cursor-pointer border ${
                    filterCategory === cat
                      ? "bg-[#17365D] text-white border-[#17365D]"
                      : "bg-white text-slate-600 border-[#CBD5E1] hover:bg-slate-50"
                  }`}
                >
                  {cat === "Garbage/Sanitation" ? "Garbage" : cat === "Water Supply" ? "Water" : cat}
                </button>
              ))}
            </div>

            {/* Queue List */}
            <div className="divide-y divide-[#CBD5E1] max-h-[520px] overflow-y-auto">
              {filteredQueue.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No grievances found matching this filter.
                </div>
              ) : (
                filteredQueue.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const priority = item.result?.priority || "Medium";
                  const cluster = item.result?.incidentCluster;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#EFF6FF] border-l-4 border-[#2D6CDF]"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.source === "citizen" ? (
                            <span className="px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#2D6CDF] text-[10px] font-bold border border-[#BFDBFE]">
                              New Citizen Report
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] text-slate-700 text-[10px] font-medium border border-[#CBD5E1]">
                              Synthetic Case
                            </span>
                          )}
                          <span className="font-semibold text-xs text-[#1F2937]">
                            {item.formData.city}
                          </span>
                          {item.formData.ward && (
                            <span className="text-slate-500 text-[11px] truncate max-w-[120px]">
                              • {item.formData.ward}
                            </span>
                          )}
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                            priority === "High"
                              ? "bg-[#FDF2F2] text-[#C2413B] border-[#F87171]"
                              : priority === "Medium"
                              ? "bg-[#FFFBEB] text-[#B45309] border-[#FCD34D]"
                              : "bg-[#F0FDF4] text-[#166534] border-[#86EFAC]"
                          }`}
                        >
                          {priority}
                        </span>
                      </div>

                      {/* Complaint Preview */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.formData.complaint}
                      </p>

                      {/* Cluster indicator & Tracking Status tag */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] bg-slate-100 text-[#17365D] px-1.5 py-0.5 rounded border border-slate-200">
                            {item.referenceId}
                          </span>
                          <span>
                            {item.result ? item.result.category : "Evaluating..."}
                          </span>
                          {cluster && cluster.relatedCount > 0 ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#17365D] border border-[#BFDBFE]">
                              Cluster: {cluster.relatedCount}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Isolated
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              item.trackingStatus === "Closed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : item.trackingStatus === "Officer Verification Pending"
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : item.trackingStatus === "Field Team Evidence Uploaded"
                                ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                                : item.trackingStatus === "Assigned to Department"
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {item.trackingStatus || "Under AI Review"}
                          </span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Incident Intelligence Rules Card */}
          <div className="bg-[#17365D] text-white rounded-[10px] p-4 border border-[#17365D] shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>Incident Intelligence Framework</span>
            </div>
            <ul className="text-xs text-slate-200 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Historical Semantic Search:</strong> Scans active synthetic CSV dataset for semantic, multilingual, and ward matches.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Cluster Intelligence:</strong> Summarizes related complaint count, language representation, recurring failure pattern, and priority drivers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-white/10 text-white border border-white/20 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Human Officer Authorization:</strong> Automated field crew mobilization is prohibited without officer sign-off.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Detailed Triage & Actions Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : selectedItem?.result ? (
            <div className="space-y-4">
              {/* Selected Complaint Header Badge */}
              <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">
                      Currently Triaged Item
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      [{selectedItem.referenceId}]
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#17365D]">
                    {selectedItem.formData.city} • {selectedItem.formData.ward || "General Locality"}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-1 italic">
                    "{selectedItem.formData.complaint}"
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#F8FAFC] border border-[#CBD5E1] text-[11px] font-medium text-slate-700">
                    Language: {selectedItem.formData.language}
                  </span>
                </div>
              </div>

              {/* Main Results Panel with Incident Cluster, Explainable Priority, and Recommended Dispatch Plan */}
              <ResultsPanel
                key={selectedItem.referenceId}
                result={selectedItem.result}
                formData={selectedItem.formData}
                timestamp={selectedItem.timestamp}
                datasetCount={dataset.length}
                onUpdateResult={(updatedResult, trackingStatus, timelineTimestamps) => {
                  if (selectedItem?.result) {
                    onUpdateQueueItem?.(selectedItem.referenceId, {
                      result: {
                        ...selectedItem.result,
                        ...updatedResult,
                      },
                      trackingStatus: trackingStatus || selectedItem.trackingStatus,
                      timelineTimestamps: {
                        ...(selectedItem.timelineTimestamps || { receivedAt: selectedItem.timestamp }),
                        ...timelineTimestamps,
                      },
                    });
                  }
                }}
              />
            </div>
          ) : (
            <div className="bg-white rounded-[10px] border border-dashed border-[#CBD5E1] p-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-[#2D6CDF] mx-auto" />
              <h3 className="text-sm font-bold text-[#17365D]">No Grievance Selected</h3>
              <p className="text-xs text-slate-500">
                Please select a grievance from the left queue to inspect the Gemini-generated triage classification.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau Analytics Section - Grounded in the Active Synthetic Dataset */}
      <OfficerAnalytics dataset={dataset} />

      {/* Dataset Inspection Modal */}
      {showDatasetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#CBD5E1] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#17365D] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-slate-200" />
                <div>
                  <h3 className="text-sm font-bold">Historical Synthetic Dataset Inspector</h3>
                  <p className="text-xs text-slate-300">
                    {dataset.length} synthetic records loaded from synthetic_complaints_dataset.csv
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDatasetModal(false)}
                className="p-1 rounded-[6px] hover:bg-white/20 transition cursor-pointer text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#CBD5E1] flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records by city, ward, language, category, or keywords..."
                  value={datasetSearchTerm}
                  onChange={(e) => setDatasetSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-[6px] border border-[#CBD5E1] bg-white focus:outline-none focus:border-[#2D6CDF]"
                />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Showing {filteredDatasetRecords.length} of {dataset.length} records
              </span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
              <table className="min-w-full text-xs text-left divide-y divide-[#CBD5E1]">
                <thead className="bg-[#F8FAFC] text-slate-700 font-bold sticky top-0">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">City</th>
                    <th className="px-3 py-2">Ward</th>
                    <th className="px-3 py-2">Language</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Original Text</th>
                    <th className="px-3 py-2">English Translation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] bg-white">
                  {filteredDatasetRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-medium text-[#17365D]">{r.id}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{r.city}</td>
                      <td className="px-3 py-2 text-slate-600">{r.ward}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                          {r.language}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-700">{r.category}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.priority === "High"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : r.priority === "Medium"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{r.timestamp}</td>
                      <td className="px-3 py-2 text-slate-700 max-w-xs truncate" title={r.complaint_text}>
                        {r.complaint_text}
                      </td>
                      <td className="px-3 py-2 text-slate-700 max-w-xs truncate" title={r.translated_english}>
                        {r.translated_english}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#CBD5E1] flex items-center justify-between">
              <span className="text-xs text-slate-500">
                100% synthetic research data. No real PII or live municipal tickets.
              </span>
              <button
                type="button"
                onClick={() => setShowDatasetModal(false)}
                className="px-4 py-1.5 rounded-[6px] bg-[#17365D] hover:bg-[#234570] text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
