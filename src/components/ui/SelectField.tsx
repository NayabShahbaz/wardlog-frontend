import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string | null; // Added for Member 2 backend validation[cite: 27]
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  error = null,
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: error ? "#dc2626" : "#d1d5db", // Red border on error[cite: 27]
        }}
        className={`w-full px-3 py-2.5 rounded-lg text-sm text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276]
                   appearance-none bg-gray-50 focus:bg-white transition-all ${
                     error ? "ring-1 ring-red-500" : ""
                   }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      
      {/* Error message display[cite: 27] */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;