import React from "react";

interface WelcomeHeaderProps {
  name: string;
  department: string;
  date?: string;
  time?: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  name,
  department,
  date,
  time,
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {name}</h1>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-sm text-gray-600">{department}</span>
        {date && <span className="text-sm text-gray-400">{date}</span>}
        {time && <span className="text-sm text-gray-400">{time}</span>}
      </div>
    </div>
  );
};

export default WelcomeHeader;
