import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import InputField from "../ui/InputField";

interface CreateERoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Make sure this matches exactly what ClinicalDocumentation expects!
  onSave: (data: {
    patientId: string;
    date: string;
    vitals: {
      temperature: string;
      bp: string;
      heartRate: string;
      respRate: string;
      o2Sat: string;
    };
    assessment: string;
    plan: string;
  }) => void;
  patients: { label: string; value: string }[];
}

const CreateERoundModal: React.FC<CreateERoundModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
}) => {
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
  );
  const [temperature, setTemperature] = useState("");
  const [bp, setBp] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respRate, setRespRate] = useState("");
  const [o2Sat, setO2Sat] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!patientId || !assessment.trim() || !plan.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    // Pass the raw data up to ClinicalDocumentation.tsx
    // It will handle stripping out the "(MRN...)" and creating the Title
    onSave({
      patientId,
      date,
      vitals: { temperature, bp, heartRate, respRate, o2Sat },
      assessment,
      plan,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setPatientId("");
    setDate(
      new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
    );
    setTemperature("");
    setBp("");
    setHeartRate("");
    setRespRate("");
    setO2Sat("");
    setAssessment("");
    setPlan("");
    setError("");
    onClose();
  };

  return (
    <Modal
      title="Record E-Round"
      isOpen={isOpen}
      onClose={resetAndClose}
      footer={
        <>
          <button
            onClick={resetAndClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save E-Round
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <SelectField
          label="Patient"
          value={patientId}
          onChange={(v) => {
            setPatientId(v);
            setError("");
          }}
          options={patients}
          placeholder="Select patient"
          required
        />

        <InputField
          label="Date"
          value={date}
          onChange={setDate}
          placeholder="MM/DD/YYYY"
          required
        />

        {/* Vital Signs */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Vital Signs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Temperature (°F)"
              value={temperature}
              onChange={setTemperature}
              placeholder="98.6"
            />
            <InputField
              label="Blood Pressure"
              value={bp}
              onChange={setBp}
              placeholder="120/80"
            />
            <InputField
              label="Heart Rate (bpm)"
              value={heartRate}
              onChange={setHeartRate}
              placeholder="72"
            />
            <InputField
              label="Respiratory Rate (/min)"
              value={respRate}
              onChange={setRespRate}
              placeholder="16"
              type="number"
            />
          </div>
          <div className="mt-4">
            <InputField
              label="Oxygen Saturation (%)"
              value={o2Sat}
              onChange={setO2Sat}
              placeholder="98"
            />
          </div>
        </div>

        {/* Assessment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            placeholder="Patient assessment and observations..."
            value={assessment}
            onChange={(e) => {
              setAssessment(e.target.value);
              setError("");
            }}
            rows={2}
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#d1d5db",
            }}
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            placeholder="Treatment plan and next steps..."
            value={plan}
            onChange={(e) => {
              setPlan(e.target.value);
              setError("");
            }}
            rows={2}
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#d1d5db",
            }}
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

export default CreateERoundModal;
