import React from "react";
import { Badge } from "../ui";
import {
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  type: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
}

type BadgeVariant =
  | "red"
  | "green"
  | "blue"
  | "orange"
  | "gray"
  | "dark"
  | "outline";

const priorityMap: Record<Task["priority"], BadgeVariant> = {
  high: "dark",
  medium: "orange",
  low: "gray",
};

const statusMap: Record<Task["status"], BadgeVariant> = {
  pending: "outline",
  completed: "green",
};

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  isOwnTask?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  canManage?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  isOwnTask,
  onDelete,
  onEdit,
  canManage,
}) => {
  const canComplete = isOwnTask && task.status !== "completed" && onComplete;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="font-bold text-gray-900 leading-tight flex-1">{task.title}</h3>
        <Badge text={task.priority} variant={priorityMap[task.priority]} />
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {task.description}
      </p>

      <div className="flex flex-col gap-1 mb-4">
        <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
          Assigned to: {task.assignedTo}
        </span>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-3 border-t border-gray-50 pt-4 mt-2">
        <div className="flex items-center gap-2">
          <Badge text={task.type} variant="outline" />
          <Badge text={task.status} variant={statusMap[task.status]} />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end ">
          {/* Mark Complete - own tasks that aren't done */}
          {canComplete && (
            <button
              onClick={() => onComplete(task.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#bbf7d0",
              }}
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              Mark Complete
            </button>
          )}

          {/* Delete - own completed tasks */}
          {task.status === "completed" && isOwnTask && onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#fecaca",
              }}
            >
              <HiOutlineTrash className="w-4 h-4" />
              Delete Task
            </button>
          )}

          {/* Edit & Delete - doctor managing assigned tasks */}
          {canManage && (
            <>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a5276] bg-[#e8f0f6] rounded-lg hover:bg-[#d6e8ee] transition-colors"
                  style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#bdd5e7",
                  }}
                >
                  <HiOutlinePencilSquare className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#fecaca",
                  }}
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
