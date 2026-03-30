import React from "react";
import type { IconType } from "react-icons";

interface SectionCardProps {
  title: string;
  icon: IconType;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  children,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-gray-700" />
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
};

export default SectionCard;
