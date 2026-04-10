import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

import Tabs from "../ui/Tabs";
import Badge from "../ui/Badge";
import DaySchedule, { type DayScheduleData } from "./DaySchedule";
import RequestSwapModal, { type SwapRequest } from "./RequestSwapModal";

// ── Mock Data ───────────────────────────────────────────────────────
const mockSchedule: DayScheduleData[] = [
  {
    date: "Thursday, March 12, 2026",
    morning: [
      { id: "s1", name: "Emily Chen", role: "Nurse", ward: "Ward A" },
      { id: "s2", name: "Jessica Wilson", role: "Nurse", ward: "Ward B" },
    ],
    afternoon: [],
    night: [],
  },
  {
    date: "Friday, March 13, 2026",
    morning: [
      { id: "s3", name: "Dr. Sarah Johnson", role: "Doctor", ward: "Ward A" },
    ],
    afternoon: [
      { id: "s4", name: "Emily Chen", role: "Nurse", ward: "Ward A" },
      { id: "s5", name: "Michael Brown", role: "Nurse", ward: "Ward C" },
    ],
    night: [{ id: "s6", name: "James Wilson", role: "Nurse", ward: "Ward B" }],
  },
  {
    date: "Saturday, March 14, 2026",
    morning: [
      { id: "s7", name: "Jessica Wilson", role: "Nurse", ward: "Ward B" },
    ],
    afternoon: [
      { id: "s8", name: "Dr. Sarah Johnson", role: "Doctor", ward: "Ward A" },
    ],
    night: [{ id: "s9", name: "Emily Chen", role: "Nurse", ward: "Ward A" }],
  },
];

const initialSwapRequests: SwapRequest[] = [];

const shiftOptions = [
  { label: "Friday Mar 13 - Morning (Ward A)", value: "fri-morning" },
  { label: "Saturday Mar 14 - Afternoon (Ward A)", value: "sat-afternoon" },
];

const staffOptions = [
  { label: "Emily Chen (Nurse)", value: "Emily Chen" },
  { label: "Jessica Wilson (Nurse)", value: "Jessica Wilson" },
  { label: "Michael Brown (Nurse)", value: "Michael Brown" },
  { label: "James Wilson (Nurse)", value: "James Wilson" },
];

// ── Component ───────────────────────────────────────────────────────
const RosterManagement = () => {
  const { userName } = useOutletContext<UserContextType>();
  const [activeTab, setActiveTab] = useState(0);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapRequests, setSwapRequests] =
    useState<SwapRequest[]>(initialSwapRequests);

  // Create a dynamic list of shifts by searching the mockSchedule
  const myActualShifts = mockSchedule.flatMap((day) => {
    const allShifts = [
      ...day.morning.map((s) => ({ ...s, shift: "Morning", date: day.date })),
      ...day.afternoon.map((s) => ({
        ...s,
        shift: "Afternoon",
        date: day.date,
      })),
      ...day.night.map((s) => ({ ...s, shift: "Night", date: day.date })),
    ];
    return allShifts.filter((s) => s.name === userName);
  });

  const tabs = [
    { label: "Schedule" },
    { label: "My Shifts", count: myActualShifts.length },
    { label: "Swap Requests", count: swapRequests.length },
  ];

  const handleSwapSubmit = (data: Omit<SwapRequest, "id" | "status">) => {
    const newRequest: SwapRequest = {
      ...data,
      id: `swap-${swapRequests.length + 1}`,
      status: "pending",
    };
    setSwapRequests([newRequest, ...swapRequests]);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">
              Roster Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage shift schedules and swap requests
          </p>
        </div>
        <button
          onClick={() => setSwapOpen(true)}
          className="flex items-center right gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#1a5276] hover:bg-[#154360] rounded-lg transition-colors shrink-0"
        >
          <HiOutlineArrowsRightLeft className="w-4 h-4" />
          Request Swap
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Schedule Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {mockSchedule.map((day) => (
            <DaySchedule key={day.date} day={day} />
          ))}
        </div>
      )}

      {/* My Shifts Tab */}
      {activeTab === 1 && (
        <div className="space-y-3">
          {myActualShifts.length > 0 ? (
            myActualShifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white rounded-xl p-4 flex items-center justify-between"
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#e5e7eb",
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {shift.date}
                  </p>
                  <p className="text-xs text-gray-500">{shift.ward}</p>
                </div>
                <Badge text={shift.shift} variant="dark" />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">
              No shifts assigned
            </div>
          )}
        </div>
      )}

      {/* Swap Requests Tab */}
      {activeTab === 2 && (
        <div className="space-y-3">
          {swapRequests.length > 0 ? (
            swapRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl p-4"
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#e5e7eb",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Swap:{" "}
                      {shiftOptions.find((s) => s.value === req.myShift)
                        ?.label || req.myShift}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      With: {req.swapWith} • Date: {req.requestedDate}
                    </p>
                  </div>
                  <Badge
                    text={req.status}
                    variant={
                      req.status === "approved"
                        ? "green"
                        : req.status === "rejected"
                          ? "red"
                          : "outline"
                    }
                  />
                </div>
                <p className="text-sm text-gray-600">{req.reason}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">
              No swap requests
            </div>
          )}
        </div>
      )}

      {/* Swap Modal */}
      <RequestSwapModal
        isOpen={swapOpen}
        onClose={() => setSwapOpen(false)}
        onSubmit={handleSwapSubmit}
        shiftOptions={shiftOptions}
        staffOptions={staffOptions}
      />
    </>
  );
};

export default RosterManagement;
