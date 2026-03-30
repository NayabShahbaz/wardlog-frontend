import React from "react";

interface BadgeProps {
  text: string;
  variant?: "red" | "green" | "blue" | "orange" | "gray";
}

const variantMap = {
  red: "bg-red-500 text-white",
  green: "bg-green-500 text-white",
  blue: "bg-blue-500 text-white",
  orange: "bg-orange-500 text-white",
  gray: "bg-gray-200 text-gray-700",
};

const Badge: React.FC<BadgeProps> = ({ text, variant = "gray" }) => {
  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${variantMap[variant]}`}
    >
      {text}
    </span>
  );
};

export default Badge;
