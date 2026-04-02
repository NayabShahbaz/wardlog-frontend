import { useState } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { Badge, Modal, SelectField, InputField } from "../ui";
import Tabs from "../ui/Tabs";

// ── Types ───────────────────────────────────────────────────────────
interface StaffShift {
  id: string;
  name: string;
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
  requester: string;
  requesterRole: string;
  shift: string;
  swapWith: string;
  requestedDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

// ── Staff pool ──────────────────────────────────────────────────────
const allStaff = [
  { name: "Dr. Sarah Johnson", role: "Doctor", ward: "Ward A" },
  { name: "Dr. Michael John", role: "Doctor", ward: "Ward A" },
  { name: "Emily Chen", role: "Nurse", ward: "Ward A" },
  { name: "Jessica Wilson", role: "Nurse", ward: "Ward B" },
  { name: "Michael Brown", role: "Nurse", ward: "Ward C" },
  { name: "James Wilson", role: "Nurse", ward: "Ward B" },
];

const staffOptions = allStaff.map((s) => ({
  label: `${s.name} (${s.role})`,
  value: s.name,
}));

const shiftOptions = [
  { label: "Morning", value: "morning" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Night", value: "night" },
];

const wardOptions = [
  { label: "Ward A", value: "Ward A" },
  { label: "Ward B", value: "Ward B" },
  { label: "Ward C", value: "Ward C" },
  { label: "ICU", value: "ICU" },
];

// ── Initial data ────────────────────────────────────────────────────
const initialSchedule: DaySchedule[] = [
  {
    date: "Thursday, March 12, 2026",
    morning: [
      { id: "s1", name: "Emily Chen", role: "Nurse", ward: "Ward A" },
      { id: "s2", name: "Jessica Wilson", role: "Nurse", ward: "Ward B" },
    ],
    afternoon: [
      { id: "s3", name: "Michael Brown", role: "Nurse", ward: "Ward C" },
    ],
    night: [{ id: "s4", name: "James Wilson", role: "Nurse", ward: "Ward B" }],
  },
  {
    date: "Friday, March 13, 2026",
    morning: [
      { id: "s5", name: "Dr. Sarah Johnson", role: "Doctor", ward: "Ward A" },
    ],
    afternoon: [
      { id: "s6", name: "Emily Chen", role: "Nurse", ward: "Ward A" },
    ],
    night: [
      { id: "s7", name: "Jessica Wilson", role: "Nurse", ward: "Ward B" },
    ],
  },
];

const initialSwapRequests: SwapRequest[] = [
  {
    id: "sr-1",
    requester: "Emily Chen",
    requesterRole: "Nurse",
    shift: "Friday Mar 13 - Afternoon (Ward A)",
    swapWith: "Jessica Wilson",
    requestedDate: "3/14/2026",
    reason: "Family emergency",
    status: "pending",
  },
  {
    id: "sr-2",
    requester: "James Wilson",
    requesterRole: "Nurse",
    shift: "Thursday Mar 12 - Night (Ward B)",
    swapWith: "Michael Brown",
    requestedDate: "3/13/2026",
    reason: "Doctor appointment",
    status: "pending",
  },
  {
    id: "sr-3",
    requester: "Dr. Sarah Johnson",
    requesterRole: "Doctor",
    shift: "Friday Mar 13 - Morning (Ward A)",
    swapWith: "Dr. Michael John",
    requestedDate: "3/14/2026",
    reason: "Conference attendance",
    status: "approved",
  },
];

// ── Conflict checker ────────────────────────────────────────────────
const findConflicts = (schedule: DaySchedule[]): string[] => {
  const conflicts: string[] = [];
  schedule.forEach((day) => {
    const allShifts = [
      ...day.morning.map((s) => ({ ...s, shift: "Morning" })),
      ...day.afternoon.map((s) => ({ ...s, shift: "Afternoon" })),
      ...day.night.map((s) => ({ ...s, shift: "Night" })),
    ];
    // Check same person in multiple shifts same day
    const nameCount: Record<string, string[]> = {};
    allShifts.forEach((s) => {
      if (!nameCount[s.name]) nameCount[s.name] = [];
      nameCount[s.name].push(s.shift);
    });
    Object.entries(nameCount).forEach(([name, shifts]) => {
      if (shifts.length > 1) {
        conflicts.push(
          `${name} is scheduled for ${shifts.join(" & ")} on ${day.date}`,
        );
      }
    });
    // Check night-to-morning conflict with next day
  });
  // Check night shift followed by morning shift next day
  for (let i = 0; i < schedule.length - 1; i++) {
    const nightStaff = schedule[i].night.map((s) => s.name);
    const nextMorning = schedule[i + 1].morning.map((s) => s.name);
    nightStaff.forEach((name) => {
      if (nextMorning.includes(name)) {
        conflicts.push(
          `${name} has night shift on ${schedule[i].date} followed by morning on ${schedule[i + 1].date}`,
        );
      }
    });
  }
  return conflicts;
};

// ── Auto-generate schedule ──────────────────────────────────────────
const generateSchedule = (dates: string[]): DaySchedule[] => {
  const nurses = allStaff.filter((s) => s.role === "Nurse");
  const doctors = allStaff.filter((s) => s.role === "Doctor");
  let nurseIdx = 0;
  let prevNight = "";

  return dates.map((date) => {
    const morning: StaffShift[] = [];
    const afternoon: StaffShift[] = [];
    const night: StaffShift[] = [];

    // Assign 1 doctor to morning
    const doc = doctors[Math.floor(Math.random() * doctors.length)];
    morning.push({
      id: `gen-${Date.now()}-${Math.random()}`,
      name: doc.name,
      role: doc.role,
      ward: doc.ward,
    });

    // Assign nurses round-robin, skip if conflict
    for (let i = 0; i < 3; i++) {
      const nurse = nurses[nurseIdx % nurses.length];
      nurseIdx++;

      if (i === 0) {
        // Morning nurse - skip if they had night before
        if (nurse.name === prevNight) {
          const alt = nurses[nurseIdx % nurses.length];
          nurseIdx++;
          morning.push({
            id: `gen-${Date.now()}-${Math.random()}`,
            name: alt.name,
            role: alt.role,
            ward: alt.ward,
          });
        } else {
          morning.push({
            id: `gen-${Date.now()}-${Math.random()}`,
            name: nurse.name,
            role: nurse.role,
            ward: nurse.ward,
          });
        }
      } else if (i === 1) {
        afternoon.push({
          id: `gen-${Date.now()}-${Math.random()}`,
          name: nurse.name,
          role: nurse.role,
          ward: nurse.ward,
        });
      } else {
        night.push({
          id: `gen-${Date.now()}-${Math.random()}`,
          name: nurse.name,
          role: nurse.role,
          ward: nurse.ward,
        });
        prevNight = nurse.name;
      }
    }

    return { date, morning, afternoon, night };
  });
};

// ── Component ───────────────────────────────────────────────────────
const AdminRoster = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [activeTab, setActiveTab] = useState(0);
  const [swapRequests, setSwapRequests] =
    useState<SwapRequest[]>(initialSwapRequests);
  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    dayIdx: number;
    shift: string;
    staffIdx: number;
  } | null>(null);

