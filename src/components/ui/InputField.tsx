import React from "react";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  error?: string | null; // Added to handle Member 2 backend validation errors[cite: 16, 23]
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
  error = null,
}) => {
  const commonProps = {
    placeholder: placeholder || label,
    value: value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    disabled: disabled,
    style: {
      borderWidth: "1px",
      borderStyle: "solid" as const,
      borderColor: error ? "#dc2626" : "#d1d5db", // Border turns red on error[cite: 23]
    },
    className: `w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-all ${
      error ? "ring-1 ring-red-500" : ""
    }`,
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {multiline ? (
        <textarea
          {...commonProps}
          rows={rows}
          className={`${commonProps.className} resize-none`}
        />
      ) : (
        <input type={type} {...commonProps} />
      )}

      {/* Error message display for backend validation[cite: 16, 23] */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;