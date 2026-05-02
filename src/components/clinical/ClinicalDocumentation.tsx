import { useEffect, useState, type ComponentType } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";

import Tabs from "../ui/Tabs";
import ClinicalNotesSection from "./ClinicalNotesSection";
import LabOrdersSection, { type LabOrder } from "./LabOrdersSection.tsx";
import ERoundsSection, { type ERound } from "./ERoundsSection";
import CreateNoteModal from "./CreateNoteModal";
import CreateLabOrderModal from "./CreateLabOrderModal.tsx";
import CreateERoundModal from "./CreateERoundModal.tsx";
import { type ClinicalNote } from "./ClinicalNoteCard";
import { apiFetch } from "../../utils/api.ts";

const ClinicalDocumentation = () => {
  const { userName, userRole } = useOutletContext<UserContextType>();
  const isNurse = userRole === "Nurse";

  // ── State Management ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [eRounds, setERounds] = useState<ERound[]>([]);
  const [patientOptions, setPatientOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [createLabOpen, setCreateLabOpen] = useState(false);
  const [createERoundOpen, setCreateERoundOpen] = useState(false);

  const token = localStorage.getItem("token");

  // ── Data Fetching ─────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all clinical data in parallel
      const [notesRes, labsRes, roundsRes, patientsRes] = await Promise.all([
        apiFetch("/api/clinical/notes", { headers }),
        apiFetch("/api/clinical/lab-orders", { headers }),
        apiFetch("/api/clinical/e-rounds", { headers }),
        apiFetch("/api/patients", { headers }),
      ]);

      const [notesData, labsData, roundsData, patientsData] = await Promise.all(
        [notesRes.json(), labsRes.json(), roundsRes.json(), patientsRes.json()],
      );

      // Map patients and use them as the master filter list
      if (patientsData.success) {
        // 1. Filter the patients so users only see their assigned patients
        const myPatients = patientsData.data.filter(
          (p: {
            assignedNurse?: string | { name?: string };
            assignedDoctor?: string | { name?: string };
            mrn: string;
            firstName: string;
            lastName: string;
          }) => {
            if (userRole === "Admin") return true;

            if (userRole === "Nurse") {
              // Note: If you bring 'supervisingDoctor' into the UI context later,
              // you can also check if p.assignedDoctor matches the nurse's supervising doctor here!
              return (
                p.assignedNurse === userName ||
                (typeof p.assignedNurse === "object" &&
                  p.assignedNurse?.name === userName)
              );
            }

            return (
              p.assignedDoctor === userName ||
              (typeof p.assignedDoctor === "object" &&
                p.assignedDoctor?.name === userName)
            );
          },
        );

        // 2. Extract ONLY the allowed MRNs
        const allowedMrns = myPatients.map((p: { mrn: string }) => p.mrn);

        // 3. STRICTLY filter the clinical documents based on allowed MRNs
        if (notesData.success) {
          setNotes(
            notesData.data.filter((n: { patientMrn: string }) =>
              allowedMrns.includes(n.patientMrn),
            ),
          );
        }
        if (labsData.success) {
          setLabOrders(
            labsData.data.filter((l: { patientMrn: string }) =>
              allowedMrns.includes(l.patientMrn),
            ),
          );
        }
        if (roundsData.success) {
          setERounds(
            roundsData.data.filter((r: { patientMrn: string }) =>
              allowedMrns.includes(r.patientMrn),
            ),
          );
        }

        // 4. Map the filtered list to the dropdown options
        const options = myPatients.map(
          (p: { firstName: string; lastName: string; mrn: string }) => ({
            label: `${p.firstName} ${p.lastName} (${p.mrn})`,
            value: p.mrn,
          }),
        );
        setPatientOptions(options);
      }
    } catch (err) {
      console.error("Failed to fetch clinical data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Save Handlers (Backend Integration) ───────────────────────
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
    try {
      const patient = patientOptions.find((p) => p.value === data.patientId);
      const patientName = patient?.label.split(" (")[0] ?? "";

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
        patientMrn: data.patientId,
        patientName,
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

      if (!res.ok || !result.success) {
        console.error("Failed to save note:", result.message);
        return;
      }

      await fetchData();
      setCreateNoteOpen(false);
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
    try {
      const patient = patientOptions.find((p) => p.value === data.patientId);
      const patientName = patient?.label.split(" (")[0] ?? "";

      const payload = {
        patientMrn: data.patientId,
        patient: patientName,
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

      if (!res.ok || !result.success) {
        console.error("Failed to save lab order:", result.message);
        return;
      }

      await fetchData();
      setCreateLabOpen(false);
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
    try {
      const patientObj = patientOptions.find((p) => p.value === data.patientId);
      const cleanPatientName = patientObj
        ? patientObj.label.split(" (")[0]
        : "Unknown";

      const payload = {
        title: `Daily Progress - ${data.date}`,
        patient: cleanPatientName,
        patientMrn: data.patientId,
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

      if (!res.ok || !result.success) {
        console.error("Failed to save e-round:", result.message);
        return;
      }

      await fetchData();
      setCreateERoundOpen(false);
    } catch (err) {
      console.error("Error saving e-round:", err);
    }
  };

  // ── UI Logic ──────────────────────────────────────────────────
  const tabs = [
    { label: "Clinical Notes", count: notes.length },
    { label: "Lab Orders", count: labOrders.length },
    { label: "E-Rounds", count: eRounds.length },
  ];

  const NotesSection = ClinicalNotesSection as ComponentType<{
    notes: ClinicalNote[];
    onCreateNote?: () => void;
  }>;

  if (loading)
    return <div className="p-8 text-center">Loading documentation...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Clinical Documentation
          </h1>
          <p className="text-sm text-gray-500">
            Manage notes, orders, and rounds
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      <div className="mt-2">
        {activeTab === 0 &&
          (notes.length > 0 ? (
            <NotesSection
              notes={notes}
              onCreateNote={isNurse ? undefined : () => setCreateNoteOpen(true)}
            />
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center mt-6">
              <p className="text-gray-500 mb-4 font-medium">
                No clinical notes found for your assigned patients.
              </p>
              {!isNurse && (
                <button
                  onClick={() => setCreateNoteOpen(true)}
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
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center mt-6">
              <p className="text-gray-500 mb-4 font-medium">
                No lab orders found for your assigned patients.
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
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center mt-6">
              <p className="text-gray-500 mb-4 font-medium">
                No E-Rounds found for your assigned patients.
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
      </div>

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
