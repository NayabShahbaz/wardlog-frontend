import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  // Updated: individual options can now be disabled
  options: { label: string; value: string; disabled?: boolean }[]; 
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  // Added: disabled prop for the entire select field
  disabled?: boolean; 
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  error = null,
  disabled = false, // Added: default value for disabled
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
        // Added: disabled attribute applied to the HTML select element
        disabled={disabled} 
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: error ? "#dc2626" : "#d1d5db",
        }}
        className={`w-full px-3 py-2.5 rounded-lg text-sm text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276]
                   appearance-none bg-gray-50 focus:bg-white transition-all ${
                     error ? "ring-1 ring-red-500" : ""
                   } ${
                     disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "" // Added: visual feedback for disabled state
                   }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option 
            key={opt.value} 
            value={opt.value} 
            // Added: individual options can now be disabled (e.g., for occupied beds)
            disabled={opt.disabled}
          >
            {opt.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;