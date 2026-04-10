import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";

import { Modal, InputField, SelectField } from "../ui";
import NoticeCard from "../ui/NoticeCard";
import type { Notice } from "../ui/NoticeCard";
import { HiOutlinePlus, HiOutlineMegaphone } from "react-icons/hi2";

const initialNotices: Notice[] = [
  {
    id: "1",
    title: "New COVID-19 Protocol Update",
    category: "Policy",
    author: "Admin",
    date: "3/11/2026",
    priority: "high",
    expiresAt: "3/26/2026",
    content:
      "Updated PPE requirements effective immediately. Please review the new guidelines in the staff protocol manual.",
  },
  {
    id: "2",
    title: "Staff Meeting - March 15",
    category: "General",
    author: "Admin",
    date: "3/11/2026",
    priority: "medium",
    content:
      "Monthly staff meeting scheduled for March 15 at 2 PM in Conference Room A. Attendance is mandatory.",
  },
];

const categoryOptions = [
  { label: "System", value: "System" },
  { label: "Policy", value: "Policy" },
  { label: "General", value: "General" },
  { label: "HR", value: "HR" },
  { label: "Emergency", value: "Emergency" },
];

const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function NoticeboardPage() {
  const { userName, userRole } = useOutletContext<UserContextType>();
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = { name: userName, role: userRole.toLowerCase() };

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "medium",
    expiresAt: "",
  });

  const handlePost = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide both a title and content for the notice.");
      return;
    }

    const id = crypto.randomUUID();
    const today = new Date().toLocaleDateString();
    const newNotice: Notice = {
      id,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      author: currentUser.name,
      date: today,
      priority: formData.priority,
      expiresAt: formData.expiresAt || undefined,
    };

    setNotices([newNotice, ...notices]);
    closeModal();
    setFormData({
      title: "",
      content: "",
      category: "General",
      priority: "medium",
      expiresAt: "",
    });
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineMegaphone className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Noticeboard</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Important announcements and updates
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <HiOutlinePlus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              showDelete={
                currentUser.role === "admin" ||
                notice.author === currentUser.name
              }
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 text-sm text-gray-400">
            No notices at this time
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title="Post New Notice"
        isOpen={isModalOpen}
        onClose={closeModal}
        footer={
          <>
            <button
              onClick={closeModal}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
            >
              Post Notice
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <InputField
            label="Notice Title"
            placeholder="e.g., Ward A Maintenance"
            value={formData.title}
            onChange={(v) => {
              setFormData({ ...formData, title: v });
              if (error) setError(null);
            }}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
              options={categoryOptions}
            />
            <SelectField
              label="Priority"
              value={formData.priority}
              onChange={(v) => setFormData({ ...formData, priority: v })}
              options={priorityOptions}
            />
          </div>
          <InputField
            label="Expiry Date (Optional)"
            type="date"
            value={formData.expiresAt}
            onChange={(v) => setFormData({ ...formData, expiresAt: v })}
          />
          <InputField
            label="Notice Content"
            placeholder="Describe the update in detail..."
            multiline
            rows={4}
            value={formData.content}
            onChange={(v) => {
              setFormData({ ...formData, content: v });
              if (error) setError(null);
            }}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
