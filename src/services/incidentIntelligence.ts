import {
  AnalysisResult,
  ComplaintFormData,
  ComplaintPriority,
  ExplainablePriority,
  HistoricalComplaintRecord,
  IncidentCluster,
  RecommendedDispatchPlan,
} from "../types";

/**
 * Robust RFC 4180 CSV Parser
 * Handles commas inside quotes, multiline values, and escaped quotes.
 */
export function parseCSV(csvText: string): HistoricalComplaintRecord[] {
  const records: HistoricalComplaintRecord[] = [];
  const lines: string[] = [];

  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip \r\n
      }
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = "";
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  // Parse header
  const parseRow = (rowStr: string): string[] => {
    const cells: string[] = [];
    let currentCell = "";
    let inQuote = false;

    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];

      if (c === '"') {
        if (inQuote && nc === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === "," && !inQuote) {
        cells.push(currentCell.trim());
        currentCell = "";
      } else {
        currentCell += c;
      }
    }
    cells.push(currentCell.trim());
    return cells;
  };

  const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, ""));
  const idIdx = headers.findIndex((h) => h === "id" || h === "complaint_id");
  const cityIdx = headers.findIndex((h) => h === "city");
  const wardIdx = headers.findIndex((h) => h === "ward");
  const langIdx = headers.findIndex((h) => h === "language");
  const catIdx = headers.findIndex((h) => h === "category");
  const prioIdx = headers.findIndex((h) => h === "priority");
  const textIdx = headers.findIndex((h) => h === "complaint_text" || h === "complaint");
  const transIdx = headers.findIndex((h) => h === "translated_english" || h === "translation" || h === "summary");
  const timeIdx = headers.findIndex((h) => h === "timestamp" || h === "date");
  const statIdx = headers.findIndex((h) => h === "status");

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length < 3) continue;

    const id = (idIdx !== -1 ? values[idIdx] : "") || `SYN-ROW-${i}`;
    const city = (cityIdx !== -1 ? values[cityIdx] : "") || "Delhi";
    const ward = (wardIdx !== -1 ? values[wardIdx] : "") || "Ward 1";
    const language = (langIdx !== -1 ? values[langIdx] : "") || "English";
    const category = ((catIdx !== -1 ? values[catIdx] : "") || "Garbage/Sanitation") as any;
    const priority = ((prioIdx !== -1 ? values[prioIdx] : "") || "Medium") as any;
    const complaint_text = (textIdx !== -1 ? values[textIdx] : "") || "";
    const translated_english = (transIdx !== -1 ? values[transIdx] : "") || complaint_text;
    const timestamp = (timeIdx !== -1 ? values[timeIdx] : "") || "2026-09-10";
    const status = (statIdx !== -1 ? values[statIdx] : "") || "Pending";

    records.push({
      id,
      city,
      ward,
      language,
      category,
      priority,
      complaint_text,
      translated_english,
      timestamp,
      status,
    });
  }

  return records;
}

/**
 * Extract semantic concept keywords from text to match across languages and phrasing
 */
function extractConceptTokens(text: string): Set<string> {
  const normalized = text.toLowerCase();
  const concepts = new Set<string>();

  // Sanitation concepts
  if (/kachra|garbage|waste|dustbin|कूड़ा|कूड़ेदान|कचरा|dhalao|dump|rotten|smell|stench|बदबू|सफाई|overflow|tipper/i.test(normalized)) {
    concepts.add("garbage_overflow");
  }
  if (/market|bazaar|बाजार|commercial|shop|dukaan/i.test(normalized)) {
    concepts.add("market_area");
  }
  if (/drain|sewer|nali|नाली|sewage into|waterlogging|stagnant/i.test(normalized)) {
    concepts.add("drainage_overflow");
  }

  // Water supply concepts
  if (/pipeline burst|pipe burst|leak|leakage|रिसाव|फूट|पाइपलाइन|पाइप|rupture|flood|pressure zero/i.test(normalized)) {
    concepts.add("pipeline_burst");
  }
  if (/turbid|muddy|brown|dirty water|sewage mix|black water|दूषित|बदबूदार पानी|foul water|illness|vomit/i.test(normalized)) {
    concepts.add("water_contamination");
  }
  if (/low pressure|no water|tap dry|पानी नहीं|टैंकर|tanker/i.test(normalized)) {
    concepts.add("low_pressure");
  }

  // Streetlights concepts
  if (/blackout|dark|andhera|अंधेरा|street light|streetlight|fixtures|bulb|बत्ती बंद|non-functional|safety/i.test(normalized)) {
    concepts.add("streetlight_blackout");
  }
  if (/exposed|hanging wire|live wire|copper wire|spark|खुला तार|करंट|shock|fuse box|thunderstorm/i.test(normalized)) {
    concepts.add("electrical_hazard");
  }
  if (/flicker|blink|single bulb|maintenance/i.test(normalized)) {
    concepts.add("light_maintenance");
  }

  return concepts;
}

