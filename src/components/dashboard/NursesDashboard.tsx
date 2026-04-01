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
    value: "1",
    sub: "0 urgent",
    color: "bg-green-100",
    iconColor: "text-green-600",
    icon: HiOutlineCheckCircle,
  },
  {
    label: "Clinical Notes",
    value: "4",
    sub: "Total document",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: HiOutlineClipboardDocument,
  },
  {
    label: "Active Notices",
    value: "3",
    sub: "System-wide",
    color: "bg-red-100",
    iconColor: "text-red-600",
    icon: HiOutlineBell,
  },
];

const admittedPatients = [
  {
    name: "Patient 1",
    mrn: "MRN001234",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
  {
    name: "Patient 2",
    mrn: "MRN001234",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
];

const clinicalNotes = [
  { title: "Progress Note", status: "Final" },
];

const NurseDashboard = () => {
  return (
    <>
      <WelcomeHeader
        name="Nurse Jane Doe"
        department="Emergency Ward"
        date="Apr 1, 2026"
        time="10:00 AM"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Tasks & Noticeboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SectionCard title="My Tasks" icon={HiOutlineCheckCircle}>
          <EmptyState message="No pending Tasks" />
        </SectionCard>

        <SectionCard title="Noticeboard" icon={HiOutlineBell}>
          <div className="space-y-3">
            {["Nursing Shift Handover", "Ward Meeting"].map((item, i) => (
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

      {/* Patients & Clinical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Assigned Patients" icon={HiOutlineUsers}>
          <div className="space-y-3">
            {admittedPatients.map((patient, i) => (
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

        <SectionCard title="Recent Observations" icon={HiOutlineDocumentText}>
          <div className="space-y-3">
            {clinicalNotes.map((note, i) => (
              <ListRow key={i}>
                <div className="flex items-center gap-2">
                  <HiOutlineDocumentText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{note.title}</span>
                </div>
                <Badge text={note.status} variant="red" />
              </ListRow>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
};

export default NurseDashboard;