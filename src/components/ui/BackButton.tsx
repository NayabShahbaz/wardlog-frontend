import React from "react";
import { HiOutlineArrowLeft } from "react-icons/hi2";

interface BackButtonProps {
  label: string;
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
    >
      <HiOutlineArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
};

export default BackButton;
