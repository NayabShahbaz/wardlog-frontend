import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  HiOutlineClipboardDocument,
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import {
  StatCard,
  SectionCard,
  Badge,
  ListRow,
  EmptyState,
  WelcomeHeader,
} from "../ui";
import { apiFetch } from "../../utils/api";
import { type UserContextType } from "../layout/DoctorLayout";
// Ensure this path is 100% correct in your file structure
import CreateLabOrderModal from "../clinical/CreateLabOrderModal"; 

// ── Types ───────────────────────────────────────────────────────
type PopulatedRef = string | { _id: string; name?: string } | null | undefined;

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  assignedTo?: PopulatedRef;
}

interface Patient {
  _id: string; // Required for mapping to 'value'
  mrn: string;
  firstName: string;
  lastName: string;
  ward?: string;
  bedNumber?: string;
  diagnosis?: string;
  status: string;
  patientType?: string;
  assignedDoctor: PopulatedRef;
  assignedNurse: PopulatedRef;
}

interface ClinicalNote {
  _id: string;
  title: string;
  patientName?: string;
  patientMrn?: string;
  status: "Draft" | "Final";
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author?: { name: string } | string;
}

// ── Helpers ─────────────────────────────────────────────────────
const getRefId = (ref: PopulatedRef): string | undefined => {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref._id;
};

const priorityVariant = (p: string) => {
  const lower = p.toLowerCase();
  if (lower === "high") return "red" as const;
  if (lower === "medium") return "orange" as const;
  return "gray" as const;
};

const statusVariant = (s: string) => {
  const lower = s.toLowerCase();
  if (lower === "pending") return "outline" as const;
  if (lower === "in-progress") return "dark" as const;
  return "green" as const;
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { userId, userName, userRole } = useOutletContext<UserContextType>();
  const isNurse = userRole === "Nurse";

  // ── State ─────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // ── Fetching ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [pRes, tRes, notesRes, boardRes] = await Promise.all([
          apiFetch("/api/patients"),
          apiFetch("/api/tasks"),
          apiFetch("/api/clinical/notes"),
          apiFetch("/api/notices"),
        ]);

        const [pData, tData, notesData, boardData] = await Promise.all([
          pRes.json(),
          tRes.json(),
          notesRes.json(),
          boardRes.json(),
        ]);

        if (pData.success) {
          const myPatients = pData.data.filter((p: Patient) => {
            if (isNurse) return getRefId(p.assignedNurse) === userId;
            return getRefId(p.assignedDoctor) === userId;
          });
          setPatients(
            myPatients.filter(
              (p: Patient) =>
                p.status !== "discharged" && p.status !== "completed",
            ),
          );
        }

        if (tData.success) {
          const myTasks = tData.data.filter((t: Task) => {
            const assignedId = getRefId(t.assignedTo);
            return assignedId === userId;
          });
          setTasks(myTasks.filter((t: Task) => t.status !== "completed").slice(0, 3));
        }

        if (notesData.success && pData.success) {
          const myMrns = pData.data
            .filter((p: Patient) => {
              if (isNurse) return getRefId(p.assignedNurse) === userId;
              return getRefId(p.assignedDoctor) === userId;
            })
            .map((p: Patient) => p.mrn);

          const myNotes = notesData.data.filter((n: ClinicalNote) =>
            myMrns.includes(n.patientMrn),
          );
          setNotes(myNotes.slice(0, 3));
        }

        if (boardData.success) {
          setNotices(boardData.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId, isNurse]);

  // ── Data Transformation ──
  const patientOptionsForModal = patients.map((p) => ({
    label: `${p.firstName} ${p.lastName} (${p.mrn})`, 
    value: p._id, // Ensure this exists in the Patient interface[cite: 12]
  }));

  const handleSaveOrder = async (orderData: any) => {
    try {
      const res = await apiFetch("/api/clinical/lab-orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        setIsOrderModalOpen(false);
        alert("Lab order created successfully!");
      }
    } catch (err) {
      console.error("Failed to save lab order:", err);
    }
  };

  const basePath = isNurse ? "/nurse" : "/doctor";

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <>
      <WelcomeHeader
        name={userName}
        department="General Medicine"
        date={new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        time={new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      />

      <div className="mb-6 flex justify-between items-center">
         <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
         <button 
           onClick={() => setIsOrderModalOpen(true)}
           className="px-4 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-md hover:bg-gray-800 transition-all"
         >
           + New Lab Order
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="My Patients" value={String(patients.length)} sub="Active" color="bg-blue-100" iconColor="text-blue-600" icon={HiOutlineUsers} />
        <StatCard label="My Tasks" value={String(tasks.length)} sub="Pending" color="bg-green-100" iconColor="text-green-600" icon={HiOutlineCheckCircle} />
        <StatCard label="Notes" value={String(notes.length)} sub="Draft/Final" color="bg-orange-100" iconColor="text-orange-600" icon={HiOutlineClipboardDocument} />
        <StatCard label="Notices" value={String(notices.length)} sub="Hospital" color="bg-red-100" iconColor="text-red-600" icon={HiOutlineBell} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Added div wrappers with onClick to fix SectionCard prop errors */}
        <div onClick={() => navigate(`${basePath}/patients`)} className="cursor-pointer">
          <SectionCard title="My Patients" icon={HiOutlineUsers}>
            {patients.length > 0 ? (
              patients.slice(0, 3).map(p => (
                <ListRow key={p.mrn}>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-400">{p.mrn}</p>
                  </div>
                  <Badge text={p.diagnosis || "No Diagnosis"} variant="outline" />
                </ListRow>
              ))
            ) : <EmptyState message="No patients assigned" />}
          </SectionCard>
        </div>

        <div onClick={() => navigate(`${basePath}/tasks`)} className="cursor-pointer">
          <SectionCard title="Priority Tasks" icon={HiOutlineCheckCircle}>
            {tasks.length > 0 ? (
              tasks.map(t => (
                <ListRow key={t._id}>
                  <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                  <Badge text={t.priority} variant={priorityVariant(t.priority)} />
                </ListRow>
              ))
            ) : <EmptyState message="All clear!" />}
          </SectionCard>
        </div>
      </div>

      <CreateLabOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        patients={patientOptionsForModal} 
      />
    </>
  );
};

export default DoctorDashboard;