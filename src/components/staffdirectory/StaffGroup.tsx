import React from "react";
import StaffCard, { type StaffMember } from "./StaffCard";

interface StaffGroupProps {
  role: string;
  members: StaffMember[];
}

const StaffGroup: React.FC<StaffGroupProps> = ({ role, members }) => {
  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{role}</h3>
        <span className="text-xs font-medium text-gray-500 px-2.5 py-1 rounded-full bg-gray-100">
          {members.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m) => (
          /* Using _id instead of id to match Member 2's backend schema[cite: 20] */
          <StaffCard key={m._id} staff={m} />
        ))}
      </div>
    </div>
  );
};

export default StaffGroup;