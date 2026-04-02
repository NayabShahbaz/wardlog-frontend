import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";

import Tabs from "../ui/Tabs";
import ClinicalNotesSection from "./ClinicalNotesSection";
import LabOrdersSection, { type LabOrder } from "./LabOrdersSection.tsx";
import ERoundsSection, { type ERound } from "./ERoundsSection";
import CreateNoteModal, { templateOptions } from "./CreateNoteModal";
import CreateLabOrderModal from "./CreateLabOrderModal.tsx";
import CreateERoundModal from "./CreateERoundModal.tsx";
import { type ClinicalNote, type SOAPNote } from "./ClinicalNoteCard";

type LabOrderFormData = {
  patientId: string;
  orderType: string;
  priority: string;
  tests: string;
};

type ERoundFormData = {
  patientId: string;
  date: string;
  vitals: Record<string, string>;
  assessment: string;
  plan: string;
};

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
  const { userName, userRole } = useOutletContext<UserContextType>();
  const isNurse = userRole === "Nurse";

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

  const generateId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // ── Handlers ───────────────────────────────────────────────────
  const handleSaveNote = (data: {
    patientId: string;
    template: string;
    fields: unknown;
  }) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const newNote: ClinicalNote = {
      id: generateId("cn"),
      title:
        templateOptions
          .find((t) => t.value === data.template)
          ?.label.split(" (")[0] || data.template,
      patientName: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: userName,
      date: new Date().toLocaleString(),
      status: "Draft",
      soap:
        data.template === "progress" ? (data.fields as SOAPNote) : undefined,
    };
    setNotes([newNote, ...notes]);
    setCreateNoteOpen(false);
  };

  const handleSaveLabOrder = (data: LabOrderFormData) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const newOrder: LabOrder = {
      id: generateId("lo"),
      orderType: orderTypeLabels[data.orderType] || data.orderType,
      patient: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: userName,
      date: new Date().toLocaleString(),
      priority: data.priority,
      status: "in-progress",
      tests: data.tests.split(",").map((t: string) => t.trim()),
    };
    setLabOrders([newOrder, ...labOrders]);
    setCreateLabOpen(false);
  };

  const handleSaveERound = (data: ERoundFormData) => {
    const patient = patientOptions.find((p) => p.value === data.patientId);
    const newRound: ERound = {
      id: generateId("er"),
      title: `Daily Progress - ${data.date}`,
      patient: patient?.label.split(" (")[0] || "Unknown",
      patientMrn: data.patientId,
      doctor: userName,
      date: data.date,
      vitals: data.vitals,
      assessment: data.assessment,
      plan: data.plan,
    };
    setERounds([newRound, ...eRounds]);
    setCreateERoundOpen(false);
  };

  useEffect(() => {
    const handleDischarge = (event: unknown) => {
      const mrn = (event as CustomEvent).detail.mrn;
      setNotes((prev) => prev.filter((n) => n.patientMrn !== mrn));
      setLabOrders((prev) => prev.filter((o) => o.patientMrn !== mrn));
      setERounds((prev) => prev.filter((r) => r.patientMrn !== mrn));
    };
    window.addEventListener("patientDischarged", handleDischarge);
    return () =>
      window.removeEventListener("patientDischarged", handleDischarge);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-0">
      {/* Header - No Button Here */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Clinical Documentation
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>Manage notes, orders, and rounds</span>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                Apr 2, 2026
              </span>
              <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                11:50 AM
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content - Passing the functions back down */}
      <div className="mt-2">
        {activeTab === 0 && (
          <ClinicalNotesSection
            notes={notes}
            onCreateNote={isNurse ? undefined : () => setCreateNoteOpen(true)}
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
            onRecordRound={
              isNurse ? undefined : () => setCreateERoundOpen(true)
            }
          />
        )}
      </div>

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
    </div>
  );
};

export default ClinicalDocumentation;
