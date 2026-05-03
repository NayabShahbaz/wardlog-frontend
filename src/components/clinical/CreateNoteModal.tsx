/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import { apiFetch } from "../../utils/api";

// ── Template definitions ────────────────────────────────────────────
interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

export const templateOptions = [
  { label: "Progress Note (progress)", value: "progress" },
  { label: "Admission Note (admission)", value: "admission" },
  { label: "Discharge Summary (discharge)", value: "discharge" },
  { label: "Procedure Note (procedure)", value: "procedure" },
];

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

// ── AI Suggestion State ─────────────────────────────────────────────
interface AISuggestion {
  fieldKey: string;
  original: string;
  expanded: string;
  editing: boolean;
  editedText: string;
}

// ── Note Field with AI Assist ───────────────────────────────────────
interface NoteFieldProps {
  field: TemplateField;
  value: string;
  onChange: (val: string) => void;
  hasError?: boolean;
  onAIAssist: () => void;
  isLoading?: boolean;
  suggestion?: AISuggestion | null;
  onAccept?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onEditChange?: (val: string) => void;
  onEditSave?: () => void;
}

const NoteField: React.FC<NoteFieldProps> = ({
  field,
  value,
  onChange,
  hasError,
  onAIAssist,
  isLoading,
  suggestion,
  onAccept,
  onReject,
  onEdit,
  onEditChange,
  onEditSave,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-semibold text-gray-900">
          {field.label}
          {field.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <button
          type="button"
          onClick={onAIAssist}
          disabled={isLoading || !value.trim()}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg transition-colors
            ${
              isLoading || !value.trim()
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          style={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#d1d5db",
          }}
          title={!value.trim() ? "Write something first" : "Expand with AI"}
        >
          {isLoading ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-75"
                />
              </svg>
              Expanding...
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
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

      {/* AI Suggestion Panel */}
      {suggestion && (
        <div className="mt-2 border border-indigo-200 rounded-lg bg-indigo-50/50 overflow-hidden">
          <div className="px-3 py-2 bg-indigo-100/60 flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 text-indigo-600"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11 6.5 7.5 3 6l3.5-1.5L8 1z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs font-semibold text-indigo-700">
              AI Suggestion
            </span>
          </div>

          {suggestion.editing ? (
            <div className="p-3 space-y-2">
              <textarea
                value={suggestion.editedText}
                onChange={(e) => onEditChange?.(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-indigo-200
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onReject}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onEditSave}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Use This
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                {suggestion.expanded}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={onReject}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                >
                  Reject
                </button>
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={onAccept}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>
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
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

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
    setAiSuggestion(null);
    setError("");
  };

  const handleAIAssist = async (fieldKey: string, fieldLabel: string) => {
    const currentText = fieldValues[fieldKey];
    if (!currentText?.trim()) return;

    setAiLoading(fieldKey);
    setAiSuggestion(null);

    try {
      // Get patient name for context
      const patient = patients.find((p) => p.value === patientId);
      const patientContext = patient?.label.split(" (")[0];

      const res = await apiFetch("/api/clinical/ai/expand-note", {
        method: "POST",
        body: JSON.stringify({
          fieldLabel,
          currentText,
          template,
          patientContext,
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setAiSuggestion({
          fieldKey,
          original: currentText,
          expanded: result.data.expanded,
          editing: false,
          editedText: result.data.expanded,
        });
      } else {
        console.error("AI expand failed:", result.message);
      }
    } catch (err) {
      console.error("AI assist error:", err);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAcceptSuggestion = () => {
    if (!aiSuggestion) return;
    updateField(
      aiSuggestion.fieldKey,
      aiSuggestion.editing ? aiSuggestion.editedText : aiSuggestion.expanded,
    );
    setAiSuggestion(null);
  };

  const handleRejectSuggestion = () => {
    setAiSuggestion(null);
  };

  const handleEditSuggestion = () => {
    if (!aiSuggestion) return;
    setAiSuggestion({ ...aiSuggestion, editing: true });
  };

  const handleEditChange = (val: string) => {
    if (!aiSuggestion) return;
    setAiSuggestion({ ...aiSuggestion, editedText: val });
  };

  const handleSave = () => {
    setError("");
    setFieldErrors({});

    if (!patientId || !template) {
      setError("Please select a patient and template.");
      return;
    }

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
    setAiSuggestion(null);
    setAiLoading(null);
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
              Write a few words, then click "AI Assist" to expand into a full
              clinical note
            </div>

            {fields.map((field) => (
              <NoteField
                key={field.key}
                field={field}
                value={fieldValues[field.key] || ""}
                onChange={(val) => updateField(field.key, val)}
                hasError={fieldErrors[field.key] || false}
                onAIAssist={() => handleAIAssist(field.key, field.label)}
                isLoading={aiLoading === field.key}
                suggestion={
                  aiSuggestion?.fieldKey === field.key ? aiSuggestion : null
                }
                onAccept={handleAcceptSuggestion}
                onReject={handleRejectSuggestion}
                onEdit={handleEditSuggestion}
                onEditChange={handleEditChange}
                onEditSave={handleAcceptSuggestion}
              />
            ))}
          </>
        )}
      </div>
    </Modal>
  );
};

export default CreateNoteModal;
