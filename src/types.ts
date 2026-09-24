export enum UserRole {
  CONTRACTOR = 'CONTRACTOR',
  PWD_ENGINEER = 'PWD_ENGINEER',
  COLLECTOR = 'COLLECTOR',
  CAG_AUDITOR = 'CAG_AUDITOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  designation: string;
  department?: string;
  district?: string;
  state?: string;
  organization?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  password?: string;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  emailVerifiedAt?: string;
  mobileVerifiedAt?: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskBreakdown {
  paymentProgressMismatch: number;
  delayProbability: number;
  costDeviation: number;
  contractorHistoricalIndicator: number;
  geographicAnomaly: number;
  duplicateWorkProbability: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string; // e.g. 'Community Hall', 'Road Construction', 'Water Filtration', 'Solar Lighting', 'Public Library'
  district: string;
  state: string;
  constituency: string; // Lok Sabha / Rajya Sabha
  mpName: string;
  sanctionDate: string;
  sanctionAmount: number; // in INR
  contractAmount: number; // in INR
  expenditure: number; // in INR
  balanceAmount: number;
  financialProgressPercent: number;
  physicalProgressPercent: number;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  delayDays: number;
  status: 'PROPOSED' | 'SANCTIONED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'DELAYED';
  contractorId: string;
  contractorName: string;
  executiveEngineer: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskReasons: string[];
  disproveChecklist: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  locationAddress: string;
  lastInspectionDate?: string;
  technicalSanctionNo: string;
  administrativeSanctionNo: string;
}

export interface WorkOrder {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  workOrderNumber: string;
  contractorId: string;
  contractorName: string;
  awardedAmount: number;
  issueDate: string;
  stipulatedCompletionDate: string;
  scopeOfWork: string;
  status: 'ACTIVE' | 'COMPLETED' | 'AMENDED' | 'TERMINATED';
  documentUrl?: string;
}

export interface MeasurementRecord {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  embNumber: string;
  pageNumber: number;
  itemDescription: string;
  claimedQuantity: number;
  measuredQuantity: number;
  unit: string;
  ratePerUnit: number;
  totalClaimedAmount: number;
  totalVerifiedAmount: number;
  submissionDate: string;
  submittedBy: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'RETURNED_FOR_CORRECTION';
  verifiedBy?: string;
  verificationDate?: string;
  engineerRemarks?: string;
  documentUrl?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  contractorId: string;
  contractorName: string;
  amountClaimed: number;
  amountApproved?: number;
  billDate: string;
  embReference: string;
  status: 'SUBMITTED' | 'UNDER_VERIFICATION' | 'APPROVED' | 'RETURNED' | 'PAID' | 'PAYMENT_HELD';
  paymentReference?: string;
  returnedReason?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Payment {
  id: string;
  paymentRefNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  invoiceId: string;
  invoiceNumber: string;
  contractorName: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'PFMS' | 'TREASURY' | 'NEFT' | 'DIRECT_CREDIT';
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'PENDING' | 'HELD';
  bankTransactionId?: string;
  disbursingOfficer: string;
  remarks?: string;
}

export interface InspectionRecord {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  inspectorName: string;
  inspectorRole: string;
  inspectionDate: string;
  physicalProgressObserved: number;
  qualityRating: 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'SUBSTANDARD' | 'EXCELLENT';
  observations: string;
  correctiveActionsRequired?: string;
  geoTag: {
    lat: number;
    lng: number;
    accuracyMeters: number;
  };
  photoUrls: string[];
  reportDocumentUrl?: string;
}

export interface MaterialCertificate {
  id: string;
  projectId: string;
  contractorId: string;
  materialType: string; // e.g., 'Grade 43 Cement', 'Fe500D TMT Rebar', 'M25 Concrete Cubes'
  testLabName: string;
  sampleBatchNo: string;
  testDate: string;
  testResult: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  submittedAt: string;
}

export interface SiteEvidence {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  uploadedBy: string;
  uploadDate: string;
  title: string;
  description: string;
  stage: 'FOUNDATION' | 'SUPERSTRUCTURE' | 'FINISHING' | 'COMPLETED' | 'ROUTINE';
  geoCoordinates: {
    lat: number;
    lng: number;
  };
  photoUrl: string;
  verifiedByEngineer: boolean;
  engineerRemarks?: string;
}

export type AlertType =
  | 'FINANCIAL_ANOMALY'
  | 'COST_ANOMALY'
  | 'PAYMENT_ANOMALY'
  | 'DUPLICATE_WORK'
  | 'DUPLICATE_PAYMENT'
  | 'PROJECT_DELAY'
  | 'PHYSICAL_FINANCIAL_MISMATCH'
  | 'CONTRACTOR_RISK_INDICATOR'
  | 'GEOGRAPHIC_ANOMALY';

export type AlertStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'FALSE_POSITIVE'
  | 'ESCALATED'
  | 'CLOSED';

export interface AIAlert {
  id: string;
  alertCode: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  district: string;
  alertType: AlertType;
  riskScore: number;
  riskLevel: RiskLevel;
  dateDetected: string;
  title: string;
  description: string;
  contributingFactors: {
    factor: string;
    points: number;
    details: string;
  }[];
  supportingEvidence: string[];
  recommendedAction: string;
  disproveCriteria: string[];
  status: AlertStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewRemarks?: string;
  humanDecision?: 'VERIFIED_ANOMALY' | 'FALSE_POSITIVE' | 'MORE_EVIDENCE_NEEDED' | 'ESCALATED';
}

export interface AuditCase {
  id: string;
  caseNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  district: string;
  assignedAuditor: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: 'OPEN' | 'IN_PROGRESS' | 'EVIDENCE_COLLECTED' | 'REPORT_FILED' | 'CLOSED';
  primaryIssue: string;
  detectedIrregularities: string[];
  auditObservations: string;
  recommendedVerification: string[];
  disproveConditions: string[];
  evidencePackReady: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryDirective {
  id: string;
  directiveNumber: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  issuedByCollector: string;
  assignedAuthority: string;
  issueDate: string;
  deadlineDate: string;
  reason: string;
  requiredDeliverables: string[];
  status: 'ISSUED' | 'IN_PROGRESS' | 'REPORT_SUBMITTED' | 'REVIEWED_AND_CLOSED';
  collectorRemarks?: string;
}

export interface FundHold {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  holdAmount: number;
  orderedBy: string;
  reason: string;
  dateImposed: string;
  status: 'ACTIVE_HOLD' | 'RECOMMENDED_HOLD' | 'REVOKED' | 'CONFIRMED';
  reviewDeadline: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'AUTH' | 'PROJECT' | 'BILL' | 'INSPECTION' | 'AI_ALERT' | 'AUDIT' | 'ADMIN';
  details: string;
  ipAddress?: string;
}

export interface SystemConfig {
  riskThresholdLowMax: number;
  riskThresholdMedMax: number;
  riskThresholdHighMax: number;
  weights: {
    costDeviation: number;
    paymentProgressMismatch: number;
    delayProbability: number;
    duplicateWorkProbability: number;
    contractorHistory: number;
    geographicAnomaly: number;
  };
  enableEmailAlerts: boolean;
  enableSmsOtp: boolean;
  requireDualOtpForRegistration: boolean;
}
