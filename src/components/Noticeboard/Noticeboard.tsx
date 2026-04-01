import { useState } from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import { NoticeCard } from "../ui";
import Modal from "../ui/Modal";
import { InputField, SelectField } from "../ui";
import type { Notice } from "../ui/NoticeCard";
import { useOutletContext } from "react-router-dom"; 
import { type UserContextType } from "../layout/DoctorLayout";

const MOCK_NOTICES = [
  {
    id: "1",
    title: "New COVID-19 Protocol Update",
    category: "urgent",
    postedBy: "Admin User",
    postedAt: "3/11/2026, 7:00:00 PM",
    expiresAt: "3/26/2026",
    content:
      "Updated PPE requirements effective immediately. Please review the new guidelines in the staff protocol manual.",
  },
  {
    id: "2",
    title: "Staff Meeting - March 15",
    category: "announcement",
    postedBy: "Admin User",
    postedAt: "3/11/2026, 7:00:00 PM",
    content:
      "Monthly staff meeting scheduled for March 15 at 2 PM in Conference Room A. Attendance is mandatory.",
  },
];

export default function NoticeboardPage() {
  const { userName, userRole } = useOutletContext<UserContextType>(); // 1. Get Dynamic Context
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // NEW: Error state for inline validation
  const [error, setError] = useState<string | null>(null);

  const currentUser = { name: userName, role: userRole.toLowerCase() };

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "announcement",
    expiresAt: "",
  });

  const handlePost = () => {
    // UPDATED: Inline validation instead of window.alert
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide both a title and content for the notice.");
      return;
    }

    const newNotice = {
      ...formData,
      id: `notice-${Date.now()}`,
      postedBy: currentUser.name,
      postedAt: new Date().toLocaleString(),
    };

    setNotices([newNotice, ...notices]);
    setIsModalOpen(false);
    setError(null); // Clear error on success
    setFormData({
      title: "",
      content: "",
      category: "announcement",
      expiresAt: "",
    });
  };

  const deleteNotice = (id: string) => {
    {
      setNotices(notices.filter((n) => n.id !== id));
    }
  };

  // Helper to close modal and reset error
  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Noticeboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">
              Important announcements and updates
            </p>
            <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium">
              Apr 1, 2025
            </span>
            <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium">
              9:41 AM
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a5276] text-white rounded-xl text-sm font-bold hover:bg-[#154360] transition-all shadow-md"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Post Notice
        </button>
      </div>

      <div className="max-w-4xl space-y-4">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice as Notice}
            isAdmin={
              currentUser.role === "admin" ||
              notice.postedBy === currentUser.name
            }
            onDelete={deleteNotice}
          />
        ))}
      </div>

      <Modal
        title="Post New Notice"
        isOpen={isModalOpen}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePost}
              className="px-6 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              Post Notice
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* NEW: Inline Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <InputField
            label="Notice Title"
            placeholder="e.g., Ward A Maintenance"
            value={formData.title}
            onChange={(v) => {
              setFormData({ ...formData, title: v });
              if (error) setError(null); // Clear error while typing
            }}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={formData.category}
              onChange={(v) => setFormData({ ...formData, category: v })}
              options={[
                { label: "Announcement", value: "announcement" },
                { label: "Urgent", value: "urgent" },
                { label: "Policy", value: "policy" },
                { label: "Event", value: "event" },
              ]}
            />
            <InputField
              label="Expiry Date (Optional)"
              type="date"
              value={formData.expiresAt}
              onChange={(v) => setFormData({ ...formData, expiresAt: v })}
            />
          </div>
          <InputField
            label="Notice Content"
            placeholder="Describe the update in detail..."
            multiline
            rows={5}
            value={formData.content}
            onChange={(v) => {
              setFormData({ ...formData, content: v });
              if (error) setError(null); // Clear error while typing
            }}
            required
          />
        </div>
      </Modal>
    </>
  );
}
