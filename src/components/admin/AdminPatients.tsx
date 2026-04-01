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

// ── Types ───────────────────────────────────────────────────────────
interface Patient {
  mrn: string;
  name: string;
  diagnosis: string;
  dob: string;
  contact: string;
  email: string;
  location: string;
  status: string;
  firstName: string;
  lastName: string;
  gender: string;
  address: string;
  ward: string;
  bedNumber: string;
  patientType: "inpatient" | "outpatient";
  assignedDoctor: string;
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
  // Inpatient-only
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

// ── Mock data ───────────────────────────────────────────────────────
const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Internal Medicine",
    department: "General Medicine",
  },
  {
    name: "Dr. Michael John",
    specialty: "Internal Medicine",
    department: "General Medicine",
  },
  {
    name: "Dr. Emily Roberts",
    specialty: "Cardiology",
    department: "Cardiology",
  },
  {
    name: "Dr. James Lee",
    specialty: "Orthopedics",
    department: "Orthopedics",
  },
  {
    name: "Dr. Anna Williams",
    specialty: "Pediatrics",
    department: "Pediatrics",
  },
];

const initialPatients: Patient[] = [
  {
    mrn: "MRN001234",
    name: "John Doe",
    diagnosis: "Pneumonia",
    dob: "3/15/1985",
    contact: "555-1001",
    email: "john.doe@gmail.com",
    location: "Ward A A-101",
    status: "admitted",
    firstName: "John",
    lastName: "Doe",
    gender: "male",
    address: "123 Main St",
    ward: "Ward A",
    bedNumber: "A-101",
    patientType: "inpatient",
    assignedDoctor: "Dr. Sarah Johnson",
  },
  {
    mrn: "MRN001235",
    name: "Mary Smith",
    diagnosis: "Pneumonia",
    dob: "3/15/1985",
    contact: "555-1001",
    email: "mary.smith@gmail.com",
    location: "Ward A A-102",
    status: "admitted",
    firstName: "Mary",
    lastName: "Smith",
    gender: "female",
    address: "456 Oak Ave",
    ward: "Ward A",
    bedNumber: "A-102",
    patientType: "inpatient",
    assignedDoctor: "Dr. Sarah Johnson",
  },
  {
    mrn: "MRN001236",
    name: "Robert Brown",
    diagnosis: "Fracture",
    dob: "7/22/1990",
    contact: "555-1002",
    email: "robert.brown@gmail.com",
    location: "Outpatient",
    status: "outpatient",
    firstName: "Robert",
    lastName: "Brown",
    gender: "male",
    address: "789 Pine Rd",
    ward: "",
    bedNumber: "",
    patientType: "outpatient",
    assignedDoctor: "Dr. James Lee",
  },
  {
    mrn: "MRN001237",
    name: "Jane Wilson",
    diagnosis: "Pneumonia",
    dob: "1/10/1978",
    contact: "555-1003",
    email: "jane.wilson@gmail.com",
    location: "Ward A A-103",
    status: "admitted",
    firstName: "Jane",
    lastName: "Wilson",
    gender: "female",
    address: "321 Elm St",
    ward: "Ward A",
    bedNumber: "A-103",
    patientType: "inpatient",
    assignedDoctor: "Dr. Michael John",
  },
];

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
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
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

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
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
        {value || <span className="text-gray-400">Select a doctor</span>}
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
                  key={doc.name}
                  type="button"
                  onClick={() => {
                    onChange(doc.name);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2.5 hover:bg-[#e8f0f6] transition-colors ${
                    value === doc.name
                      ? "bg-[#e8f0f6] text-[#1a5276]"
                      : "text-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-400">
                    {doc.specialty} • {doc.department}
                  </p>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                No doctors found
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
  isEdit,
}: {
  data: PatientFormState;
  onChange: (d: PatientFormState) => void;
  isEdit?: boolean;
}) => {
  const update = (field: keyof PatientFormState, value: string) => {
    const updated = { ...data, [field]: value };
    // Reset conditional fields when type changes
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
      {/* Patient Type - first choice */}
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
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Medical Record Number"
              placeholder="e.g. MRN001234"
              value={data.mrn}
              onChange={(v) => update("mrn", v)}
              disabled={isEdit}
              required
            />
            <InputField
              label="Diagnosis"
              placeholder="e.g. Pneumonia"
              value={data.diagnosis}
              onChange={(v) => update("diagnosis", v)}
              required
            />
          </div>

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
              label="Date of Birth"
              placeholder="MM/DD/YYYY"
              value={data.dob}
              onChange={(v) => update("dob", v)}
              type="date"
              required
            />
            <SelectField
              label="Gender"
              value={data.gender}
              onChange={(v) => update("gender", v)}
              options={genderOptions}
              placeholder="Select gender"
              required
            />
          </div>

          <InputField
            label="Address"
            placeholder="e.g. 123 Main Street, City"
            value={data.address}
            onChange={(v) => update("address", v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Phone"
              placeholder="e.g. 555-1001"
              value={data.phone}
              onChange={(v) => update("phone", v)}
              type="tel"
              required
            />
            <InputField
              label="Email"
              placeholder="e.g. john@gmail.com"
              value={data.email}
              onChange={(v) => update("email", v)}
              type="email"
            />
          </div>

          {/* Assigned Doctor - searchable dropdown */}
          <DoctorSearchSelect
            value={data.assignedDoctor}
            onChange={(v) => update("assignedDoctor", v)}
            required
          />

          {/* Inpatient-only fields */}
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
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addData, setAddData] = useState<PatientFormState>(emptyForm);
  const [editData, setEditData] = useState<PatientFormState>(emptyForm);
  const [editMrn, setEditMrn] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
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

  const formToPatient = (
    data: PatientFormState,
    existingMrn?: string,
  ): Patient => ({
    mrn: existingMrn || data.mrn || `MRN00${1238 + patients.length}`,
    name: `${data.firstName} ${data.lastName}`,
    diagnosis: data.diagnosis,
    dob: data.dob,
    contact: data.phone,
    email: data.email,
    location:
      data.patientType === "inpatient"
        ? `${data.ward} ${data.bedNumber}`
        : "Outpatient",
    status: data.patientType === "outpatient" ? "outpatient" : "admitted",
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    address: data.address,
    ward: data.ward,
    bedNumber: data.bedNumber,
    patientType: data.patientType as "inpatient" | "outpatient",
    assignedDoctor: data.assignedDoctor,
  });

  const handleAdd = () => {
    if (!validate(addData)) return;
    setPatients([...patients, formToPatient(addData)]);
    setAddData(emptyForm);
    setAddOpen(false);
    setError("");
  };

  const handleEdit = (patient: Patient) => {
    setEditData({
      mrn: patient.mrn,
      patientType: patient.patientType,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      gender: patient.gender,
      address: patient.address,
      phone: patient.contact,
      email: patient.email,
      diagnosis: patient.diagnosis,
      assignedDoctor: patient.assignedDoctor,
      ward: patient.ward,
      bedNumber: patient.bedNumber,
      status: patient.status,
    });
    setEditMrn(patient.mrn);
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!validate(editData)) return;
    setPatients(
      patients.map((p) =>
        p.mrn === editMrn ? formToPatient(editData, editMrn) : p,
      ),
    );
    setEditOpen(false);
    setEditData(emptyForm);
    setError("");
  };

  const handleDelete = (mrn: string) => {
    setPatients(patients.filter((p) => p.mrn !== mrn));
    setDeleteConfirm(null);
  };

  const columns: Column[] = [
    { key: "mrn", header: "MRN" },
    {
      key: "name",
      header: "Patient",
      render: (row: unknown) => (
        <div>
          <p className="font-semibold text-gray-900">{(row as Patient).name}</p>
          <p className="text-xs text-gray-400">{(row as Patient).diagnosis}</p>
        </div>
      ),
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
      render: (row: unknown) => (
        <span className="text-sm text-gray-700">
          {(row as Patient).assignedDoctor}
        </span>
      ),
    },
    { key: "location", header: "Location" },
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
      <DataTable columns={columns} data={filtered} keyField="mrn" />

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
          <AdminPatientForm data={addData} onChange={setAddData} />
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
          <AdminPatientForm data={editData} onChange={setEditData} isEdit />
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
