import React, { useState } from "react";
import Modal from "../ui/Modal";
import PatientForm, {
  type PatientFormData,
  getEmptyPatientForm,
} from "./PatientForm";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: PatientFormData) => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState<PatientFormData>(
    getEmptyPatientForm(),
  );

  const handleSubmit = () => {
    onAdd(formData);
    setFormData(getEmptyPatientForm());
    onClose();
  };

  const handleClose = () => {
    setFormData(getEmptyPatientForm());
    onClose();
  };

  return (
    <Modal
      title="Add New Patient"
      isOpen={isOpen}
      onClose={handleClose}
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360] transition-colors"
          >
            Add Patient
          </button>
        </>
      }
    >
      <PatientForm data={formData} onChange={setFormData} />
    </Modal>
  );
};

export default AddPatientModal;
