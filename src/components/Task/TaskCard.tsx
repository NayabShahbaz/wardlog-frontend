import React from "react";
import { Badge } from "../ui";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  type: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
}

// Strictly align with Badge.tsx variants
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
  pending: "orange",
  "in-progress": "blue",
  completed: "green", // Maps to your brand blue #1a5276
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 leading-tight">{task.title}</h3>
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

      <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-2">
        {/* Uses the blue-outlined style defined in your Badge component */}
        <Badge text={task.type} variant="outline" />
        <Badge text={task.status} variant={statusMap[task.status]} />
      </div>
    </div>
  );
};

export default TaskCard;