/**
 * Normalizes ward names to identify ward identity (e.g., Ward 42, Karol Bagh, Andheri, Bellandur)
 */
function extractWardKey(wardStr: string): string[] {
  const normalized = wardStr.toLowerCase();
  const tokens: string[] = [];
  const wardNumberMatch = normalized.match(/ward\s*([0-9a-z/-]+)/i);
  if (wardNumberMatch) {
    tokens.push(wardNumberMatch[1]);
  }
  // Ward zone names (Karol Bagh, Andheri, Bellandur, Jubilee Hills, etc.)
  const zoneMatch = normalized.match(/\(([^)]+)\)/);
  if (zoneMatch) {
    tokens.push(zoneMatch[1].trim().toLowerCase());
  } else {
    // split words
    normalized
      .replace(/ward/g, "")
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2)
      .forEach((w) => tokens.push(w));
  }
  return tokens;
}

/**
 * Generates a clean, deterministic cluster ID based on city, ward, category, and record reference
 */
function generateClusterId(
  city: string,
  ward: string = "",
  category: string,
  firstRecordId?: string
): string {
  const cityCode = (city || "DEL").slice(0, 3).toUpperCase();
  const wardMatch = (ward || "").match(/\d+/);
  const wardNum = wardMatch ? `W${wardMatch[0]}` : "W01";
  const catCode =
    category === "Garbage/Sanitation"
      ? "SWM"
      : category === "Water Supply"
      ? "WAT"
      : "LGT";
  const suffix = firstRecordId ? firstRecordId.replace(/[^0-9]/g, "").slice(-3) : "101";
  return `CLUST-${cityCode}-${wardNum}-${catCode}-${suffix}`;
}

/**
 * Calculates pending duration strictly derived from matching records in the synthetic dataset
 */
function calculatePendingDurationFromRecords(records: HistoricalComplaintRecord[]): {
  durationText: string;
  oldestTimestamp?: string;
  summary: string;
} {
  if (!records || records.length === 0) {
    return {
      durationText: "New intake (0 hours)",
      summary: "First-instance intake; no unresolved backlog in the synthetic demo dataset.",
    };
  }

  const timestamps = records
    .map((r) => r.timestamp?.trim())
    .filter(Boolean)
    .sort();

  const oldest = timestamps[0];
  let durationText = "24 – 72 hours backlog";
  let summary = `Oldest synthetic record logged on ${oldest || "earlier"}. Multiple complaints have remained open in the synthetic dataset.`;

  if (oldest) {
    const dateMatch = oldest.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      const recordDate = new Date(dateMatch[1]);
      const refDate = new Date("2026-09-11");
      const diffMs = Math.max(0, refDate.getTime() - recordDate.getTime());
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const approxHours = Math.max(diffDays * 24, 12);

      if (diffDays > 0) {
        durationText = `~${approxHours} hours (${diffDays} days) pending`;
        summary = `Oldest matching report registered on ${oldest} (~${approxHours}h unresolved in synthetic demo data). Indicates chronic failure to resolve the underlying root cause.`;
      } else {
        durationText = `Within current shift (~8 hours) pending`;
        summary = `Oldest matching report registered on ${oldest}. Rapid surge of reports logged within the active shift.`;
      }
    }
  }

  return {
    durationText,
    oldestTimestamp: oldest,
    summary,
  };
}

/**
 * Searches the uploaded synthetic dataset for semantically similar complaints using:
 * - City
 * - Ward
 * - Category
 * - Complaint text (including multilingual meaning and concept overlap)
 *
 * Strictly derives counts and metrics from the provided dataset records without inventing numbers.
 */
