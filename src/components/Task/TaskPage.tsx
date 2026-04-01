import { useState } from "react";
import { useOutletContext } from "react-router-dom"; 
import { type UserContextType } from "../layout/DoctorLayout";

import {
  Tabs,
  Modal,
  InputField,
  SelectField,
  WelcomeHeader,
  StatCard,
} from "../ui";
import {
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineClipboard,
} from "react-icons/hi2";
import TaskCard, { type Task } from "./TaskCard";

type TaskPriority = "high" | "medium" | "low";



const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Administer morning medications",
    description: "Administer scheduled morning medications to Ward A patients",
    assignedTo: "Nurse Jane Doe",
    type: "Medication",
    priority: "high",
    status: "completed",
  },
  {
    id: "2",
    title: "Review lab results for Patient 1",
    description: "Check CBC and CMP results from morning blood draw",
    assignedTo: "Dr. Sarah Johnson",
    type: "Clinical",
    priority: "high",
    status: "pending",
  },
  {
    id: "3",
    title: "Update discharge summary",
    description: "Complete discharge documentation for MRN001236",
    assignedTo: "Dr. Sarah Johnson",
    type: "Administrative",
    priority: "medium",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Administer evening medications",
    description: "Administer scheduled evening medications to Ward B patients",
    assignedTo: "Nurse Jane Doe",
    type: "Medication",
    priority: "medium",
    status: "pending",
  },

  
];

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userName, userRole } = useOutletContext<UserContextType>(); // 1. Get context
  const isNurse = userRole === "Nurse";

  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    type: "",
    priority: "medium" as TaskPriority,
    content: "",
  });

  const currentUser = {
    name: userName,
    role: userRole,
    department: isNurse ? "Nursing" : "General Medicine",
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as const } : t,
      ),
    );
  };

 // This replaces both the original constant and the .push() logic
  const taskTabs = [
    {
      label: "My Tasks",
      count: tasks.filter((t) => t.assignedTo === userName).length,
    },
    // The spread operator (...) handles the conditional logic cleanly without .push()
    ...(!isNurse ? [{
      label: "I Assigned",
      count: tasks.filter((t) => t.assignedTo !== userName).length,
    }] : []),
    {
      label: "All Tasks",
      count: tasks.length,
    },
  ];


  const getFilteredTasks = () => {
    // Tab 0 is always "My Tasks"
    if (activeTabIndex === 0) {
      return tasks.filter((t) => t.assignedTo === currentUser.name);
    }

    if (isNurse) {
      // For Nurses: Tab 1 is "All Tasks"
      if (activeTabIndex === 1) return tasks;
    } else {
      // For Doctors: Tab 1 is "I Assigned", Tab 2 is "All Tasks"
      if (activeTabIndex === 1) {
        return tasks.filter((t) => t.assignedTo !== currentUser.name);
      }
      if (activeTabIndex === 2) return tasks;
    }

    return tasks;
  };

  const handleCreateTask = () => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.assignedTo ||
      !formData.type
    ) {
      setError("Please fill in all required fields marked with *");
      return;
    }

   if (editingTask) {
    // UPDATE LOGIC: Map through tasks and replace the one that matches the ID
    setTasks(tasks.map(t => 
      t.id === editingTask.id 
        ? { ...t, 
            title: formData.title, 
            description: formData.content, 
            assignedTo: formData.assignedTo, 
            type: formData.type, 
            priority: formData.priority 
          } 
        : t
    ));
  } else {
    // CREATE LOGIC: Add a brand new task to the list
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: formData.title,
      description: formData.content,
      assignedTo: formData.assignedTo,
      type: formData.type,
      priority: formData.priority,
      status: "pending",
    };
    setTasks([newTask, ...tasks]);
  }

    setIsModalOpen(false);
    setEditingTask(null); 
    setError(null);
    setFormData({
      title: "",
      assignedTo: "",
      type: "",
      priority: "medium",
      content: "",
    });
  };

  const filtered = getFilteredTasks();

  // 1. Delete a task permanently
