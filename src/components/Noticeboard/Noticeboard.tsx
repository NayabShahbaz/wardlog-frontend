import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";
import { apiFetch } from "../../utils/api";

import { Modal, InputField, SelectField } from "../ui";
import NoticeCard from "../ui/NoticeCard";
import type { Notice } from "../ui/NoticeCard";
import { HiOutlinePlus, HiOutlineMegaphone } from "react-icons/hi2";

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

// Backend notice shape
interface BackendNotice {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author?: { _id: string; name: string } | string;
  createdAt?: string;
  expiresAt?: string;
}

// Transform backend notice to the shape NoticeCard expects
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
        : "Unknown",
  date: n.createdAt
    ? new Date(n.createdAt).toLocaleDateString()
    : new Date().toLocaleDateString(),
  expiresAt: n.expiresAt
    ? new Date(n.expiresAt).toLocaleDateString()
    : undefined,
});

export default function NoticeboardPage() {
  const { userId, userName, userRole } = useOutletContext<UserContextType>();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === "Admin";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "Medium",
    expiresAt: "",
  });

  // ── Fetch Notices ─────────────────────────────────────────────
  const fetchNotices = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notices");
      const data = await res.json();
      if (data.success) {
        setNotices(data.data.map(toNotice));
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // ── Create Notice ─────────────────────────────────────────────
  const handlePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide both a title and content for the notice.");
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
      };

      if (formData.expiresAt) {
        payload.expiresAt = formData.expiresAt;
      }

      const res = await apiFetch("/api/notices", {
        method: "POST",
        body: JSON.stringify(payload),
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

  // ── Delete Notice ─────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/notices/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchNotices();
      } else {
        console.error("Delete failed:", result.message);
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setFormData({
      title: "",
      content: "",
      category: "General",
      priority: "Medium",
      expiresAt: "",
    });
  };

  // Keep userId reference alive for future use
  void userId;

  if (loading) return <div className="p-8 text-center">Loading notices...</div>;

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

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <HiOutlinePlus className="w-4 h-4" /> Post Notice
          </button>
        )}
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              showDelete={isAdmin || notice.author === userName}
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
