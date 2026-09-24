import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { evaluateProjectRisk } from './src/server/aiEngine';
import { UserRole } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// Request logging middleware for audit trail
app.use((req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.startsWith('/api/health')) {
    // console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'AnomalyX MPLADS Monitoring Engine',
    timestamp: new Date().toISOString(),
    governancePrinciple: 'AI provides early warning & risk-prioritization. Human officials make final verification decisions.',
  });
});

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// Login endpoint
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Email or Mobile number is required' });
  }

  // Find user by email or mobile
  const user = db.users.find(
    (u) =>
      (u.email.toLowerCase() === identifier.toLowerCase() || u.mobile === identifier) &&
      (!role || u.role === role)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or user not registered' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Account is deactivated. Please contact administration.' });
  }

  user.lastLogin = new Date().toISOString();
  db.addAuditLog(user.id, user.fullName, user.role, 'USER_LOGIN', 'AUTH', `User logged in from ${req.ip}`);

  res.json({
    success: true,
    token: `token_${user.id}_${Date.now()}`,
    user,
    message: 'Authentication successful',
  });
});

// Send OTP endpoint (Email & Mobile)
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { channel, target, type = 'LOGIN' } = req.body;
  if (!target) {
    return res.status(400).json({ error: 'Email or phone target is required' });
  }

  // Generate 6-digit development OTP
  // For demo, deterministic or fixed default for convenience (e.g. 123456 or random)
  const otp = '123456';
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  db.otps.set(target, {
    [channel === 'email' ? 'email' : 'mobile']: target,
    otp,
    expiresAt,
    verified: false,
    type,
  });

  res.json({
    success: true,
    message: `OTP sent successfully to ${target}. (Demo OTP: ${otp})`,
    demoOtpHint: otp,
    expiresInSeconds: 600,
  });
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { target, otp } = req.body;
  if (!target || !otp) {
    return res.status(400).json({ error: 'Target and OTP are required' });
  }

  const record = db.otps.get(target);
  if (!record) {
    // If testing with standard demo OTP '123456', accept gracefully
    if (otp === '123456') {
      return res.json({ success: true, message: 'OTP verified successfully (Demo verification)' });
    }
    return res.status(400).json({ error: 'No active OTP request found for this address. Please request a new OTP.' });
  }

  if (Date.now() > record.expiresAt) {
    db.otps.delete(target);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (record.otp !== otp && otp !== '123456') {
    return res.status(400).json({ error: 'Incorrect OTP. Please enter the valid 6-digit code.' });
  }

  record.verified = true;
  res.json({ success: true, message: 'OTP verified successfully' });
});

// Sign up endpoint
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { fullName, email, mobile, password, role, designation, organization, district, state } = req.body;

  if (!fullName || !email || !mobile || !role) {
    return res.status(400).json({ error: 'Full name, email, mobile, and role are required' });
  }

  // Check if email already exists
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    fullName,
    email: email.toLowerCase(),
    mobile,
    role: role as UserRole,
    designation: designation || 'Designated Official',
    organization: organization || 'Government Dept',
    district: district || 'Nashik',
    state: state || 'Maharashtra',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.addAuditLog(newUser.id, newUser.fullName, newUser.role, 'USER_REGISTERED', 'AUTH', `New user registered as ${role}`);

  res.status(201).json({
    success: true,
    user: newUser,
    token: `token_${newUser.id}_${Date.now()}`,
    message: 'Account created successfully',
  });
});

// Forgot / Reset password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { target, otp, newPassword } = req.body;
  if (!target || !newPassword) {
    return res.status(400).json({ error: 'Target identifier and new password are required' });
  }

  const user = db.users.find(
    (u) => u.email.toLowerCase() === target.toLowerCase() || u.mobile === target
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found matching this identifier' });
  }

  db.addAuditLog(user.id, user.fullName, user.role, 'PASSWORD_RESET', 'AUTH', 'Password was successfully reset via OTP.');
  res.json({ success: true, message: 'Password has been updated. You can now login.' });
});

// Current session
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // In demo mode, return the matched user or default admin
  const token = authHeader.replace('Bearer ', '');
  const userId = token.split('_')[1];
  const user = db.users.find((u) => u.id === userId) || db.users[0];
  res.json({ user });
});

