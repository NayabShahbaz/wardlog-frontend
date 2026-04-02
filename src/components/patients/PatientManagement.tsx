import { useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

import {
  Badge,
  SearchBar,
  DataTable,
  Modal,
  InputField,
  SelectField,
} from "../ui";
import Tabs from "../ui/Tabs";
import type { Column } from "../ui/DataTable";
import { type UserContextType } from "../layout/DoctorLayout";

// ── Types ───────────────────────────────────────────────────────────
interface Patient {
  [key: string]: string | undefined;
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
  assignedDoctor: string;
  assignedNurse: string;
  admissionDate: string;
  patientType: "inpatient" | "outpatient";
  appointmentDate?: string;
}

const currentWard = "Ward A";

const teamNurses = [
  { label: "Emily Chen (Nurse - Ward A)", value: "Emily Chen" },
  { label: "Jessica Wilson (Nurse - Ward B)", value: "Jessica Wilson" },
];

const today = new Date();
const threeDaysAhead = new Date(today);
threeDaysAhead.setDate(today.getDate() + 3);

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
    assignedDoctor: "Dr. Sarah Johnson",
    assignedNurse: "Emily Chen",
    admissionDate: "3/10/2026",
    patientType: "inpatient",
  },
  {
    mrn: "MRN001235",
    name: "Mary Smith",
    diagnosis: "Diabetes Management",
    dob: "6/20/1990",
    contact: "555-1002",
    email: "mary.smith@gmail.com",
    location: "Ward A A-102",
    status: "admitted",
    firstName: "Mary",
    lastName: "Smith",
    gender: "female",
    address: "456 Oak Ave",
    ward: "Ward A",
    bedNumber: "A-102",
    assignedDoctor: "Dr. Sarah Johnson",
    assignedNurse: "Emily Chen",
    admissionDate: "3/11/2026",
    patientType: "inpatient",
  },
  {
    mrn: "MRN001236",
    name: "Robert Brown",
    diagnosis: "Follow-up Checkup",
    dob: "7/22/1990",
    contact: "555-1003",
    email: "robert.brown@gmail.com",
    location: "Outpatient",
    status: "outpatient",
    firstName: "Robert",
    lastName: "Brown",
    gender: "male",
    address: "789 Pine Rd",
    ward: "",
    bedNumber: "",
    assignedDoctor: "Dr. Sarah Johnson",
    assignedNurse: "",
    admissionDate: "",
    patientType: "outpatient",
    appointmentDate: new Date(today.getTime() + 86400000).toLocaleDateString(),
  },
  {
    mrn: "MRN001237",
    name: "Jane Wilson",
    diagnosis: "Pneumonia",
    dob: "1/10/1978",
    contact: "555-1004",
    email: "jane.wilson@gmail.com",
    location: "Ward A A-103",
    status: "admitted",
    firstName: "Jane",
    lastName: "Wilson",
    gender: "female",
    address: "321 Elm St",
    ward: "Ward A",
    bedNumber: "A-103",
    assignedDoctor: "Dr. Michael John",
    assignedNurse: "Jessica Wilson",
    admissionDate: "3/09/2026",
    patientType: "inpatient",
  },
  {
    mrn: "MRN001238",
    name: "Alice Cooper",
    diagnosis: "Blood Test Review",
    dob: "4/05/1995",
    contact: "555-1005",
    email: "alice.cooper@gmail.com",
    location: "Outpatient",
    status: "outpatient",
    firstName: "Alice",
    lastName: "Cooper",
    gender: "female",
    address: "555 Maple Dr",
    ward: "",
    bedNumber: "",
    assignedDoctor: "Dr. Michael John",
    assignedNurse: "",
    admissionDate: "",
    patientType: "outpatient",
    appointmentDate: new Date(
      today.getTime() + 2 * 86400000,
    ).toLocaleDateString(),
  },
];

const statusVariant: Record<string, "dark" | "outline" | "gray" | "green"> = {
  admitted: "dark",
  outpatient: "outline",
  discharged: "gray",
  completed: "green",
};

