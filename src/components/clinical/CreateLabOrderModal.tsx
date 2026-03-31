import React, { useState } from "react";
import Modal from "../ui/Modal";
import { SelectField } from "../ui";

interface CreateLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    patientId: string;
    orderType: string;
    priority: string;
    tests: string;
    notes: string;
  }) => void;
  patients: { label: string; value: string }[];
}

const orderTypeOptions = [
  { label: "Blood Work", value: "blood_work" },
  { label: "Imaging", value: "imaging" },
  { label: "Urinalysis", value: "urinalysis" },
  { label: "Microbiology", value: "microbiology" },
];

const priorityOptions = [
  { label: "Routine", value: "routine" },
  { label: "Urgent", value: "urgent" },
  { label: "STAT", value: "stat" },
];

const CreateLabOrderModal: React.FC<CreateLabOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
}) => {
  const [patientId, setPatientId] = useState("");
  const [orderType, setOrderType] = useState("");
  const [priority, setPriority] = useState("routine");
  const [tests, setTests] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!patientId || !orderType || !tests.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    onSave({ patientId, orderType, priority, tests, notes });
    resetAndClose();
  };

  const resetAndClose = () => {
    setPatientId("");
    setOrderType("");
    setPriority("routine");
    setTests("");
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <Modal
      title="Create Lab Order"
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
            Create Order
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Order Type"
            value={orderType}
            onChange={(v) => {
              setOrderType(v);
              setError("");
            }}
            options={orderTypeOptions}
            placeholder="Select type"
            required
          />
          <SelectField
            label="Priority"
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
            placeholder="Select priority"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tests (comma-separated)
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            placeholder="e.g., CBC, CMP, Lipid Panel"
            value={tests}
            onChange={(e) => {
              setTests(e.target.value);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            placeholder="Any special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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

export default CreateLabOrderModal;
