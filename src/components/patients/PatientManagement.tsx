import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineEye,
} from "react-icons/hi2";

import { Badge } from "../ui";
import { SearchBar } from "../ui";
import { DataTable } from "../ui";
import AddPatientModal from "./AddPatientModal";
import UpdatePatientModal from "./UpdatePatientModal";
import { type PatientFormData } from "./PatientForm";
import type { Column } from "../ui/DataTable";

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
}

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
    address: "123 Main St, City",
    ward: "Ward A",
    bedNumber: "A-101",
  },
  {
    mrn: "MRN001235",
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
    address: "456 Oak Ave, Town",
    ward: "Ward A",
    bedNumber: "A-101",
  },
  {
    mrn: "MRN001236",
    name: "John Doe",
    diagnosis: "Pneumonia",
    dob: "3/15/1985",
    contact: "555-1001",
    email: "john.doe@gmail.com",
    location: "Ward A A-101",
    status: "outpatient",
    firstName: "John",
    lastName: "Doe",
    gender: "male",
    address: "789 Pine Rd, Village",
    ward: "Ward A",
    bedNumber: "A-101",
  },
  {
    mrn: "MRN001237",
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
    address: "321 Elm St, Metro",
    ward: "Ward A",
    bedNumber: "A-101",
  },
];

const statusVariant: Record<
  string,
  "green" | "red" | "blue" | "orange" | "gray" | "dark" | "outline"
> = {
  admitted: "dark",
  outpatient: "outline",
  discharged: "gray",
};

const PatientManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<PatientFormData | null>(null);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (data: PatientFormData) => {
    const newPatient: Patient = {
      mrn: data.mrn || `MRN00${1238 + patients.length}`,
      name: `${data.firstName} ${data.lastName}`,
      diagnosis: data.diagnosis,
      dob: data.dob,
      contact: data.phone,
      email: data.email,
      location: `${data.ward} ${data.bedNumber}`,
      status: data.status,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      address: data.address,
      ward: data.ward,
      bedNumber: data.bedNumber,
    };
    setPatients([...patients, newPatient]);
  };

  const handleEdit = (patient: Patient) => {
    setEditPatient({
      mrn: patient.mrn,
      status: patient.status,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dob: patient.dob,
      gender: patient.gender,
      address: patient.address,
      phone: patient.contact,
      email: patient.email,
      ward: patient.ward,
      bedNumber: patient.bedNumber,
      diagnosis: patient.diagnosis,
    });
    setEditOpen(true);
  };

  const handleUpdate = (data: PatientFormData) => {
    setPatients(
      patients.map((p) =>
        p.mrn === data.mrn
          ? {
              ...p,
              name: `${data.firstName} ${data.lastName}`,
              diagnosis: data.diagnosis,
              dob: data.dob,
              contact: data.phone,
              email: data.email,
              location: `${data.ward} ${data.bedNumber}`,
              status: data.status,
              firstName: data.firstName,
              lastName: data.lastName,
              gender: data.gender,
              address: data.address,
              ward: data.ward,
              bedNumber: data.bedNumber,
            }
          : p,
      ),
    );
  };

  const handleDelete = (mrn: string) => {
    setPatients(patients.filter((p) => p.mrn !== mrn));
  };

  const columns: Column[] = [
    { key: "mrn", header: "MRN" },
    {
      key: "name",
      header: "Patient",
      render: (row) => {
        const patient = row as Patient;
        return (
          <div>
            <p className="font-semibold text-gray-900">{patient.name}</p>
            <p className="text-xs text-gray-400">{patient.diagnosis}</p>
          </div>
        );
      },
    },
    { key: "dob", header: "DOB" },
    {
      key: "contact",
      header: "Contact",
      render: (row) => {
        const patient = row as Patient;
        return (
          <div>
            <p>{patient.contact}</p>
            <p className="text-xs text-gray-400">{patient.email}</p>
          </div>
        );
      },
    },
    { key: "location", header: "Location" },
    {
      key: "status",
      header: "Status",
      render: (row) => {
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
      render: (row) => {
        const patient = row as Patient;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/doctor/patients/${patient.mrn}`)}
              className="p-1.5 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-lg transition-colors"
            >
              <HiOutlineEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(patient)}
              className="p-1.5 text-gray-500 hover:text-[#1a5276] hover:bg-[#e8f0f6] rounded-lg transition-colors"
            >
              <HiOutlinePencilSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(patient.mrn)}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Management
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500">
              View and manage patient records
            </span>
            <span className="text-sm text-gray-400">Apr 1, 2025</span>
            <span className="text-sm text-gray-400">9:41 AM</span>
          </div>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search Patients by Name or MRN..."
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} keyField="mrn" />

      {/* Modals */}
      <AddPatientModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
      <UpdatePatientModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdate}
        patient={editPatient}
      />
    </>
  );
};

export default PatientManagement;
