/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSparkles,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { Badge, Modal, SelectField, InputField } from "../ui";
import Tabs from "../ui/Tabs";
import { apiFetch } from "../../utils/api";

// ── Types ───────────────────────────────────────────────────────────
interface StaffShift {
  id: string;
  _id?: string;
  name: string;
  staffName?: string;
  role: string;
  ward: string;
}

interface DaySchedule {
  date: string;
  morning: StaffShift[];
  afternoon: StaffShift[];
  night: StaffShift[];
}

interface SwapRequest {
  id: string;
  _id?: string;
  requester: string;
  requesterRole: string;
  shift: string;
  swapWith: string;
  requestedDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

const shiftOptions = [
  { label: "Morning", value: "Morning" },
  { label: "Afternoon (Evening)", value: "Evening" },
  { label: "Night", value: "Night" },
];

const wardOptions = [
  { label: "Ward A", value: "Ward A" },
  { label: "Ward B", value: "Ward B" },
  { label: "Ward C", value: "Ward C" },
  { label: "ICU", value: "ICU" },
];

// ── Conflict checker ────────────────────────────────────────────────
const findConflicts = (schedule: DaySchedule[]): string[] => {
  const conflicts: string[] = [];
  schedule.forEach((day) => {
    const allShifts = [
      ...day.morning.map((s: StaffShift) => ({ ...s, shift: "Morning" })),
      ...day.afternoon.map((s: StaffShift) => ({ ...s, shift: "Afternoon" })),
      ...day.night.map((s: StaffShift) => ({ ...s, shift: "Night" })),
    ];
    const nameCount: Record<string, string[]> = {};
    allShifts.forEach((s) => {
      const name = s.staffName || s.name;
      if (!nameCount[name]) nameCount[name] = [];
      nameCount[name].push(s.shift);
    });
    Object.entries(nameCount).forEach(([name, shifts]) => {
      if (shifts.length > 1) {
        conflicts.push(
          `${name} is scheduled for ${shifts.join(" & ")} on ${day.date}`,
        );
      }
    });
  });
  for (let i = 0; i < schedule.length - 1; i++) {
    const nightStaff = schedule[i].night.map(
      (s: StaffShift) => s.staffName || s.name,
    );
    const nextMorning = schedule[i + 1].morning.map(
      (s: StaffShift) => s.staffName || s.name,
    );
    nightStaff.forEach((name: string) => {
      if (nextMorning.includes(name)) {
        conflicts.push(
          `${name} has night shift on ${schedule[i].date} followed by morning on ${schedule[i + 1].date}`,
        );
      }
    });
  }
  return conflicts;
};

// ── Conflict Banner Component ────────────────────────────────────────
const ConflictBanner = ({
  conflicts,
  onDismiss,
}: {
  conflicts: string[];
  onDismiss: () => void;
}) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <HiOutlineExclamationTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {conflicts.length} scheduling conflict
              {conflicts.length > 1 ? "s" : ""} detected
            </p>
            <ul className="mt-1.5 space-y-1">
              {conflicts.map((c, i) => (
                <li
                  key={i}
                  className="text-xs text-amber-700 flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-md transition-colors shrink-0"
          aria-label="Dismiss conflicts"
        >
          <HiOutlineXMark className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AdminRoster = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [staffOptions, setStaffOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [conflictsDismissed, setConflictsDismissed] = useState(false);

  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    dayIdx: number;
    shift: string;
    staffIdx: number;
  } | null>(null);

  // ── New Swap Request Deletion States ──
  const [deleteSwapConfirm, setDeleteSwapConfirm] = useState<string | null>(
    null,
  );
  const [clearAllSwapsConfirm, setClearAllSwapsConfirm] = useState(false);

  const [addDay, setAddDay] = useState("");
  const [addShift, setAddShift] = useState("");
  const [addStaff, setAddStaff] = useState("");
  const [addWard, setAddWard] = useState("Ward A");
  const [addError, setAddError] = useState("");
  const [editTarget, setEditTarget] = useState<{
    dayIdx: number;
    shift: string;
    staffIdx: number;
  } | null>(null);
  const [editStaff, setEditStaff] = useState("");
  const [editWard, setEditWard] = useState("");
  const [editError, setEditError] = useState("");
  const [genStartDate, setGenStartDate] = useState("");
  const [genDays, setGenDays] = useState("5");

  // ── Compute conflicts reactively whenever schedule changes ──────────
  const conflicts = useMemo(() => findConflicts(schedule), [schedule]);

  const conflictingStaffNames = useMemo(() => {
    const names = new Set<string>();
    conflicts.forEach((msg) => {
      const match = msg.match(/^(.+?)\s+(is scheduled|has night)/);
      if (match) names.add(match[1]);
    });
    return names;
  }, [conflicts]);

  useEffect(() => {
    setConflictsDismissed(false);
  }, [conflicts]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rosterRes, swapRes, staffRes] = await Promise.all([
        apiFetch("/api/roster"),
        apiFetch("/api/swap-requests"),
        apiFetch("/api/staff"),
      ]);

      const rosterData = await rosterRes.json();
      const swapData = await swapRes.json();
      const staffData = await staffRes.json();

      if (rosterData.success && Array.isArray(rosterData.data)) {
        const reshapedData = rosterData.data.map((day: any) => ({
          date: new Date(day.date).toLocaleDateString(),
          morning: day.shifts.filter((s: any) => s.shift === "Morning"),
          afternoon: day.shifts.filter((s: any) => s.shift === "Evening"),
          night: day.shifts.filter((s: any) => s.shift === "Night"),
        }));
        setSchedule(reshapedData);
      } else {
        setSchedule([]);
      }

      if (staffData.success && Array.isArray(staffData.data)) {
        setStaffOptions(
          staffData.data.map((s: any) => ({
            label: `${s.name} (${s.role})`,
            value: s.name,
          })),
        );
      }

      if (swapData.success && Array.isArray(swapData.data)) {
        const normalizedSwaps = swapData.data.map((req: any) => {
          let shiftDisplay = req.shift;
          if (rosterData.data && typeof req.shift === "string") {
            for (const day of rosterData.data) {
              const found = day.shifts?.find(
                (s: any) => s._id === req.shift || s.id === req.shift,
              );
              if (found) {
                const dateStr = new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                shiftDisplay = `${dateStr} - ${found.shift} (${found.ward})`;
                break;
              }
            }
          }

          let swapWithDisplay = req.swapWith?.name || req.swapWith || "Unknown";
          if (typeof swapWithDisplay === "string" && staffData.data) {
            const staffFound = staffData.data.find(
              (st: any) =>
                st._id === swapWithDisplay || st.id === swapWithDisplay,
            );
            if (staffFound) swapWithDisplay = staffFound.name;
          }

          let reqName = req.requester?.name || req.requester || "Unknown";
          let reqRole = req.requester?.role || "Staff";
          if (typeof reqName === "string" && staffData.data) {
            const reqFound = staffData.data.find(
              (st: any) => st._id === reqName || st.id === reqName,
            );
            if (reqFound) {
              reqName = reqFound.name;
              reqRole = reqFound.role;
            }
          }

          return {
            ...req,
            id: req._id || req.id,
            requester: reqName,
            requesterRole: reqRole,
            shift: shiftDisplay,
            swapWith: swapWithDisplay,
            status: req.status ? req.status.toLowerCase() : "pending",
          };
        });
        setSwapRequests(normalizedSwaps);
      } else {
        setSwapRequests([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setSchedule([]);
      setSwapRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount = swapRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const totalCount = swapRequests.length;

  const tabs = [
    {
      label: "Schedule",
      count: conflicts.length > 0 ? conflicts.length : undefined,
      countVariant: "warning",
    },
    {
      label: "All Swap Requests",
      count: totalCount > 0 ? totalCount : 0,
    },
    {
      label: "Pending Approvals",
      count: pendingCount > 0 ? pendingCount : 0,
    },
  ];

  const refetchRoster = async () => {
    const rosterRes = await apiFetch("/api/roster");
    const rosterData = await rosterRes.json();
    if (rosterData.success) {
      const reshapedData = rosterData.data.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString(),
        morning: day.shifts.filter((s: any) => s.shift === "Morning"),
        afternoon: day.shifts.filter((s: any) => s.shift === "Evening"),
        night: day.shifts.filter((s: any) => s.shift === "Night"),
      }));
      setSchedule(reshapedData);
    }
  };

  const handleAddShift = async () => {
    if (!addDay || !addShift || !addStaff) {
      setAddError("Please fill all fields.");
      return;
    }
    const staffInfo = staffOptions.find((s) => s.value === addStaff);
    if (!staffInfo) return;

    const roleMatch = staffInfo.label.match(/\(([^)]+)\)/);
    const role = roleMatch ? roleMatch[1] : "Staff";

    const [year, month, day] = addDay.split("-");
    const isoDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ).toISOString();

    try {
      const res = await apiFetch("/api/roster/shifts", {
        method: "POST",
        body: JSON.stringify({
          date: isoDate,
          shiftData: {
            shift: addShift,
            staffName: staffInfo.value,
            role: role,
            ward: addWard,
          },
        }),
      });

      if (res.ok) {
        await refetchRoster();
        setAddShiftOpen(false);
        setAddDay("");
        setAddShift("");
        setAddStaff("");
        setAddWard("Ward A");
        setAddError("");
      } else {
        const errData = await res.json();
        setAddError(errData.message || "Failed to save shift to database");
      }
    } catch {
      setAddError("Server error occurred while adding shift.");
    }
  };

  const handleEditShift = async () => {
    if (!editTarget || !editStaff) {
      setEditError("Please select a staff member.");
      return;
    }
    const staffInfo = staffOptions.find((s) => s.value === editStaff);
    if (!staffInfo) return;

    const roleMatch = staffInfo.label.match(/\(([^)]+)\)/);
    const role = roleMatch ? roleMatch[1] : "Staff";

    const shiftKey = editTarget.shift as "morning" | "afternoon" | "night";
    const shiftToEdit =
      schedule[editTarget.dayIdx][shiftKey][editTarget.staffIdx];
    const shiftId = shiftToEdit._id || shiftToEdit.id;

    const backendShiftType =
      shiftKey === "afternoon"
        ? "Evening"
        : shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1);

