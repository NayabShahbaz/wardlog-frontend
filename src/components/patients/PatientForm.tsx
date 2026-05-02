import React from "react";
import { InputField, SelectField } from "../ui";

export interface PatientFormData {
  mrn: string;
  status: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  ward: string;
  bedNumber: string;
  diagnosis: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const getEmptyPatientForm = (): PatientFormData => ({
  mrn: "",
  status: "",
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  address: "",
  phone: "",
  email: "",
  ward: "",
  bedNumber: "",
  diagnosis: "",
});

interface PatientFormProps {
  data: PatientFormData;
  onChange: (data: PatientFormData) => void;
  isEdit?: boolean;
}

const statusOptions = [
  { label: "Admitted", value: "admitted" },
  { label: "Outpatient", value: "outpatient" },
  { label: "Discharged", value: "discharged" },
];

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

const PatientForm: React.FC<PatientFormProps> = ({
  data,
  onChange,
  isEdit = false,
}) => {
  const update = (field: keyof PatientFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 px-1 sm:px-0">
      {/* Row 1: MRN & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Medical Record Number"
          placeholder="e.g. MRN001234"
          value={data.mrn}
          onChange={(v) => update("mrn", v)}
          disabled={isEdit}
          required
        />
        <SelectField
          label="Status"
          value={data.status}
          onChange={(v) => update("status", v)}
          options={statusOptions}
          placeholder="Select status"
          required
        />
      </div>

      {/* Row 2: Name */}
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

      {/* Row 3: DOB & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Date of Birth"
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

      {/* Row 4: Address - Full width always */}
      <div className="w-full">
        <InputField
          label="Address"
          placeholder="e.g. 123 Main Street, City"
          value={data.address}
          onChange={(v) => update("address", v)}
        />
      </div>

      {/* Row 5: Contact */}
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
          placeholder="e.g. john.doe@gmail.com"
          value={data.email}
          onChange={(v) => update("email", v)}
          type="email"
        />
      </div>

      {/* Row 6: Clinical Details 
          Mobile: 1 col | Tablet: 2 cols | Desktop: 3 cols 
      */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <InputField
          label="Diagnosis"
          placeholder="e.g. Pneumonia"
          value={data.diagnosis}
          onChange={(v) => update("diagnosis", v)}
          required
        />
      </div>
    </div>
  );
};

export default PatientForm;
