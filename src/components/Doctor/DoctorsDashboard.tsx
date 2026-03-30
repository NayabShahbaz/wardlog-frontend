import React from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineClipboardDocument,
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineClipboard,
  HiOutlineUserGroup,
} from "react-icons/hi2";

import { PageLayout } from "../layout";
import {
  StatCard,
  SectionCard,
  Badge,
  ListRow,
  EmptyState,
  WelcomeHeader,
} from "../ui";

const navItems = [
  { label: "Dashboard", icon: HiOutlineClipboard, active: true },
  { label: "Patients", icon: HiOutlineUsers },
  { label: "Clinical Docs", icon: HiOutlineDocumentText },
  { label: "Ward Coordination", icon: HiOutlineCalendarDays },
  { label: "NoticeBoard", icon: HiOutlineBell },
  { label: "Tasks", icon: HiOutlineCheckCircle },
  { label: "Roster", icon: HiOutlineCalendarDays },
  { label: "Staff Directory", icon: HiOutlineUserGroup },
];

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
  {
    name: "Patient 3",
    mrn: "MRN001234",
    ward: "Ward A A-101",
    diagnosis: "Pneumonia",
  },
];

const clinicalNotes = [
  { title: "Progress Note", status: "Final" },
  { title: "Progress Note", status: "Final" },
  { title: "Progress Note", status: "Final" },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      navItems={navItems}
      userName="Dr. Sarah Johnson"
      userRole="Doctor"
      onLogout={() => navigate("/login")}
    >
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
        <SectionCard title="My Tasks" icon={HiOutlineCheckCircle}>
          <EmptyState message="No pending Tasks" />
        </SectionCard>

        <SectionCard title="Noticeboard" icon={HiOutlineBell}>
          <div className="space-y-3">
            {["News", "News", "News"].map((item, i) => (
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
        <SectionCard title="Admitted Patients" icon={HiOutlineUsers}>
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

        <SectionCard title="Recent Clinical Notes" icon={HiOutlineDocumentText}>
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
    </PageLayout>
  );
};

export default DoctorDashboard;
