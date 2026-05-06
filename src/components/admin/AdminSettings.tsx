import { useState, useEffect } from "react";
import { HiOutlineCog6Tooth, HiOutlineShieldCheck } from "react-icons/hi2";
import { SectionCard, InputField, SelectField } from "../ui";
import { apiFetch } from "../../utils/api";

const AdminSettings = () => {
  // 1. New State Management for View vs Edit Mode
  const [settings, setSettings] = useState<any>(null); // Stores the saved DB state
  const [isEditing, setIsEditing] = useState(false); // Controls the view toggle
  const [formData, setFormData] = useState({
    hospitalName: "",
    timezone: "Asia/Karachi",
    sessionTimeout: "30",
    maxPatients: "200",
    backupFrequency: "Daily", // Fixed capitalization to match DB enum
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/api/admin/settings");
        const result = await res.json();
        if (res.ok && result.success) {
          const { data } = result;
          setSettings(data);
          // Pre-fill the form buffer
          setFormData({
            hospitalName: data.hospitalName || "",
            timezone: data.timezone || "Asia/Karachi",
            sessionTimeout: data.sessionTimeout?.toString() || "30",
            maxPatients: data.maxPatients?.toString() || "200",
            backupFrequency: data.backupFrequency || "Daily",
          });
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        hospitalName: formData.hospitalName,
        timezone: formData.timezone,
        sessionTimeout: parseInt(formData.sessionTimeout),
        maxPatients: parseInt(formData.maxPatients),
        backupFrequency: formData.backupFrequency,
      };

      const res = await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setSettings(result.data); // Update the read-only view with new data
        setIsEditing(false); // Close the form
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading system settings...</div>;

  return (
    <div className="space-y-6">
      {/* 2. Header with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineCog6Tooth className="w-6 h-6 text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Configure hospital system preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Edit Settings
          </button>
        )}
      </div>

      {saved && (
        <div className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg border border-green-200">
          Settings saved successfully
        </div>
      )}

      {/* 3. Conditional Rendering: Read-Only View vs Edit Form */}
      {!isEditing ? (
        <SectionCard title="Current Configurations" icon={HiOutlineShieldCheck}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 p-2">
            <div className="border-b border-gray-50 pb-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Hospital Name</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{settings?.hospitalName}</p>
            </div>
            <div className="border-b border-gray-50 pb-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Timezone</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{settings?.timezone}</p>
            </div>
            <div className="border-b border-gray-50 pb-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Session Timeout</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{settings?.sessionTimeout} minutes</p>
            </div>
            <div className="border-b border-gray-50 pb-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Max Patient Capacity</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{settings?.maxPatients} patients</p>
            </div>
            <div className="border-b border-gray-50 pb-2 md:col-span-2">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Backup Frequency</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{settings?.backupFrequency}</p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-6">
          <SectionCard title="General" icon={HiOutlineCog6Tooth}>
            <div className="space-y-4">
              <InputField
                label="Hospital Name"
                value={formData.hospitalName}
                onChange={(v) => setFormData({ ...formData, hospitalName: v })}
                placeholder="Hospital name"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(v) => setFormData({ ...formData, timezone: v })}
                  options={[
                    { label: "Asia/Karachi (PKT)", value: "Asia/Karachi" },
                    { label: "America/New_York (EST)", value: "America/New_York" },
                    { label: "Europe/London (GMT)", value: "Europe/London" },
                    { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
                  ]}
                />
                <InputField
                  label="Session Timeout (minutes)"
                  value={formData.sessionTimeout}
                  onChange={(v) => setFormData({ ...formData, sessionTimeout: v })}
                  type="number"
                  placeholder="30"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Capacity" icon={HiOutlineCog6Tooth}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Max Patients"
                value={formData.maxPatients}
                onChange={(v) => setFormData({ ...formData, maxPatients: v })}
                type="number"
                placeholder="200"
              />
              <SelectField
                label="Backup Frequency"
                value={formData.backupFrequency}
                onChange={(v) => setFormData({ ...formData, backupFrequency: v })}
                options={[
                  { label: "Daily", value: "Daily" },
                  { label: "Weekly", value: "Weekly" },
                  { label: "Monthly", value: "Monthly" },
                ]}
              />
            </div>
          </SectionCard>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                // Reset form back to saved settings if they cancel
                setFormData({
                  hospitalName: settings?.hospitalName || "",
                  timezone: settings?.timezone || "Asia/Karachi",
                  sessionTimeout: settings?.sessionTimeout?.toString() || "30",
                  maxPatients: settings?.maxPatients?.toString() || "200",
                  backupFrequency: settings?.backupFrequency || "Daily",
                });
                setIsEditing(false);
              }}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;