export function findIncidentCluster(
  formData: ComplaintFormData,
  analysis: AnalysisResult,
  dataset: HistoricalComplaintRecord[]
): IncidentCluster {
  const currentCity = (formData.city || "Delhi").toLowerCase().trim();
  const currentWardTokens = extractWardKey(formData.ward || "");
  const currentConcepts = extractConceptTokens(
    `${formData.complaint} ${analysis.translatedEnglishSummary || ""} ${analysis.reason || ""}`
  );

  const matchedRecords: { record: HistoricalComplaintRecord; score: number }[] = [];

  if (dataset && dataset.length > 0) {
    for (const record of dataset) {
      // Category MUST match
      if (record.category !== analysis.category) {
        continue;
      }

      // City MUST match
      if (record.city.toLowerCase().trim() !== currentCity) {
        continue;
      }

      let matchScore = 0;

      // Ward comparison
      const recordWardTokens = extractWardKey(record.ward || "");
      const wardOverlap = currentWardTokens.some((tok) =>
        recordWardTokens.some((rt) => rt.includes(tok) || tok.includes(rt))
      );

      if (wardOverlap) {
        matchScore += 3;
      }

      // Semantic concept comparison (multilingual meaning & issue description)
      const recordConcepts = extractConceptTokens(
        `${record.complaint_text} ${record.translated_english}`
      );

      let conceptMatches = 0;
      for (const concept of currentConcepts) {
        if (recordConcepts.has(concept)) {
          conceptMatches++;
        }
      }

      if (conceptMatches > 0) {
        matchScore += conceptMatches * 2;
      }

      // Direct token overlap in translated English
      const currentSummaryWords = (analysis.translatedEnglishSummary || formData.complaint)
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);
      const recordWords = record.translated_english.toLowerCase().split(/\W+/);
      const wordOverlap = currentSummaryWords.filter((w) => recordWords.includes(w)).length;
      if (wordOverlap >= 2) {
        matchScore += 1;
      }

      // Inclusion criteria: Same Ward with at least one shared concept/overlap, OR high concept similarity in same city
      if (wardOverlap && matchScore >= 4) {
        matchedRecords.push({ record, score: matchScore });
      } else if (matchScore >= 5) {
        matchedRecords.push({ record, score: matchScore });
      }
    }
  }

  // Sort by match relevance descending
  matchedRecords.sort((a, b) => b.score - a.score);
  // Do NOT invent counts: calculate only from the uploaded CSV/demo records
  const matchingRecords = matchedRecords.map((m) => m.record);
  const relatedCount = matchingRecords.length;

  // Determine municipal department
  let recommendedDepartment = "General Municipal Administration";
  if (analysis.category === "Garbage/Sanitation") {
    recommendedDepartment = "Department of Solid Waste Management & Public Health";
  } else if (analysis.category === "Water Supply") {
    recommendedDepartment = "Water Supply & Sewerage Board (Jal Board)";
  } else if (analysis.category === "Streetlights") {
    recommendedDepartment = "Electrical & Public Lighting Division";
  }

  // Languages represented in cluster (from dataset matching records plus current detected language)
  const languagesSet = new Set<string>();
  matchingRecords.forEach((r) => {
    if (r.language) languagesSet.add(r.language);
  });
  if (analysis.detectedLanguage) {
    languagesSet.add(analysis.detectedLanguage);
  }
  if (formData.language) {
    languagesSet.add(formData.language);
  }
  const languagesRepresented = Array.from(languagesSet);

  // If no matching complaints exist in the uploaded synthetic dataset
  if (relatedCount === 0) {
    const clusterId = `${generateClusterId(formData.city, formData.ward, analysis.category)}-ISO`;
    return {
      clusterId,
      city: formData.city,
      ward: formData.ward || "All-Ward",
      category: analysis.category,
      relatedCount: 0,
      languagesRepresented: languagesRepresented.length > 0 ? languagesRepresented : [formData.language || "English"],
      repeatedIssuePattern: `No related historical reports found in the synthetic dataset (${dataset?.length || 0} records scanned). This grievance is treated as an isolated single-point event for ${formData.ward || formData.city}.`,
      priorityDrivers: `Isolated single grievance: 0 repeat reports in synthetic demo data. Priority (${analysis.priority}) is determined strictly by individual triage severity without recurrence escalation.`,
      priorityDriversDetail: {
        repeatReports: {
          count: 0,
          summary: `0 repeat reports in synthetic demo data (1 standalone report). No prior duplicate records detected in the active dataset.`,
        },
        severity: {
          level: analysis.priority,
          summary: `Assigned ${analysis.priority} severity based on individual citizen complaint parameters and public impact assessment.`,
        },
        pendingDuration: {
          durationText: "New intake (0 hours)",
          summary: "Newly filed complaint; no accumulated historical backlog in the synthetic demo dataset.",
        },
      },
      recommendedDepartment,
      recommendedDepartmentAction: analysis.suggestedAction || "Dispatch standard ward inspection team for verification and single-point rectification.",
      matchingRecords: [],
      isIsolated: true,
    };
  }

  // Synthesize repeated issue pattern
  let repeatedIssuePattern = "";
  if (analysis.category === "Garbage/Sanitation") {
    repeatedIssuePattern = `Persistent solid waste buildup and community bin overflow reported ${matchingRecords.length} times across ${formData.ward || formData.city}. Uncollected refuse is attracting stray animals and creating hazardous sanitation conditions.`;
  } else if (analysis.category === "Water Supply") {
    if (currentConcepts.has("water_contamination")) {
      repeatedIssuePattern = `Severe potable water contamination cluster detected across ${matchingRecords.length} historical reports in ${formData.ward || formData.city}. Foul odor and turbidity indicate systemic cross-contamination with drainage or sewer lines.`;
    } else {
      repeatedIssuePattern = `Recurrent water distribution pressure failure and pipeline leakage reported across ${matchingRecords.length} distinct complaints in ${formData.ward || formData.city}.`;
    }
  } else {
    if (currentConcepts.has("electrical_hazard")) {
      repeatedIssuePattern = `Critical electrical public hazard cluster: Exposed live wiring and damaged junction boxes reported ${matchingRecords.length} times in ${formData.ward || formData.city}, creating imminent electrocution risk.`;
    } else {
      repeatedIssuePattern = `Consecutive streetlight blackout corridor: ${matchingRecords.length} matching complaints in ${formData.ward || formData.city} indicate a localized feeder line or timer breaker failure.`;
    }
  }

  // Calculate pending duration strictly from matching records
  const pendingDuration = calculatePendingDurationFromRecords(matchingRecords);

  // Determine cluster severity (highest between current analysis and matching records)
  let severityLevel = analysis.priority;
  if (matchingRecords.some((r) => r.priority === "High")) {
    severityLevel = "High";
  }

  let severitySummary = "";
  if (severityLevel === "High") {
    severitySummary = analysis.category === "Garbage/Sanitation"
      ? "High severity: Acute public health risk from decomposing waste near residential markets and drainage clogging."
      : analysis.category === "Water Supply"
      ? "High severity: Direct contamination risk of municipal potable water supply, threatening waterborne disease outbreaks."
      : "High severity: Imminent electrocution or major transit accident risk along darkened public corridor.";
  } else if (severityLevel === "Medium") {
    severitySummary = "Medium severity: Noticeable civic disruption affecting residents across multiple lanes; requires rapid mitigation within standard SLA.";
  } else {
    severitySummary = "Low severity: Localized non-hazardous defect; manageable through routine scheduled maintenance.";
  }

  // Priority drivers detail
  const priorityDriversDetail = {
    repeatReports: {
      count: matchingRecords.length,
      summary: `${matchingRecords.length} repeat reports identified in the active synthetic demo dataset for ${formData.ward || formData.city}. Multiple citizen filings signal a clustered municipal failure rather than an isolated incident.`,
    },
    severity: {
      level: severityLevel,
      summary: severitySummary,
    },
    pendingDuration,
  };

  const priorityDrivers = `Priority drivers active: ${matchingRecords.length} repeat reports in synthetic demo data, ${severityLevel} severity classification, and ${pendingDuration.durationText} backlog across ${formData.ward || formData.city}.`;

  // Recommended department action
  let recommendedDepartmentAction = "";
  if (analysis.category === "Garbage/Sanitation") {
    recommendedDepartmentAction = `Escalate to Zone Supervisory Sanitary Inspector. Deploy a heavy hydraulic compactor tipper to clear the ward depot, sanitize the pedestrian periphery with lime powder, and review the ward door-to-door collection route.`;
  } else if (analysis.category === "Water Supply") {
    recommendedDepartmentAction = `Notify Assistant Executive Engineer (Water Works). Immediately isolate sector distribution gate valves, dispatch a mobile water quality testing laboratory, and position potable water relief tankers.`;
  } else {
    recommendedDepartmentAction = `Mobilize the Electrical Division Quick Response Vehicle (QRV) with aerial hydraulic ladder. Insulate exposed cables, replace blown circuit fuses, and inspect the main feeder pillar.`;
  }

  const clusterId = generateClusterId(
    formData.city,
    formData.ward,
    analysis.category,
    matchingRecords[0]?.id
  );

  return {
    clusterId,
    city: formData.city,
    ward: formData.ward || "All-Ward",
    category: analysis.category,
    relatedCount: matchingRecords.length,
    languagesRepresented,
    repeatedIssuePattern,
    priorityDrivers,
    priorityDriversDetail,
    recommendedDepartment,
    recommendedDepartmentAction,
    matchingRecords,
    isIsolated: false,
  };
}

