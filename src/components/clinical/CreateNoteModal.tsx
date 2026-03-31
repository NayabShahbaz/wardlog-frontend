import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";

// ── Template definitions ────────────────────────────────────────────
interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const templateOptions = [
  { label: "Progress Note (progress)", value: "progress" },
  { label: "Admission Note (admission)", value: "admission" },
  { label: "Discharge Summary (discharge)", value: "discharge" },
  { label: "Procedure Note (procedure)", value: "procedure" },
];

// eslint-disable-next-line react-refresh/only-export-components
export const templateFields: Record<string, TemplateField[]> = {
  progress: [
    {
      key: "subjective",
      label: "Subjective",
      placeholder: "Enter subjective findings...",
      required: true,
    },
    {
      key: "objective",
      label: "Objective",
      placeholder: "Enter objective findings...",
      required: true,
    },
    {
      key: "assessment",
      label: "Assessment",
      placeholder: "Enter assessment...",
      required: true,
    },
    {
      key: "plan",
      label: "Plan",
      placeholder: "Enter plan...",
      required: true,
    },
  ],
  admission: [
    {
      key: "chiefComplaint",
      label: "Chief Complaint",
      placeholder: "Enter chief complaint...",
      required: true,
    },
    {
      key: "historyOfPresentIllness",
      label: "History of Present Illness",
      placeholder: "Enter history of present illness...",
      required: true,
    },
    {
      key: "pastMedicalHistory",
      label: "Past Medical History",
      placeholder: "Enter past medical history...",
    },
    {
      key: "medications",
      label: "Current Medications",
      placeholder: "Enter current medications...",
    },
    {
      key: "physicalExam",
      label: "Physical Examination",
      placeholder: "Enter physical exam findings...",
      required: true,
    },
    {
      key: "assessment",
      label: "Assessment & Plan",
      placeholder: "Enter assessment and plan...",
      required: true,
    },
  ],
  discharge: [
    {
      key: "admissionDate",
      label: "Admission Date",
      placeholder: "Enter admission date...",
      required: true,
    },
    {
      key: "dischargeDate",
      label: "Discharge Date",
      placeholder: "Enter discharge date...",
      required: true,
    },
    {
      key: "finalDiagnosis",
      label: "Final Diagnosis",
      placeholder: "Enter final diagnosis...",
      required: true,
    },
    {
      key: "hospitalCourse",
      label: "Hospital Course",
      placeholder: "Enter hospital course...",
      required: true,
    },
    {
      key: "dischargeMedications",
      label: "Discharge Medications",
      placeholder: "Enter discharge medications...",
      required: true,
    },
    {
      key: "followUpInstructions",
      label: "Follow-up Instructions",
      placeholder: "Enter follow-up instructions...",
      required: true,
    },
  ],
  procedure: [
    {
      key: "procedureName",
      label: "Procedure Name",
      placeholder: "Enter procedure name...",
      required: true,
    },
    {
      key: "indication",
      label: "Indication",
      placeholder: "Enter indication...",
      required: true,
    },
    {
      key: "procedureDescription",
      label: "Procedure Description",
      placeholder: "Describe the procedure...",
      required: true,
    },
    {
      key: "findings",
      label: "Findings",
      placeholder: "Enter findings...",
      required: true,
    },
    {
      key: "complications",
      label: "Complications",
      placeholder: "Enter complications (if any)...",
    },
    {
      key: "postProcedurePlan",
      label: "Post-Procedure Plan",
      placeholder: "Enter post-procedure plan...",
      required: true,
    },
  ],
};

// ── AI Assist Button ────────────────────────────────────────────────
const AIAssistButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 rounded-lg transition-colors hover:bg-gray-100"
    style={{ borderWidth: "1px", borderStyle: "solid", borderColor: "#d1d5db" }}
  >
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"
        fill="#6366f1"
      />
      <path
        d="M12 9l.75 1.75L14.5 11.5l-1.75.75L12 14l-.75-1.75L9.5 11.5l1.75-.75L12 9z"
        fill="#6366f1"
        opacity="0.6"
      />
    </svg>
    AI Assist
  </button>
);

// ── Note Field ──────────────────────────────────────────────────────
interface NoteFieldProps {
  field: TemplateField;
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
}

const NoteField: React.FC<NoteFieldProps> = ({
  field,
  value,
  onChange,
  hasError,
}) => {
  const handleAIAssist = () => {
    onChange(`[AI-generated ${field.label.toLowerCase()}]`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-gray-900">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <AIAssistButton onClick={handleAIAssist} />
      </div>
      <textarea
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: hasError ? "#ef4444" : "#d1d5db",
        }}
        className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
      />
      {hasError && (
        <p className="text-xs text-red-500 mt-0.5">This field is required</p>
      )}
    </div>
  );
};

// ── Modal ───────────────────────────────────────────────────────────
interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    patientId: string;
    template: string;
    fields: Record<string, string>;
  }) => void;
  patients: { label: string; value: string }[];
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patients,
}) => {
  const [patientId, setPatientId] = useState("");
  const [template, setTemplate] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const fields = template ? templateFields[template] || [] : [];

  const updateField = (key: string, val: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    setFieldValues({});
    setFieldErrors({});
    setError("");
  };

  const handleSave = () => {
    setError("");
    setFieldErrors({});

    // Validate patient and template
    if (!patientId || !template) {
      setError("Please select a patient and template.");
      return;
    }

    // Validate required fields
    const errors: Record<string, boolean> = {};
    let hasFieldErrors = false;
    fields.forEach((field) => {
      if (field.required && !fieldValues[field.key]?.trim()) {
        errors[field.key] = true;
        hasFieldErrors = true;
      }
    });

    if (hasFieldErrors) {
      setFieldErrors(errors);
      setError("Please fill all required fields.");
      return;
    }

    onSave({ patientId, template, fields: fieldValues });
    resetAndClose();
  };

  const resetAndClose = () => {
    setPatientId("");
    setTemplate("");
    setFieldValues({});
    setError("");
    setFieldErrors({});
    onClose();
  };

  return (
    <Modal
      title="Create Clinical Note"
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
            className="px-5 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Save Note
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
          label="Select Patient"
          value={patientId}
          onChange={(val) => {
            setPatientId(val);
            setError("");
          }}
          options={patients}
          placeholder="Choose a patient"
          required
        />
        <SelectField
          label="Select Template"
          value={template}
          onChange={handleTemplateChange}
          options={templateOptions}
          placeholder="Choose a template"
          required
        />

        {fields.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-sm text-indigo-600">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"
                  fill="#6366f1"
                />
                <path
                  d="M12 9l.75 1.75L14.5 11.5l-1.75.75L12 14l-.75-1.75L9.5 11.5l1.75-.75L12 9z"
                  fill="#6366f1"
                  opacity="0.6"
                />
              </svg>
              Click "AI Assist" on any field for suggestions
            </div>

            {fields.map((field) => (
              <NoteField
                key={field.key}
                field={field}
                value={fieldValues[field.key] || ""}
                onChange={(val) => updateField(field.key, val)}
                hasError={fieldErrors[field.key] || false}
              />
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};

export default CreateNoteModal;
