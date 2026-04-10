import { useState } from "react";
import { HiOutlinePlus, HiOutlineMegaphone } from "react-icons/hi2";
import { Modal, InputField, SelectField } from "../ui";
import NoticeCard from "../ui/NoticeCard";
import type { Notice } from "../ui/NoticeCard";

const initialNotices: Notice[] = [
  {
    id: "n1",
    title: "System Maintenance Scheduled",
    content:
      "The hospital management system will undergo scheduled maintenance on March 15, 2026 from 2:00 AM to 4:00 AM. Please save all work before this time.",
    category: "System",
    author: "Admin",
    date: "3/10/2026",
    priority: "high",
  },
  {
    id: "n2",
    title: "New COVID-19 Protocol Update",
    content:
      "Updated COVID-19 screening protocols are now in effect. All staff must review the new guidelines available in the shared drive. Masks are mandatory in all patient areas.",
    category: "Policy",
    author: "Admin",
    date: "3/09/2026",
    priority: "high",
  },
  {
    id: "n3",
    title: "Staff Meeting - March 12",
    content:
      "Monthly all-hands staff meeting has been moved to 3:00 PM in the main auditorium. Attendance is mandatory for all department heads.",
    category: "General",
    author: "Admin",
    date: "3/08/2026",
    priority: "medium",
  },
  {
    id: "n4",
    title: "New Staff Onboarding",
    content:
      "Please welcome Dr. Michael John who has joined the General Medicine department. He will be available for consultations starting next week.",
    category: "HR",
    author: "Admin",
    date: "3/07/2026",
    priority: "low",
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

const AdminNoticeboard = () => {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    priority: "medium",
  });

  const handleCreate = () => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.category
    ) {
      setError("Please fill all required fields.");
      return;
    }
    const newNotice: Notice = {
      id: `n${Date.now()}`,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      author: "Admin",
      date: new Date().toLocaleDateString(),
      priority: formData.priority,
    };
    setNotices([newNotice, ...notices]);
    setFormData({ title: "", content: "", category: "", priority: "medium" });
    setCreateOpen(false);
    setError("");
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineMegaphone className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">Noticeboard</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage system-wide announcements
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
        >
          <HiOutlinePlus className="w-4 h-4" /> Create Notice
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            showDelete
            onDelete={handleDelete}
          />
        ))}

        {notices.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">
            No notices posted
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title="Create Notice"
        isOpen={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setError("");
        }}
        footer={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
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
            label="Title"
            value={formData.title}
            onChange={(v) => {
              setFormData({ ...formData, title: v });
              setError("");
            }}
            required
            placeholder="Notice title"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={formData.category}
              onChange={(v) => {
                setFormData({ ...formData, category: v });
                setError("");
              }}
              options={categoryOptions}
              placeholder="Select category"
              required
            />
            <SelectField
              label="Priority"
              value={formData.priority}
              onChange={(v) => setFormData({ ...formData, priority: v })}
              options={priorityOptions}
              placeholder="Select priority"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content<span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              placeholder="Write your announcement..."
              value={formData.content}
              onChange={(e) => {
                setFormData({ ...formData, content: e.target.value });
                setError("");
              }}
              rows={4}
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#d1d5db",
              }}
              className="w-full px-3 py-2.5 rounded-lg text-sm placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:bg-white resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminNoticeboard;
