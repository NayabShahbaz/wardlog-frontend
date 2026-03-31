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
  category: "urgent" | "announcement" | "policy" | "event";
  postedBy: string;
  postedAt: string;
  expiresAt?: string;
  content: string;
}

interface NoticeCardProps {
  notice: Notice;
  isAdmin?: boolean;
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

const categoryVariants: Record<Notice["category"], BadgeVariant> = {
  urgent: "red",
  announcement: "blue",
  policy: "dark",
  event: "orange",
};

const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  isAdmin,
  onDelete,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const isUrgent = notice.category === "urgent";
  const badgeVariant: BadgeVariant = categoryVariants[notice.category];

  return (
    <div
      className={`bg-white rounded-2xl p-6 transition-all border ${
        isUrgent ? "border-red-200 shadow-sm shadow-red-50" : "border-gray-100"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
          <Badge text={notice.category} variant={badgeVariant} />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            {!isConfirming ? (
              <button
                onClick={() => setIsConfirming(true)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete notice"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] font-bold text-red-500 uppercase mr-1">
                  Delete?
                </p>
                <button
                  onClick={() => onDelete?.(notice.id)}
                  className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="p-1.5 bg-gray-100 text-gray-500 rounded-md hover:bg-gray-200"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-500 font-medium">
          Posted by {notice.postedBy} - {notice.postedAt}
        </p>
        {notice.expiresAt && (
          <p className="text-xs text-gray-400">Expires: {notice.expiresAt}</p>
        )}
      </div>

      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
        {notice.content}
      </p>
    </div>
  );
};

export default NoticeCard;
