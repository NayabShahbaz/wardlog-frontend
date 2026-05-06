import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { type UserContextType } from "../layout/DoctorLayout";

import { Tabs, Modal, InputField, SelectField, StatCard } from "../ui";
import {
  HiOutlinePlus,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineClipboard,
} from "react-icons/hi2";
import TaskCard, { type Task } from "./TaskCard";
import { apiFetch } from "../../utils/api"; 

type TaskPriority = "high" | "medium" | "low";

export default function TaskPage() {
  const [tasks, setTasks] = useState<any[]>([]); 
  const [staffOptions, setStaffOptions] = useState<{ label: string; value: string }[]>([]);
  
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const { userName, userRole } = useOutletContext<UserContextType>();
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

  const fetchTasks = async () => {
    try {
      const res = await apiFetch("/api/tasks");
      const result = await res.json();
      if (result.success) {
        const formattedTasks = result.data.map((t: any) => ({
          ...t,
          id: t._id,
          // DEFENSIVE FIX: Forces status to lowercase in case backend sends "Completed"
          status: t.status ? t.status.toLowerCase() : "pending", 
          assignedTo: t.assignedTo?.name || t.assignedTo,
          _rawAssignedToId: t.assignedTo?._id || t.assignedTo,
        }));
        setTasks(formattedTasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await apiFetch("/api/staff");
      const result = await res.json();
      if (result.success) {
        setStaffOptions(result.data.map((s: any) => ({
          label: `${s.name} (${s.role})`,
          value: s._id
        })));
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (!isNurse) fetchStaff(); 
  }, [isNurse]);

  const myNurseTasks = tasks.filter((t) => t.assignedTo === userName);
  const todoNurseTasks = myNurseTasks.filter((t) => t.status !== "completed");

  const taskTabs = isNurse
    ? [
        { label: "My Tasks", count: myNurseTasks.length },
        { label: "To-Do", count: todoNurseTasks.length },
      ]
    : [
        {
          label: "My Tasks",
          count: tasks.filter((t) => t.assignedTo === userName).length,
        },
        {
          label: "I Assigned",
          count: tasks.filter((t) => t.assignedTo !== userName).length,
        },
        { label: "All Tasks", count: tasks.length },
      ];

  const getFilteredTasks = () => {
    if (isNurse) {
      return activeTabIndex === 0 ? myNurseTasks : todoNurseTasks;
    }
    if (activeTabIndex === 0)
      return tasks.filter((t) => t.assignedTo === userName);
    if (activeTabIndex === 1)
      return tasks.filter((t) => t.assignedTo !== userName);
    return tasks;
  };

  const filtered = getFilteredTasks();

  // ── FIX: Complete Task with Alerts ──
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await apiFetch(`/api/tasks/${taskId}/complete`, { method: "PUT" });
      if (res.ok) {
        await fetchTasks();
      } else {
        // If the button "isn't working", this alert will now tell you why the backend rejected it
        const data = await res.json();
        alert(`Failed to complete task: ${data.message || "Backend Error"}`);
      }
    } catch (err) {
      console.error("Error completing task:", err);
      alert("Network error. Server could not be reached.");
    }
  };

  const handleDeleteTask = async () => {
    if (deleteConfirm) {
      try {
        const res = await apiFetch(`/api/tasks/${deleteConfirm}`, { method: "DELETE" });
        if (res.ok) {
          await fetchTasks();
          setDeleteConfirm(null);
        }
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      assignedTo: task._rawAssignedToId || task.assignedTo,
      type: task.type,
      priority: task.priority,
      content: task.description, 
    });
    setIsModalOpen(true);
  };

  const handleCreateTask = async () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.assignedTo || !formData.type) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify({
          title: formData.title,
          description: formData.content, 
          assignedTo: formData.assignedTo,
          type: formData.type,
          priority: formData.priority,
        }),
      });

      if (res.ok) {
        await fetchTasks();
        setIsModalOpen(false);
        setEditingTask(null);
        setError(null);
        setFormData({ title: "", assignedTo: "", type: "", priority: "medium", content: "" });
      } else {
        const result = await res.json();
        setError(result.message || "Failed to save task.");
      }
    } catch (err) {
      setError("Server error while saving task.");
    }
  };

  const statSource = isNurse ? myNurseTasks : tasks;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-gray-500">
              Create, assign and track tasks
            </span>
          </div>
        </div>

        {!isNurse && (
          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({ title: "", assignedTo: "", type: "", priority: "medium", content: "" });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1a5276] text-white rounded-lg text-sm font-semibold hover:bg-[#154360] active:scale-[0.98] transition-all shadow-sm w-full sm:w-auto"
          >
            <HiOutlinePlus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Pending"
          value={statSource.filter((t) => t.status === "pending").length}
          sub="Requires attention"
          icon={HiOutlineClipboard}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          label="In Progress"
          value={statSource.filter((t) => t.status === "pending").length}
          sub="Currently active"
          icon={HiOutlineClock}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <StatCard
            label="Completed"
            value={statSource.filter((t) => t.status === "completed").length}
            sub="Tasks finished"
            icon={HiOutlineCheckCircle}
            color="bg-green-50"
            iconColor="text-green-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <Tabs
          tabs={taskTabs}
          activeIndex={activeTabIndex}
          onChange={setActiveTabIndex}
        />
      </div>

     <div className="grid grid-cols-1 gap-4">
        {filtered.length > 0 ? (
          filtered.map((task) => {
            const isOwn = task.assignedTo === currentUser.name;
            
            // THE FIX:
            // 1. If user is a Nurse, they can NEVER manage (edit/delete).
            // 2. If user is a Doctor, they can manage EXCEPT on the "All Tasks" tab (index 2).
            const manage = !isNurse && !isOwn; 

            return (
              <TaskCard
                key={task.id}
                task={task}
                isOwnTask={isOwn}
                canManage={manage}
                onComplete={handleCompleteTask}
                onDelete={() => setDeleteConfirm(task.id)}
                onEdit={() => handleEditTask(task)}
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl py-16 border border-gray-100 text-center shadow-sm">
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
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="order-2 sm:order-1 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="order-1 sm:order-2 px-5 py-2 text-sm font-medium text-white bg-[#1a5276] rounded-lg hover:bg-[#154360]"
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
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
              options={staffOptions} 
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  setFormData({ ...formData, priority: v as TaskPriority })
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

      <Modal
        title="Delete Task"
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTask}
              className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}