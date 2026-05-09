/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
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
interface StaffMember {
  _id: string;
  name: string;
  role: string;
  department?: string;
}

interface SwapRequest {
  _id: string;
  requester: { _id: string; name: string } | string;
  requesterRole: string;
  status: string;
  reason?: string;
  requestedDate?: string;
}

interface Notice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
}

interface Patient {
  mrn: string;
  firstName: string;
  lastName: string;
  status: string;
}

const priorityVariant = (p: string) => {
  const lower = p.toLowerCase();
  if (lower === "high") return "red" as const;
  if (lower === "medium") return "orange" as const;
  return "gray" as const;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userName } = useOutletContext<UserContextType>();

  // ── State ─────────────────────────────────────────────────────
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalStaff: 0, activeWards: 0 });

  // ── Fetching ──────────────────────────────────────────────────
  // ── Fetching ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Correctly define all 5 response variables here
        const [staffRes, swapRes, noticeRes, patientRes, statsRes] =
          await Promise.all([
            apiFetch("/api/staff"),
            apiFetch("/api/swap-requests"),
            apiFetch("/api/notices"),
            apiFetch("/api/patients"),
            apiFetch("/api/admin/dashboard"), // Member 2's endpoint
          ]);

        // statsRes is now defined, so .json() will no longer error[cite: 31]
        const [staffData, swapData, noticeData, patientData, statsData] =
          await Promise.all([
            staffRes.json(),
            swapRes.json(),
            noticeRes.json(),
            patientRes.json(),
            statsRes.json(),
          ]);

        if (staffData.success) setStaff(staffData.data);
        if (swapData.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const normalizedSwaps = swapData.data.map((req: any) => ({
            ...req,
            // 1. Force the database's capital "Pending" to lowercase so the filters work
            status: req.status ? req.status.toLowerCase() : "pending",

            // 2. Safely extract the role from the populated User object
            requesterRole: req.requester?.role || "Staff",
          }));
          setSwapRequests(normalizedSwaps);
        }
        if (noticeData.success) setNotices(noticeData.data);
        if (patientData.success) setPatients(patientData.data);
        // Map the backend data to your stats state
        if (statsData.success) setStats(statsData.data);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // ── Derived stats ─────────────────────────────────────────────
  const doctors = staff.filter((s) => s.role === "Doctor");
  const nurses = staff.filter((s) => s.role === "Nurse");
  const admins = staff.filter((s) => s.role === "Admin");
  const pendingSwaps = swapRequests.filter((r) => r.status === "pending");
  const activePatients = patients.filter(
    (p) => p.status !== "discharged" && p.status !== "completed",
  );

  const getRequesterName = (req: SwapRequest): string => {
    if (typeof req.requester === "string") return req.requester;
    return req.requester?.name ?? "Unknown";
  };

  const statCards = [
    {
      label: "Total Staff",
      // stats.totalStaff is provided by Member 2's dashboard API[cite: 30, 31]
      value: stats.totalStaff.toString(),
      sub: `${doctors.length} doctors, ${nurses.length} nurses, ${admins.length} admin`,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: HiOutlineUsers,
    },
    {
      label: "Active Wards", // Changed from "Active Patients" to match Member 2's API
      // Fixed the typo "activePa" to "activeWards"
      value: stats.activeWards.toString(),
      sub: "Hospital operational units",
      color: "bg-green-100",
      iconColor: "text-green-600",
      icon: HiOutlineBuildingOffice2,
    },
    {
      label: "Pending Approvals",
      // Pending swaps are part of Member 2's roster responsibilities
      value: String(pendingSwaps.length),
      sub: pendingSwaps.length > 0 ? "Requires action" : "All clear",
      color: "bg-orange-100",
      iconColor: "text-orange-600",
      icon: HiOutlineShieldCheck,
    },
    {
      label: "Active Notices",
      // Notices are managed by Member 2[cite: 30]
      value: String(notices.length),
      sub: "Hospital-wide announcements",
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
        department="System Administration"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Pending Swap Requests */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/admin/roster")}
        >
          <SectionCard title="Pending Approvals" icon={HiOutlineUserPlus}>
            <div className="min-h-52.5">
              {pendingSwaps.length > 0 ? (
                <div className="space-y-3">
                  {pendingSwaps.slice(0, 3).map((req) => (
                    <ListRow key={req._id}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {getRequesterName(req)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {req.requesterRole}
                          {req.reason && ` · ${req.reason}`}
                        </p>
                      </div>
                      <Badge text={req.status} variant="outline" />
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No pending approvals" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Notices */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/admin/noticeboard")}
        >
          <SectionCard title="Recent Notices" icon={HiOutlineBell}>
            <div className="min-h-52.5">
              {notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.slice(0, 3).map((notice) => (
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
                  <EmptyState message="No notices" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Staff Overview */}
        <div
          className="cursor-pointer hover:shadow-md transition-shadow rounded-xl"
          onClick={() => navigate("/admin/staff-directory")}
        >
          <SectionCard
            title="Staff Directory"
            icon={HiOutlineClipboardDocumentList}
          >
            <div className="min-h-70">
              {staff.length > 0 ? (
                <div className="space-y-3">
                  {staff.slice(0, 4).map((member) => (
                    <ListRow key={member._id}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {member.department ?? "—"}
                        </p>
                      </div>
                      <Badge
                        text={member.role}
                        variant={
                          member.role === "Doctor"
                            ? "dark"
                            : member.role === "Nurse"
                              ? "outline"
                              : "gray"
                        }
                      />
                    </ListRow>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="No staff found" />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Quick Actions */}
        <SectionCard title="Quick Actions" icon={HiOutlineCog6Tooth}>
          <div className="min-h-52.5 space-y-3">
            <button
              onClick={() => navigate("/admin/patients")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a5276] text-white rounded-xl text-sm font-bold hover:bg-[#154360] shadow-md active:scale-[0.98] transition-all"
            >
              <HiOutlineUsers className="w-5 h-5" /> Manage Patients
            </button>
            <button
              onClick={() => navigate("/admin/staff-directory")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#22c55e] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] shadow-md active:scale-[0.98] transition-all"
            >
              <HiOutlineUserGroup className="w-5 h-5" /> Staff Directory
            </button>
            <button
              onClick={() => navigate("/admin/roster")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#a855f7] text-white rounded-xl text-sm font-bold hover:bg-[#9333ea] shadow-md active:scale-[0.98] transition-all"
            >
              <HiOutlineCalendarDays className="w-5 h-5" /> Manage Roster
            </button>
            <button
              onClick={() => navigate("/admin/noticeboard")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#f59e0b] text-white rounded-xl text-sm font-bold hover:bg-[#d97706] shadow-md active:scale-[0.98] transition-all"
            >
              <HiOutlineBell className="w-5 h-5" /> Manage Noticeboard
            </button>
            <button
              onClick={() => navigate("/admin/settings")}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#ef4444] text-white rounded-xl text-sm font-bold hover:bg-[#dc2626] shadow-md active:scale-[0.98] transition-all"
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