  // Add shift form
  const [addDay, setAddDay] = useState("");
  const [addShift, setAddShift] = useState("");
  const [addStaff, setAddStaff] = useState("");
  const [addWard, setAddWard] = useState("Ward A");
  const [addError, setAddError] = useState("");

  // Edit shift form
  const [editTarget, setEditTarget] = useState<{
    dayIdx: number;
    shift: string;
    staffIdx: number;
  } | null>(null);
  const [editStaff, setEditStaff] = useState("");
  const [editWard, setEditWard] = useState("");
  const [editError, setEditError] = useState("");

  // Generate form
  const [genStartDate, setGenStartDate] = useState("");
  const [genDays, setGenDays] = useState("5");

  const conflicts = findConflicts(schedule);
  const pendingCount = swapRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const dayOptions = schedule.map((d, i) => ({
    label: d.date,
    value: String(i),
  }));

  const tabs = [
    { label: "Schedule" },
    { label: "Swap Requests", count: swapRequests.length },
    { label: "Pending Approvals", count: pendingCount },
  ];

  // ── Handlers ────────────────────────────────────────────────────
  const handleAddShift = () => {
    if (!addDay || !addShift || !addStaff) {
      setAddError("Please fill all fields.");
      return;
    }
    const dayIdx = parseInt(addDay);
    const staffInfo = allStaff.find((s) => s.name === addStaff);
    if (!staffInfo) return;

    const newShift: StaffShift = {
      id: `add-${Date.now()}`,
      name: staffInfo.name,
      role: staffInfo.role,
      ward: addWard,
    };

    const updated = [...schedule];
    const shiftKey = addShift as "morning" | "afternoon" | "night";
    updated[dayIdx] = {
      ...updated[dayIdx],
      [shiftKey]: [...updated[dayIdx][shiftKey], newShift],
    };
    setSchedule(updated);
    setAddShiftOpen(false);
    setAddDay("");
    setAddShift("");
    setAddStaff("");
    setAddWard("Ward A");
    setAddError("");
  };

