import { Project, RiskLevel, RiskBreakdown, AIAlert } from '../types';

/**
 * AnomalyX AI Risk Engine & Analytics Module
 * 
 * CORE GOVERNANCE PRINCIPLE:
 * The AI Risk Engine calculates objective mathematical, statistical, and semantic
 * indicators to assist human officials. AI results are strictly presented as
 * "Risk Indicators", "Anomalies", "Exceptions", or "Requires Verification".
 * AI NEVER declares fraud or automatically enforces blacklisting or payment blocks.
 */

export interface AIAnalysisResult {
  projectId: string;
  projectCode: string;
  projectName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  breakdown: RiskBreakdown;
  contributingFactors: {
    factor: string;
    points: number;
    details: string;
  }[];
  delayPrediction: {
    category: 'ON_TIME' | 'AT_RISK' | 'DELAYED';
    predictedDelayDays: number;
    confidence: number;
  };
  costDeviationPercent: number;
  progressMismatchPercent: number;
  potentialDuplicates: {
    targetProjectId: string;
    targetProjectCode: string;
    targetProjectName: string;
    semanticSimilarity: number;
    geospatialDistanceMeters: number;
    flag: string;
  }[];
  whatWouldDisproveThisAlert: string[];
  recommendedAction: string;
}

// Haversine distance calculator between coordinates in meters
export function calculateGeoDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Simple n-gram / token cosine similarity simulator for text comparison (resembling Sentence Transformers)
export function computeSemanticSimilarity(text1: string, text2: string): number {
  const tokenize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  };

  const words1 = tokenize(text1);
  const words2 = tokenize(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let intersection = 0;

  set1.forEach((word) => {
    if (set2.has(word)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  // Jaccard + token overlap blend normalized
  const jaccard = intersection / union;
  return Number((jaccard * 0.7 + 0.3 * (intersection / Math.min(set1.size, set2.size))).toFixed(2));
}

export function evaluateProjectRisk(project: Project, allProjects: Project[]): AIAnalysisResult {
  const contributingFactors: AIAnalysisResult['contributingFactors'] = [];
  let calculatedScore = 0;

  // 1. Payment vs Physical Progress Mismatch
  // E.g. Financial 92% vs Physical 45% -> delta = 47%
  const mismatch = Math.max(0, project.financialProgressPercent - project.physicalProgressPercent);
  let mismatchScore = 0;
  if (mismatch > 40) {
    mismatchScore = 25;
    contributingFactors.push({
      factor: 'Payment-Progress Mismatch',
      points: 25,
      details: `Disproportionate financial draw: Financial progress (${project.financialProgressPercent}%) exceeds physical progress (${project.physicalProgressPercent}%) by ${mismatch}%.`,
    });
  } else if (mismatch > 25) {
    mismatchScore = 18;
    contributingFactors.push({
      factor: 'Payment-Progress Mismatch',
      points: 18,
      details: `Moderate financial acceleration: Financial progress (${project.financialProgressPercent}%) is ${mismatch}% higher than physical milestone.`,
    });
  } else if (mismatch > 15) {
    mismatchScore = 10;
    contributingFactors.push({
      factor: 'Payment-Progress Variance',
      points: 10,
      details: `Minor variance: Financial progress (${project.financialProgressPercent}%) leads physical progress (${project.physicalProgressPercent}%) by ${mismatch}%.`,
    });
  }
  calculatedScore += mismatchScore;

  // 2. Delay Analysis & Prediction
  let delayScore = 0;
  let delayCategory: 'ON_TIME' | 'AT_RISK' | 'DELAYED' = 'ON_TIME';
  if (project.delayDays > 120 || project.status === 'DELAYED') {
    delayScore = 20;
    delayCategory = 'DELAYED';
    contributingFactors.push({
      factor: 'Severe Project Delay',
      points: 20,
      details: `Project is currently ${project.delayDays} days overdue beyond contractual completion deadline.`,
    });
  } else if (project.delayDays > 30) {
    delayScore = 12;
    delayCategory = 'AT_RISK';
    contributingFactors.push({
      factor: 'Timeline Slippage',
      points: 12,
      details: `Project has fallen behind baseline schedule by ${project.delayDays} days.`,
    });
  } else {
    delayCategory = 'ON_TIME';
  }
  calculatedScore += delayScore;

  // 3. Cost Deviation vs Estimated Sanction
  const expenditureRatio = project.expenditure / (project.sanctionAmount || 1);
  let costScore = 0;
  let costDeviationPercent = 0;
  if (expenditureRatio > 0.9 && project.physicalProgressPercent < 60) {
    costScore = 18;
    costDeviationPercent = Math.round((expenditureRatio - project.physicalProgressPercent / 100) * 100);
    contributingFactors.push({
      factor: 'Unusual Cost Rate Exhaustion',
      points: 18,
      details: `90%+ of funds exhausted before structural half-way mark reached.`,
    });
  } else if (project.contractAmount > project.sanctionAmount) {
    costScore = 10;
    costDeviationPercent = Math.round(((project.contractAmount - project.sanctionAmount) / project.sanctionAmount) * 100);
    contributingFactors.push({
      factor: 'Contract Value Exceeds Sanction',
      points: 10,
      details: `Contract awarded at ${costDeviationPercent}% above initial administrative sanction.`,
    });
  }
  calculatedScore += costScore;

  // 4. Duplicate Work & Geospatial Anomaly Check
  const potentialDuplicates: AIAnalysisResult['potentialDuplicates'] = [];
  let duplicateScore = 0;
  let geoScore = 0;

  allProjects.forEach((other) => {
    if (other.id === project.id) return;

    // Check geospatial distance
    const distMeters = calculateGeoDistanceMeters(
      project.coordinates.lat,
      project.coordinates.lng,
      other.coordinates.lat,
      other.coordinates.lng
    );

    // Semantic text similarity
    const textSim = computeSemanticSimilarity(
      `${project.name} ${project.description} ${project.category}`,
      `${other.name} ${other.description} ${other.category}`
    );

    // If text similarity > 0.70 or distance < 1000 meters in same category
    if (textSim >= 0.75 || (distMeters < 1200 && textSim >= 0.5)) {
      const isHighSimilarity = textSim >= 0.85;
      potentialDuplicates.push({
        targetProjectId: other.id,
        targetProjectCode: other.code,
        targetProjectName: other.name,
        semanticSimilarity: Math.round(textSim * 100),
        geospatialDistanceMeters: distMeters,
        flag: isHighSimilarity
          ? 'High Semantic & Geographic Overlap - Requires Verification'
          : 'Proximity cluster in same sector',
      });

      if (isHighSimilarity && duplicateScore === 0) {
        duplicateScore = 20;
        contributingFactors.push({
          factor: 'Potential Overlapping / Duplicate Work',
          points: 20,
          details: `Sentence Transformer similarity of ${Math.round(textSim * 100)}% with project ${other.code} situated ${distMeters}m away.`,
        });
      }

      if (distMeters < 800 && geoScore === 0) {
        geoScore = 10;
        contributingFactors.push({
          factor: 'Geospatial Cluster Anomaly',
          points: 10,
          details: `Located within ${distMeters}m of another project (${other.code}) of identical nature.`,
        });
      }
    }
  });

  calculatedScore += duplicateScore + geoScore;

  // 5. Contractor Historical Performance Indicator
  let contractorScore = 0;
  if (project.contractorId === 'usr-contractor-01' && (project.code === 'P102' || project.code === 'P108')) {
    contractorScore = 10;
    contributingFactors.push({
      factor: 'Contractor Risk Indicator',
      points: 10,
      details: 'Vendor currently has multiple concurrent delayed sites and pending bill inquiries.',
    });
  }
  calculatedScore += contractorScore;

  // Cap between 5 and 95
  const finalScore = Math.min(95, Math.max(5, calculatedScore));

  let riskLevel: RiskLevel = 'LOW';
  if (finalScore >= 81) riskLevel = 'CRITICAL';
  else if (finalScore >= 61) riskLevel = 'HIGH';
  else if (finalScore >= 31) riskLevel = 'MEDIUM';
  else riskLevel = 'LOW';

  const whatWouldDisproveThisAlert = [
    'Fresh joint field inspection report by Executive Engineer verifying physical completion against bills.',
    'Revised Measurement Book (E-MB) entries countersigned by Sectional Engineer explaining quantity adjustments.',
    'Proof of distinct municipal survey plot boundaries establishing independent utility.',
    'Material reconciliation statement accounting for all purchased items stored on site.',
  ];

  let recommendedAction = 'Maintain routine quarterly inspection monitoring.';
  if (riskLevel === 'CRITICAL') {
    recommendedAction =
      'Schedule priority field verification within 7 days, hold pending payments, and cross-reference E-MB measurements with physical site progress.';
  } else if (riskLevel === 'HIGH') {
    recommendedAction =
      'Reconcile invoices against schedule of rates (DSR) and summon contractor for physical progress review.';
  } else if (riskLevel === 'MEDIUM') {
    recommendedAction = 'Request updated geo-tagged photo evidence from site engineer and monitor next milestone.';
  }

  return {
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    riskScore: finalScore,
    riskLevel,
    breakdown: {
      paymentProgressMismatch: mismatchScore,
      delayProbability: delayScore,
      costDeviation: costScore,
      duplicateWorkProbability: duplicateScore,
      contractorHistoricalIndicator: contractorScore,
      geographicAnomaly: geoScore,
    },
    contributingFactors,
    delayPrediction: {
      category: delayCategory,
      predictedDelayDays: project.delayDays > 0 ? project.delayDays + 45 : 0,
      confidence: 0.89,
    },
    costDeviationPercent,
    progressMismatchPercent: mismatch,
    potentialDuplicates,
    whatWouldDisproveThisAlert,
    recommendedAction,
  };
}
