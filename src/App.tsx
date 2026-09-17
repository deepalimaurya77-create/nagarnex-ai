import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { CitizenReportView } from "./components/CitizenReportView";
import { OfficerConsoleView, QueueItem } from "./components/OfficerConsoleView";
import { TrackComplaintView } from "./components/TrackComplaintView";
import {
  ComplaintFormData,
  AnalysisResult,
  SampleComplaint,
  HistoricalComplaintRecord,
} from "./types";
import { SAMPLE_COMPLAINTS } from "./data/sampleComplaints";
import {
  parseCSV,
  findIncidentCluster,
  generateExplainablePriority,
  generateRecommendedDispatchPlan,
} from "./services/incidentIntelligence";
import { FileText, Shield, Search } from "lucide-react";

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: "sample-1",
    source: "synthetic",
    referenceId: "CP-DEMO-2026-1042",
    trackingStatus: "Assigned to Department",
    timelineTimestamps: {
      receivedAt: "10:15 AM",
      aiReviewedAt: "10:15 AM",
      assignedAt: "10:20 AM",
    },
    formData: {
      city: "Delhi",
      ward: "Ward 42 (Karol Bagh)",
      language: "Hindi",
      complaint:
        "हमारे इलाके में मुख्य बाजार के पास पिछले चार दिनों से नगर निगम की कचरा गाड़ी नहीं आई है। सामुदायिक कूड़ेदान पूरी तरह भर चुका है और बदबू के कारण आसपास के दुकानदारों और राहगीरों का निकलना मुश्किल हो गया है। कृपया तत्काल सफाई करवाएं।",
    },
    result: {
      category: "Garbage/Sanitation",
      priority: "Medium",
      reason:
        "Accumulated uncollected waste in commercial/public area creating foul odor and health hazard for pedestrians.",
      suggestedAction:
        "Dispatch Zone 4 SWM compactor truck and sanitary inspectors for emergency bin clearance and disinfectant spraying.",
      detectedLanguage: "Hindi",
      translatedEnglishSummary:
        "The municipal garbage truck has not arrived for the last four days near the main market. Community dustbin is completely overflowing and stench is unbearable.",
      estimatedSlaHours: 24,
      visualEvidenceSummary: {
        hasVisualEvidence: true,
        mediaType: "image",
        mediaPreviewUrl:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><rect width='320' height='240' fill='%23f1f5f9'/><rect x='30' y='140' width='260' height='70' fill='%2364748b' rx='4'/><rect x='50' y='90' width='80' height='80' fill='%23475569' rx='2'/><path d='M140 160 Q 180 120 220 160' stroke='%23d97706' stroke-width='4' fill='none'/><circle cx='90' cy='130' r='14' fill='%23cbd5e1'/><text x='160' y='225' font-family='sans-serif' font-size='11' font-weight='bold' fill='%23334155' text-anchor='middle'>SWM Commercial Dustbin Point</text></svg>",
        visibleCivicIssue:
          "Masonry community waste collection bin overflowed with domestic and packaging refuse onto street pavement.",
        supportsReportedCategory: true,
        supportAssessmentNote:
          "Visual context directly corroborates the reported uncollected garbage and sanitary obstruction.",
        confidenceLevel: "High",
        observationCaveat:
          "Visual indicators are advisory only. Prototype analysis does not provide exact damage measurements or absolute physical certainty.",
      },
    },
    timestamp: "10:15 AM",
    assignedStatus: "pending",
  },
  {
    id: "sample-2",
    source: "synthetic",
    referenceId: "CP-DEMO-2026-2098",
    trackingStatus: "Received",
    timelineTimestamps: {
      receivedAt: "09:42 AM",
    },
    formData: {
      city: "Mumbai",
      ward: "Ward K/West (Andheri)",
      language: "Hinglish",
      complaint:
        "Station road ke corner pe do street lights pichle ek hafte se completely band padi hain. Raat 8 baje ke baad poora stretch dark ho jata hai, pedestrians ko safety issue ho raha hai aur vehicle collision ka high risk hai. Kindly technician bhej ke repair karwayein.",
    },
    result: {
      category: "Streetlights",
      priority: "Medium",
      reason:
        "Darkened transit corridor posing safety risk to commuters and increasing accident vulnerability after 8 PM.",
      suggestedAction:
        "Direct Electrical Maintenance Section to replace faulty LED luminaire and verify junction box feeder cable.",
      detectedLanguage: "Hinglish",
      translatedEnglishSummary:
        "Two streetlights on station road have been out for a week, causing darkness and pedestrian safety issues.",
      estimatedSlaHours: 24,
    },
    timestamp: "09:42 AM",
    assignedStatus: "pending",
  },
  {
    id: "sample-3",
    source: "synthetic",
    referenceId: "CP-DEMO-2026-3150",
    trackingStatus: "Field Team Evidence Uploaded",
    timelineTimestamps: {
      receivedAt: "08:30 AM",
      aiReviewedAt: "08:31 AM",
      assignedAt: "08:45 AM",
      evidenceUploadedAt: "09:10 AM",
      verificationPendingAt: "09:12 AM",
    },
    formData: {
      city: "Bengaluru",
      ward: "Ward 150 (Bellandur)",
      language: "English",
      complaint:
        "Tap water supplied this morning to residential blocks in 4th Cross is heavily turbid, muddy brown, and emits a strong foul sewage odor. Multiple households cannot use it for drinking or cooking. Suspected sewer line cross-contamination.",
    },
    result: {
      category: "Water Supply",
      priority: "High",
      reason:
        "Direct contamination risk of municipal drinking water supply with potential sewage cross-connection threatening public health.",
      suggestedAction:
        "Urgent dispatch of Jal Board water quality testing mobile unit; isolate distribution valve and flush feeder mains.",
      detectedLanguage: "English",
      translatedEnglishSummary:
        "Tap water supplied this morning is heavily turbid, brown, and foul-smelling, indicating potential sewage contamination.",
      estimatedSlaHours: 6,
      isDispatched: true,
      dispatchedAt: "08:45 AM",
      visualEvidenceSummary: {
        hasVisualEvidence: true,
        mediaType: "video",
        mediaPreviewUrl:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><rect width='320' height='240' fill='%23f8fafc'/><rect x='40' y='40' width='240' height='160' fill='%23e0f2fe' rx='8'/><path d='M100 120 C 130 90, 190 150, 220 120' stroke='%230284c7' stroke-width='6' fill='none'/><circle cx='160' cy='120' r='20' fill='%230284c7' opacity='0.3'/><text x='160' y='180' font-family='sans-serif' font-size='10' font-weight='bold' fill='%230369a1' text-anchor='middle'>Water Turbidity Sample (4s Video Frame)</text></svg>",
        visibleCivicIssue:
          "Heavy discoloration, particulate sediment, and reddish-brown turbidity observed discharging from municipal distribution line.",
        supportsReportedCategory: true,
        supportAssessmentNote:
          "Visual video frame corroborates acute water supply turbidity and suspected cross-contamination.",
        confidenceLevel: "High",
        observationCaveat:
          "Visual indicators are advisory only. Prototype analysis does not provide exact chemical purity assays or turbidity NTU metrics.",
      },
      proofOfAction: {
        name: "field_remediation_water_clear.svg",
        mimeType: "image/svg+xml",
        dataUrl:
          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240' viewBox='0 0 320 240'><rect width='320' height='240' fill='%23f0fdf4'/><rect x='40' y='40' width='240' height='160' fill='%23dcfce7' rx='8'/><circle cx='160' cy='120' r='30' fill='%2322c55e' opacity='0.2'/><path d='M130 120 L 150 140 L 190 100' stroke='%2316a34a' stroke-width='6' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='160' y='180' font-family='sans-serif' font-size='10' font-weight='bold' fill='%2315803d' text-anchor='middle'>Post-Flush Clear Water Sample</text></svg>",
        uploadedAt: "09:10 AM",
        fieldNotes:
          "Isolated branch gate valve, flushed feeder segment into stormwater run, and took follow-up sample showing restored optical clarity.",
      },
      beforeAfterReview: {
        visibleImprovementOrUnresolved:
          "Marked reduction in turbidity. Clear water flow observed after section flushing without sewage discoloration.",
        actionAddressesProblem: true,
        actionAssessmentNote:
          "Purge and line isolation successfully removed brown particulate sediment from Bellandur 4th Cross supply line.",
        confidence: "High",
        verificationStatus: "Needs officer verification",
        observationCaveat:
          "Final closure requires authorised municipal officer approval.",
      },
    },
    timestamp: "08:30 AM",
    assignedStatus: "pending",
  },
  {
    id: "sample-4",
    source: "synthetic",
    referenceId: "CP-DEMO-2026-4098",
    trackingStatus: "Under AI Review",
    timelineTimestamps: {
      receivedAt: "07:15 AM",
      aiReviewedAt: "07:16 AM",
    },
    formData: {
      city: "Hyderabad",
      ward: "Ward 98 (Jubilee Hills)",
      language: "Hinglish",
      complaint:
        "Main pipeline burst ho gayi hai near circle number 3. Clean drinking water road pe waste ho raha hai aur houses mein pressure zero ho chuka hai pichle 12 ghanto se. Valve team ko urgently send kijiye.",
    },
    result: {
      category: "Water Supply",
      priority: "High",
      reason:
        "Major trunk distribution line breach causing road inundation and complete residential water pressure failure.",
      suggestedAction:
        "Depute emergency valve operating crew to shut section gate valve and mobilize heavy pipeline repair squad.",
      detectedLanguage: "Hinglish",
      translatedEnglishSummary:
        "Main water pipeline has burst near circle 3, wasting clean water on the road and causing zero water pressure in homes.",
      estimatedSlaHours: 4,
    },
    timestamp: "07:15 AM",
    assignedStatus: "pending",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"citizen" | "track" | "officer">("citizen");
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);

  // Historical CSV Dataset State
  const [dataset, setDataset] = useState<HistoricalComplaintRecord[]>([]);

  // Citizen Form State
  const [citizenFormData, setCitizenFormData] = useState<ComplaintFormData>({
    city: "Delhi",
    ward: "Ward 42 (Karol Bagh)",
    language: "Hindi",
    complaint: SAMPLE_COMPLAINTS[0].text,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Citizen Submission Receipt State
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    referenceId: string;
    timestamp: string;
    city: string;
    ward: string;
    language: string;
    complaint: string;
    hasVisualEvidence?: boolean;
    visualEvidenceType?: "image" | "video";
    visualEvidencePreviewUrl?: string;
  } | null>(null);

  // Officer Queue & Selected Item State
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [selectedOfficerItem, setSelectedOfficerItem] = useState<QueueItem | null>(INITIAL_QUEUE[0]);

  // Load the uploaded historical dataset on startup and enrich initial queue items
  useEffect(() => {
    async function loadDataset() {
      try {
        const res = await fetch("/synthetic_complaints_dataset.csv");
        if (res.ok) {
          const csvText = await res.text();
          const records = parseCSV(csvText);
          setDataset(records);

          // Enrich INITIAL_QUEUE items with cluster, explainable priority, and dispatch plans
          setQueue((prevQueue) =>
            prevQueue.map((item) => {
              if (!item.result) return item;

              const cluster = findIncidentCluster(item.formData, item.result, records);
              const explainablePriority = generateExplainablePriority(
                item.result,
                cluster,
                item.formData
              );
              const dispatchPlan = generateRecommendedDispatchPlan(
                item.result,
                cluster,
                item.formData
              );

              return {
                ...item,
                result: {
                  ...item.result,
                  incidentCluster: cluster,
                  explainablePriority,
                  dispatchPlan,
                },
              };
            })
          );
        }
      } catch (err) {
        console.error("Error loading historical dataset CSV:", err);
      }
    }
    loadDataset();
  }, []);

  // Update selected item when queue updates
  useEffect(() => {
    if (selectedOfficerItem) {
      const updated = queue.find((q) => q.id === selectedOfficerItem.id);
      if (updated) {
        setSelectedOfficerItem(updated);
      }
    }
  }, [queue]);

  // Handler when officer uploads/replaces CSV dataset
  const handleUploadDataset = (records: HistoricalComplaintRecord[], filename: string) => {
    setDataset(records);

    // Re-evaluate all items in the queue against the new uploaded dataset
    setQueue((prevQueue) =>
      prevQueue.map((item) => {
        if (!item.result) return item;
        const cluster = findIncidentCluster(item.formData, item.result, records);
        const explainablePriority = generateExplainablePriority(item.result, cluster, item.formData);
        const dispatchPlan = generateRecommendedDispatchPlan(item.result, cluster, item.formData);

        return {
          ...item,
          result: {
            ...item.result,
            incidentCluster: cluster,
            explainablePriority,
            dispatchPlan,
          },
        };
      })
    );
  };

  // Citizen Form Updates
  const handleCitizenFormChange = (updates: Partial<ComplaintFormData>) => {
    setCitizenFormData((prev) => ({ ...prev, ...updates }));
    if (error) setError(null);
  };

  const handleSelectSample = (sample: SampleComplaint) => {
    setCitizenFormData({
      city: sample.city,
      ward: sample.ward,
      language: sample.language,
      complaint: sample.text,
    });
    if (error) setError(null);
  };

  // Submit Complaint for Citizen Review
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!citizenFormData.complaint.trim()) {
      setError("Please describe your issue before submitting.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `CP-DEMO-2026-${randomSuffix}`;

    // 20-second timeout guarantee to never leave user in endless loading state
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch("/api/analyze-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(citizenFormData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Triage is temporarily unavailable. Please try again.");
      }

      const analysisResult: AnalysisResult = json.data;

      // Ensure cluster, explainable priority, and dispatch plan are populated
      let cluster = analysisResult.incidentCluster;
      if (cluster === undefined && dataset.length > 0) {
        cluster = findIncidentCluster(citizenFormData, analysisResult, dataset);
      }

      let explainablePriority = analysisResult.explainablePriority;
      if (!explainablePriority) {
        explainablePriority = generateExplainablePriority(analysisResult, cluster || null, citizenFormData);
      }

      let dispatchPlan = analysisResult.dispatchPlan;
      if (!dispatchPlan) {
        dispatchPlan = generateRecommendedDispatchPlan(analysisResult, cluster || null, citizenFormData);
      }

      const fullResult: AnalysisResult = {
        ...analysisResult,
        incidentCluster: cluster || null,
        explainablePriority,
        dispatchPlan,
      };

      // Send category, priority, reason, suggested action, and intelligence cards to the Officer Console (Demo)
      const newQueueItem: QueueItem = {
        id: `citizen-${Date.now()}`,
        source: "citizen",
        referenceId: refCode,
        formData: { ...citizenFormData },
        result: fullResult,
        timestamp: now,
        assignedStatus: "pending",
        trackingStatus: "Received",
        timelineTimestamps: {
          receivedAt: now,
        },
      };

      // Add to front of officer queue and auto-select
      setQueue((prev) => [newQueueItem, ...prev]);
      setSelectedOfficerItem(newQueueItem);

      // On success, show citizen confirmation
      setSubmissionReceipt({
        referenceId: refCode,
        timestamp: now,
        city: citizenFormData.city,
        ward: citizenFormData.ward,
        language: citizenFormData.language,
        complaint: citizenFormData.complaint,
        hasVisualEvidence: Boolean(citizenFormData.visualEvidence),
        visualEvidenceType: citizenFormData.visualEvidence?.type,
        visualEvidencePreviewUrl: citizenFormData.visualEvidence?.dataUrl,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Citizen submission error:", err);
      setError("Triage is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Submission Form for new citizen report
  const handleResetCitizenSubmission = () => {
    setSubmissionReceipt(null);
    setCitizenFormData({
      city: "Delhi",
      ward: "",
      language: "Hindi",
      complaint: "",
      visualEvidence: null,
    });
    setError(null);
  };

  // Run on-demand triage for officer
  const handleOfficerRunAnalysis = async (customData: ComplaintFormData) => {
    setIsLoading(true);
    setError(null);

    const now = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refCode = `CP-DEMO-2026-${randomSuffix}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 20000);

    try {
      const response = await fetch("/api/analyze-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Triage is temporarily unavailable. Please try again.");
      }

      const analysisResult: AnalysisResult = json.data;

      // Compute cluster against active dataset
      const cluster = analysisResult.incidentCluster !== undefined
        ? analysisResult.incidentCluster
        : findIncidentCluster(customData, analysisResult, dataset);

      const explainablePriority = analysisResult.explainablePriority ||
        generateExplainablePriority(analysisResult, cluster, customData);

      const dispatchPlan = analysisResult.dispatchPlan ||
        generateRecommendedDispatchPlan(analysisResult, cluster, customData);

      const fullResult: AnalysisResult = {
        ...analysisResult,
        incidentCluster: cluster,
        explainablePriority,
        dispatchPlan,
      };

      const newQueueItem: QueueItem = {
        id: `officer-${Date.now()}`,
        source: "synthetic",
        referenceId: refCode,
        formData: { ...customData },
        result: fullResult,
        timestamp: now,
        assignedStatus: "pending",
        trackingStatus: "Under AI Review",
        timelineTimestamps: {
          receivedAt: now,
          aiReviewedAt: now,
        },
      };

      setQueue((prev) => [newQueueItem, ...prev]);
      setSelectedOfficerItem(newQueueItem);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Officer triage error:", err);
      setError("Triage is temporarily unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQueueItem = (referenceId: string, updated: Partial<QueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.referenceId === referenceId) {
          return {
            ...item,
            ...updated,
            result: updated.result
              ? { ...item.result, ...updated.result }
              : item.result,
          };
        }
        return item;
      })
    );
    setSelectedOfficerItem((prev) => {
      if (prev && prev.referenceId === referenceId) {
        return {
          ...prev,
          ...updated,
          result: updated.result
            ? { ...prev.result, ...updated.result }
            : prev.result,
        };
      }
      return prev;
    });
  };

  const citizenSubmissionCount = queue.filter((item) => item.source === "citizen").length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1F2937] flex flex-col font-sans selection:bg-[#2D6CDF] selection:text-white">
      {/* Header with Title and Note */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top Tab Navigation: Citizen vs Officer Console */}
        <div className="bg-white rounded-[10px] border border-[#CBD5E1] p-1.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            {/* Tab 1: Report an Issue (Citizen View) */}
            <button
              type="button"
              id="tab-report-issue"
              onClick={() => setActiveTab("citizen")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                activeTab === "citizen"
                  ? "bg-[#17365D] text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:text-[#17365D] hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Report an Issue</span>
              <span
                className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium ${
                  activeTab === "citizen" ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-slate-500"
                }`}
              >
                Citizen
              </span>
            </button>

            {/* Tab 2: Track Complaint (Citizen View) */}
            <button
              type="button"
              id="tab-track-complaint"
              onClick={() => setActiveTab("track")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                activeTab === "track"
                  ? "bg-[#17365D] text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:text-[#17365D] hover:bg-slate-50"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Track Complaint</span>
              <span
                className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium ${
                  activeTab === "track" ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-slate-500"
                }`}
              >
                Citizen
              </span>
            </button>

            {/* Tab 3: Officer Console (Demo) (Municipal Staff View) */}
            <button
              type="button"
              id="tab-officer-console"
              onClick={() => setActiveTab("officer")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                activeTab === "officer"
                  ? "bg-[#17365D] text-white shadow-xs"
                  : "bg-transparent text-slate-600 hover:text-[#17365D] hover:bg-slate-50"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Officer Console (Demo)</span>
              <span
                className={`hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium ${
                  activeTab === "officer" ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-slate-500"
                }`}
              >
                Municipal Staff
              </span>
              {citizenSubmissionCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full bg-[#D97706] text-white text-[10px] font-bold"
                  title="New citizen submissions in queue"
                >
                  {citizenSubmissionCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 pr-2 text-xs text-slate-500">
            <span>Current Flow:</span>
            <span className="font-semibold text-[#17365D]">
              {activeTab === "citizen"
                ? "Citizen Public Grievance Intake"
                : activeTab === "track"
                ? "Public Grievance Resolution Tracking"
                : "Multilingual Incident Clustering & Supervisory Triage"}
            </span>
          </div>
        </div>

        {/* View Switcher */}
        {activeTab === "citizen" ? (
          /* 1. Report an Issue: Citizen View */
          <CitizenReportView
            formData={citizenFormData}
            onChange={handleCitizenFormChange}
            onSubmit={handleCitizenSubmit}
            isLoading={isLoading}
            error={error}
            onSelectSample={handleSelectSample}
            submissionReceipt={submissionReceipt}
            onResetSubmission={handleResetCitizenSubmission}
            onSwitchToOfficerConsole={() => setActiveTab("officer")}
            onTrackComplaint={(trackingId) => {
              setActiveTrackingId(trackingId);
              setActiveTab("track");
            }}
          />
        ) : activeTab === "track" ? (
          /* 2. Track Complaint: Citizen Status Timeline */
          <TrackComplaintView
            queue={queue}
            initialTrackingId={activeTrackingId}
            onSwitchToReportIssue={() => setActiveTab("citizen")}
            onSwitchToOfficerConsole={(item) => {
              if (item) {
                setSelectedOfficerItem(item);
              }
              setActiveTab("officer");
            }}
          />
        ) : (
          /* 3. Officer Console (Demo): Municipal Staff View */
          <OfficerConsoleView
            queue={queue}
            selectedItem={selectedOfficerItem}
            onSelectItem={(item) => setSelectedOfficerItem(item)}
            isLoading={isLoading}
            error={error}
            onRetry={() => {
              if (selectedOfficerItem) {
                handleOfficerRunAnalysis(selectedOfficerItem.formData);
              }
            }}
            onRunAnalysis={handleOfficerRunAnalysis}
            dataset={dataset}
            onUploadDataset={handleUploadDataset}
            onUpdateQueueItem={handleUpdateQueueItem}
          />
        )}
      </main>

      {/* Municipal Technology Footer */}
      <footer className="bg-[#17365D] border-t border-[#122B4A] text-slate-300 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">NagarNex AI</span>
            <span>•</span>
            <span>Evidence-to-Closure Civic Intelligence for Indian Municipal Corporations</span>
          </div>

          <div className="text-center sm:text-right text-slate-300 text-[11px]">
            <p>Grounded in active synthetic historical dataset. No real government tickets or physical dispatch.</p>
            <p className="mt-0.5 text-slate-400">
              Zero Citizen PII: No citizen names, phone numbers, or private street addresses stored.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