  const handleEditShift = () => {
    if (!editTarget || !editStaff) {
      setEditError("Please select a staff member.");
      return;
    }
    const staffInfo = allStaff.find((s) => s.name === editStaff);
    if (!staffInfo) return;

    const updated = [...schedule];
    const shiftKey = editTarget.shift as "morning" | "afternoon" | "night";
    const shiftArr = [...updated[editTarget.dayIdx][shiftKey]];
    shiftArr[editTarget.staffIdx] = {
      ...shiftArr[editTarget.staffIdx],
      name: staffInfo.name,
      role: staffInfo.role,
      ward: editWard || shiftArr[editTarget.staffIdx].ward,
    };
    updated[editTarget.dayIdx] = {
      ...updated[editTarget.dayIdx],
      [shiftKey]: shiftArr,
    };
    setSchedule(updated);
    setEditShiftOpen(false);
    setEditTarget(null);
    setEditStaff("");
    setEditWard("");
    setEditError("");
  };

  const handleDeleteShift = () => {
    if (!deleteConfirm) return;
    const updated = [...schedule];
    const shiftKey = deleteConfirm.shift as "morning" | "afternoon" | "night";
    const shiftArr = [...updated[deleteConfirm.dayIdx][shiftKey]];
    shiftArr.splice(deleteConfirm.staffIdx, 1);
    updated[deleteConfirm.dayIdx] = {
      ...updated[deleteConfirm.dayIdx],
      [shiftKey]: shiftArr,
    };
    setSchedule(updated);
    setDeleteConfirm(null);
  };

  const handleGenerate = () => {
    if (!genStartDate || !genDays) return;
    const start = new Date(genStartDate);
    const days: string[] = [];
    for (let i = 0; i < parseInt(genDays); i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(
        d.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
      );
    }
    const generated = generateSchedule(days);
    setSchedule(generated);
    setGenerateOpen(false);
  };

  const handleApprove = (id: string) => {
    setSwapRequests(
      swapRequests.map((r) =>
        r.id === id ? { ...r, status: "approved" as const } : r,
      ),
    );
  };

  const handleReject = (id: string) => {
    setSwapRequests(
      swapRequests.map((r) =>
        r.id === id ? { ...r, status: "rejected" as const } : r,
      ),
    );
  };

  const openEdit = (
    dayIdx: number,
    shift: string,
    staffIdx: number,
    staff: StaffShift,
  ) => {
    setEditTarget({ dayIdx, shift, staffIdx });
    setEditStaff(staff.name);
    setEditWard(staff.ward);
    setEditShiftOpen(true);
  };

