import { useState, useEffect } from "react";
import {
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { Badge, Modal, SelectField, InputField } from "../ui";
import Tabs from "../ui/Tabs";
import { apiFetch } from "../../utils/api";

// ── Types ───────────────────────────────────────────────────────────
interface StaffShift {
  id: string;
  _id?: string; 
  name: string;
  staffName?: string; // For backward compatibility with older data
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
  id: string; // Used by frontend logic
  _id?: string; // Original MongoDB ID
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

const AdminRoster = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [staffOptions, setStaffOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [addShiftOpen, setAddShiftOpen] = useState(false);
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    dayIdx: number;
    shift: string;
    staffIdx: number;
  } | null>(null);

  const [addDay, setAddDay] = useState("");
  const [addShift, setAddShift] = useState("");
  const [addStaff, setAddStaff] = useState("");
  const [addWard, setAddWard] = useState("Ward A");
  const [addError, setAddError] = useState("");
  const [editTarget, setEditTarget] = useState<{ dayIdx: number; shift: string; staffIdx: number } | null>(null);
  const [editStaff, setEditStaff] = useState("");
  const [editWard, setEditWard] = useState("");
  const [editError, setEditError] = useState("");
  const [genStartDate, setGenStartDate] = useState("");
  const [genDays, setGenDays] = useState("5");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rosterRes, swapRes, staffRes] = await Promise.all([
          apiFetch("/api/roster"),
          apiFetch("/api/swap-requests"),
          apiFetch("/api/staff")
        ]);

        const rosterData = await rosterRes.json();
        const swapData = await swapRes.json();
        const staffData = await staffRes.json();

        if (rosterData.success && Array.isArray(rosterData.data)) {
          const reshapedData = rosterData.data.map((day: any) => ({
            date: new Date(day.date).toLocaleDateString(),
            morning: day.shifts.filter((s: any) => s.shift === 'Morning'),
            afternoon: day.shifts.filter((s: any) => s.shift === 'Evening'),
            night: day.shifts.filter((s: any) => s.shift === 'Night')
          }));
          setSchedule(reshapedData);
        } else {
          setSchedule([]);
        }
      
        if (swapData.success && Array.isArray(swapData.data)) {
          const normalizedSwaps = swapData.data.map((req: any) => ({
            ...req,
            id: req._id || req.id,
            
            // 1. Unpack the populated objects into plain strings so React doesn't crash!
            requester: req.requester?.name || "Unknown Staff",
            requesterRole: req.requester?.role || "Staff",
            swapWith: req.swapWith?.name || "Unknown Staff",
            
            // 2. Normalize the capital "Pending" from the database back to lowercase 
            // so your frontend tabs, filters, and colored badges work correctly!
            status: req.status ? req.status.toLowerCase() : "pending"
          }));
          setSwapRequests(normalizedSwaps);
        } else {
          setSwapRequests([]);
        }

        if (staffData.success && Array.isArray(staffData.data)) {
          setStaffOptions(staffData.data.map((s: any) => ({
            label: `${s.name} (${s.role})`,
            value: s.name,
          })));
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setSchedule([]);
        setSwapRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = swapRequests.filter((r) => r.status === "pending").length;
  const dayOptions = (schedule || []).map((d, i) => ({ 
    label: d.date || `Day ${i + 1}`, 
    value: String(i) 
  }));
  const tabs = [
    { label: "Schedule" },
    { label: "Swap Requests", count: (swapRequests || []).length },
    { label: "Pending Approvals", count: pendingCount },
  ];

 const handleAddShift = async () => {
    if (!addDay || !addShift || !addStaff) {
      setAddError("Please fill all fields.");
      return;
    }
    const staffInfo = staffOptions.find((s) => s.value === addStaff);
    if (!staffInfo) return;

    const roleMatch = staffInfo.label.match(/\(([^)]+)\)/);
    const role = roleMatch ? roleMatch[1] : "Staff";

    // Format the date for the backend
    const [year, month, day] = addDay.split('-');
    const isoDate = new Date(Number(year), Number(month) - 1, Number(day)).toISOString();

    try {
      const res = await apiFetch("/api/roster/shifts", {
        method: "POST",
        body: JSON.stringify({
          date: isoDate,
          shiftData: {
            shift: addShift, // Matches the backend enum (Morning/Evening/Night)
            staffName: staffInfo.value,
            role: role,
            ward: addWard
          }
        })
      });

      if (res.ok) {
        // If successful, instantly re-fetch the Roster to get the real MongoDB _ids!
        const rosterRes = await apiFetch("/api/roster");
        const rosterData = await rosterRes.json();
        if (rosterData.success) {
          const reshapedData = rosterData.data.map((day: any) => ({
            date: new Date(day.date).toLocaleDateString(),
            morning: day.shifts.filter((s: any) => s.shift === 'Morning'),
            afternoon: day.shifts.filter((s: any) => s.shift === 'Evening'),
            night: day.shifts.filter((s: any) => s.shift === 'Night')
          }));
          setSchedule(reshapedData);
        }
        
        // Close modal and clean up
        setAddShiftOpen(false);
        setAddDay(""); setAddShift(""); setAddStaff(""); setAddWard("Ward A"); setAddError("");
      } else {
        const errData = await res.json();
        setAddError(errData.message || "Failed to save shift to database");
      }
    } catch (err) {
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

    // Locate the exact shift document to grab its real MongoDB _id
    const shiftKey = editTarget.shift as "morning" | "afternoon" | "night";
    const shiftToEdit = schedule[editTarget.dayIdx][shiftKey][editTarget.staffIdx];
    const shiftId = shiftToEdit._id || shiftToEdit.id;

    // Convert frontend key ("afternoon") back to backend Enum ("Evening")
    const backendShiftType = shiftKey === "afternoon" ? "Evening" : shiftKey.charAt(0).toUpperCase() + shiftKey.slice(1);

    try {
      const res = await apiFetch(`/api/roster/shifts/${shiftId}`, {
        method: "PUT",
        body: JSON.stringify({
          shift: backendShiftType,
          staffName: staffInfo.value,
          role: role,
          ward: editWard || shiftToEdit.ward
        })
      });

      if (res.ok) {
        // Re-fetch to apply changes
        const rosterRes = await apiFetch("/api/roster");
        const rosterData = await rosterRes.json();
        if (rosterData.success) {
          const reshapedData = rosterData.data.map((day: any) => ({
            date: new Date(day.date).toLocaleDateString(),
            morning: day.shifts.filter((s: any) => s.shift === 'Morning'),
            afternoon: day.shifts.filter((s: any) => s.shift === 'Evening'),
            night: day.shifts.filter((s: any) => s.shift === 'Night')
          }));
          setSchedule(reshapedData);
        }
        setEditShiftOpen(false);
        setEditTarget(null); setEditStaff(""); setEditWard(""); setEditError("");
      } else {
         const errData = await res.json();
         setEditError(errData.message || "Failed to update shift.");
      }
    } catch (err) {
       setEditError("Server error occurred while editing shift.");
    }
  };

  const handleDeleteShift = async () => {
    if (!deleteConfirm) return;

    const shiftKey = deleteConfirm.shift as "morning" | "afternoon" | "night";
    const shiftToDelete = schedule[deleteConfirm.dayIdx][shiftKey][deleteConfirm.staffIdx];
    const shiftId = shiftToDelete._id || shiftToDelete.id;

    try {
      const res = await apiFetch(`/api/roster/shifts/${shiftId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        // Re-fetch to pull the updated schedule
        const rosterRes = await apiFetch("/api/roster");
        const rosterData = await rosterRes.json();
        if (rosterData.success) {
          const reshapedData = rosterData.data.map((day: any) => ({
            date: new Date(day.date).toLocaleDateString(),
            morning: day.shifts.filter((s: any) => s.shift === 'Morning'),
            afternoon: day.shifts.filter((s: any) => s.shift === 'Evening'),
            night: day.shifts.filter((s: any) => s.shift === 'Night')
          }));
          setSchedule(reshapedData);
        }
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
        body: JSON.stringify({ startDate: genStartDate, days: parseInt(genDays) }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const reshapedData = result.data.map((day: any) => ({
          date: new Date(day.date).toLocaleDateString(),
          morning: day.shifts.filter((s: any) => s.shift === 'Morning'),
          afternoon: day.shifts.filter((s: any) => s.shift === 'Evening'),
          night: day.shifts.filter((s: any) => s.shift === 'Night')
        }));
        setSchedule(reshapedData);
        setGenerateOpen(false);
      } else {
        alert(result.message || "Failed to generate schedule.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await apiFetch(`/api/swap-requests/${id}/approve`, { method: "PUT" });
      if (res.ok) {
        setSwapRequests(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, status: "approved" } : r));
      }
    } catch (err) { console.error(err); }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiFetch(`/api/swap-requests/${id}/reject`, { method: "PUT" });
      if (res.ok) {
        setSwapRequests(prev => prev.map(r => (r.id === id || r._id === id) ? { ...r, status: "rejected" } : r));
      }
    } catch (err) { console.error(err); }
  };

  const renderShiftColumn = (label: string, staff: StaffShift[] = [], dayIdx: number, shiftKey: string) => (
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
        {staff.length > 0 ? staff.map((s, idx) => (
          <div
            key={s._id || s.id || idx} 
            className="group py-2 flex items-center justify-between last:border-0"
            style={{
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#f3f4f6",
            }}
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.staffName ||s.name}</p>
              <p className="text-xs text-gray-500">
                {s.role} • {s.ward}
              </p>
            </div>
            {/* Admin actions (Edit/Delete) visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditTarget({ dayIdx, shift: shiftKey, staffIdx: idx }); setEditStaff(s.name); setEditWard(s.ward); setEditShiftOpen(true); }}
                className="p-1.5 text-gray-400 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-md transition-colors"
              >
                <HiOutlinePencilSquare className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeleteConfirm({ dayIdx, shift: shiftKey, staffIdx: idx })}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <p className="text-sm text-gray-400 italic">No staff scheduled</p>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading roster...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineCalendarDays className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Roster Management</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage schedules and approve swap requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGenerateOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"><HiOutlineSparkles className="w-4 h-4" /> Auto Generate</button>
          <button onClick={() => setAddShiftOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg"><HiOutlinePlus className="w-4 h-4" /> Add Shift</button>
        </div>
      </div>

      <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />

      
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
              <h3 className="text-base font-bold text-gray-900 mb-4">{day.date}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderShiftColumn("Morning", day.morning, dayIdx, "morning")}
                {renderShiftColumn("Afternoon", day.afternoon, dayIdx, "afternoon")}
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
          {(swapRequests || [])
            .filter(r => activeTab === 1 || r.status === "pending")
            .map(req => (
              <div key={req.id} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex justify-between mb-3">
                  <div><p className="text-sm font-bold text-gray-900">{req.requester}</p><p className="text-xs text-gray-500">{req.requesterRole}</p></div>
                  <Badge text={req.status} variant={req.status === "approved" ? "green" : req.status === "rejected" ? "red" : "outline"} />
                </div>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p><span className="font-medium">Shift:</span> {req.shift}</p>
                  <p><span className="font-medium">Swap with:</span> {req.swapWith}</p>
                  <p><span className="font-medium">Reason:</span> {req.reason}</p>
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"><HiOutlineCheckCircle className="w-4 h-4" /> Approve</button>
                    <button onClick={() => handleReject(req.id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"><HiOutlineXCircle className="w-4 h-4" /> Reject</button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <Modal title="Add Shift" isOpen={addShiftOpen} onClose={() => setAddShiftOpen(false)} footer={<><button onClick={() => setAddShiftOpen(false)} className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button><button onClick={handleAddShift} className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg">Add Shift</button></>}>
        <div className="space-y-4">
          {addError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{addError}</div>}
          <InputField label="Day" type="date" value={addDay} onChange={setAddDay} required />
          <SelectField label="Shift" value={addShift} onChange={setAddShift} options={shiftOptions} placeholder="Select shift" required />
          <SelectField label="Staff Member" value={addStaff} onChange={setAddStaff} options={staffOptions} placeholder="Select staff" required />
          <SelectField label="Ward" value={addWard} onChange={setAddWard} options={wardOptions} />
        </div>
      </Modal>

      <Modal title="Edit Shift" isOpen={editShiftOpen} onClose={() => setEditShiftOpen(false)} footer={<><button onClick={() => setEditShiftOpen(false)} className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button><button onClick={handleEditShift} className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg">Update</button></>}>
        <div className="space-y-4">
          {editError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{editError}</div>}
          <SelectField label="Staff Member" value={editStaff} onChange={setEditStaff} options={staffOptions} required />
          <SelectField label="Ward" value={editWard} onChange={setEditWard} options={wardOptions} />
        </div>
      </Modal>

      <Modal title="Auto Generate Schedule" isOpen={generateOpen} onClose={() => setGenerateOpen(false)} footer={<><button onClick={() => setGenerateOpen(false)} className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button><button onClick={handleGenerate} className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg">Generate</button></>}>
        <div className="space-y-4">
          <InputField label="Start Date" value={genStartDate} onChange={setGenStartDate} type="date" required />
          <InputField label="Number of Days" value={genDays} onChange={setGenDays} type="number" required />
        </div>
      </Modal>

      <Modal title="Remove Shift" isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} footer={<><button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg">Cancel</button><button onClick={handleDeleteShift} className="px-5 py-2 text-sm text-white bg-red-600 rounded-lg">Remove</button></>}>
        <p className="text-sm text-gray-600">Are you sure you want to remove this staff member from the shift?</p>
      </Modal>
    </div>
  );
};

export default AdminRoster;