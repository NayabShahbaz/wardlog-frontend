import React from "react";
import Badge from "../ui/Badge";

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface NoteField {
  label: string;
  value: string;
}

export interface ClinicalNote {
  id: string;
  title: string;
  patientName: string;
  patientMrn: string;
  doctor: string;
  date: string;
  status: "Final" | "Draft";
  soap?: SOAPNote;
  fields?: NoteField[];
}

interface ClinicalNoteCardProps {
  note: ClinicalNote;
}

const soapColors: Record<string, string> = {
  Subjective: "#3b82f6",
  Objective: "#f59e0b",
  Assessment: "#10b981",
  Plan: "#8b5cf6",
};

const fieldColors = [
  "#3b82f6",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
];

const ClinicalNoteCard: React.FC<ClinicalNoteCardProps> = ({ note }) => {
  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">{note.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Patient: {note.patientName} ({note.patientMrn})
          </p>
          <p className="text-sm text-gray-400">
            {note.doctor} · {note.date}
          </p>
        </div>
        <Badge
          text={note.status}
          variant={note.status === "Final" ? "dark" : "outline"}
        />
      </div>

      {/* SOAP Sections */}
      {note.soap && (
        <div className="mt-4 space-y-3">
          {Object.entries(note.soap).map(([key, value]) => {
            if (!value) return null;
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="flex gap-3">
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ backgroundColor: soapColors[label] || "#9ca3af" }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-sm text-gray-600">{value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generic fields (admission, discharge, procedure) */}
      {note.fields && note.fields.length > 0 && (
        <div className="mt-4 space-y-3">
          {note.fields.map((field, i) => {
            if (!field.value) return null;
            return (
              <div key={field.label} className="flex gap-3">
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: fieldColors[i % fieldColors.length],
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-600">{field.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClinicalNoteCard;
