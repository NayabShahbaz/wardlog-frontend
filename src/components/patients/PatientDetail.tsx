import { useState, useEffect, useCallback } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useOutletContext,
} from "react-router-dom";
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
import { apiFetch } from "../../utils/api";

type PopulatedRef = string | { _id: string; name?: string } | null | undefined;

interface Patient {
  _id?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  diagnosis?: string;
  patientType: "inpatient" | "outpatient";
  status: "admitted" | "outpatient" | "discharged" | "completed";
  ward?: string;
  bedNumber?: string;
  assignedDoctor: PopulatedRef;
  assignedNurse: PopulatedRef;
  admissionDate?: string;
  appointmentDate?: string;
}

interface UserContext {
  userId: string;
  userName: string;
  userRole: string;
}

const getRefName = (ref: PopulatedRef): string =>
  !ref ? "—" : typeof ref === "string" ? ref : (ref.name ?? "—");

const getFullName = (p: Patient) => `${p.firstName} ${p.lastName}`;

const calcAge = (dob: string): number => {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const formatDate = (d?: string) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
};

const PatientDetail = () => {
  const { userId, userName, userRole } = useOutletContext<UserContext>();
  const navigate = useNavigate();
  const location = useLocation();
  const { mrn } = useParams<{ mrn: string }>();
  const isNurse = userRole === "Nurse";
  const basePath = location.pathname.startsWith("/nurse")
    ? "/nurse"
    : "/doctor";

  // ── State ────────────────────────────────────────────────────
  const [patient, setPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [eRounds, setERounds] = useState<ERound[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLabOpen, setCreateLabOpen] = useState(false);
  const [createERoundOpen, setCreateERoundOpen] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────
  const fetchPatient = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/patients/${mrn}`);
      const result = await res.json();
      if (result.success) setPatient(result.data);
    } catch (err) {
      console.error("Failed to fetch patient:", err);
    }
  }, [mrn]);

  const fetchClinicalData = useCallback(async () => {
    try {
      const [notesRes, labsRes, roundsRes] = await Promise.all([
        apiFetch(`/api/clinical/notes?patientMrn=${mrn}`),
        apiFetch(`/api/clinical/lab-orders?patientMrn=${mrn}`),
        apiFetch(`/api/clinical/e-rounds?patientMrn=${mrn}`),
      ]);

      const [notesData, labsData, roundsData] = await Promise.all([
        notesRes.json(),
        labsRes.json(),
        roundsRes.json(),
      ]);

      if (notesData.success) {
        setNotes(
          (notesData.data as ClinicalNote[]).filter(
            (n) => n.patientMrn === mrn,
          ),
        );
      }
      if (labsData.success) {
        setLabOrders(
          (labsData.data as LabOrder[]).filter((l) => l.patientMrn === mrn),
        );
      }
      if (roundsData.success) {
        setERounds(
          (roundsData.data as ERound[]).filter((r) => r.patientMrn === mrn),
        );
      }
    } catch (err) {
      console.error("Failed to fetch clinical data:", err);
    }
  }, [mrn]);

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchPatient(), fetchClinicalData()]);
      setLoading(false);
    };
    load();
  }, [fetchPatient, fetchClinicalData]);

  // ── Save Handlers ────────────────────────────────────────────
  const templateLabels: Record<string, string> = {
    progress: "Progress Note",
    admission: "Admission Note",
    discharge: "Discharge Summary",
    procedure: "Procedure Note",
  };

  const handleSaveNote = async (data: {
    patientId: string;
    template: string;
    fields: Record<string, string>;
  }) => {
    if (!patient) return;
    try {
      const soap =
        data.template === "progress"
          ? {
              subjective: data.fields.subjective || "",
              objective: data.fields.objective || "",
              assessment: data.fields.assessment || "",
              plan: data.fields.plan || "",
            }
          : undefined;

      const fields =
        data.template !== "progress"
          ? Object.entries(data.fields)
              .filter(([, value]) => value)
              .map(([key, value]) => ({
                label: key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase()),
                value,
              }))
          : undefined;

      const payload = {
        title: templateLabels[data.template] || data.template,
        patientMrn: patient.mrn,
        patientName: getFullName(patient),
        doctor: userName,
        date: new Date().toLocaleString(),
        status: "Draft",
        template: data.template,
        soap,
        fields,
      };

      const res = await apiFetch("/api/clinical/notes", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchClinicalData();
        setCreateOpen(false);
      } else {
        console.error("Failed:", result.message);
      }
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  const orderTypeLabels: Record<string, string> = {
    blood_work: "Blood Work",
    imaging: "Imaging",
    urinalysis: "Urinalysis",
    microbiology: "Microbiology",
  };

  const handleSaveLabOrder = async (data: {
    patientId: string;
    orderType: string;
    priority: string;
    tests: string;
    notes: string;
  }) => {
    if (!patient) return;
    try {
      const payload = {
        patientMrn: patient.mrn,
        patient: getFullName(patient),
        orderType: orderTypeLabels[data.orderType] || data.orderType,
        doctor: userName,
        date: new Date().toLocaleString(),
        priority: data.priority,
        status: "pending",
        tests: data.tests
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: data.notes || undefined,
      };

      const res = await apiFetch("/api/clinical/lab-orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchClinicalData();
        setCreateLabOpen(false);
      } else {
        console.error("Failed:", result.message);
      }
    } catch (err) {
      console.error("Error saving lab order:", err);
    }
  };

  const handleSaveERound = async (data: {
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
    if (!patient) return;
    try {
      const payload = {
        title: `Daily Progress - ${data.date}`,
        patient: getFullName(patient),
        patientMrn: patient.mrn,
        doctor: userName,
        date: data.date,
        vitals: data.vitals,
        assessment: data.assessment,
        plan: data.plan,
      };

      const res = await apiFetch("/api/clinical/e-rounds", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchClinicalData();
        setCreateERoundOpen(false);
      } else {
        console.error("Failed:", result.message);
      }
    } catch (err) {
      console.error("Error saving e-round:", err);
    }
  };

  // ── Loading / Not Found ──────────────────────────────────────
  if (loading) {
    return <div className="p-8 text-center">Loading patient...</div>;
  }

  if (!patient) {
    return (
      <>
        <BackButton
          label="Back to Patients"
          onClick={() => navigate(`${basePath}/patients`)}
        />
        <div className="text-center py-20 text-gray-400">Patient not found</div>
      </>
    );
  }

  // ── Derived display data ─────────────────────────────────────
  const patientName = getFullName(patient);
  const age = calcAge(patient.dob);
  const statusVariant = patient.status === "admitted" ? "dark" : "outline";

  const allInfo = [
    {
      label: "Date of Birth",
      value: `${formatDate(patient.dob)} (${age} years)`,
    },
    { label: "Gender", value: patient.gender },
    { label: "Phone", value: patient.phone },
    { label: "Email", value: patient.email ?? "—" },
    { label: "Address", value: patient.address ?? "—", fullWidth: true },
    ...(patient.patientType === "inpatient"
      ? [
          { label: "Ward", value: patient.ward ?? "—" },
          { label: "Bed Number", value: patient.bedNumber ?? "—" },
          {
            label: "Admission Date",
            value: formatDate(patient.admissionDate),
          },
        ]
      : [
          {
            label: "Appointment Date",
            value: formatDate(patient.appointmentDate),
          },
        ]),
    { label: "Diagnosis", value: patient.diagnosis ?? "—" },
    { label: "Assigned Doctor", value: getRefName(patient.assignedDoctor) },
    { label: "Assigned Nurse", value: getRefName(patient.assignedNurse) },
  ];

  const tabs = [
    { label: "Clinical Notes", count: notes.length },
    { label: "Lab Orders", count: labOrders.length },
    { label: "E-rounds", count: eRounds.length },
  ];

  const patientDropdown = [{ label: patientName, value: patient.mrn }];

  void userId;

  return (
    <>
      <BackButton
        label="Back to Patients"
        onClick={() => navigate(`${basePath}/patients`)}
      />

      {/* Header */}
      <div className="max-w-8xl mx-auto px-6 mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{patientName}</h1>
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

      {/* Conditional Rendering for Tab Contents with Empty States */}
      {activeTab === 0 &&
        (notes.length > 0 ? (
          <ClinicalNotesSection
            notes={notes}
            onCreateNote={isNurse ? undefined : () => setCreateOpen(true)}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-4 font-medium">
              No clinical notes found for this patient.
            </p>
            {!isNurse && (
              <button
                onClick={() => setCreateOpen(true)}
                className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Clinical Note
              </button>
            )}
          </div>
        ))}

      {activeTab === 1 &&
        (labOrders.length > 0 ? (
          <LabOrdersSection
            orders={labOrders}
            onCreateOrder={() => setCreateLabOpen(true)}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-4 font-medium">
              No lab orders found for this patient.
            </p>
            <button
              onClick={() => setCreateLabOpen(true)}
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Lab Order
            </button>
          </div>
        ))}

      {activeTab === 2 &&
        (eRounds.length > 0 ? (
          <ERoundsSection
            rounds={eRounds}
            onRecordRound={
              isNurse ? undefined : () => setCreateERoundOpen(true)
            }
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-gray-500 mb-4 font-medium">
              No E-Rounds found for this patient.
            </p>
            {!isNurse && (
              <button
                onClick={() => setCreateERoundOpen(true)}
                className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Record E-Round
              </button>
            )}
          </div>
        ))}

      {/* Modals */}
      {!isNurse && (
        <>
          <CreateNoteModal
            isOpen={createOpen}
            onClose={() => setCreateOpen(false)}
            onSave={handleSaveNote}
            patients={patientDropdown}
          />
          <CreateERoundModal
            isOpen={createERoundOpen}
            onClose={() => setCreateERoundOpen(false)}
            onSave={handleSaveERound}
            patients={patientDropdown}
          />
        </>
      )}
      <CreateLabOrderModal
        isOpen={createLabOpen}
        onClose={() => setCreateLabOpen(false)}
        onSave={handleSaveLabOrder}
        patients={patientDropdown}
      />
    </>
  );
};

export default PatientDetail;