const handleDeleteTask = (taskId: string) => {
  setTasks(prev => prev.filter(t => t.id !== taskId));
};

// 2. Setup state for editing
const [editingTask, setEditingTask] = useState<Task | null>(null);

const handleEditTask = (task: Task) => {
  setEditingTask(task);
  setFormData({
    title: task.title,
    assignedTo: task.assignedTo,
    type: task.type,
    priority: task.priority,
    content: task.description,
  });
  setIsModalOpen(true);
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <WelcomeHeader
          name={currentUser.name}
          department={currentUser.department}
          date="Apr 1, 2025"
          time="9:41 AM"
        />

        {!isNurse && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a5276] text-white rounded-xl text-sm font-bold hover:bg-[#154360] transition-all shadow-md"
          >
            <HiOutlinePlus className="w-5 h-5" /> Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Pending"
          value={tasks.filter((t) => t.status === "pending").length}
          sub="Requires attention"
          icon={HiOutlineClipboard}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          label="In Progress"
          value={tasks.filter((t) => t.status === "in-progress").length}
          sub="Currently active"
          icon={HiOutlineClock}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Completed"
          value={tasks.filter((t) => t.status === "completed").length}
          sub="Tasks finished"
          icon={HiOutlineCheckCircle}
          color="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      <Tabs
        tabs={taskTabs}
        activeIndex={activeTabIndex}
        onChange={setActiveTabIndex}
      />

      <div className="grid grid-cols-1 gap-4">
        {filtered.length > 0 ? (
          filtered.map((task) => {
            // Determine if the currently selected tab is the "All Tasks" tab
            const isAllTasksTab = isNurse ? activeTabIndex === 1 : activeTabIndex === 2;

            return (
              <TaskCard
                key={task.id}
                task={task}
                // isOwnTask is only true if we are NOT in the "All Tasks" tab
                isOwnTask={!isAllTasksTab && task.assignedTo === currentUser.name}
                onComplete={handleCompleteTask}
                onDelete={() => handleDeleteTask(task.id)}
                onEdit={() => handleEditTask(task)}
                // canManage is only true if NOT in "All Tasks" and current user is a Doctor who assigned it
                canManage={!isAllTasksTab && !isNurse && task.assignedTo !== currentUser.name}
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl py-20 border border-gray-100 text-center shadow-sm">
            <HiOutlineClipboard className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No tasks found</p>
          </div>
        )}
      </div>
      {!isNurse && (
        <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setError(null);
        }}
        title={editingTask ? "Edit Task" : "Create Task"}
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTask}
              className="px-6 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-bold shadow-sm"
            >
              {editingTask ? "Save Changes" : "Create Task"}
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
            label="Title"
            value={formData.title}
            onChange={(v) => {
              setFormData({ ...formData, title: v });
              setError(null);
            }}
            required
          />

          <SelectField
            label="Assigned To"
            value={formData.assignedTo}
            placeholder="Select staff member..."
            onChange={(v) => {
              setFormData({ ...formData, assignedTo: v });
              setError(null);
            }}
            required
            options={[
              { label: "Emily Chen (Nurse)", value: "Emily Chen" },
              { label: "James Wilson (Staff)", value: "James Wilson" },
              {
                label: "Dr. Sarah Johnson (Doctor)",
                value: "Dr. Sarah Johnson",
              },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Type"
              value={formData.type}
              placeholder="Select type..."
              onChange={(v) => {
                setFormData({ ...formData, type: v });
                setError(null);
              }}
              required
              options={[
                { label: "Medication", value: "Medication" },
                { label: "Clinical", value: "Clinical" },
                { label: "Administrative", value: "Administrative" },
                { label: "Observation", value: "Observation" },
              ]}
            />
            <SelectField
              label="Priority"
              value={formData.priority}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  priority: v as "high" | "medium" | "low",
                })
              }
              required
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
            />
          </div>

          <InputField
            label="Content"
            multiline
            rows={4}
            value={formData.content}
            onChange={(v) => {
              setFormData({ ...formData, content: v });
              setError(null);
            }}
            required
          />
        </div>
      </Modal>
      )}
    </div>
  );
}
