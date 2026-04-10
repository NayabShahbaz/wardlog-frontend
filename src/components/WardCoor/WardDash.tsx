import { useLocation, useNavigate } from "react-router-dom"; 

import {
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineCalendarDays,
  HiOutlineExclamationTriangle,
  HiOutlineArrowSmallRight,
} from "react-icons/hi2";
import { StatCard, WardOccupancy } from "../ui";

const WardDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  //const { userRole } = useOutletContext<UserContextType>();

  const basePath = location.pathname.startsWith('/nurse') ? '/nurse' : '/doctor';

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

      {/* Stats Grid - Fixed props to match StatCard component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value="4"
          sub="3 admitted"
          icon={HiOutlineUsers}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="My Tasks"
          value="1"
          sub="0 urgent"
          icon={HiOutlineCheckCircle}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          label="Today's Shifts"
          value="0"
          sub="1 tomorrow"
          icon={HiOutlineCalendarDays}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Active Staff"
          value="5"
          sub="General Medicine"
          icon={HiOutlineExclamationTriangle}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <WardOccupancy />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Noticeboard Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <HiOutlineArrowSmallRight className="-rotate-45 text-blue-500" />{" "}
              Noticeboard
            </h2>
            <div className="space-y-3">
              <div className="p-3 border border-gray-50 rounded-xl bg-gray-50/50 text-sm text-gray-600">
                System update scheduled for 2:00 AM.
              </div>
              <div className="p-3 border border-gray-50 rounded-xl bg-gray-50/50 text-sm text-gray-600">
                New safety protocols for Ward A updated.
              </div>
              <button
                onClick={() => navigate(`${basePath}/noticeboard`)}
                className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-2 hover:underline transition-all"
              >
                View all notices <HiOutlineArrowSmallRight />
              </button>
            </div>
          </div>

          {/* Quick Actions Section */}
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