const wardOptions = [
  { label: "Ward A", value: "Ward A" },
  { label: "Ward B", value: "Ward B" },
  { label: "Ward C", value: "Ward C" },
  { label: "ICU", value: "ICU" },
];

const PatientManagement = () => {
  const { userName, userRole } = useOutletContext<UserContextType>();
  const navigate = useNavigate();
  const location = useLocation();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Patient | null>(null);
  const [dischargeConfirm, setDischargeConfirm] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  const activeFilter = (list: Patient[]) =>
    list.filter((p) => {
      if (p.status === "discharged" || p.status === "completed") return false;
      if (p.patientType === "outpatient" && p.appointmentDate) {
        const apptDate = new Date(p.appointmentDate);
        return apptDate <= threeDaysAhead;
      }
      return true;
    });

  const myPatients = activeFilter(
    patients.filter((p) => {
      if (userRole === "Nurse") return p.assignedNurse === userName;
      return p.assignedDoctor === userName;
    }),
  );

  const wardPatients = activeFilter(
    patients.filter(
      (p) =>
        p.patientType === "inpatient" &&
        (p.ward === currentWard || p.assignedDoctor === userName),
    ),
  );

  const getFiltered = () => {
    const base = activeTab === 0 ? myPatients : wardPatients;
    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q),
    );
  };

  const filtered = getFiltered();

  const tabs = [
    { label: "My Patients", count: myPatients.length },
    { label: "Ward Patients", count: wardPatients.length },
  ];

  const handleEdit = (patient: Patient) => {
    setEditData({ ...patient });
    setEditOpen(true);
    setError("");
  };

  const handleUpdate = () => {
    if (!editData) return;
    if (!editData.firstName || !editData.lastName || !editData.diagnosis) {
      setError("Please fill all required fields.");
      return;
    }
    setPatients(
      patients.map((p) =>
        p.mrn === editData.mrn
          ? {
              ...editData,
              name: `${editData.firstName} ${editData.lastName}`,
              location:
                editData.patientType === "inpatient"
                  ? `${editData.ward} ${editData.bedNumber}`
                  : "Outpatient",
            }
          : p,
      ),
    );
    setEditOpen(false);
    setEditData(null);
    setError("");
  };

  const updateField = (field: keyof Patient, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleDischarge = (mrn: string) => {
    setPatients(
      patients.map((p) => (p.mrn === mrn ? { ...p, status: "discharged" } : p)),
    );
    window.dispatchEvent(
      new CustomEvent("patientDischarged", { detail: { mrn } }),
    );
    setDischargeConfirm(null);
  };

  const handleComplete = (mrn: string) => {
    setPatients(
      patients.map((p) => (p.mrn === mrn ? { ...p, status: "completed" } : p)),
    );
    setCompleteConfirm(null);
  };

  const columns: Column[] = [
    { key: "mrn", header: "MRN" },
    {
      key: "name",
      header: "Patient",
      render: (row: unknown) => {
        const patient = row as Patient;
        return (
          <div>
            <p className="font-semibold text-gray-900">{patient.name}</p>
            <p className="text-xs text-gray-400">{patient.diagnosis}</p>
          </div>
        );
      },
    },
    {
      key: "patientType",
      header: "Type",
      render: (row: unknown) => {
        const patient = row as Patient;
        return (
          <Badge
            text={patient.patientType}
            variant={patient.patientType === "inpatient" ? "dark" : "outline"}
          />
        );
      },
    },
    {
      key: "assignedNurse",
      header: "Nurse",
      render: (row: unknown) => {
        const patient = row as Patient;
        return (
          <span className="text-sm text-gray-600">
            {patient.assignedNurse || "—"}
          </span>
        );
      },
    },
    {
      key: "location",
      header: "Location",
      render: (row: unknown) => {
        const patient = row as Patient;
        return (
          <span className="text-sm text-gray-700">
            {patient.patientType === "outpatient" && patient.appointmentDate
              ? `Appt: ${patient.appointmentDate}`
              : patient.location}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: unknown) => {
        const patient = row as Patient;
        return (
          <Badge
            text={patient.status}
            variant={statusVariant[patient.status] || "gray"}
          />
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: unknown) => {
        const patient = row as Patient;
        const basePath = location.pathname.startsWith("/nurse")
          ? "/nurse"
          : "/doctor";
        const canEdit =
          patient.assignedDoctor === userName || userRole === "Nurse";

        return (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate(`${basePath}/patients/${patient.mrn}`)}
              className="p-1 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded transition-colors"
              title="View"
            >
              <HiOutlineEye className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={() => handleEdit(patient)}
                className="p-1 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded transition-colors"
                title="Edit"
              >
                <HiOutlinePencilSquare className="w-3.5 h-3.5" />
              </button>
            )}
            {userRole === "Doctor" && patient.assignedDoctor === userName && (
              <>
                {patient.patientType === "inpatient" &&
                  patient.status === "admitted" && (
                    <button
                      onClick={() => setDischargeConfirm(patient.mrn)}
                      className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Discharge"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5" />
                    </button>
                  )}
                {patient.patientType === "outpatient" &&
                  patient.status === "outpatient" && (
                    <button
                      onClick={() => setCompleteConfirm(patient.mrn)}
                      className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Complete"
                    >
                      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Patient Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your patient records
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search patients by name or MRN..."
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} keyField="mrn" />

      {/* Update Modal */}
      {editData && (
        <Modal
          title="Update Patient"
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
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            <InputField
              label="Medical Record Number"
              value={editData.mrn}
              onChange={() => {}}
              disabled
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="First Name"
                value={editData.firstName}
                onChange={(v) => updateField("firstName", v)}
                required
              />
              <InputField
                label="Last Name"
                value={editData.lastName}
                onChange={(v) => updateField("lastName", v)}
                required
              />
            </div>
            <InputField
              label="Diagnosis"
              value={editData.diagnosis}
              onChange={(v) => updateField("diagnosis", v)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Phone"
                value={editData.contact}
                onChange={(v) => updateField("contact", v)}
                type="tel"
              />
              <InputField
                label="Email"
                value={editData.email}
                onChange={(v) => updateField("email", v)}
                type="email"
              />
            </div>
            <SelectField
              label="Assigned Nurse"
              value={editData.assignedNurse}
              onChange={(v) => updateField("assignedNurse", v)}
              options={teamNurses}
              placeholder="Select nurse from your team"
            />
            {editData.patientType === "inpatient" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Ward"
                  value={editData.ward}
                  onChange={(v) => updateField("ward", v)}
                  options={wardOptions}
                />
                <InputField
                  label="Bed Number"
                  value={editData.bedNumber}
                  onChange={(v) => updateField("bedNumber", v)}
                />
              </div>
            )}
            {editData.patientType === "outpatient" && (
              <InputField
                label="Appointment Date"
                value={editData.appointmentDate || ""}
                onChange={(v) => updateField("appointmentDate", v)}
                type="date"
              />
            )}
          </div>
        </Modal>
      )}

      {/* Discharge Confirmation */}
      <Modal
        title="Discharge Patient"
        isOpen={!!dischargeConfirm}
        onClose={() => setDischargeConfirm(null)}
        footer={
          <>
            <button
              onClick={() => setDischargeConfirm(null)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                dischargeConfirm && handleDischarge(dischargeConfirm)
              }
              className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
            >
              Discharge
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to discharge this patient? They will be removed
          from your active list.
        </p>
      </Modal>

      {/* Complete Appointment */}
      <Modal
        title="Complete Appointment"
        isOpen={!!completeConfirm}
        onClose={() => setCompleteConfirm(null)}
        footer={
          <>
            <button
              onClick={() => setCompleteConfirm(null)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => completeConfirm && handleComplete(completeConfirm)}
              className="px-5 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Mark Complete
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Mark this appointment as completed? The patient will be removed from
          your active list.
        </p>
      </Modal>
    </>
  );
};

export default PatientManagement;
