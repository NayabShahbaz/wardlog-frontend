import { useNavigate } from "react-router-dom";
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

const myPatients = [
  {
    name: "John Doe",
    mrn: "MRN001234",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
  {
    name: "Mary Smith",
    mrn: "MRN001235",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
  {
    name: "John Doe",
    mrn: "MRN001237",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
];

const clinicalNotes = [
  { title: "Progress Note", status: "Final" },
  { title: "Admission Note", status: "Final" },
  { title: "Progress Note", status: "Draft" },
];

const myTasks = [
  {
    id: "t1",
    title: "Review lab results for Patient 1",
    priority: "high",
    status: "pending",
  },
  {
    id: "t2",
    title: "Update discharge summary",
    priority: "medium",
    status: "pending",
  },
  {
    id: "t3",
    title: "Consult with radiology",
    priority: "low",
    status: "pending",
  },
];

const notices = [
  "System maintenance scheduled for March 15",
  "New COVID-19 protocol update available",
  "Staff meeting moved to 3 PM today",
];

const priorityVariant = (p: string) => {
  if (p === "high") return "red" as const;
  if (p === "medium") return "orange" as const;
  return "gray" as const;
};

const statusVariant = (s: string) => {
  if (s === "pending") return "outline" as const;
  if (s === "in-progress") return "dark" as const;
  return "green" as const;
};

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const statCards = [
    {
      label: "Total Patients",
      value: "4",
      sub: "3 admitted",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: HiOutlineUsers,
    },
    {
      label: "My Tasks",
      value: String(myTasks.length),
      sub: `${myTasks.filter((t) => t.priority === "high").length} urgent`,
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: HiOutlineCheckCircle,
    },
    {
      label: "Clinical Notes",
      value: String(clinicalNotes.length),
      sub: "Total documents",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: HiOutlineClipboardDocument,
    },
    {
      label: "Active Notices",
      value: String(notices.length),
      sub: "System-wide",
      color: "bg-red-100",
      iconColor: "text-red-600",
      icon: HiOutlineBell,
    },
  ];

  return (
    <>
      <WelcomeHeader
        name="Dr. Sarah Johnson"
        department="General Medicine"
        date="Apr 1, 2025"
        time="9:41 AM"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Tasks & Noticeboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/doctor/tasks")}
        >
          <SectionCard title="My Tasks" icon={HiOutlineCheckCircle}>
            {myTasks.length > 0 ? (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <ListRow key={task.id}>
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
              <EmptyState message="No pending Tasks" />
            )}
          </SectionCard>
        </div>

        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/doctor/noticeboard")}
        >
          <SectionCard title="Noticeboard" icon={HiOutlineBell}>
            <div className="space-y-3">
              {notices.map((item, i) => (
                <div
                  key={i}
                  className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* My Patients & Clinical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/doctor/patients")}
        >
          <SectionCard title="My Patients" icon={HiOutlineUsers}>
            <div className="space-y-3">
              {myPatients.map((patient, i) => (
                <ListRow key={i}>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {patient.mrn} • {patient.ward}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {patient.diagnosis}
                  </span>
                </ListRow>
              ))}
            </div>
          </SectionCard>
        </div>

        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/doctor/clinical-docs")}
        >
          <SectionCard
            title="Recent Clinical Notes"
            icon={HiOutlineDocumentText}
          >
            <div className="space-y-3">
              {clinicalNotes.map((note, i) => (
                <ListRow key={i}>
                  <div className="flex items-center gap-2">
                    <HiOutlineDocumentText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{note.title}</span>
                  </div>
                  <Badge
                    text={note.status}
                    variant={note.status === "Final" ? "dark" : "outline"}
                  />
                </ListRow>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