    try {
      const res = await apiFetch(`/api/roster/shifts/${shiftId}`, {
        method: "PUT",
        body: JSON.stringify({
          shift: backendShiftType,
          staffName: staffInfo.value,
          role: role,
          ward: editWard || shiftToEdit.ward,
        }),
      });

      if (res.ok) {
        await refetchRoster();
        setEditShiftOpen(false);
        setEditTarget(null);
        setEditStaff("");
        setEditWard("");
        setEditError("");
      } else {
        const errData = await res.json();
        setEditError(errData.message || "Failed to update shift.");
      }
    } catch {
      setEditError("Server error occurred while editing shift.");
    }
  };

  const handleDeleteShift = async () => {
    if (!deleteConfirm) return;

    const shiftKey = deleteConfirm.shift as "morning" | "afternoon" | "night";
    const shiftToDelete =
      schedule[deleteConfirm.dayIdx][shiftKey][deleteConfirm.staffIdx];
    const shiftId = shiftToDelete._id || shiftToDelete.id;

    try {
      const res = await apiFetch(`/api/roster/shifts/${shiftId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await refetchRoster();
        setDeleteConfirm(null);
      } else {
        console.error("Backend refused to delete the shift.");
      }
    } catch (err) {
      console.error("Network error while trying to delete shift:", err);
    }
  };

  const handleGenerate = async () => {
    if (!genStartDate || !genDays) {
      alert("Please select a start date and number of days.");
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch("/api/roster/generate", {
        method: "POST",
        body: JSON.stringify({
          startDate: genStartDate,
          days: parseInt(genDays),
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await refetchRoster();
        setGenerateOpen(false);
        setGenStartDate("");
        setGenDays("5");
      } else {
        alert(result.message || "Failed to generate schedule.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during generation.");
    } finally {
      setLoading(false);
    }
  };

  // ── Swap Request Approval/Rejection ──
  const handleApprove = async (id: string) => {
    try {
      const res = await apiFetch(`/api/swap-requests/${id}/approve`, {
        method: "PUT",
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiFetch(`/api/swap-requests/${id}/reject`, {
        method: "PUT",
      });
      if (res.ok) await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Swap Request Deletion Handlers ──
  const handleDeleteSwapRequest = async () => {
    if (!deleteSwapConfirm) {
      console.log("No swap request selected for deletion.");
      return;
    }
    try {
      const res = await apiFetch(`/api/swap-requests/${deleteSwapConfirm}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
        setDeleteSwapConfirm(null);
      }
    } catch (err) {
      console.error("Failed to delete swap request:", err);
    }
  };

  const handleClearAllSwaps = async () => {
    try {
      const res = await apiFetch(`/api/swap-requests`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
        setClearAllSwapsConfirm(false);
      }
    } catch (err) {
      console.error("Failed to clear all swap requests:", err);
    }
  };

  const renderShiftColumn = (
    label: string,
    staff: StaffShift[] = [],
    dayIdx: number,
    shiftKey: string,
  ) => (
    <div
      className="bg-white rounded-xl p-4 flex-1 min-w-0"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-bold text-gray-900">{label}</h4>
        <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">
          {staff.length}
        </span>
      </div>

      <div className="space-y-2">
        {staff.length > 0 ? (
          staff.map((s, idx) => {
            const staffName = s.staffName || s.name;
            const hasConflict = conflictingStaffNames.has(staffName);

            return (
              <div
                key={s._id || s.id || idx}
                className={`group py-2 flex items-center justify-between last:border-0 rounded-md transition-colors ${
                  hasConflict ? "bg-amber-50 px-2 -mx-2" : ""
                }`}
                style={{
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: hasConflict ? "#fde68a" : "#f3f4f6",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {hasConflict && (
                    <HiOutlineExclamationTriangle
                      className="w-3.5 h-3.5 text-amber-500 shrink-0"
                      title="Scheduling conflict"
                    />
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        hasConflict ? "text-amber-800" : "text-gray-900"
                      }`}
                    >
                      {staffName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.role} • {s.ward}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditTarget({ dayIdx, shift: shiftKey, staffIdx: idx });
                      setEditStaff(s.name);
                      setEditWard(s.ward);
                      setEditShiftOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-md transition-colors"
                  >
                    <HiOutlinePencilSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirm({
                        dayIdx,
                        shift: shiftKey,
                        staffIdx: idx,
                      })
                    }
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400 italic">No staff scheduled</p>
        )}
      </div>
    </div>
  );

  if (loading && schedule.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">Loading roster...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">
              Roster Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage schedules and approve swap requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#1a5276] rounded-lg hover:bg-[#e8f0f6] transition-colors shadow-sm"
            style={{
              borderWidth: "1.5px",
              borderStyle: "solid",
              borderColor: "#1a5276",
            }}
          >
            <HiOutlineSparkles className="w-4 h-4" /> Auto Generate
          </button>
          <button
            onClick={() => setAddShiftOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Shift
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      {activeTab === 0 && (
        <div className="space-y-4">
          {!conflictsDismissed && (
            <ConflictBanner
              conflicts={conflicts}
              onDismiss={() => setConflictsDismissed(true)}
            />
          )}

          {schedule.map((day, dayIdx) => (
            <div
              key={day.date}
              className="bg-white rounded-xl p-5"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#e5e7eb",
              }}
            >
              <h3 className="text-base font-bold text-gray-900 mb-4">
                {day.date}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderShiftColumn("Morning", day.morning, dayIdx, "morning")}
                {renderShiftColumn(
                  "Afternoon",
                  day.afternoon,
                  dayIdx,
                  "afternoon",
                )}
                {renderShiftColumn("Night", day.night, dayIdx, "night")}
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">
              No schedule available
            </div>
          )}
        </div>
      )}

      {(activeTab === 1 || activeTab === 2) && (
        <div className="space-y-4">
          {/* ── Clear All Button (Only visible on 'All Swap Requests' tab) ── */}
          {activeTab === 1 && swapRequests.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setClearAllSwapsConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
              >
                <HiOutlineTrash className="w-4 h-4" />
                Clear All History
              </button>
            </div>
          )}

          {(swapRequests || [])
            .filter((r) => activeTab === 1 || r.status === "pending")
            .map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl p-5 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {req.requester}
                    </p>
                    <p className="text-xs text-gray-500">{req.requesterRole}</p>
                  </div>

                  <div className="flex items-center gap-3">
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
                    {/* ── Individual Delete Button (Only on 'All Swap Requests' tab) ── */}
                    {activeTab === 1 && (
                      <button
                        onClick={() => setDeleteSwapConfirm(req.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete record"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p>
                    <span className="font-medium">Shift:</span> {req.shift}
                  </p>
                  <p>
                    <span className="font-medium">Swap with:</span>{" "}
                    {req.swapWith}
                  </p>
                  <p>
                    <span className="font-medium">Reason:</span> {req.reason}
                  </p>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                    >
                      <HiOutlineCheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <HiOutlineXCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}

          {activeTab === 1 && swapRequests.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">
              No swap requests found
            </div>
          )}
          {activeTab === 2 && pendingCount === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">
              No pending approvals
            </div>
          )}
        </div>
      )}

      {/* ── Original Modals ───────────────────────────────────────── */}
      <Modal
        title="Add Shift"
        isOpen={addShiftOpen}
        onClose={() => setAddShiftOpen(false)}
        footer={
          <>
            <button
              onClick={() => setAddShiftOpen(false)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddShift}
              className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg"
            >
              Add Shift
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {addError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {addError}
            </div>
          )}
          <InputField
            label="Day"
            type="date"
            value={addDay}
            onChange={setAddDay}
            required
          />
          <SelectField
            label="Shift"
            value={addShift}
            onChange={setAddShift}
            options={shiftOptions}
            placeholder="Select shift"
            required
          />
          <SelectField
            label="Staff Member"
            value={addStaff}
            onChange={setAddStaff}
            options={staffOptions}
            placeholder="Select staff"
            required
          />
          <SelectField
            label="Ward"
            value={addWard}
            onChange={setAddWard}
            options={wardOptions}
          />
        </div>
      </Modal>

      <Modal
        title="Edit Shift"
        isOpen={editShiftOpen}
        onClose={() => setEditShiftOpen(false)}
        footer={
          <>
            <button
              onClick={() => setEditShiftOpen(false)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleEditShift}
              className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg"
            >
              Update
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {editError}
            </div>
          )}
          <SelectField
            label="Staff Member"
            value={editStaff}
            onChange={setEditStaff}
            options={staffOptions}
            required
          />
          <SelectField
            label="Ward"
            value={editWard}
            onChange={setEditWard}
            options={wardOptions}
          />
        </div>
      </Modal>

      <Modal
        title="Auto Generate Schedule"
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        footer={
          <>
            <button
              onClick={() => setGenerateOpen(false)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg"
            >
              Generate
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <InputField
            label="Start Date"
            value={genStartDate}
            onChange={setGenStartDate}
            type="date"
            required
          />
          <InputField
            label="Number of Days"
            value={genDays}
            onChange={setGenDays}
            type="number"
            required
          />
        </div>
      </Modal>

      <Modal
        title="Remove Shift"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        footer={
          <>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteShift}
              className="px-5 py-2 text-sm text-white bg-red-600 rounded-lg"
            >
              Remove
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove this staff member from the shift?
        </p>
      </Modal>

      {/* ── New Swap Request Deletion Modals ──────────────────────── */}
      <Modal
        title="Delete Swap Request"
        isOpen={!!deleteSwapConfirm}
        onClose={() => setDeleteSwapConfirm(null)}
        footer={
          <>
            <button
              onClick={() => setDeleteSwapConfirm(null)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSwapRequest}
              className="px-5 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this swap request? This action cannot
          be undone.
        </p>
      </Modal>

      <Modal
        title="Clear All Swap History"
        isOpen={clearAllSwapsConfirm}
        onClose={() => setClearAllSwapsConfirm(false)}
        footer={
          <>
            <button
              onClick={() => setClearAllSwapsConfirm(false)}
              className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAllSwaps}
              className="px-5 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <strong>all</strong> swap request
          history? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminRoster;
