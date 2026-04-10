import { Badge } from "../ui";
import {
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineXMark,
} from "react-icons/hi2";
import React, { useState } from "react";

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  date: string;
  priority: string;
  expiresAt?: string;
}

interface NoticeCardProps {
  notice: Notice;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

type BadgeVariant =
  | "red"
  | "green"
  | "blue"
  | "orange"
  | "gray"
  | "dark"
  | "outline";

const categoryVariant = (cat: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    System: "blue",
    Policy: "dark",
    General: "outline",
    HR: "green",
    Emergency: "red",
  };
  return map[cat] ?? "outline";
};

const priorityVariant = (p: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    high: "red",
    medium: "orange",
    low: "gray",
  };
  return map[p] ?? "gray";
};

const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  showDelete = false,
  onDelete,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <div
      className="bg-white rounded-xl p-5"
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-3">
          <h3 className="text-base font-bold text-gray-900">{notice.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {notice.author} • {notice.date}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            text={notice.category}
            variant={categoryVariant(notice.category)}
          />
          {notice.priority && (
            <Badge
              text={notice.priority}
              variant={priorityVariant(notice.priority)}
            />
          )}

          {showDelete && onDelete && (
            <>
              {!isConfirming ? (
                <button
                  onClick={() => setIsConfirming(true)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <p className="text-[10px] font-bold text-red-500 uppercase mr-1">
                    Delete?
                  </p>
                  <button
                    onClick={() => {
                      onDelete(notice.id);
                      setIsConfirming(false);
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
                  >
                    <HiOutlineCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsConfirming(false)}
                    className="p-1.5 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200"
                  >
                    <HiOutlineXMark className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-600 leading-relaxed">{notice.content}</p>

      {/* Expiry */}
      {notice.expiresAt && (
        <p className="text-xs text-gray-400 mt-3">
          Expires: {notice.expiresAt}
        </p>
      )}
    </div>
  );
};

export default NoticeCard;