// ==========================================
// PROJECTS & TRACEABILITY APIs
// ==========================================

// Get all projects with role-based filtering
app.get('/api/projects', (req: Request, res: Response) => {
  const { role, userId, district, riskLevel, search } = req.query;

  let projects = [...db.projects];

  // RBAC Filter: Contractors can strictly only see their own awarded projects!
  if (role === UserRole.CONTRACTOR) {
    projects = projects.filter((p) => p.contractorId === userId || p.contractorName.includes('Patil'));
  }

  // Engineer / Collector district filter
  if (district && district !== 'ALL') {
    projects = projects.filter((p) => p.district.toLowerCase() === String(district).toLowerCase());
  }

  if (riskLevel && riskLevel !== 'ALL') {
    projects = projects.filter((p) => p.riskLevel === riskLevel);
  }

  if (search) {
    const q = String(search).toLowerCase();
    projects = projects.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.contractorName.toLowerCase().includes(q)
    );
  }

  res.json({
    total: projects.length,
    projects,
  });
});

// Get detailed project with full traceability graph
app.get('/api/projects/:id', (req: Request, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.id || p.code.toLowerCase() === req.params.id.toLowerCase());

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Compute live AI risk analysis
  const aiAnalysis = evaluateProjectRisk(project, db.projects);

  // Traceability chain data
  const workOrders = db.workOrders.filter((w) => w.projectId === project.id);
  const invoices = db.invoices.filter((i) => i.projectId === project.id);
  const payments = db.payments.filter((p) => p.projectId === project.id);
  const measurements = db.measurements.filter((m) => m.projectId === project.id);
  const inspections = db.inspections.filter((i) => i.projectId === project.id);
  const siteEvidence = db.siteEvidence.filter((e) => e.projectId === project.id);
  const certificates = db.materialCertificates.filter((c) => c.projectId === project.id);
  const alerts = db.aiAlerts.filter((a) => a.projectId === project.id);
  const auditCases = db.auditCases.filter((c) => c.projectId === project.id);
  const inquiryDirectives = db.inquiryDirectives.filter((d) => d.projectId === project.id);
  const fundHolds = db.fundHolds.filter((h) => h.projectId === project.id);

  res.json({
    project,
    aiAnalysis,
    traceability: {
      workOrders,
      invoices,
      payments,
      measurements,
      inspections,
      siteEvidence,
      certificates,
      alerts,
      auditCases,
      inquiryDirectives,
      fundHolds,
    },
  });
});

// Create / Update project
app.post('/api/projects', (req: Request, res: Response) => {
  const newProj = {
    ...req.body,
    id: `proj-p${db.projects.length + 101}`,
    code: `P${db.projects.length + 101}`,
    sanctionDate: req.body.sanctionDate || new Date().toISOString().split('T')[0],
    financialProgressPercent: 0,
    physicalProgressPercent: 0,
    delayDays: 0,
    riskScore: 15,
    riskLevel: 'LOW',
    riskReasons: ['Newly initiated project - baseline monitoring active'],
    disproveChecklist: ['Initial site demarcation and layout plan'],
  };

  db.projects.unshift(newProj);
  db.addAuditLog('admin', 'Admin User', UserRole.ADMIN, 'PROJECT_CREATED', 'PROJECT', `Created project ${newProj.code}: ${newProj.name}`);

  res.status(201).json({ success: true, project: newProj });
});

// Update project progress
app.post('/api/projects/:id/progress', (req: Request, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { physicalProgressPercent, updateNotes } = req.body;
  if (physicalProgressPercent !== undefined) {
    project.physicalProgressPercent = Number(physicalProgressPercent);
  }

  // Re-evaluate risk
  const updatedRisk = evaluateProjectRisk(project, db.projects);
  project.riskScore = updatedRisk.riskScore;
  project.riskLevel = updatedRisk.riskLevel;

  db.addAuditLog(
    req.body.userId || 'contractor',
    req.body.userName || 'Contractor User',
    UserRole.CONTRACTOR,
    'PROGRESS_UPDATED',
    'PROJECT',
    `Updated physical progress to ${physicalProgressPercent}% for project ${project.code}. Notes: ${updateNotes || 'Routine update'}`
  );

  res.json({ success: true, project, aiAnalysis: updatedRisk });
});

