import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import ClinicalNoteCard, { type ClinicalNote } from "./ClinicalNoteCard";

interface ClinicalNotesSectionProps {
  notes: ClinicalNote[];
  onCreateNote?: () => void;
}

const ClinicalNotesSection: React.FC<ClinicalNotesSectionProps> = ({
  notes,
  onCreateNote,
}) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Clinical Notes</h2>
        {onCreateNote && (
          <button
            onClick={onCreateNote}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Create Note
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => <ClinicalNoteCard key={note.id} note={note} />)
        ) : (
          <div className="text-center py-8 text-sm text-gray-400">
            No clinical notes found
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalNotesSection;
