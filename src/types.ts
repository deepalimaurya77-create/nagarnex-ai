export type ComplaintCategory = "Garbage/Sanitation" | "Water Supply" | "Streetlights";

export type ComplaintPriority = "Low" | "Medium" | "High";

export type LanguageOption = "Hindi" | "Hinglish" | "English";

export type CityOption =
  | "Ahmedabad"
  | "Bengaluru"
  | "Chennai"
  | "Delhi"
  | "Hyderabad"
  | "Kochi"
  | "Kolkata"
  | "Mumbai";

export interface HistoricalComplaintRecord {
  id: string;
  city: string;
  ward: string;
  language: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  complaint_text: string;
  translated_english: string;
  timestamp: string;
  status: string;
}

export interface PriorityDriversDetail {
  repeatReports: {
    count: number;
    summary: string;
  };
  severity: {
    level: ComplaintPriority;
    summary: string;
  };
  pendingDuration: {
    durationText: string;
    oldestTimestamp?: string;
    summary: string;
  };
}

export interface IncidentCluster {
  clusterId: string;
  city: string;
  ward: string;
  category: ComplaintCategory;
  relatedCount: number;
  languagesRepresented: string[];
  repeatedIssuePattern: string;
  priorityDrivers: string;
  priorityDriversDetail?: PriorityDriversDetail;
  recommendedDepartment: string;
  recommendedDepartmentAction: string;
  matchingRecords: HistoricalComplaintRecord[];
  isIsolated?: boolean;
}

export interface ExplainablePriority {
  level: ComplaintPriority;
  primaryReason: string;
  healthSafetyImpact: "High" | "Medium" | "Low";
  infrastructureScope: string;
  recurrenceClusterFactor: string;
  slaRationale: string;
}

export interface RecommendedDispatchPlan {
  department: string;
  suggestedAction: string;
  prototypeServiceTarget: string;
  recommendedUnit: string;
  officerConfirmed: boolean;
  confirmedAt?: string;
  officerNotes?: string;
}

export interface VisualEvidenceItem {
  type: "image" | "video";
  dataUrl: string; // Base64 or Blob data URL
  mimeType: string;
  name: string;
  sizeBytes?: number;
  durationSeconds?: number;
}

export interface VisualEvidenceSummary {
  hasVisualEvidence: boolean;
  mediaType?: "image" | "video";
  mediaPreviewUrl?: string;
  visibleCivicIssue: string;
  supportsReportedCategory: boolean;
  supportAssessmentNote: string;
  confidenceLevel: "Low" | "Medium" | "High";
  observationCaveat: string;
}

export interface ProofOfActionItem {
  dataUrl: string;
  mimeType: string;
  name: string;
  uploadedAt: string;
  fieldNotes?: string;
}

export interface BeforeAfterReview {
  visibleImprovementOrUnresolved: string;
  actionAddressesProblem: boolean;
  actionAssessmentNote: string;
  confidence: "Low" | "Medium" | "High";
  verificationStatus: "Needs officer verification" | "Verified & Approved by Officer" | "Re-inspection Requested";
  officerSignedOff?: boolean;
  signedOffAt?: string;
  officerNotes?: string;
  observationCaveat?: string;
}

export interface AnalysisResult {
  category: ComplaintCategory;
  priority: ComplaintPriority;
  reason: string;
  suggestedAction: string;
  detectedLanguage?: string;
  translatedEnglishSummary?: string;
  estimatedSlaHours?: number;
  incidentCluster?: IncidentCluster | null;
  explainablePriority?: ExplainablePriority;
  dispatchPlan?: RecommendedDispatchPlan;
  visualEvidenceSummary?: VisualEvidenceSummary | null;
  isDispatched?: boolean;
  dispatchedAt?: string | null;
  proofOfAction?: ProofOfActionItem | null;
  beforeAfterReview?: BeforeAfterReview | null;
}

export interface ComplaintFormData {
  city: CityOption;
  ward: string;
  language: LanguageOption;
  complaint: string;
  visualEvidence?: VisualEvidenceItem | null;
}

export type ComplaintTrackingStatus =
  | "Received"
  | "Under AI Review"
  | "Assigned to Department"
  | "Field Team Evidence Uploaded"
  | "Officer Verification Pending"
  | "Closed";

export interface ComplaintTimelineTimestamps {
  receivedAt: string;
  aiReviewedAt?: string | null;
  assignedAt?: string | null;
  evidenceUploadedAt?: string | null;
  verificationPendingAt?: string | null;
  closedAt?: string | null;
}

export interface ComplaintTrackingRecord {
  trackingId: string; // Format: CP-DEMO-2026-XXXX
  city: CityOption;
  ward: string;
  category: ComplaintCategory;
  status: ComplaintTrackingStatus;
  receivedAt: string;
  updatedAt: string;
  timelineTimestamps: ComplaintTimelineTimestamps;
  officerNotes?: string;
  // NOTE: Strictly no names, phone numbers, addresses, or personal data stored or displayed
}

export interface SampleComplaint {
  id: string;
  badge: string;
  city: CityOption;
  ward: string;
  language: LanguageOption;
  text: string;
  expectedCategory: ComplaintCategory;
  description: string;
}
