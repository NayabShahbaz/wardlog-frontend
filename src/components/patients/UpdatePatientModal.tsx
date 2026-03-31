import React, { useState } from "react";
import Modal from "../ui/Modal";
import PatientForm, { type PatientFormData } from "./PatientForm";

interface UpdatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: PatientFormData) => void;
  patient: PatientFormData | null;
}

const UpdatePatientFormWrapper: React.FC<{
  patient: PatientFormData;
  onUpdate: (data: PatientFormData) => void;
  onClose: () => void;
}> = ({ patient, onUpdate, onClose }) => {
  const [formData, setFormData] = useState<PatientFormData>({ ...patient });

  const handleSubmit = () => {
    onUpdate(formData);
    onClose();
  };

  return (
    <>
      <PatientForm data={formData} onChange={setFormData} isEdit />
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360] transition-colors"
        >
          Update Patient
        </button>
      </div>
    </>
  );
};

const UpdatePatientModal: React.FC<UpdatePatientModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  patient,
}) => {
  if (!patient) return null;

  return (
    <Modal title="Edit Patient" isOpen={isOpen} onClose={onClose}>
      <UpdatePatientFormWrapper
        key={patient.mrn}
        patient={patient}
        onUpdate={onUpdate}
        onClose={onClose}
      />
    </Modal>
  );
};

export default UpdatePatientModal;
