import { useNavigate } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineBuildingOffice2,
  HiOutlineCog6Tooth,
  HiOutlineClipboardDocumentList,
  HiOutlineUserPlus,
  HiOutlineUserGroup,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineCalendarDays,
} from "react-icons/hi2";
import { StatCard, SectionCard, Badge, ListRow, WelcomeHeader } from "../ui";

const recentActivity = [
  {
    id: "a1",
    action: "New user registered",
    user: "Emily Chen",
    time: "2 hours ago",
    type: "user",
  },
  {
    id: "a2",
    action: "Ward B updated",
    user: "Admin",
    time: "4 hours ago",
    type: "ward",
  },
  {
    id: "a3",
    action: "System backup completed",
    user: "System",
    time: "6 hours ago",
    type: "system",
  },
  {
    id: "a4",
    action: "New doctor onboarded",
    user: "Dr. Michael John",
    time: "1 day ago",
    type: "user",
  },
];

const pendingApprovals = [
  {
    id: "p1",
    name: "James Wilson",
    role: "Nurse",
    department: "Ward B",
    status: "pending",
  },
  {
    id: "p2",
    name: "Linda Martinez",
    role: "Admin",
    department: "Administration",
    status: "pending",
  },
];

const systemAlerts = [
  "Database backup scheduled for tonight at 2 AM",
  "3 user accounts require password reset",
  "Ward C capacity at 90%",
];

const activityTypeVariant = (type: string) => {
  if (type === "user") return "dark" as const;
  if (type === "ward") return "outline" as const;
  return "gray" as const;
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const statCards = [
    {
      label: "Total Staff",
      value: "8",
      sub: "2 doctors, 4 nurses, 2 admin",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: HiOutlineUsers,
    },
    {
      label: "Active Wards",
      value: "4",
      sub: "Ward A, B, C, ICU",
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: HiOutlineBuildingOffice2,
    },
    {
      label: "Pending Approvals",
      value: String(pendingApprovals.length),
      sub: "Requires action",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: HiOutlineShieldCheck,
    },
    {
      label: "System Alerts",
      value: String(systemAlerts.length),
      sub: "Active alerts",
      color: "bg-red-100",
      iconColor: "text-red-600",
      icon: HiOutlineBell,
    },
  ];

  return (
    <>
      <WelcomeHeader
        name="Admin"
        department="System Administration"
        date="Apr 1, 2025"
        time="9:41 AM"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/admin/staff")}
        >
          <SectionCard title="Pending Approvals" icon={HiOutlineUserPlus}>
            {pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.map((item) => (
                  <ListRow key={item.id}>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.role} • {item.department}
                      </p>
                    </div>
                    <Badge text={item.status} variant="outline" />
                  </ListRow>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-400">
                No pending approvals
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard title="System Alerts" icon={HiOutlineBell}>
          <div className="space-y-3">
            {systemAlerts.map((alert, i) => (
              <div
                key={i}
                className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-600"
              >
                {alert}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          title="Recent Activity"
          icon={HiOutlineClipboardDocumentList}
        >
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <ListRow key={item.id}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.user} • {item.time}
                  </p>
                </div>
                <Badge
                  text={item.type}
                  variant={activityTypeVariant(item.type)}
                />
              </ListRow>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Quick Actions" icon={HiOutlineCog6Tooth}>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/admin/patients")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium hover:bg-[#e8f0f6] hover:text-[#1a5276] transition-colors text-left"
            >
              <HiOutlineUsers className="w-5 h-5" /> Manage Patients
            </button>
            <button
              onClick={() => navigate("/admin/staff")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium hover:bg-[#e8f0f6] hover:text-[#1a5276] transition-colors text-left"
            >
              <HiOutlineUserGroup className="w-5 h-5" /> Manage Staff
            </button>
            <button
              onClick={() => navigate("/admin/roster")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium hover:bg-[#e8f0f6] hover:text-[#1a5276] transition-colors text-left"
            >
              <HiOutlineCalendarDays className="w-5 h-5" /> Manage Roster
            </button>
            <button
              onClick={() => navigate("/admin/noticeboard")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium hover:bg-[#e8f0f6] hover:text-[#1a5276] transition-colors text-left"
            >
              <HiOutlineBell className="w-5 h-5" /> Manage Noticeboard
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium hover:bg-[#e8f0f6] hover:text-[#1a5276] transition-colors text-left"
            >
              <HiOutlineCog6Tooth className="w-5 h-5" /> System Settings
            </button>
          </div>
        </SectionCard>
      </div>
    </>
  );
};

export default AdminDashboard;
