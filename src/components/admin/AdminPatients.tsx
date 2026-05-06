/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import {
  Badge,
  SearchBar,
  DataTable,
  Modal,
  InputField,
  SelectField,
} from "../ui";
import type { Column } from "../ui/DataTable";
import { apiFetch } from "../../utils/api";

// ── Types ───────────────────────────────────────────────────────────
type PopulatedRef =
  | string
  | { _id: string; name?: string; firstName?: string; lastName?: string }
  | null
  | undefined;

interface Patient {
  [key: string]: unknown;
  _id?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  name: string;
  diagnosis: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  ward?: string;
  bedNumber?: string;
  patientType: "inpatient" | "outpatient";
  status: string;
  assignedDoctor: PopulatedRef;
  assignedNurse?: PopulatedRef;
}

interface Doctor {
  _id: string;
  name: string;
  role?: string;
  specialty?: string;
  department?: string;
}

interface PatientFormState {
  mrn: string;
  patientType: "inpatient" | "outpatient" | "";
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  diagnosis: string;
  assignedDoctor: string;
  ward: string;
  bedNumber: string;
  status: string;
}

const emptyForm: PatientFormState = {
  mrn: "",
  patientType: "",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  diagnosis: "",
  assignedDoctor: "",
  ward: "",
  bedNumber: "",
  status: "admitted",
};

// ── Helpers ─────────────────────────────────────────────────────────

const getRefId = (ref: PopulatedRef): string => {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  return ref._id;
};

const getRefName = (ref: PopulatedRef): string => {
  if (!ref) return "—";
  if (typeof ref === "string") return ref;
  if (ref.name) return ref.name;
  if (ref.firstName || ref.lastName)
    return `${ref.firstName || ""} ${ref.lastName || ""}`.trim();
  return "—";
};

// ── Static Options ──────────────────────────────────────────────────
const statusVariant: Record<string, "dark" | "outline" | "gray"> = {
  admitted: "dark",
  outpatient: "outline",
  discharged: "gray",
};

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const wardOptions = [
  { label: "Ward A", value: "Ward A" },
  { label: "Ward B", value: "Ward B" },
  { label: "Ward C", value: "Ward C" },
  { label: "ICU", value: "ICU" },
];

const patientTypeOptions = [
  { label: "Inpatient (Admitted)", value: "inpatient" },
  { label: "Outpatient", value: "outpatient" },
];

