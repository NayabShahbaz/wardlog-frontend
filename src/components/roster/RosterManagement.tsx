/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";
import { apiFetch } from "../../utils/api";
import {
  HiOutlineArrowsRightLeft,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

import Tabs from "../ui/Tabs";
import Badge from "../ui/Badge";
import DaySchedule, { type DayScheduleData } from "./DaySchedule";
import RequestSwapModal, { type SwapRequest } from "./RequestSwapModal";

const RosterManagement = () => {
  const { userName } = useOutletContext<UserContextType>();
  const [activeTab, setActiveTab] = useState(0);
  const [swapOpen, setSwapOpen] = useState(false);
  const [schedule, setSchedule] = useState<DayScheduleData[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [staffOptions, setStaffOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchRosterData = async () => {
    try {
      setLoading(true);
      const [rosterRes, swapRes, staffRes] = await Promise.all([
        apiFetch("/api/roster"),
        apiFetch("/api/swap-requests"),
        apiFetch("/api/staff"),
      ]);

      const rosterData = await rosterRes.json();
      const swapData = await swapRes.json();
      const staffData = await staffRes.json();

      console.log(swapData.data); // Debugging line to inspect swap request data
      // 1. First, process staff into a lookup map and update options
      const rawStaffList = staffData.data || [];
      const staffLookup: Record<string, string> = {};

      rawStaffList.forEach((s: any) => {
        const id = String(s._id || s.id).trim();
        staffLookup[id] = s.name;
      });

      if (staffData.success) {
        setStaffOptions(
          rawStaffList
            .filter(
              (s: any) =>
                s.role?.toLowerCase() !== "admin" && s.name !== userName,
            )
            .map((s: any) => ({
              label: `${s.name} (${s.role})`,
              value: String(s._id || s.id).trim(),
            })),
        );
      }

      // 2. Process Roster (Existing logic)
      if (rosterData.success) {
        const reshapedData = rosterData.data.map((day: any) => ({
          date: new Date(day.date).toLocaleDateString(),
          morning: day.shifts.filter((s: any) => s.shift === "Morning"),
          afternoon: day.shifts.filter((s: any) => s.shift === "Evening"),
          night: day.shifts.filter((s: any) => s.shift === "Night"),
        }));
        setSchedule(reshapedData);
      }

      // 3. Process Swaps using the staffLookup map
      if (swapData.success) {
        const safeSwaps = swapData.data.map((req: any) => {
          const cleanDate = req.requestedDate
            ? new Date(req.requestedDate).toLocaleDateString()
            : "N/A";

          // Clean Shift Logic
          let cleanShift = req.shift;
          if (typeof req.shift === "object") {
            cleanShift = req.shift?.shift || "Unknown Shift";
          } else if (typeof req.shift === "string" && req.shift.length === 24) {
            for (const day of rosterData.data) {
              const matched = day.shifts.find(
                (s: any) => String(s._id) === String(req.shift),
              );
              if (matched) {
                cleanShift = `${new Date(day.date).toLocaleDateString()} - ${matched.shift}`;
                break;
              }
            }
          }

          // FIX: Reliable SwapWith Name Resolution
          let displayName = "Unknown Staff";
          if (req.swapWith && typeof req.swapWith === "object") {
            displayName =
              req.swapWith.name || req.swapWith.userName || "Unknown";
          } else if (req.swapWith) {
            const sid = String(req.swapWith).trim();
            displayName = staffLookup[sid] || `Staff (${sid.slice(-4)})`;
          }

          return {
            ...req,
            id: req._id || req.id,
            swapWith: displayName,
            shift: cleanShift,
            requestedDate: cleanDate,
            status: req.status ? req.status.toLowerCase() : "pending",
          };
        });
        setSwapRequests(safeSwaps);
      }
    } catch (err) {
      console.error("Failed to fetch roster data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRosterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived State ─────────────────────────────────────────────
  const myActualShifts = schedule.flatMap((day) => {
    const allShifts = [
      ...day.morning.map((s: any) => ({
        ...s,
        shift: "Morning",
        date: day.date,
      })),
      ...day.afternoon.map((s: any) => ({
        ...s,
        shift: "Afternoon",
        date: day.date,
      })),
      ...day.night.map((s: any) => ({ ...s, shift: "Night", date: day.date })),
    ];
    // ── FIX: Check BOTH name and staffName to avoid empty arrays ──
    return allShifts.filter(
      (s) => s.name === userName || s.staffName === userName,
    );
  });

  const shiftOptions = myActualShifts.map((s: any) => ({
    label: `${s.date} - ${s.shift} (${s.ward})`,
    // ── FIX: Use the actual MongoDB shift _id so the backend can find it ──
    value: s._id || s.id || `${s.date}|${s.shift}`,
  }));

  const tabs = [
    { label: "Schedule" },
    { label: "My Shifts", count: myActualShifts.length },
    { label: "Swap Requests", count: swapRequests.length },
  ];

  // ── Handlers ──────────────────────────────────────────────────
  const handleSwapSubmit = async (data: Omit<SwapRequest, "id" | "status">) => {
    console.log(
      "Submitting swap request with data:",
      data,
      "and userName:",
      userName,
    );
    try {
      const res = await apiFetch("/api/swap-requests", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          requester: userName,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchRosterData(); // Refresh list to show new request
        setSwapOpen(false);
      } else {
        alert(result.message || "Failed to submit swap request.");
      }
    } catch (err) {
      console.error("Error submitting swap request:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading roster...</div>
    );

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
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-[#1a5276] hover:bg-[#154360] rounded-lg transition-colors shrink-0"
        >
          <HiOutlineArrowsRightLeft className="w-4 h-4" />
          Request Swap
        </button>
      </div>

      <div className="mb-6">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Schedule Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          {schedule.length > 0 ? (
            schedule.map((day) => <DaySchedule key={day.date} day={day} />)
          ) : (
            <div className="text-center py-12 text-gray-400">
              No schedule available
            </div>
          )}
        </div>
      )}

      {/* My Shifts Tab */}
      {activeTab === 1 && (
        <div className="space-y-3">
          {myActualShifts.length > 0 ? (
            myActualShifts.map((shift, idx) => (
              <div
                key={`${shift.date}-${idx}`}
                className="bg-white rounded-xl p-4 flex items-center justify-between border border-gray-200"
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
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Swap: {req.shift}
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