  // ── Render helpers ──────────────────────────────────────────────
  const renderShiftColumn = (
    label: string,
    staff: StaffShift[],
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-gray-900">{label}</h4>
          <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">
            {staff.length}
          </span>
        </div>
      </div>
      {staff.length > 0 ? (
        <div className="space-y-2">
          {staff.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-2"
              style={{
                borderBottomWidth: "1px",
                borderBottomStyle: "solid",
                borderBottomColor: "#f3f4f6",
              }}
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">
                  {s.role} • {s.ward}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(dayIdx, shiftKey, idx, s)}
                  className="p-1 text-gray-400 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded transition-colors"
                >
                  <HiOutlinePencilSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirm({ dayIdx, shift: shiftKey, staffIdx: idx })
                  }
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No staff scheduled</p>
      )}
    </div>
  );

  const renderSwapCard = (req: SwapRequest) => (
    <div
      key={req.id}
      className="bg-white rounded-xl p-5"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{req.requester}</p>
          <p className="text-xs text-gray-500">{req.requesterRole}</p>
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
      <div className="space-y-1 mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Shift:</span> {req.shift}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Swap with:</span> {req.swapWith}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Date:</span> {req.requestedDate}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Reason:</span> {req.reason}
        </p>
      </div>
      {req.status === "pending" && (
        <div
          className="flex items-center gap-2 pt-3"
          style={{
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderTopColor: "#f3f4f6",
          }}
        >
          <button
            onClick={() => handleApprove(req.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            <HiOutlineCheckCircle className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => handleReject(req.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <HiOutlineXCircle className="w-4 h-4" /> Reject
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">
              Roster Management
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage schedules, generate rosters, and approve swap requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium shadow text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#d1d5db",
            }}
          >
            <HiOutlineSparkles className="w-4 h-4" /> Auto Generate
          </button>
          <button
            onClick={() => setAddShiftOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" /> Add Shift
          </button>
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div
          className="bg-red-50 rounded-xl p-4"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#fecaca",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-bold text-red-800">
              Schedule Conflicts Detected
            </p>
          </div>
          <ul className="space-y-1">
            {conflicts.map((c, i) => (
              <li key={i} className="text-sm text-red-700">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      {/* Schedule Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
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
              No schedule generated. Click "Auto Generate" to create one.
            </div>
          )}
        </div>
      )}

      {/* Swap Requests Tab */}
      {activeTab === 1 && (
        <div className="space-y-4">{swapRequests.map(renderSwapCard)}</div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 2 && (
        <div className="space-y-4">
          {swapRequests.filter((r) => r.status === "pending").length > 0 ? (
            swapRequests
              .filter((r) => r.status === "pending")
              .map(renderSwapCard)
          ) : (
            <div className="text-center py-12 text-sm text-gray-400">
              No pending approvals
            </div>
          )}
        </div>
      )}

      {/* Add Shift Modal */}
      <Modal
        title="Add Shift"
        isOpen={addShiftOpen}
        onClose={() => {
          setAddShiftOpen(false);
          setAddError("");
        }}
        footer={
          <>
            <button
              onClick={() => setAddShiftOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddShift}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Add Shift
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {addError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {addError}
            </div>
          )}
          <SelectField
            label="Day"
            value={addDay}
            onChange={(v) => {
              setAddDay(v);
              setAddError("");
            }}
            options={dayOptions}
            placeholder="Select day"
            required
          />
          <SelectField
            label="Shift"
            value={addShift}
            onChange={(v) => {
              setAddShift(v);
              setAddError("");
            }}
            options={shiftOptions}
            placeholder="Select shift"
            required
          />
          <SelectField
            label="Staff Member"
            value={addStaff}
            onChange={(v) => {
              setAddStaff(v);
              setAddError("");
            }}
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

      {/* Edit Shift Modal */}
      <Modal
        title="Edit Shift"
        isOpen={editShiftOpen}
        onClose={() => {
          setEditShiftOpen(false);
          setEditError("");
        }}
        footer={
          <>
            <button
              onClick={() => setEditShiftOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleEditShift}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Update
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {editError}
            </div>
          )}
          <SelectField
            label="Staff Member"
            value={editStaff}
            onChange={(v) => {
              setEditStaff(v);
              setEditError("");
            }}
            options={staffOptions}
            placeholder="Select staff"
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

      {/* Delete Confirmation */}
      <Modal
        title="Remove Shift"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        footer={
          <>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteShift}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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

      {/* Auto Generate Modal */}
      <Modal
        title="Auto Generate Schedule"
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        footer={
          <>
            <button
              onClick={() => setGenerateOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Generate
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will replace the current schedule with an auto-generated
            conflict-free roster.
          </p>
          <InputField
            label="Start Date"
            value={genStartDate}
            onChange={setGenStartDate}
            type="date"
            required
            placeholder="Select start date"
          />
          <InputField
            label="Number of Days"
            value={genDays}
            onChange={setGenDays}
            type="number"
            placeholder="5"
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminRoster;
