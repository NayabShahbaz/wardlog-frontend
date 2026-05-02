import { useState, useEffect } from "react";
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
import { apiFetch } from "../../utils/api";

// ── Types matching the backend Patient schema + populated refs ──
type PopulatedRef = string | { _id: string; name?: string } | null | undefined;

interface Patient {
  [key: string]: unknown;
  _id?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: "male" | "female" | "other";
  address?: string;
  phone: string;
  email?: string;
  diagnosis?: string;
  patientType: "inpatient" | "outpatient";
  status: "admitted" | "outpatient" | "discharged" | "completed";
  ward?: string;
  bedNumber?: string;
  assignedDoctor: PopulatedRef;
  assignedNurse: PopulatedRef;
  admissionDate?: string;
  appointmentDate?: string;
}

// Static UI choices (not patient data) ─────────────────────────────
const today = new Date();
const threeDaysAhead = new Date(today);
threeDaysAhead.setDate(today.getDate() + 3);

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

// ── Helpers for Mongoose populated refs ────────────────────────────
const getRefId = (ref: PopulatedRef): string | undefined => {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref._id;
};

const getRefName = (ref: PopulatedRef): string | undefined => {
  if (!ref) return undefined;
  if (typeof ref === "string") return ref;
  return ref.name;
};

// ── Display-only derived fields ────────────────────────────────────
const getFullName = (p: Patient) => `${p.firstName} ${p.lastName}`;
const getLocation = (p: Patient) =>
  p.patientType === "inpatient"
    ? `${p.ward ?? ""} ${p.bedNumber ?? ""}`.trim()
    : "Outpatient";

