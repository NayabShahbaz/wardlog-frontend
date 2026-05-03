import React from "react";

// Interface aligned with Member 2's MongoDB backend schema[cite: 15]
export interface StaffShift {
  _id: string; // Updated from 'id' to '_id' for MongoDB compatibility[cite: 15]
  name: string;
  role: string;
  ward: string;
}

interface ShiftCardProps {
  label: string;
  staff: StaffShift[];
}

const ShiftCard: React.FC<ShiftCardProps> = ({ label, staff }) => {
  return (
    <div
      className="bg-white rounded-xl p-4 flex-1 min-w-0"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-bold text-gray-900">{label}</h4>
        <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-md bg-gray-100">
          {staff.length}
        </span>
      </div>

      {staff.length > 0 ? (
        <div className="space-y-2">
          {staff.map((s) => (
            <div
              key={s._id} // Using MongoDB identifier[cite: 15]
              className="py-2 last:border-0"
              style={{
                borderBottomWidth: "1px",
                borderBottomStyle: "solid",
                borderBottomColor: "#f3f4f6",
              }}
            >
              <p className="text-sm font-semibold text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-500">
                {s.role} • {s.ward}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No staff scheduled</p>
      )}
    </div>
  );
};

export default ShiftCard;