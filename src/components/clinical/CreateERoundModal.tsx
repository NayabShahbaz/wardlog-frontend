import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import InputField from "../ui/InputField";
import { apiFetch } from "../../utils/api";

interface CreateERoundModalProps {
  isOpen: boolean;
  onClose: () => void;
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

// ── AI Suggestion State ─────────────────────────────────────────────
interface AISuggestion {
  fieldKey: string;
  original: string;
  expanded: string;
  editing: boolean;
  editedText: string;
}

// ── AI-Powered Textarea ─────────────────────────────────────────────
interface AITextareaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  required?: boolean;
  onAIAssist: () => void;
  isLoading?: boolean;
  suggestion?: AISuggestion | null;
  onAccept?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  onEditChange?: (val: string) => void;
  onEditSave?: () => void;
}

const AITextarea: React.FC<AITextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
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
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#d1d5db",
        }}
        className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
      />

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

  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  // ── AI Assist Handler ─────────────────────────────────────────
  const handleAIAssist = async (
    fieldKey: string,
    fieldLabel: string,
    currentText: string,
  ) => {
    if (!currentText.trim()) return;

    setAiLoading(fieldKey);
    setAiSuggestion(null);

    try {
      const patient = patients.find((p) => p.value === patientId);
      const patientContext = patient?.label.split(" (")[0];

      // Build vitals context so AI knows the clinical picture
      const vitalsContext = [
        temperature && `Temp: ${temperature}°F`,
        bp && `BP: ${bp}`,
        heartRate && `HR: ${heartRate}`,
        respRate && `RR: ${respRate}`,
        o2Sat && `O2 Sat: ${o2Sat}%`,
      ]
        .filter(Boolean)
        .join(", ");

      const res = await apiFetch("/api/clinical/ai/expand-note", {
        method: "POST",
        body: JSON.stringify({
          fieldLabel,
          currentText,
          template: "e-round",
          patientContext: [patientContext, vitalsContext]
            .filter(Boolean)
            .join(" | "),
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
    const text = aiSuggestion.editing
      ? aiSuggestion.editedText
      : aiSuggestion.expanded;

    if (aiSuggestion.fieldKey === "assessment") setAssessment(text);
    if (aiSuggestion.fieldKey === "plan") setPlan(text);
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

  // ── Save / Reset ─────────────────────────────────────────────
  const handleSave = () => {
    if (!patientId || !assessment.trim() || !plan.trim()) {
      setError("Please fill all required fields.");
      return;
    }

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
    setAiSuggestion(null);
    setAiLoading(null);
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

        {/* AI hint */}
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
          Write a few words, then click "AI Assist" to expand
        </div>

        {/* Assessment with AI */}
        <AITextarea
          label="Assessment"
          value={assessment}
          onChange={(v) => {
            setAssessment(v);
            setError("");
          }}
          placeholder="Patient assessment and observations..."
          required
          onAIAssist={() =>
            handleAIAssist("assessment", "Assessment", assessment)
          }
          isLoading={aiLoading === "assessment"}
          suggestion={
            aiSuggestion?.fieldKey === "assessment" ? aiSuggestion : null
          }
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
          onEdit={handleEditSuggestion}
          onEditChange={handleEditChange}
          onEditSave={handleAcceptSuggestion}
        />

        {/* Plan with AI */}
        <AITextarea
          label="Plan"
          value={plan}
          onChange={(v) => {
            setPlan(v);
            setError("");
          }}
          placeholder="Treatment plan and next steps..."
          required
          onAIAssist={() => handleAIAssist("plan", "Plan", plan)}
          isLoading={aiLoading === "plan"}
          suggestion={aiSuggestion?.fieldKey === "plan" ? aiSuggestion : null}
          onAccept={handleAcceptSuggestion}
          onReject={handleRejectSuggestion}
          onEdit={handleEditSuggestion}
          onEditChange={handleEditChange}
          onEditSave={handleAcceptSuggestion}
        />
      </div>
    </Modal>
  );
};

export default CreateERoundModal;