// ── Searchable Doctor Dropdown ──────────────────────────────────────
const DoctorSearchSelect = ({
  value,
  onChange,
  required,
  doctors,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  doctors: Doctor[];
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = doctors.filter((d) => {
    const searchLower = search.toLowerCase();
    const matchName = d.name?.toLowerCase().includes(searchLower);
    const matchSpecialty = d.specialty?.toLowerCase().includes(searchLower);
    const matchDept = d.department?.toLowerCase().includes(searchLower);
    return matchName || matchSpecialty || matchDept;
  });

  const selectedDoctor = doctors.find(
    (d) => d._id === value || d.name === value,
  );

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Assigned Doctor
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-left bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white"
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#d1d5db",
        }}
      >
        {selectedDoctor ? (
          <span className="text-gray-900">{selectedDoctor.name}</span>
        ) : value ? (
          <span className="text-gray-900">{value}</span>
        ) : (
          <span className="text-gray-400">Select a doctor</span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-20 overflow-hidden"
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#e5e7eb",
          }}
        >
          {/* Search input */}
          <div
            className="p-2"
            style={{
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "#f3f4f6",
            }}
          >
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1a5276]"
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#e5e7eb",
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Doctor list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((doc) => (
                <button
                  key={doc._id}
                  type="button"
                  onMouseDown={() => {
                    onChange(doc._id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-[#e8f0f6] transition-colors ${
                    value === doc._id
                      ? "bg-[#e8f0f6] text-[#1a5276]"
                      : "text-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-400">
                    {doc.specialty || "General"} •{" "}
                    {doc.department || "Medicine"}
                  </p>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                {doctors.length === 0
                  ? "No doctors loaded from server"
                  : "No doctors match search"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Patient Form ────────────────────────────────────────────────────
const AdminPatientForm = ({
  data,
  onChange,
  doctors,
  isEdit = false,
}: {
  data: PatientFormState;
  onChange: (d: PatientFormState) => void;
  doctors: Doctor[];
  isEdit?: boolean;
}) => {
  const update = (field: keyof PatientFormState, value: string) => {
    const updated = { ...data, [field]: value };
    if (field === "patientType") {
      if (value === "outpatient") {
        updated.ward = "";
        updated.bedNumber = "";
        updated.status = "outpatient";
      } else {
        updated.status = "admitted";
      }
    }
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Patient Type"
        value={data.patientType}
        onChange={(v) => update("patientType", v)}
        options={patientTypeOptions}
        placeholder="Select patient type"
        required
      />

      {data.patientType && (
        <>
          {isEdit && (
            <div className="mb-4">
              <InputField
                label="Medical Record Number"
                value={data.mrn}
                onChange={() => {}}
                disabled={true}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              placeholder="e.g. John"
              value={data.firstName}
              onChange={(v) => update("firstName", v)}
              required
            />
            <InputField
              label="Last Name"
              placeholder="e.g. Doe"
              value={data.lastName}
              onChange={(v) => update("lastName", v)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Diagnosis"
              placeholder="e.g. Pneumonia"
              value={data.diagnosis}
              onChange={(v) => update("diagnosis", v)}
              required
            />
            <InputField
              label="Date of Birth"
              placeholder="MM/DD/YYYY"
              value={data.dob ? data.dob.split("T")[0] : ""}
              onChange={(v) => update("dob", v)}
              type="date"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Gender"
              value={data.gender}
              onChange={(v) => update("gender", v)}
              options={genderOptions}
              placeholder="Select gender"
              required
            />
            <InputField
              label="Phone"
              placeholder="e.g. 555-1001"
              value={data.phone}
              onChange={(v) => update("phone", v)}
              type="tel"
              required
            />
          </div>

          <InputField
            label="Address"
            placeholder="e.g. 123 Main Street, City"
            value={data.address}
            onChange={(v) => update("address", v)}
          />

          <InputField
            label="Email"
            placeholder="e.g. john@gmail.com"
            value={data.email}
            onChange={(v) => update("email", v)}
            type="email"
          />

          <DoctorSearchSelect
            value={data.assignedDoctor}
            onChange={(v) => update("assignedDoctor", v)}
            doctors={doctors}
            required
          />

          {data.patientType === "inpatient" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Ward"
                value={data.ward}
                onChange={(v) => update("ward", v)}
                options={wardOptions}
                placeholder="Select ward"
                required
              />
              <InputField
                label="Bed Number"
                placeholder="e.g. A-101"
                value={data.bedNumber}
                onChange={(v) => update("bedNumber", v)}
                required
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────
const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addData, setAddData] = useState<PatientFormState>(emptyForm);
  const [editData, setEditData] = useState<PatientFormState>(emptyForm);
  const [editMrn, setEditMrn] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    try {
      const res = await apiFetch("/api/patients");
      const result = await res.json();
      if (result.success) setPatients(result.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
    }
  };

  const fetchDoctors = async () => {
    try {
      // Fetch BOTH Users (for the ID) and Staff (for the UI details) at the same time
      const [usersRes, staffRes] = await Promise.all([
        apiFetch("/api/users"),
        apiFetch("/api/staff"),
      ]);

      const usersResult = await usersRes.json();
      const staffResult = await staffRes.json();

      if (usersResult.success && staffResult.success) {
        // 1. Get only the Users who are Doctors
        const doctorUsers = usersResult.data.filter(
          (u: any) => u.role === "Doctor",
        );

        // 2. Map through them and attach their Staff details
        const docs = doctorUsers.map((user: any) => {
          // Find their matching Staff profile by name or email
          const staffProfile = staffResult.data.find(
            (s: any) => s.name === user.name || s.email === user.email,
          );

          return {
            _id: user._id || user.id, // The exact User ID the backend Patient model wants
            name: user.name,
            role: user.role,
            specialty: staffProfile?.specialty || "General", // Pulled from Staff
            department: staffProfile?.department || "Medicine", // Pulled from Staff
          };
        });

        setDoctors(docs);
      } else {
        console.error("Failed to load doctor data.");
      }
    } catch (err) {
      console.error("Network error fetching doctors", err);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchDoctors()]);
      setLoading(false);
    };
    initializeData();
  }, []);

  const filtered = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()),
  );

  const validate = (data: PatientFormState): boolean => {
    if (
      !data.patientType ||
      !data.firstName ||
      !data.lastName ||
      !data.diagnosis ||
      !data.assignedDoctor
    ) {
      setError("Please fill all required fields.");
      return false;
    }
    if (data.patientType === "inpatient" && (!data.ward || !data.bedNumber)) {
      setError("Ward and bed number are required for inpatients.");
      return false;
    }
    return true;
  };

  type CreatePatientPayload = {
    firstName: string;
    lastName: string;
    dob: string;
    phone: string;
    email: string;
    gender: string;
    address: string;
    diagnosis: string;
    patientType: "inpatient" | "outpatient" | "";
    assignedDoctor: string;
    status: string;
    ward?: string;
    bedNumber?: string;
  };

  const generatePayload = (data: PatientFormState): CreatePatientPayload => {
    const payload: CreatePatientPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      address: data.address,
      diagnosis: data.diagnosis,
      patientType: data.patientType,
      assignedDoctor: data.assignedDoctor,
      status: data.status,
    };

    if (data.patientType === "inpatient") {
      payload.ward = data.ward;
      payload.bedNumber = data.bedNumber;
    }

    return payload;
  };

  const handleAdd = async () => {
    if (!validate(addData)) return;
    try {
      const payload = generatePayload(addData);
      const res = await apiFetch("/api/patients", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        await fetchPatients();
        setAddData(emptyForm);
        setAddOpen(false);
        setError("");
      } else {
        setError(result.message || "Failed to add patient.");
      }
    } catch (err) {
      console.error("Error adding patient:", err);
      setError("Server error adding patient.");
    }
  };

  const handleEdit = (patient: Patient) => {
    const refId = getRefId(patient.assignedDoctor);
    const refName = getRefName(patient.assignedDoctor);

    const matchedDoc = doctors.find(
      (d) =>
        d._id === refId ||
        d._id === refName ||
        d.name === refName ||
        d.name === refId,
    );

    const realDoctorId = matchedDoc ? matchedDoc._id : "";

    setEditData({
      mrn: patient.mrn,
      patientType: patient.patientType,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      gender: patient.gender,
      address: patient.address || "",
      phone: patient.phone,
      email: patient.email || "",
      diagnosis: patient.diagnosis,
      assignedDoctor: realDoctorId,
      ward: patient.ward || "",
      bedNumber: patient.bedNumber || "",
      status: patient.status,
    });
    setEditMrn(patient.mrn);
    setEditOpen(true);
    setError("");
  };

  const handleUpdate = async () => {
    if (!validate(editData)) return;
    try {
      const payload = generatePayload(editData);

      const res = await apiFetch(`/api/patients/${editMrn}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        await fetchPatients();
        setEditOpen(false);
        setEditData(emptyForm);
        setError("");
      } else {
        setError(result.message || "Failed to update patient.");
        console.error("Backend rejected update:", result);
      }
    } catch (err) {
      console.error("Error updating patient:", err);
      setError("Server error updating patient.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/patients/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        await fetchPatients();
        setDeleteConfirm(null); // Closes modal on success
      } else {
        // PREVENTS SILENT FAILURE: Reads the backend error and alerts you
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.message || "Backend rejected the request"}`);
        setDeleteConfirm(null); // Forces modal to close so you aren't stuck
      }
    } catch (err) {
      console.error("Failed to delete patient:", err);
      alert("Network error: Could not reach the server.");
      setDeleteConfirm(null);
    }
  };

  const columns: Column[] = [
    { key: "mrn", header: "MRN" },
    {
      key: "name",
      header: "Patient",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <div>
            <p className="font-semibold text-gray-900">{`${p.firstName} ${p.lastName}`}</p>
            <p className="text-xs text-gray-400">{p.diagnosis}</p>
          </div>
        );
      },
    },
    {
      key: "patientType",
      header: "Type",
      render: (row: unknown) => (
        <Badge
          text={(row as Patient).patientType}
          variant={
            (row as Patient).patientType === "inpatient" ? "dark" : "outline"
          }
        />
      ),
    },
    {
      key: "assignedDoctor",
      header: "Doctor",
      render: (row: unknown) => {
        const p = row as Patient;

        if (!p.assignedDoctor) {
          return (
            <span className="text-sm text-gray-400 italic">Unassigned</span>
          );
        }

        const refId = getRefId(p.assignedDoctor);
        const refName = getRefName(p.assignedDoctor);

        const matchingDoc = doctors.find(
          (d) => d._id === refId || d._id === refName || d.name === refName,
        );

        const displayValue = matchingDoc
          ? matchingDoc.name
          : refName !== "—"
            ? refName
            : refId;

        return (
          <span className="text-sm text-gray-700">
            {displayValue || (
              <span className="text-gray-400 italic">Unassigned</span>
            )}
          </span>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <span className="text-sm text-gray-700">
            {p.patientType === "inpatient"
              ? `${p.ward} ${p.bedNumber}`
              : "Outpatient"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: unknown) => (
        <Badge
          text={(row as Patient).status}
          variant={statusVariant[(row as Patient).status] || "gray"}
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: unknown) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row as Patient)}
            className="p-1.5 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-lg transition-colors"
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm((row as Patient).mrn)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading patients...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, and manage all patient records
          </p>
        </div>
        <button
          onClick={() => {
            setAddData(emptyForm);
            setError("");
            setAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add Patient
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search patients by name or MRN..."
      />
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        keyField="mrn"
      />

      {/* Add Modal */}
      <Modal
        title="Add New Patient"
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          setError("");
        }}
        footer={
          <>
            <button
              onClick={() => setAddOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Add Patient
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <AdminPatientForm
            data={addData}
            onChange={setAddData}
            doctors={doctors}
          />
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Patient"
        isOpen={editOpen}
        onClose={() => {
          setEditOpen(false);
          setError("");
        }}
        footer={
          <>
            <button
              onClick={() => setEditOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Update Patient
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <AdminPatientForm
            data={editData}
            onChange={setEditData}
            doctors={doctors}
            isEdit={true}
          />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        title="Delete Patient"
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
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this patient? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default AdminPatients;
