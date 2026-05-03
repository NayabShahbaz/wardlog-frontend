import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import InputField from "../ui/InputField";

// Interface updated to match Member 2's backend schema[cite: 11, 15]
export interface SwapRequest {
  id: string;
  shift: string; // Updated from myShift[cite: 15]
  swapWith: string;
  requestedDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SwapRequest, "id" | "status">) => void;
  shiftOptions: { label: string; value: string }[];
  staffOptions: { label: string; value: string }[];
}

const RequestSwapModal: React.FC<RequestSwapModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  shiftOptions,
  staffOptions,
}) => {
  const [shift, setShift] = useState("");
  const [swapWith, setSwapWith] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!shift || !swapWith || !requestedDate || !reason.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    // Submitting with keys compatible with Member 2's API[cite: 15]
    onSubmit({ shift, swapWith, requestedDate, reason });
    resetAndClose();
  };

  const resetAndClose = () => {
    setShift("");
    setSwapWith("");
    setRequestedDate("");
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      title="Request Shift Swap"
      isOpen={isOpen}
      onClose={resetAndClose}
      footer={
        <>
          <button
            onClick={resetAndClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#154360] transition-colors"
          >
            Submit Request
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <SelectField
          label="My Shift to Swap"
          value={shift}
          onChange={(v) => {
            setShift(v);
            setError("");
          }}
          options={shiftOptions}
          placeholder="Select your shift"
          required
        />

        <SelectField
          label="Swap With"
          value={swapWith}
          onChange={(v) => {
            setSwapWith(v);
            setError("");
          }}
          options={staffOptions}
          placeholder="Select staff member"
          required
        />

        <InputField
          label="Requested Date"
          value={requestedDate}
          onChange={(v) => {
            setRequestedDate(v);
            setError("");
          }}
          type="date"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            placeholder="Please provide a reason for the swap request"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            rows={3}
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#d1d5db",
            }}
            className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};

export default RequestSwapModal;