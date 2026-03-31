import React from "react";

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean; // Added
  rows?: number; // Added
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  multiline = false, // Added
  rows = 3, // Added
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
      borderColor: "#d1d5db",
    },
    className:
      "w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white disabled:bg-gray-100 disabled:text-gray-500",
  };

  return (
    <div>
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
    </div>
  );
};

export default InputField;
