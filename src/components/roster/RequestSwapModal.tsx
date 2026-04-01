import React, { useState } from "react";
import Modal from "../ui/Modal";
import SelectField from "../ui/SelectField";
import InputField from "../ui/InputField";

export interface SwapRequest {
  id: string;
  myShift: string;
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
  const [myShift, setMyShift] = useState("");
  const [swapWith, setSwapWith] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!myShift || !swapWith || !requestedDate || !reason.trim()) {
      setError("Please fill all required fields.");
      return;
    }
    onSubmit({ myShift, swapWith, requestedDate, reason });
    resetAndClose();
  };

  const resetAndClose = () => {
    setMyShift("");
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
            className="px-6 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-sm"
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
          value={myShift}
          onChange={(v) => {
            setMyShift(v);
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
          placeholder="mm/dd/yyyy"
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