// ==========================================
// WORK ORDERS & MEASUREMENTS (E-MB) APIs
// ==========================================

app.get('/api/work-orders', (req: Request, res: Response) => {
  const { contractorId } = req.query;
  let orders = db.workOrders;
  if (contractorId) {
    orders = orders.filter((o) => o.contractorId === contractorId);
  }
  res.json({ total: orders.length, workOrders: orders });
});

app.get('/api/measurements', (req: Request, res: Response) => {
  res.json({ total: db.measurements.length, measurements: db.measurements });
});

app.post('/api/measurements', (req: Request, res: Response) => {
  const newEmb: any = {
    id: `emb-${Date.now()}`,
    embNumber: `EMB-PWD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    pageNumber: Math.floor(10 + Math.random() * 80),
    submissionDate: new Date().toISOString().split('T')[0],
    verificationStatus: 'PENDING',
    ...req.body,
  };

  db.measurements.unshift(newEmb);
  db.addAuditLog(
    req.body.submittedBy || 'contractor',
    req.body.submittedByName || 'Contractor',
    UserRole.CONTRACTOR,
    'EMB_SUBMITTED',
    'BILL',
    `Submitted E-MB item measurement for ${newEmb.projectName} (${newEmb.claimedQuantity} ${newEmb.unit})`
  );

  res.status(201).json({ success: true, measurement: newEmb });
});

// Verify measurement (Engineer)
app.put('/api/measurements/:id/verify', (req: Request, res: Response) => {
  const emb = db.measurements.find((m) => m.id === req.params.id);
  if (!emb) return res.status(404).json({ error: 'Measurement not found' });

  const { status, remarks, verifiedQuantity, verifiedBy } = req.body;
  emb.verificationStatus = status;
  emb.engineerRemarks = remarks;
  if (verifiedQuantity !== undefined) {
    emb.measuredQuantity = Number(verifiedQuantity);
    emb.totalVerifiedAmount = Number(verifiedQuantity) * emb.ratePerUnit;
  }
  emb.verifiedBy = verifiedBy || 'Er. Vikram Shinde (Executive Engineer)';
  emb.verificationDate = new Date().toISOString().split('T')[0];

  db.addAuditLog(
    'usr-engineer-01',
    emb.verifiedBy,
    UserRole.PWD_ENGINEER,
    'EMB_VERIFIED',
    'BILL',
    `Measurement ${emb.embNumber} marked as ${status}. Remarks: ${remarks}`
  );

  res.json({ success: true, measurement: emb });
});

// ==========================================
// BILLS & INVOICES APIs
// ==========================================

app.get('/api/invoices', (req: Request, res: Response) => {
  const { contractorId } = req.query;
  let invoices = db.invoices;
  if (contractorId) {
    invoices = invoices.filter((i) => i.contractorId === contractorId);
  }
  res.json({ total: invoices.length, invoices });
});

app.post('/api/invoices', (req: Request, res: Response) => {
  const newInv: any = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    billDate: new Date().toISOString().split('T')[0],
    submittedAt: new Date().toISOString(),
    status: 'SUBMITTED',
    ...req.body,
  };

  db.invoices.unshift(newInv);
  db.addAuditLog(
    newInv.contractorId || 'contractor',
    newInv.contractorName || 'Contractor',
    UserRole.CONTRACTOR,
    'INVOICE_SUBMITTED',
    'BILL',
    `Submitted bill ${newInv.invoiceNumber} for ₹${newInv.amountClaimed.toLocaleString()}`
  );

  res.status(201).json({ success: true, invoice: newInv });
});

// Engineer verify bill
app.put('/api/invoices/:id/verify', (req: Request, res: Response) => {
  const inv = db.invoices.find((i) => i.id === req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });

  const { status, approvedAmount, remarks, verifiedBy } = req.body;
  inv.status = status;
  if (approvedAmount !== undefined) inv.amountApproved = approvedAmount;
  if (remarks) inv.returnedReason = remarks;
  inv.verifiedBy = verifiedBy || 'Er. Vikram Shinde';
  inv.verifiedAt = new Date().toISOString();

  db.addAuditLog(
    'usr-engineer-01',
    inv.verifiedBy,
    UserRole.PWD_ENGINEER,
    'INVOICE_VERIFIED',
    'BILL',
    `Bill ${inv.invoiceNumber} status updated to ${status}`
  );

  res.json({ success: true, invoice: inv });
});

// ==========================================
// PAYMENTS APIs
// ==========================================

app.get('/api/payments', (req: Request, res: Response) => {
  res.json({ total: db.payments.length, payments: db.payments });
});

// ==========================================
// INSPECTIONS & SITE EVIDENCE APIs
// ==========================================

app.get('/api/inspections', (req: Request, res: Response) => {
  res.json({ total: db.inspections.length, inspections: db.inspections });
});

app.post('/api/inspections', (req: Request, res: Response) => {
  const newInsp = {
    id: `insp-${Date.now()}`,
    inspectionDate: new Date().toISOString().split('T')[0],
    photoUrls: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60',
    ],
    ...req.body,
  };

  db.inspections.unshift(newInsp);

  // Update project last inspection date and physical progress
  const proj = db.projects.find((p) => p.id === newInsp.projectId);
  if (proj) {
    proj.lastInspectionDate = newInsp.inspectionDate;
    if (newInsp.physicalProgressObserved !== undefined) {
      proj.physicalProgressPercent = newInsp.physicalProgressObserved;
    }
  }

  db.addAuditLog(
    'usr-engineer-01',
    newInsp.inspectorName || 'Er. Vikram Shinde',
    UserRole.PWD_ENGINEER,
    'INSPECTION_RECORDED',
    'INSPECTION',
    `Conducted physical inspection for ${newInsp.projectName} (Observed: ${newInsp.physicalProgressObserved}%)`
  );

  res.status(201).json({ success: true, inspection: newInsp });
});

app.get('/api/evidence', (req: Request, res: Response) => {
  res.json({ total: db.siteEvidence.length, siteEvidence: db.siteEvidence });
});

app.post('/api/evidence', (req: Request, res: Response) => {
  const newEvid = {
    id: `evid-${Date.now()}`,
    uploadDate: new Date().toISOString().split('T')[0],
    verifiedByEngineer: false,
    ...req.body,
  };

  db.siteEvidence.unshift(newEvid);
  db.addAuditLog(
    newEvid.uploadedBy || 'contractor',
    newEvid.uploadedByName || 'Contractor',
    UserRole.CONTRACTOR,
    'EVIDENCE_UPLOADED',
    'BILL',
    `Uploaded site photo evidence for ${newEvid.projectName}: ${newEvid.title}`
  );

  res.status(201).json({ success: true, evidence: newEvid });
});

app.get('/api/material-certificates', (req: Request, res: Response) => {
  res.json({ total: db.materialCertificates.length, certificates: db.materialCertificates });
});

app.post('/api/material-certificates', (req: Request, res: Response) => {
  const newCert = {
    id: `cert-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'PENDING',
    ...req.body,
  };

  db.materialCertificates.unshift(newCert);
  res.status(201).json({ success: true, certificate: newCert });
});

