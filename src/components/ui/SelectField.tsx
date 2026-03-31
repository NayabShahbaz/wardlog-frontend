import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
}) => {
  return (
    <div>
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
          borderColor: "#d1d5db",
        }}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276]
                   appearance-none bg-gray-50 focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
