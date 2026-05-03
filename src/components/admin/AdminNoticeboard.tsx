import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";
import { apiFetch } from "../../utils/api";
import { HiOutlinePlus, HiOutlineMegaphone } from "react-icons/hi2";
import { Modal, InputField, SelectField } from "../ui";
import NoticeCard from "../ui/NoticeCard";
import type { Notice } from "../ui/NoticeCard";

const categoryOptions = [
  { label: "System", value: "System" },
  { label: "Policy", value: "Policy" },
  { label: "General", value: "General" },
  { label: "HR", value: "HR" },
  { label: "Emergency", value: "Emergency" },
];

const priorityOptions = [
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

interface BackendNotice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author?: { _id: string; name: string } | string;
  createdAt?: string;
}

const toNotice = (n: BackendNotice): Notice => ({
  id: n._id,
  title: n.title,
  content: n.content,
  category: n.category,
  priority: n.priority.toLowerCase(),
  author:
    typeof n.author === "object" && n.author?.name
      ? n.author.name
      : typeof n.author === "string"
        ? n.author
        : "Admin",
  date: n.createdAt
    ? new Date(n.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString(),
});

const AdminNoticeboard = () => {
  const { userName } = useOutletContext<UserContextType>();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    priority: "Medium",
  });

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchNotices = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notices");
      const data = await res.json();
      if (data.success) setNotices(data.data.map(toNotice));
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ── Create ────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.category
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const res = await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          category: formData.category,
          priority: formData.priority,
          author: userName || "Admin", // Explicitly sent to match Member 2's model
          date: new Date().toISOString(), // Standardized ISO format
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.message || "Failed to post notice.");
        return;
      }

      await fetchNotices();
      closeModal();
    } catch (err) {
      console.error("Error posting notice:", err);
      setError("Server error. Please try again.");
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  // Optimized handleDelete for AdminNoticeboard_6.tsx
const handleDelete = async (id: string) => {
  try {
    const res = await apiFetch(`/api/notices/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (res.ok && result.success) {
      // Functional state update is safer for concurrent actions
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } else {
      console.error("Delete failed:", result.message);
    }
  } catch (err) {
    console.error("Error deleting notice:", err);
  }
};

  const closeModal = () => {
    setCreateOpen(false);
    setError("");
    setFormData({
      title: "",
      content: "",
      category: "",
      priority: "Medium",
    });
  };

  void userName;

  if (loading) return <div className="p-8 text-center">Loading notices...</div>;

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
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              showDelete
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 text-sm text-gray-400">
            No notices posted
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title="Create Notice"
        isOpen={createOpen}
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