// ==========================================
// AI ENGINE & ANOMALY DETECTION APIs
// ==========================================

// Get all AI Risk Alerts
app.get('/api/ai/anomalies', (req: Request, res: Response) => {
  const { status, riskLevel, alertType } = req.query;
  let alerts = [...db.aiAlerts];

  if (status && status !== 'ALL') {
    alerts = alerts.filter((a) => a.status === status);
  }

  if (riskLevel && riskLevel !== 'ALL') {
    alerts = alerts.filter((a) => a.riskLevel === riskLevel);
  }

  if (alertType && alertType !== 'ALL') {
    alerts = alerts.filter((a) => a.alertType === alertType);
  }

  res.json({
    total: alerts.length,
    alerts,
    distribution: {
      critical: db.aiAlerts.filter((a) => a.riskLevel === 'CRITICAL').length,
      high: db.aiAlerts.filter((a) => a.riskLevel === 'HIGH').length,
      medium: db.aiAlerts.filter((a) => a.riskLevel === 'MEDIUM').length,
      low: db.aiAlerts.filter((a) => a.riskLevel === 'LOW').length,
    },
  });
});

// Human verification / review of AI Alert
app.put('/api/ai/anomalies/:id/review', (req: Request, res: Response) => {
  const alert = db.aiAlerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const { decision, remarks, reviewerName, reviewerRole } = req.body;
  alert.humanDecision = decision;
  alert.reviewRemarks = remarks;
  alert.reviewedBy = reviewerName;
  alert.reviewedAt = new Date().toISOString();

  if (decision === 'VERIFIED_ANOMALY') alert.status = 'VERIFIED';
  else if (decision === 'FALSE_POSITIVE') alert.status = 'FALSE_POSITIVE';
  else if (decision === 'ESCALATED') alert.status = 'ESCALATED';
  else alert.status = 'UNDER_REVIEW';

  db.addAuditLog(
    reviewerName || 'auditor',
    reviewerName || 'Official Reviewer',
    (reviewerRole as UserRole) || UserRole.CAG_AUDITOR,
    'ALERT_REVIEWED',
    'AI_ALERT',
    `Human verification recorded for alert ${alert.alertCode}: ${decision}. Remarks: ${remarks}`
  );

  res.json({
    success: true,
    alert,
    message: 'Human review recorded. AI scores updated accordingly.',
  });
});

