import React from "react";

interface BadgeProps {
  text: string;
  variant?: "red" | "green" | "blue" | "orange" | "gray" | "dark" | "outline";
}

const variantMap = {
  red: "bg-red-500 text-white",
  green: "bg-emerald-500 text-white",
  blue: "bg-white text-gray-700",
  orange: "bg-orange-500 text-white",
  gray: "bg-gray-200 text-gray-700",
  dark: "bg-gray-900 text-white",
  outline: "bg-white text-gray-700",
};

const Badge: React.FC<BadgeProps> = ({ text, variant = "gray" }) => {
  const isOutline = variant === "blue" || variant === "outline";
  return (
    <span
      className={`text-xs font-medium px-3 py-1 rounded-full ${variantMap[variant]}`}
      style={
        isOutline
          ? { borderWidth: "1px", borderStyle: "solid", borderColor: "#d1d5db" }
          : {}
      }
    >
      {text}
    </span>
  );
};

export default Badge;
