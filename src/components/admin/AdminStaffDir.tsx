import { useState, useEffect } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUserCircle,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineBuildingOffice2,
} from "react-icons/hi2";
import { Badge, SearchBar, Modal, InputField, SelectField } from "../ui";
import { apiFetch } from "../../utils/api";

interface StaffMember {
  _id: string; // Updated to match MongoDB schema
  name: string;
  role: string;
  specialty?: string;
  department: string;
  phone: string;
  email: string;
  status: string;
}

const roleOptions = [
  { label: "Doctor", value: "Doctor" },
  { label: "Nurse", value: "Nurse" },
  { label: "Admin", value: "Admin" },
];

const deptOptions = [
  { label: "General Medicine", value: "General Medicine" },
  { label: "Ward A", value: "Ward A" },
  { label: "Ward B", value: "Ward B" },
  { label: "Ward C", value: "Ward C" },
  { label: "ICU", value: "ICU" },
  { label: "Administration", value: "Administration" },
];

interface StaffFormData {
  name: string;
  role: string;
  specialty: string;
  department: string;
  phone: string;
  email: string;
}

const emptyForm: StaffFormData = {
  name: "",
  role: "",
  specialty: "",
  department: "",
  phone: "",
  email: "",
};

const AdminStaffDirectory = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]); // Removed initialStaff
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Member 2: Fetch Staff ──────────────────────────────────────
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/staff");
      const result = await res.json();
      if (res.ok && result.success) {
        setStaff(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch staff directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const grouped: Record<string, StaffMember[]> = {};
  filtered.forEach((s) => {
    const group =
      s.role === "Doctor" ? "Doctors" : s.role === "Nurse" ? "Nurses" : "Admin";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(s);
  });

  // ── Member 2: Add Staff ────────────────────────────────────────
  const handleAdd = async () => {
    if (!formData.name || !formData.role || !formData.department || !formData.email) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await apiFetch("/api/staff", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          status: "Active"
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchStaff();
        setAddOpen(false);
        setFormData(emptyForm);
      } else {
        setError(result.message || "Failed to add staff.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleEditOpen = (member: StaffMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      specialty: member.specialty || "",
      department: member.department,
      phone: member.phone,
      email: member.email,
    });
    setEditId(member._id);
    setEditOpen(true);
  };

  // ── Member 2: Update Staff ─────────────────────────────────────
  const handleUpdate = async () => {
    if (!formData.name || !formData.role || !formData.department || !formData.email) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await apiFetch(`/api/staff/${editId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchStaff();
        setEditOpen(false);
        setEditId(null);
        setFormData(emptyForm);
      } else {
        setError(result.message || "Failed to update staff.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  // ── Member 2: Delete Staff ─────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/staff/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStaff((prev) => prev.filter((s) => s._id !== id)); // Immediate UI update
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Error deleting staff:", err);
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      <InputField
        label="Full Name"
        value={formData.name}
        onChange={(v) => {
          setFormData({ ...formData, name: v });
          setError("");
        }}
        required
        placeholder="e.g. Dr. Jane Smith"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label="Role"
          value={formData.role}
          onChange={(v) => {
            setFormData({ ...formData, role: v });
            setError("");
          }}
          options={roleOptions}
          placeholder="Select role"
          required
        />
        <SelectField
          label="Department"
          value={formData.department}
          onChange={(v) => {
            setFormData({ ...formData, department: v });
            setError("");
          }}
          options={deptOptions}
          placeholder="Select department"
          required
        />
      </div>
      {formData.role === "Doctor" && (
        <InputField
          label="Specialty"
          value={formData.specialty}
          onChange={(v) => setFormData({ ...formData, specialty: v })}
          placeholder="e.g. Internal Medicine"
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Phone"
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
          placeholder="e.g. 555-0101"
          type="tel"
        />
        <InputField
          label="Email"
          value={formData.email}
          onChange={(v) => {
            setFormData({ ...formData, email: v });
            setError("");
          }}
          required
          placeholder="e.g. name@hospital.com"
          type="email"
        />
      </div>
    </div>
  );

  const renderStaffCard = (member: StaffMember) => (
    <div
      key={member._id}
      className="bg-white rounded-xl p-4 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8f0f6] flex items-center justify-center shrink-0">
            <HiOutlineUserCircle className="w-6 h-6 text-[#1a5276]" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{member.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge text={member.role} variant="outline" />
              <Badge
                text={member.status}
                variant={member.status === "active" ? "dark" : "outline"}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditOpen(member)}
            className="p-1.5 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-lg transition-colors"
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm(member._id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {member.specialty && (
          <div className="flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Specialty: {member.specialty}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            Department: {member.department}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlinePhone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-[#1a5276]">{member.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineEnvelope className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-[#1a5276]">{member.email}</span>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading staff directory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all hospital staff members
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(emptyForm);
            setAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search staff by name, role, or department..."
      />

      {["Doctors", "Nurses", "Admin"].map((role) =>
        grouped[role] && grouped[role].length > 0 ? (
          <div
            key={role}
            className="bg-white rounded-xl p-5 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">{role}</h3>
              <span className="text-xs font-medium text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">
                {grouped[role].length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[role].map(renderStaffCard)}
            </div>
          </div>
        ) : null,
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          No staff found
        </div>
      )}

      <Modal
        title="Add Staff Member"
        isOpen={addOpen}
        onClose={() => { setAddOpen(false); setError(""); }}
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleAdd} className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]">Add Staff</button>
          </>
        }
      >
        {renderForm()}
      </Modal>

      <Modal
        title="Edit Staff Member"
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); setError(""); }}
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleUpdate} className="px-5 py-2 text-sm text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]">Update Staff</button>
          </>
        }
      >
        {renderForm()}
      </Modal>

      <Modal
        title="Delete Staff Member"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        footer={
          <>
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-5 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to remove this staff member? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminStaffDirectory;