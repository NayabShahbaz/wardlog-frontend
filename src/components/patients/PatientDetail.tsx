import { useState } from "react";
import { useLocation, useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Badge } from "../ui";
import InfoGrid from "../ui/InfoGrid";
import Tabs from "../ui/Tabs";
import BackButton from "../ui/BackButton";
import { type ClinicalNote } from "../clinical/ClinicalNoteCard";
import ClinicalNotesSection from "../clinical/ClinicalNotesSection";
import LabOrdersSection, { type LabOrder } from "../clinical/LabOrdersSection";
import ERoundsSection, { type ERound } from "../clinical/ERoundsSection";
import CreateNoteModal from "../clinical/CreateNoteModal";
import CreateLabOrderModal from "../clinical/CreateLabOrderModal";
import CreateERoundModal from "../clinical/CreateERoundModal";
import { HiOutlineUsers } from "react-icons/hi2";


interface Patient {
  name: string;
  mrn: string;
  status: "admitted" | "outpatient";
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  ward: string;
  bedNumber: string;
  admissionDate: string;
  diagnosis: string;
  assignedDoctor: string;
}

interface UserContext {
  userName: string;
  userRole: string;
}

const mockPatients: Record<string, Patient> = {
  MRN001234: {
    name: "John Doe",
    mrn: "MRN001234",
    status: "admitted",
    dob: "3/15/1985",
    age: 40,
    gender: "Male",
    phone: "555-1001",
    email: "john.doe@gmail.com",
    address: "123 Main St",
    ward: "Ward A",
    bedNumber: "A-101",
    admissionDate: "3/10/2026",
    diagnosis: "Pneumonia",
    assignedDoctor: "Dr. Sarah Johnson",
  },
  MRN001235: {
    name: "Mary Smith",
    mrn: "MRN001235",
    status: "admitted",
    dob: "6/20/1990",
    age: 35,
    gender: "Female",
    phone: "555-1002",
    email: "mary.smith@gmail.com",
    address: "456 Oak Ave",
    ward: "Ward A",
    bedNumber: "A-102",
    admissionDate: "3/11/2026",
    diagnosis: "Diabetes Management",
    assignedDoctor: "Dr. Sarah Johnson",
  },
  MRN001236: {
    name: "Robert Brown",
    mrn: "MRN001236",
    status: "outpatient",
    dob: "7/22/1990",
    age: 35,
    gender: "Male",
    phone: "555-1003",
    email: "robert.brown@gmail.com",
    address: "789 Pine Rd",
    ward: "",
    bedNumber: "",
    admissionDate: "",
    diagnosis: "Follow-up Checkup",
    assignedDoctor: "Dr. Sarah Johnson",
  },
  MRN001237: {
    name: "Jane Wilson",
    mrn: "MRN001237",
    status: "admitted",
    dob: "1/10/1978",
    age: 48,
    gender: "Female",
    phone: "555-1004",
    email: "jane.wilson@gmail.com",
    address: "321 Elm St",
    ward: "Ward A",
    bedNumber: "A-103",
    admissionDate: "3/09/2026",
    diagnosis: "Pneumonia",
    assignedDoctor: "Dr. Michael John",
  },
  MRN001238: {
    name: "Alice Cooper",
    mrn: "MRN001238",
    status: "outpatient",
    dob: "4/05/1995",
    age: 31,
    gender: "Female",
    phone: "555-1005",
    email: "alice.cooper@gmail.com",
    address: "555 Maple Dr",
    ward: "",
    bedNumber: "",
    admissionDate: "",
    diagnosis: "Blood Test Review",
    assignedDoctor: "Dr. Michael John",
  },
};

const mockClinicalNotes: ClinicalNote[] = [
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
      plan: "Continue current antibiotic regimen",
    },
  },
];

const mockLabOrders: LabOrder[] = [
  {
    id: "lo-1",
    orderType: "Blood Work",
    patient: "John Doe",
    patientMrn: "MRN001234",
    doctor: "Dr. Sarah Johnson",
    date: "3/11/2026, 10:00:00 AM",
    priority: "routine",
    status: "completed",
    tests: ["CBC", "CMP"],
  },
];

const mockERounds: ERound[] = [
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
    assessment: "Stable condition, lungs clearer",
    plan: "Continue current treatment, monitor vitals q4h",
  },
];