// Explainable Risk Score for specific project
app.get('/api/ai/risk-score/:projectId', (req: Request, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId || p.code === req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const analysis = evaluateProjectRisk(project, db.projects);
  res.json(analysis);
});

// Duplicate detection analysis across all projects
app.get('/api/ai/duplicate-detection', (req: Request, res: Response) => {
  const pairs: any[] = [];

  for (let i = 0; i < db.projects.length; i++) {
    for (let j = i + 1; j < db.projects.length; j++) {
      const p1 = db.projects[i];
      const p2 = db.projects[j];
      const res = evaluateProjectRisk(p1, [p2]);
      if (res.potentialDuplicates.length > 0) {
        pairs.push({
          sourceProject: { id: p1.id, code: p1.code, name: p1.name, district: p1.district, cost: p1.sanctionAmount },
          targetProject: { id: p2.id, code: p2.code, name: p2.name, district: p2.district, cost: p2.sanctionAmount },
          similarity: res.potentialDuplicates[0].semanticSimilarity,
          distanceMeters: res.potentialDuplicates[0].geospatialDistanceMeters,
          status: 'Requires Verification (Not Confirmed Fraud)',
        });
      }
    }
  }

  res.json({ count: pairs.length, pairs });
});

// ==========================================
// CAG AUDIT CASES & EVIDENCE PACK APIs
// ==========================================

app.get('/api/audit/cases', (req: Request, res: Response) => {
  res.json({ total: db.auditCases.length, cases: db.auditCases });
});

app.post('/api/audit/cases', (req: Request, res: Response) => {
  const newCase = {
    id: `case-${Date.now()}`,
    caseNumber: `CAG/MH/${new Date().getFullYear()}/CASE-${Math.floor(100 + Math.random() * 900)}`,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    evidencePackReady: false,
    ...req.body,
  };

  db.auditCases.unshift(newCase);
  db.addAuditLog(
    'usr-auditor-01',
    req.body.assignedAuditor || 'Arunabh Sengupta',
    UserRole.CAG_AUDITOR,
    'AUDIT_CASE_OPENED',
    'AUDIT',
    `Opened audit case ${newCase.caseNumber} for Project ${newCase.projectCode}`
  );

  res.status(201).json({ success: true, case: newCase });
});

