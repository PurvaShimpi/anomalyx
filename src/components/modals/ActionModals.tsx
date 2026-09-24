import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, db } from '../../server/db';
import { UserRole } from '../../types';
import { X, Send, Camera, Receipt, ClipboardCheck, Scale, MapPin } from 'lucide-react';

// ==========================================
// 1. INQUIRY DIRECTIVE MODAL (COLLECTOR)
// ==========================================
interface InquiryDirectiveModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const InquiryDirectiveModal: React.FC<InquiryDirectiveModalProps> = ({ onClose, onSuccess }) => {
  const { user, addToast } = useAuth();
  const [projectId, setProjectId] = useState('proj-p102');
  const [assignedAuthority, setAssignedAuthority] = useState('Sub-Divisional Magistrate (SDM), Niphad & Superintending Engineer (PWD)');
  const [reason, setReason] = useState('Critical physical vs financial progress mismatch (45% physical vs 92% funds disbursed) and 91% duplicate work anomaly with P108.');
  const [deadlineDays, setDeadlineDays] = useState('14');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = INITIAL_PROJECTS.find((p) => p.id === projectId);
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

    const newDir = {
      id: `inq-${Date.now()}`,
      directiveNumber: `DM/NSK/INQ/2026/0${db.inquiryDirectives.length + 15}`,
      projectId,
      projectCode: proj?.code || 'P102',
      projectName: proj?.name || 'Project',
      issuedByCollector: user?.fullName || 'District Magistrate',
      assignedAuthority,
      issueDate: new Date().toISOString().split('T')[0],
      deadlineDate: deadlineDate.toISOString().split('T')[0],
      reason,
      requiredDeliverables: [
        'Joint physical inventory measurement statement',
        'Cadastral boundary demarcation map verifying independent plot from P108',
        'Executive Engineer formal report on steel truss billing reconciliation',
      ],
      status: 'ISSUED' as const,
      collectorRemarks: 'Prioritize inspection within 7 days. Fund disbursements frozen.',
    };

    db.inquiryDirectives.unshift(newDir);
    db.addAuditLog(
      user?.id || 'collector',
      user?.fullName || 'Collector',
      UserRole.COLLECTOR,
      'INQUIRY_DIRECTIVE_ISSUED',
      'PROJECT',
      `Issued inquiry directive ${newDir.directiveNumber} for ${newDir.projectName}`
    );