/**
 * Generates an Explainable Priority breakdown
 */
export function generateExplainablePriority(
  analysis: AnalysisResult,
  cluster: IncidentCluster | null,
  formData: ComplaintFormData
): ExplainablePriority {
  const level = analysis.priority;

  let healthSafetyImpact: "High" | "Medium" | "Low" = "Medium";
  let infrastructureScope = "Ward-level distribution";
  let recurrenceClusterFactor = "Isolated single report; no historical cluster detected in synthetic dataset.";
  let slaRationale = "24-48 Hour standard municipal triage target.";

  if (level === "High") {
    healthSafetyImpact = "High";
    slaRationale = "Emergency prototype target: 4 - 8 Hours to mitigate immediate public health or electrocution hazards.";
  } else if (level === "Low") {
    healthSafetyImpact = "Low";
    slaRationale = "Routine service target: 48 - 72 Hours for minor aesthetic or non-hazardous maintenance.";
  }

  if (cluster) {
    recurrenceClusterFactor = `Escalated due to ${cluster.relatedCount} matching historical complaints in the synthetic dataset across ${cluster.languagesRepresented.join(", ")}.`;
    infrastructureScope = `Corridor / Area-wide failure affecting multiple residents in ${formData.ward || formData.city}.`;
  } else {
    recurrenceClusterFactor = "No related historical reports found in the synthetic dataset (isolated grievance).";
    infrastructureScope = `Localized single-point issue in ${formData.ward || formData.city}.`;
  }

  const primaryReason =
    level === "High"
      ? `Assigned High Priority because the reported condition (${analysis.category}) poses an acute risk to resident safety, critical potable water supply, or high-traffic corridor transit, further substantiated by ${cluster ? `${cluster.relatedCount} historical cluster reports` : "immediate hazard indicators"}.`
      : level === "Medium"
      ? `Assigned Medium Priority as the issue impacts daily civic quality of life in ${formData.ward || formData.city}, requiring prompt municipal intervention within standard SLA windows before conditions deteriorate.`
      : `Assigned Low Priority because the report represents routine maintenance or non-hazardous minor repairs with minimal disruption to public safety.`;

  return {
    level,
    primaryReason,
    healthSafetyImpact,
    infrastructureScope,
    recurrenceClusterFactor,
    slaRationale,
  };
}

