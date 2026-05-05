import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineArrowSmallRight,
} from "react-icons/hi2";
import { StatCard, WardOccupancy } from "../ui";
import { apiFetch } from "../../utils/api";

const WardDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    admittedPatients: 0,
    myTasks: 0,
    urgentTasks: 0,
    todayShifts: 0,
    tomorrowShifts: 0,
    activeStaff: 0,
    department: "General Medicine"
  });
  const [patients, setPatients] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Member 2: Fetch Dashboard Data (Ward Coordination Responsibility) ──[cite: 11, 15]
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, noticeRes] = await Promise.all([
          apiFetch("/api/ward/dashboard"), // <--- Fixed the URL
          apiFetch("/api/notices") 
        ]);

        const statsData = await statsRes.json();
        const noticeData = await noticeRes.json();

        if (statsData.success) {
          setStats(statsData.data.stats);       // <--- Drill into stats
          setPatients(statsData.data.patients); // <--- Save the patients
        }
        if (noticeData.success) setNotices(noticeData.data.slice(0, 2));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const basePath = location.pathname.startsWith("/nurse")
    ? "/nurse"
    : "/doctor";

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ward Coordination Dashboard
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-500">
            Overview of ward activities and resources
          </p>
        </div>
      </div>

      {/* Stats Grid - Live data from Member 2 Backend[cite: 12, 15] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={stats.totalPatients.toString()}
          sub={`${stats.admittedPatients} admitted`}
          icon={HiOutlineUsers}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="My Tasks"
          value={stats.myTasks.toString()}
          sub={`${stats.urgentTasks} urgent`}
          icon={HiOutlineCheckCircle}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="Today's Shifts"
          value={stats.todayShifts.toString()}
          sub={`${stats.tomorrowShifts} tomorrow`}
          icon={HiOutlineCalendarDays}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Active Staff"
          value={stats.activeStaff.toString()}
          sub={stats.department}
          icon={HiOutlineExclamationTriangle}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ward Occupancy Map (Member 2 Responsibility)[cite: 11, 15] */}
        <div className="lg:col-span-2">
          <WardOccupancy patients={patients} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Noticeboard Section (Member 2 Responsibility)[cite: 11, 13] */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <HiOutlineArrowSmallRight className="-rotate-45 text-blue-500" />{" "}
              Noticeboard
            </h2>
            <div className="space-y-3">
              {notices.length > 0 ? notices.map((notice) => (
                <div key={notice._id} className="p-3 border border-gray-50 rounded-xl bg-gray-50/50 text-sm text-gray-600">
                  {notice.title}
                </div>
              )) : (
                <div className="text-xs text-gray-400">No active notices</div>
              )}
              <button
                onClick={() => navigate(`${basePath}/noticeboard`)}
                className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-2 hover:underline transition-all"
              >
                View all notices <HiOutlineArrowSmallRight />
              </button>
            </div>
          </div>

          {/* Quick Actions Section - Routing synced with Admin Directory route[cite: 10, 17] */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <span>✋</span> Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`${basePath}/tasks`)}
                className="w-full py-3 bg-[#1a5276] text-white rounded-xl text-sm font-bold hover:bg-[#154360] shadow-md active:scale-[0.98] transition-all"
              >
                Manage Tasks
              </button>
              <button
                onClick={() => navigate(`${basePath}/roster`)}
                className="w-full py-3 bg-[#a855f7] text-white rounded-xl text-sm font-bold hover:bg-[#9333ea] shadow-md active:scale-[0.98] transition-all"
              >
                View Roster
              </button>
              <button
                onClick={() => navigate(`${basePath}/directory`)}
                className="w-full py-3 bg-[#22c55e] text-white rounded-xl text-sm font-bold hover:bg-[#16a34a] shadow-md active:scale-[0.98] transition-all"
              >
                Staff Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardDashboard;