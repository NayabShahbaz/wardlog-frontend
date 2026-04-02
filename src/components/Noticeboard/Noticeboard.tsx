import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";

import { NoticeCard, Modal, InputField, SelectField } from "../ui";
import { HiOutlinePlus } from "react-icons/hi2";
import type { Notice } from "../ui/NoticeCard";

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
  const { userName, userRole } = useOutletContext<UserContextType>();
  const [notices, setNotices] = useState(MOCK_NOTICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUser = { name: userName, role: userRole.toLowerCase() };

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "announcement",
    expiresAt: "",
  });

  // ── Handlers ───────────────────────────────────────────────────
  const handlePost = () => {
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
    closeModal();
    setFormData({
      title: "",
      content: "",
      category: "announcement",
      expiresAt: "",
    });
  };

  const deleteNotice = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-0">
      {/* ── Header: Responsive Alignment ────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            Noticeboard
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm text-gray-500">
              Important announcements and updates
            </p>
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium">
                Apr 1, 2026
              </span>
              <span className="bg-gray-200 px-2 py-0.5 rounded text-[10px] text-gray-500 font-medium">
                11:41 AM
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a5276] text-white rounded-xl text-sm font-bold hover:bg-[#154360] active:scale-[0.98] transition-all shadow-md w-full sm:w-auto"
        >
          <HiOutlinePlus className="w-5 h-5" />
          <span>Post Notice</span>
        </button>
      </div>

      {/* ── Notice List ───────────────────────────────────────────── */}
      <div className="max-w-4xl space-y-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice as Notice}
              isAdmin={
                currentUser.role === "admin" ||
                notice.postedBy === currentUser.name
              }
              onDelete={deleteNotice}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl py-16 border border-gray-100 text-center shadow-sm">
            <p className="text-gray-400 font-medium">No notices at this time</p>
          </div>
        )}
      </div>

      {/* ── Modal: Optimized Form Layout ──────────────────────────── */}
      <Modal
        title="Post New Notice"
        isOpen={isModalOpen}
        onClose={closeModal}
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeModal}
              className="order-2 sm:order-1 px-6 py-2 text-sm font-bold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePost}
              className="order-1 sm:order-2 px-6 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform"
            >
              Post Notice
            </button>
          </div>
        }
      >
        <div className="space-y-4">
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
              if (error) setError(null);
            }}
            required
          />

          {/* Responsive Grid: Stacks on mobile, side-by-side on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              if (error) setError(null);
            }}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