const PatientManagement = () => {
  const { userId, userName, userRole } = useOutletContext<UserContextType>();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // ── State ────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurses, setNurses] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState<Patient | null>(null);
  const [dischargeConfirm, setDischargeConfirm] = useState<string | null>(null);
  const [completeConfirm, setCompleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");

  // ── Data Fetching ────────────────────────────────────────────────
  const fetchPatients = async () => {
    try {
      const res = await apiFetch("/api/patients");
      const result = await res.json();
      if (result.success) {
        // Hide discharged/completed patients from the UI (still kept in DB)
        const visible = result.data.filter(
          (p: Patient) => p.status !== "discharged" && p.status !== "completed",
        );
        setPatients(visible);
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNurses = async () => {
    try {
      const res = await apiFetch("/api/users?role=Nurse");
      const result = await res.json();
      if (result.success) setNurses(result.data);
    } catch (err) {
      console.error("Failed to fetch nurses", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchNurses();
  }, [token]);

  // ── Filters ──────────────────────────────────────────────────────
  const activeFilter = (list: Patient[]) =>
    list.filter((p) => {
      if (p.patientType === "outpatient" && p.appointmentDate) {
        const apptDate = new Date(p.appointmentDate);
        return apptDate <= threeDaysAhead;
      }
      return true;
    });

  // Bulletproof check that tries both ID and Name
  const isAssignedToMe = (p: Patient) => {
    if (userRole === "Nurse") {
      return (
        getRefId(p.assignedNurse) === userId ||
        getRefName(p.assignedNurse) === userName
      );
    }
    return (
      getRefId(p.assignedDoctor) === userId ||
      getRefName(p.assignedDoctor) === userName
    );
  };

  const myPatients = activeFilter(patients.filter(isAssignedToMe));

  const userWards = Array.from(
    new Set(
      patients
        .filter(isAssignedToMe)
        .map((p) => p.ward)
        .filter((w): w is string => Boolean(w)),
    ),
  );

  const wardPatients = activeFilter(
    patients.filter((p) => {
      // 1. Must be an inpatient to show up in the Ward Patients tab
      if (p.patientType !== "inpatient") return false;

      // 2. Nurses (and Admins) can see ALL ward patients in the hospital
      if (userRole === "Nurse" || userRole === "Admin") return true;

      // 3. Doctors only see patients in their specific wards, or their own assigned patients
      return userWards.includes(p.ward ?? "") || isAssignedToMe(p);
    }),
  );

  const getFiltered = () => {
    const base = activeTab === 0 ? myPatients : wardPatients;
    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(
      (p) =>
        getFullName(p).toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q),
    );
  };

  const filtered = getFiltered();

  const tabs = [
    { label: "My Patients", count: myPatients.length },
    { label: "Ward Patients", count: wardPatients.length },
  ];

  // ── Handlers ─────────────────────────────────────────────────────
  const handleEdit = (patient: Patient) => {
    setEditData({ ...patient });
    setEditOpen(true);
    setError("");
  };

  const handleUpdate = async () => {
    if (!editData) return;
    if (!editData.firstName || !editData.lastName || !editData.diagnosis) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await apiFetch(`/api/patients/${editData.mrn}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editData,
          assignedDoctor: getRefId(editData.assignedDoctor),
          assignedNurse: getRefId(editData.assignedNurse),
        }),
      });

      if (res.ok) {
        await fetchPatients();
        setEditOpen(false);
        setEditData(null);
        setError("");
      } else {
        setError("Failed to update patient record.");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Server error during update.");
    }
  };

  const updateField = (field: keyof Patient, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleStatusUpdate = async (mrn: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/patients/${mrn}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (newStatus === "discharged") {
          window.dispatchEvent(
            new CustomEvent("patientDischarged", { detail: { mrn } }),
          );
        }
        await fetchPatients();
        setDischargeConfirm(null);
        setCompleteConfirm(null);
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────
  const columns: Column[] = [
    { key: "mrn", header: "MRN" },
    {
      key: "name",
      header: "Patient",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <div>
            <p className="font-semibold text-gray-900">{getFullName(p)}</p>
            <p className="text-xs text-gray-400">{p.diagnosis ?? "—"}</p>
          </div>
        );
      },
    },
    {
      key: "patientType",
      header: "Type",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <Badge
            text={p.patientType}
            variant={p.patientType === "inpatient" ? "dark" : "outline"}
          />
        );
      },
    },
    {
      key: "assignedNurse",
      header: "Nurse",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <span className="text-sm text-gray-600">
            {getRefName(p.assignedNurse) || "—"}
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
            {p.patientType === "outpatient" && p.appointmentDate
              ? `Appt: ${new Date(p.appointmentDate).toLocaleDateString()}`
              : getLocation(p)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: unknown) => {
        const p = row as Patient;
        return (
          <Badge text={p.status} variant={statusVariant[p.status] || "gray"} />
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: unknown) => {
        const p = row as Patient;
        const basePath = location.pathname.startsWith("/nurse")
          ? "/nurse"
          : "/doctor";
        const assignedDoctorId = getRefId(p.assignedDoctor);
        const canEdit = assignedDoctorId === userId || userRole === "Nurse";
        const isAssignedDoctor =
          userRole === "Doctor" && assignedDoctorId === userId;

        return (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => navigate(`${basePath}/patients/${p.mrn}`)}
              className="p-1 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded transition-colors"
              title="View"
            >
              <HiOutlineEye className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={() => handleEdit(p)}
                className="p-1 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded transition-colors"
                title="Edit"
              >
                <HiOutlinePencilSquare className="w-3.5 h-3.5" />
              </button>
            )}
            {isAssignedDoctor && (
              <>
                {p.patientType === "inpatient" && p.status === "admitted" && (
                  <button
                    onClick={() => setDischargeConfirm(p.mrn)}
                    className="p-1 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    title="Discharge"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-3.5 h-3.5" />
                  </button>
                )}
                {p.patientType === "outpatient" &&
                  p.status === "outpatient" && (
                    <button
                      onClick={() => setCompleteConfirm(p.mrn)}
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

  const nurseOptions = nurses.map((n) => ({
    label: n.name,
    value: n._id,
  }));

  if (loading)
    return <div className="p-8 text-center">Loading patients...</div>;

  return (
    <>
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

      <div className="mb-4">
        <Tabs tabs={tabs} activeIndex={activeTab} onChange={setActiveTab} />
      </div>

      <div className="mb-4 sm:mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search patients by name or MRN..."
        />
      </div>

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
              value={editData.diagnosis ?? ""}
              onChange={(v) => updateField("diagnosis", v)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Phone"
                value={editData.phone}
                onChange={(v) => updateField("phone", v)}
                type="tel"
              />
              <InputField
                label="Email"
                value={editData.email ?? ""}
                onChange={(v) => updateField("email", v)}
                type="email"
              />
            </div>
            <SelectField
              label="Assigned Nurse"
              value={getRefId(editData.assignedNurse) ?? ""}
              onChange={(v) => updateField("assignedNurse", v)}
              options={nurseOptions}
              placeholder="Select nurse"
            />
            {editData.patientType === "inpatient" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Ward"
                  value={editData.ward ?? ""}
                  onChange={(v) => updateField("ward", v)}
                  options={wardOptions}
                />
                <InputField
                  label="Bed Number"
                  value={editData.bedNumber ?? ""}
                  onChange={(v) => updateField("bedNumber", v)}
                />
              </div>
            )}
            {editData.patientType === "outpatient" && (
              <InputField
                label="Appointment Date"
                value={
                  editData.appointmentDate
                    ? new Date(editData.appointmentDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
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
                dischargeConfirm &&
                handleStatusUpdate(dischargeConfirm, "discharged")
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
              onClick={() =>
                completeConfirm &&
                handleStatusUpdate(completeConfirm, "completed")
              }
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