    addToast('success', 'Inquiry Directive Issued', `Directive ${newDir.directiveNumber} assigned to ${assignedAuthority}`);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Issue Official Administrative Inquiry Directive
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.riskLevel} RISK)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Investigating Authority:</label>
            <input
              type="text"
              value={assignedAuthority}
              onChange={(e) => setAssignedAuthority(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Inquiry Grounds &amp; Scope:</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Compliance Deadline (Days):</label>
            <input
              type="number"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              min="3"
              max="60"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Issue Inquiry Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. SUBMIT BILL / INVOICE MODAL (CONTRACTOR)
// ==========================================
interface NewInvoiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({ onClose, onSuccess }) => {
  const { user, addToast } = useAuth();
  const [projectId, setProjectId] = useState('proj-p101');
  const [amount, setAmount] = useState('250000');
  const [embRef, setEmbRef] = useState('EMB-PWD-2025-044 Page 18');
  const [billDescription, setBillDescription] = useState('Running Account (RA) Bill for civil tiling & plastering work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = INITIAL_PROJECTS.find((p) => p.id === projectId);
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/PATIL/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      projectId,
      projectCode: proj?.code || 'P101',
      projectName: proj?.name || 'Project',
      contractorId: user?.id || 'usr-contractor-01',
      contractorName: user?.fullName || 'Patil Infrastructure & Works Pvt Ltd',
      amountClaimed: Number(amount),
      billDate: new Date().toISOString().split('T')[0],
      embReference: embRef,
      status: 'SUBMITTED' as const,
      submittedAt: new Date().toISOString(),
    };

    db.invoices.unshift(newInv);
    db.addAuditLog(
      user?.id || 'contractor',
      user?.fullName || 'Contractor',
      UserRole.CONTRACTOR,
      'INVOICE_SUBMITTED',
      'BILL',
      `Submitted invoice ${newInv.invoiceNumber} for ₹${Number(amount).toLocaleString()}`
    );

    addToast('success', 'Bill Submitted', `Invoice ${newInv.invoiceNumber} submitted for technical verification.`);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Submit Contractor Bill / RA Invoice
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Awarded Project:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {INITIAL_PROJECTS.filter((p) => p.contractorName.includes('Patil')).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Claimed (₹):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Supporting E-MB Reference:</label>
            <input
              type="text"
              value={embRef}
              onChange={(e) => setEmbRef(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Description / Milestones:</label>
            <textarea
              rows={2}
              value={billDescription}
              onChange={(e) => setBillDescription(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Bill for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. UPLOAD SITE EVIDENCE (CONTRACTOR / PWD)
// ==========================================
interface UploadEvidenceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadEvidenceModal: React.FC<UploadEvidenceModalProps> = ({ onClose, onSuccess }) => {
  const { user, addToast } = useAuth();
  const [projectId, setProjectId] = useState('proj-p101');
  const [title, setTitle] = useState('OPD Ward Floor Vitrified Tiling Progress');
  const [stage, setStage] = useState<'FOUNDATION' | 'SUPERSTRUCTURE' | 'FINISHING' | 'COMPLETED'>('FINISHING');
  const [description, setDescription] = useState('Geo-tagged photo of 600x600mm tile laying in Sector 3 Baramati PHC.');
  const [lat, setLat] = useState('18.1517');
  const [lng, setLng] = useState('74.5772');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = INITIAL_PROJECTS.find((p) => p.id === projectId);
    const newEv = {
      id: `evid-${Date.now()}`,
      projectId,
      projectCode: proj?.code || 'P101',
      projectName: proj?.name || 'Project',
      uploadedBy: user?.fullName || 'Contractor',
      uploadDate: new Date().toISOString().split('T')[0],
      title,
      description,
      stage,
      geoCoordinates: { lat: Number(lat), lng: Number(lng) },
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60',
      verifiedByEngineer: false,
    };

    db.siteEvidence.unshift(newEv);
    db.addAuditLog(
      user?.id || 'contractor',
      user?.fullName || 'Contractor',
      UserRole.CONTRACTOR,
      'EVIDENCE_UPLOADED',
      'BILL',
      `Uploaded site photo evidence for ${newEv.projectName}`
    );

    addToast('success', 'Evidence Uploaded', 'Geo-tagged photographic evidence saved with GPS coordinates.');
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Upload Geo-Tagged Site Evidence
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Project:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Evidence Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Construction Stage:</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="FOUNDATION">Foundation</option>
                <option value="SUPERSTRUCTURE">Superstructure</option>
                <option value="FINISHING">Finishing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GPS Accuracy:</label>
              <input
                type="text"
                disabled
                value="± 3.8 meters (Verified)"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Latitude:</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Longitude:</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Work Description:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              Upload &amp; Tag Photo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. SCHEDULE / RECORD INSPECTION (ENGINEER)
// ==========================================
interface ScheduleInspectionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({ onClose, onSuccess }) => {
  const { user, addToast } = useAuth();
  const [projectId, setProjectId] = useState('proj-p102');
  const [progress, setProgress] = useState('45');
  const [rating, setRating] = useState<'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'SUBSTANDARD' | 'EXCELLENT'>('NEEDS_IMPROVEMENT');
  const [observations, setObservations] = useState('Inspected roof steel truss assembly. Noted incomplete erection of bay 5 to 9. Steel material claimed in bill INV-2025-099 not found stored on site.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = INITIAL_PROJECTS.find((p) => p.id === projectId);
    const newInsp = {
      id: `insp-${Date.now()}`,
      projectId,
      projectCode: proj?.code || 'P102',
      projectName: proj?.name || 'Project',
      inspectorName: user?.fullName || 'Er. Vikram Shinde',
      inspectorRole: 'Executive Engineer (PWD)',
      inspectionDate: new Date().toISOString().split('T')[0],
      physicalProgressObserved: Number(progress),
      qualityRating: rating,
      observations,
      correctiveActionsRequired: 'Reconcile physical steel quantities with E-MB entries before submitting next bill.',
      geoTag: { lat: 20.0768, lng: 74.1084, accuracyMeters: 4.1 },
      photoUrls: ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800&auto=format&fit=crop&q=60'],
    };

    db.inspections.unshift(newInsp);
    if (proj) {
      proj.lastInspectionDate = newInsp.inspectionDate;
      proj.physicalProgressPercent = Number(progress);
    }

    db.addAuditLog(
      user?.id || 'engineer',
      user?.fullName || 'Engineer',
      UserRole.PWD_ENGINEER,
      'INSPECTION_RECORDED',
      'INSPECTION',
      `Recorded site inspection for ${newInsp.projectName} (Observed: ${progress}%)`
    );

    addToast('success', 'Inspection Recorded', `Site report filed for ${proj?.code}. Observed progress: ${progress}%`);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Record Official Site Inspection
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Under Supervision:</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            >
              {INITIAL_PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Observed Physical Progress (%):</label>
              <input
                type="number"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                min="0"
                max="100"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quality Assessment:</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold"
              >
                <option value="EXCELLENT">Excellent</option>
                <option value="SATISFACTORY">Satisfactory</option>
                <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                <option value="SUBSTANDARD">Substandard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Technical Observations &amp; Ground Reality:</label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              File Inspection Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
