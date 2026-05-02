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
  if (s === "pending") return "outline" as const;
  if (s === "in-progress") return "dark" as const;
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
          const activeTasks = myTasks.filter(
            (t: Task) => t.status !== "completed",
          );
          setTasks(activeTasks.slice(0, 3));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Stat Cards ────────────────────────────────────────────────
  const basePath = isNurse ? "/nurse" : "/doctor";

  const statCards = [
    {
      label: "My Patients",
      value: String(patients.length),
      sub: `${patients.filter((p) => p.status === "admitted").length} admitted`,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: HiOutlineUsers,
    },
    {
      label: "My Tasks",
      value: String(tasks.length),
      sub: `${tasks.filter((t) => t.priority === "high").length} urgent`,
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: HiOutlineCheckCircle,
    },
    {
      label: "Clinical Notes",
      value: String(notes.length),
      sub: "Recent updates",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: HiOutlineClipboardDocument,
    },
    {
      label: "Active Notices",
      value: String(notices.length),
      sub: "Hospital-wide",
      color: "bg-red-100",
      iconColor: "text-red-600",
      icon: HiOutlineBell,
    },
  ];

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>
    );

  return (
    <>
      <WelcomeHeader
        name={userName}
        department="General Medicine"
        date={new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        time={new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Tasks Section */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate(`${basePath}/tasks`)}
        >
          <SectionCard title="Priority Tasks" icon={HiOutlineCheckCircle}>
            <div className="min-h-[210px]">
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <ListRow key={task._id}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {task.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          text={task.priority}
                          variant={priorityVariant(task.priority)}
                        />
                        <Badge
                          text={task.status}
                          variant={statusVariant(task.status)}
                        />
                      </div>
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No pending tasks" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Noticeboard Section */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate(`${basePath}/noticeboard`)}
        >
          <SectionCard title="Noticeboard" icon={HiOutlineBell}>
            <div className="min-h-[210px]">
              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <ListRow key={notice._id}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notice.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {notice.category}
                        </p>
                      </div>
                      <Badge
                        text={notice.priority}
                        variant={priorityVariant(notice.priority)}
                      />
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No new notices" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patients Section */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate(`${basePath}/patients`)}
        >
          <SectionCard title="My Patients" icon={HiOutlineUsers}>
            <div className="min-h-[210px]">
              {patients.length > 0 ? (
                <div className="space-y-3">
                  {patients.slice(0, 3).map((p) => (
                    <ListRow key={p.mrn}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.mrn}
                          {p.ward && ` · ${p.ward} ${p.bedNumber ?? ""}`}
                        </p>
                      </div>
                      <Badge text={p.diagnosis ?? "—"} variant="outline" />
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No patients assigned" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Notes Section */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate(`${basePath}/clinical-docs`)}
        >
          <SectionCard
            title="Recent Clinical Notes"
            icon={HiOutlineDocumentText}
          >
            <div className="min-h-[210px]">
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <ListRow key={note._id}>
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <HiOutlineDocumentText className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600 truncate">
                            {note.title}
                          </p>
                          {note.patientName && (
                            <p className="text-xs text-gray-400 truncate">
                              {note.patientName}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        text={note.status}
                        variant={note.status === "Final" ? "dark" : "outline"}
                      />
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No clinical documents" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
