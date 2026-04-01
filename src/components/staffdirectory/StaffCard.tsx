import React from "react";
import {
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineBuildingOffice2,
  HiOutlineUserCircle,
} from "react-icons/hi2";
import Badge from "../ui/Badge";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  department: string;
  phone: string;
  email: string;
}

interface StaffCardProps {
  staff: StaffMember;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff }) => {
  return (
    <div
      className="bg-white rounded-xl p-4"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#e8f0f6] flex items-center justify-center shrink-0">
          <HiOutlineUserCircle className="w-6 h-6 text-[#1a5276]" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{staff.name}</p>
          <Badge text={staff.role} variant="outline" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {staff.specialty && (
          <div className="flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600">
              Specialty: {staff.specialty}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <HiOutlineBuildingOffice2 className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-600">
            Department: {staff.department}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlinePhone className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-[#1a5276]">{staff.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineEnvelope className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-[#1a5276]">{staff.email}</span>
        </div>
      </div>
    </div>
  );
};

export default StaffCard;
