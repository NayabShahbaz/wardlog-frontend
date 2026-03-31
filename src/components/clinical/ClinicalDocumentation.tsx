import { useState } from "react";
import Tabs from "../ui/Tabs";
import ClinicalNotesSection from "./ClinicalNotesSection";
import LabOrdersSection, { type LabOrder } from "./LabOrdersSection.tsx";
import ERoundsSection, { type ERound } from "./ERoundsSection";
import CreateNoteModal, {
  templateFields,
  templateOptions,
} from "./CreateNoteModal";
import CreateLabOrderModal from "./CreateLabOrderModal.tsx";
import CreateERoundModal from "./CreateERoundModal.tsx";
import { type ClinicalNote } from "./ClinicalNoteCard";

// Mock data
const initialNotes: ClinicalNote[] = [
  {
    id: "cn-1",
    title: "Progress Note",
    patientName: "John Doe",
    patientMrn: "MRN001234",
    doctor: "Dr. Sarah Johnson",
    date: "3/12/2029, 1:30:00 PM",
    status: "Final",
    soap: {
      subjective: "Patient reports improved breathing, decreased cough",
      objective: "Temp 98.6°F, BP 120/80, RR 16, O2 sat 96% on room air",
      assessment: "Pneumonia improving on antibiotics",
      plan: "Continue current antibiotic regimen, reassess in 24 hours",
    },
  },
];

const initialLabOrders: LabOrder[] = [
  {
    id: "lo-1",
    orderType: "Blood Work",
    patient: "Mary Smith",
    patientMrn: "MRN001235",
    doctor: "Dr. Sarah Johnson",
    date: "3/12/2026, 11:30:00 AM",
    priority: "routine",
    status: "completed",
    tests: ["HbA1c", "Fasting Glucose"],
  },
  {
    id: "lo-2",
    orderType: "Blood Work",
    patient: "John Doe",
    patientMrn: "MRN001234",
    doctor: "Dr. Sarah Johnson",
    date: "3/12/2026, 12:00:00 PM",
    priority: "routine",
    status: "in-progress",
    tests: ["CBC", "CMP", "Blood Culture"],
  },
];

const initialERounds: ERound[] = [
  {
    id: "er-1",
    title: "Daily Progress - 3/12/2026",
    patient: "John Doe",
    patientMrn: "MRN001234",
    doctor: "Dr. Sarah Johnson",
    date: "3/12/2026",
    vitals: {
      temperature: "98.6",
      bp: "120/80",
      heartRate: "72",
      respRate: "16",
      o2Sat: "96",
    },
    assessment: "Patient showing improvement, lungs clearer on auscultation",
    plan: "Continue current treatment, monitor vitals q4h",
  },
];

const patientOptions = [
  { label: "John Doe (MRN001234)", value: "MRN001234" },
  { label: "Mary Smith (MRN001235)", value: "MRN001235" },
  { label: "John Doe (MRN001236)", value: "MRN001236" },
  { label: "John Doe (MRN001237)", value: "MRN001237" },
];

const orderTypeLabels: Record<string, string> = {
  blood_work: "Blood Work",
  imaging: "Imaging",
  urinalysis: "Urinalysis",
  microbiology: "Microbiology",
};

const ClinicalDocumentation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState<ClinicalNote[]>(initialNotes);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(initialLabOrders);
  const [eRounds, setERounds] = useState<ERound[]>(initialERounds);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [createLabOpen, setCreateLabOpen] = useState(false);
  const [createERoundOpen, setCreateERoundOpen] = useState(false);

  const tabs = [
    { label: "Clinical Notes", count: notes.length },
    { label: "Lab Orders", count: labOrders.length },
    { label: "E-Rounds", count: eRounds.length },
  ];

  // Save handlers
  const handleSaveNote = (data: {
    patientId: string;
    template: string;
    fields: Record<string, string>;
  }) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const templateLabel =
      templateOptions.find((t) => t.value === data.template)?.label ||
      data.template;

    const soap =
      data.template === "progress"
        ? {
            subjective: data.fields.subjective || "",
            objective: data.fields.objective || "",
            assessment: data.fields.assessment || "",
            plan: data.fields.plan || "",
          }
        : undefined;

    const tplFields = templateFields[data.template];
    const noteFields =
      data.template !== "progress" && tplFields
        ? tplFields
            .map((f) => ({ label: f.label, value: data.fields[f.key] || "" }))
            .filter((f) => f.value)
        : undefined;

    const newNote: ClinicalNote = {
      id: `cn-${notes.length + 1}`,
      title: templateLabel.split(" (")[0],
      patientName: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: "Dr. Sarah Johnson",
      date: new Date().toLocaleString(),
      status: "Draft",
      soap,
      fields: noteFields,
    };
    setNotes([newNote, ...notes]);
  };

  const handleSaveLabOrder = (data: {
    patientId: string;
    orderType: string;
    priority: string;
    tests: string;
    notes: string;
  }) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const newOrder: LabOrder = {
      id: `lo-${labOrders.length + 1}`,
      orderType: orderTypeLabels[data.orderType] || data.orderType,
      patient: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: "Dr. Sarah Johnson",
      date: new Date().toLocaleString(),
      priority: data.priority,
      status: "in-progress",
      tests: data.tests
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    setLabOrders([newOrder, ...labOrders]);
  };

  const handleSaveERound = (data: {
    patientId: string;
    date: string;
    vitals: {
      temperature: string;
      bp: string;
      heartRate: string;
      respRate: string;
      o2Sat: string;
    };
    assessment: string;
    plan: string;
  }) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const newRound: ERound = {
      id: `er-${eRounds.length + 1}`,
      title: `Daily Progress - ${data.date}`,
      patient: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: "Dr. Sarah Johnson",
      date: data.date,
      vitals: {
        temperature: data.vitals.temperature || undefined,
        bp: data.vitals.bp || undefined,
        heartRate: data.vitals.heartRate || undefined,
        respRate: data.vitals.respRate || undefined,
        o2Sat: data.vitals.o2Sat || undefined,
      },
      assessment: data.assessment,
      plan: data.plan,
    };
    setERounds([newRound, ...eRounds]);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Clinical Documentation
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-gray-500">
            Create and manage clinical notes, orders, and e-rounds
          </span>
          <span className="text-sm text-gray-400">Apr 1, 2025</span>
          <span className="text-sm text-gray-400">9:41 AM</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <ClinicalNotesSection
          notes={notes}
          onCreateNote={() => setCreateNoteOpen(true)}
        />
      )}

      {activeTab === 1 && (
        <LabOrdersSection
          orders={labOrders}
          onCreateOrder={() => setCreateLabOpen(true)}
        />
      )}

      {activeTab === 2 && (
        <ERoundsSection
          rounds={eRounds}
          onRecordRound={() => setCreateERoundOpen(true)}
        />
      )}

      {/* Modals */}
      <CreateNoteModal
        isOpen={createNoteOpen}
        onClose={() => setCreateNoteOpen(false)}
        onSave={handleSaveNote}
        patients={patientOptions}
      />
      <CreateLabOrderModal
        isOpen={createLabOpen}
        onClose={() => setCreateLabOpen(false)}
        onSave={handleSaveLabOrder}
        patients={patientOptions}
      />
      <CreateERoundModal
        isOpen={createERoundOpen}
        onClose={() => setCreateERoundOpen(false)}
        onSave={handleSaveERound}
        patients={patientOptions}
      />
    </>
  );
};

export default ClinicalDocumentation;