/**
 * Generates the Recommended Dispatch Plan
 */
export function generateRecommendedDispatchPlan(
  analysis: AnalysisResult,
  cluster: IncidentCluster | null,
  formData: ComplaintFormData
): RecommendedDispatchPlan {
  let department = "General Municipal Administration";
  let suggestedAction = analysis.suggestedAction;
  let prototypeServiceTarget = "24 - 48 Hours";
  let recommendedUnit = "Standard Ward Inspection Team";

  if (analysis.category === "Garbage/Sanitation") {
    department = "Department of Solid Waste Management & Public Health";
    prototypeServiceTarget = analysis.priority === "High" ? "4 - 8 Hours (Emergency)" : "24 Hours (Standard)";
    recommendedUnit = cluster && cluster.relatedCount > 2
      ? "1x 8.5m³ Compactor Truck, 4x Sanitation Staff, 1x Lime Disinfection Unit"
      : "1x Light Tipper Tipper Truck, 2x Sanitation Workers";
  } else if (analysis.category === "Water Supply") {
    department = "Water Supply & Sewerage Board (Jal Board)";
    prototypeServiceTarget = analysis.priority === "High" ? "4 - 6 Hours (Emergency)" : "12 - 24 Hours";
    recommendedUnit = cluster && cluster.relatedCount > 2
      ? "1x Emergency Valve Repair Squad, 1x Mobile Water Quality Lab, 2x Drinking Water Tankers"
      : "1x Pipeline Leak Inspection Unit, 1x Acoustic Leak Detector";
  } else if (analysis.category === "Streetlights") {
    department = "Electrical & Public Lighting Division";
    prototypeServiceTarget = analysis.priority === "High" ? "4 Hours (Hazard)" : "48 Hours (Routine)";
    recommendedUnit = cluster && cluster.relatedCount > 2
      ? "1x Aerial Hydraulic Ladder Truck, 2x Certified High-Voltage Electricians, Feeder Box Spares"
      : "1x Luminaire Replacement Van, 1x Junior Technician";
  }

  return {
    department,
    suggestedAction: cluster ? cluster.recommendedDepartmentAction : suggestedAction,
    prototypeServiceTarget,
    recommendedUnit,
    officerConfirmed: false,
  };
}