const PatientDetail = () => {
  const { userName,userRole } = useOutletContext<UserContext>(); // Get data from Layout
  const navigate = useNavigate();
  const location = useLocation();
  const isNurse = userRole === "Nurse";
  const { mrn } = useParams<{ mrn: string }>();
  const basePath = location.pathname.startsWith("/nurse") ? "/nurse" : "/doctor";
  const [activeTab, setActiveTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLabOpen, setCreateLabOpen] = useState(false);
  const [createERoundOpen, setCreateERoundOpen] = useState(false);
  const [notes, setNotes] = useState<ClinicalNote[]>(mockClinicalNotes);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(mockLabOrders);
  const [eRounds, setERounds] = useState<ERound[]>(mockERounds);

  const patient = mrn ? mockPatients[mrn] : null;

  if (!patient) {
    return (
      <>
        <div className="text-center py-20 text-gray-400">Patient not found</div>
      </>
    );
  }

  const statusVariant = patient.status === "admitted" ? "dark" : "outline";

  const allInfo = [
    {
      label: "Date of Birth",
      value: `${patient.dob} (${patient.age} years)`,
    },
    { label: "Gender", value: patient.gender },
    { label: "Phone", value: patient.phone },
    { label: "Email", value: patient.email },
    {
      label: "Address",
      value: patient.address,
      fullWidth: true,
    },
    { label: "Ward", value: patient.ward },
    { label: "Bed Number", value: patient.bedNumber },
    { label: "Admission Date", value: patient.admissionDate },
    { label: "Diagnosis", value: patient.diagnosis },
    { label: "Assigned Doctor", value: patient.assignedDoctor },
  ];

  const tabs = [
    { label: "Clinical Notes", count: notes.length },
    { label: "Lab Orders", count: labOrders.length },
    { label: "E-rounds", count: eRounds.length },
  ];

  const handleSaveNote = (data: {
    patientId: string;
    template: string;
    fields: Record<string, string>;
  }) => {
    const templateLabels: Record<string, string> = {
      progress: "Progress Note",
      admission: "Admission Note",
      discharge: "Discharge Summary",
      procedure: "Procedure Note",
    };

    const soap =
      data.template === "progress"
        ? {
            subjective: data.fields.subjective || "",
            objective: data.fields.objective || "",
            assessment: data.fields.assessment || "",
            plan: data.fields.plan || "",
          }
        : undefined;

    // Build generic fields for non-progress templates
    const noteFields =
      data.template !== "progress"
        ? Object.entries(data.fields)
            .map(([key, value]) => ({
              label: key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (s) => s.toUpperCase()),
              value,
            }))
            .filter((f) => f.value)
        : undefined;

    const newNote: ClinicalNote = {
      id: `cn-${notes.length + 1}`,
      title: templateLabels[data.template] || data.template,
      patientName: patient.name,
      patientMrn: patient.mrn,
      doctor: userName,
      date: new Date().toLocaleString(),
      status: "Draft",
      soap,
      fields: noteFields,
    };
    setNotes([newNote, ...notes]);
  };

  // 2. THE LAB ORDER FUNCTION (NEWLY DEFINED)
  const handleSaveLabOrder = (data: any) => {
    const newOrder: LabOrder = {
      id: `lo-${labOrders.length + 1}`,
      orderType: data.orderType === "blood_work" ? "Blood Work" : data.orderType,
      patient: patient.name,
      patientMrn: patient.mrn,
      doctor: userName, // <--- FIXED: Uses Context
      date: new Date().toLocaleString(),
      priority: data.priority,
      status: "in-progress",
      tests: data.tests.split(",").map((t: string) => t.trim()).filter(Boolean),
    };
    setLabOrders([newOrder, ...labOrders]);
  };

  // 3. THE E-ROUND FUNCTION (NEWLY DEFINED)
  const handleSaveERound = (data: any) => {
    const newRound: ERound = {
      id: `er-${eRounds.length + 1}`,
      title: `Daily Progress - ${data.date}`,
      patient: patient.name,
      patientMrn: patient.mrn,
      doctor: userName, // <--- FIXED: Uses Context
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
      <BackButton
        label="Back to Patients"
        onClick={() => navigate(`${basePath}/patients`)}
      />

      {/* Header */}
      <div className="max-w-8xl mx-auto px-6 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
          <p className="text-sm text-gray-500">MRN: {patient.mrn}</p>
        </div>
        <Badge text={patient.status} variant={statusVariant} />
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineUsers className="w-5 h-5 text-gray-700" />
          <h2 className="text-base font-bold text-gray-900">
            Patient Information
          </h2>
        </div>
        <InfoGrid items={allInfo} />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Clinical Notes */}
      {activeTab === 0 && (
        <ClinicalNotesSection
          notes={notes}
          onCreateNote={isNurse ? undefined : () => setCreateOpen(true)}
        />
      )}

      {/* Lab Orders */}
      {activeTab === 1 && (
        <LabOrdersSection
          orders={labOrders}
          onCreateOrder={() => setCreateLabOpen(true)}
        />
      )}

      {/* E-Rounds */}
      {activeTab === 2 && (
        <ERoundsSection
          rounds={eRounds}
          onRecordRound={isNurse ? undefined : () => setCreateERoundOpen(true)}
        />
      )}
      
      {!isNurse && (
        <>
          {/* Modals */}
          <CreateNoteModal
            isOpen={createOpen}
            onClose={() => setCreateOpen(false)}
            onSave={handleSaveNote}
            patients={[{ label: patient.name, value: patient.mrn }]}
          />
          
          <CreateERoundModal
            isOpen={createERoundOpen}
            onClose={() => setCreateERoundOpen(false)}
            onSave={handleSaveERound}
            patients={[{ label: patient.name, value: patient.mrn }]}
          />
        </>
      )}

      <CreateLabOrderModal
            isOpen={createLabOpen}
            onClose={() => setCreateLabOpen(false)}
            onSave={handleSaveLabOrder}
            patients={[{ label: patient.name, value: patient.mrn }]}
      />
    </>
  );
};


export default PatientDetail;