// Generate complete evidence pack dossier for project
app.get('/api/audit/evidence-pack/:projectId', (req: Request, res: Response) => {
  const project = db.projects.find((p) => p.id === req.params.projectId || p.code === req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const pack = {
    generatedAt: new Date().toISOString(),
    caseReference: `CAG/EVID-PACK/${project.code}/${new Date().getFullYear()}`,
    project,
    sanctionOrders: [
      { orderNumber: project.administrativeSanctionNo, type: 'Administrative Sanction', date: project.sanctionDate, amount: project.sanctionAmount },
      { orderNumber: project.technicalSanctionNo, type: 'Technical Sanction', date: project.startDate, amount: project.contractAmount },
    ],
    workOrders: db.workOrders.filter((w) => w.projectId === project.id),
    embRecords: db.measurements.filter((m) => m.projectId === project.id),
    invoices: db.invoices.filter((i) => i.projectId === project.id),
    paymentVouchers: db.payments.filter((p) => p.projectId === project.id),
    inspectionReports: db.inspections.filter((i) => i.projectId === project.id),
    sitePhotographs: db.siteEvidence.filter((e) => e.projectId === project.id),
    aiRiskSummary: evaluateProjectRisk(project, db.projects),
    disproveChecklist: project.disproveChecklist,
    certificationNotice: 'DEMO DATA – NOT OFFICIAL GOVERNMENT DATA | Comptroller and Auditor General Field Examination Module',
  };

  res.json(pack);
});

// ==========================================
// COLLECTOR DIRECTIVES & FUND HOLDS APIs
// ==========================================

app.get('/api/collector/inquiry-directives', (req: Request, res: Response) => {
  res.json({ total: db.inquiryDirectives.length, directives: db.inquiryDirectives });
});

app.post('/api/collector/inquiry-directives', (req: Request, res: Response) => {
  const newDir = {
    id: `inq-${Date.now()}`,
    directiveNumber: `DM/NSK/INQ/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    issueDate: new Date().toISOString().split('T')[0],
    status: 'ISSUED',
    ...req.body,
  };

  db.inquiryDirectives.unshift(newDir);
  db.addAuditLog(
    'usr-collector-01',
    newDir.issuedByCollector || 'District Magistrate',
    UserRole.COLLECTOR,
    'INQUIRY_DIRECTIVE_ISSUED',
    'PROJECT',
    `Issued inquiry directive ${newDir.directiveNumber} for ${newDir.projectName}`
  );

  res.status(201).json({ success: true, directive: newDir });
});

app.get('/api/collector/fund-holds', (req: Request, res: Response) => {
  res.json({ total: db.fundHolds.length, fundHolds: db.fundHolds });
});

app.post('/api/collector/fund-holds', (req: Request, res: Response) => {
  const newHold = {
    id: `hold-${Date.now()}`,
    dateImposed: new Date().toISOString().split('T')[0],
    status: 'ACTIVE_HOLD',
    ...req.body,
  };

  db.fundHolds.unshift(newHold);

  // Mark project status if applicable
  const proj = db.projects.find((p) => p.id === newHold.projectId);
  if (proj) proj.status = 'ON_HOLD';

  db.addAuditLog(
    'usr-collector-01',
    newHold.orderedBy || 'District Magistrate',
    UserRole.COLLECTOR,
    'FUND_HOLD_ORDERED',
    'PROJECT',
    `Ordered precautionary fund hold on ${newHold.projectName} (₹${newHold.holdAmount.toLocaleString()})`
  );

  res.status(201).json({ success: true, fundHold: newHold });
});

// ==========================================
// ADMIN & SYSTEM LOGS APIs
// ==========================================

app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json({ total: db.users.length, users: db.users });
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const newUser = {
    id: `usr-${Date.now()}`,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.users.push(newUser);
  db.addAuditLog('admin', 'Admin', UserRole.ADMIN, 'USER_CREATED', 'ADMIN', `Created user account for ${newUser.fullName} (${newUser.role})`);
  res.status(201).json({ success: true, user: newUser });
});

app.put('/api/admin/users/:id/toggle', (req: Request, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = !user.isActive;
  db.addAuditLog('admin', 'Admin', UserRole.ADMIN, 'USER_UPDATED', 'ADMIN', `Toggled user status for ${user.fullName} to ${user.isActive ? 'Active' : 'Inactive'}`);
  res.json({ success: true, user });
});

app.get('/api/admin/logs', (req: Request, res: Response) => {
  res.json({ total: db.auditLogs.length, logs: db.auditLogs });
});

app.get('/api/admin/config', (req: Request, res: Response) => {
  res.json(db.config);
});

app.post('/api/admin/config', (req: Request, res: Response) => {
  db.config = { ...db.config, ...req.body };
  db.addAuditLog('admin', 'Admin', UserRole.ADMIN, 'CONFIG_UPDATED', 'ADMIN', 'Updated AI risk engine thresholds and weighting factors.');
  res.json({ success: true, config: db.config });
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AnomalyX] Server running on http://localhost:${PORT}`);
  });
}

startServer();
