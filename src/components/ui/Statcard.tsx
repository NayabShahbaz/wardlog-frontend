import React from "react";
import type { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: IconType;
  color: string; // e.g. "bg-blue-100"
  iconColor: string; // e.g. "text-blue-600"
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon: Icon,
  color,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div
        className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
  );
};

export default StatCard;
