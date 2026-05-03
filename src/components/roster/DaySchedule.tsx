import React from "react";
import ShiftCard, { type StaffShift } from "./ShiftCard";

export interface DayScheduleData {
  date: string;
  morning: StaffShift[];
  afternoon: StaffShift[];
  night: StaffShift[];
}

interface DayScheduleProps {
  day: DayScheduleData;
}

const DaySchedule: React.FC<DayScheduleProps> = ({ day }) => {
  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      <h3 className="text-base font-bold text-gray-900 mb-4">{day.date}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* These labels and staff assignments align with Member 2's backend roster logic[cite: 11, 15] */}
        <ShiftCard label="Morning" staff={day.morning} />
        <ShiftCard label="Afternoon" staff={day.afternoon} />
        <ShiftCard label="Night" staff={day.night} />
      </div>
    </div>
  );
};

export default DaySchedule;