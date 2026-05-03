import { useState, useEffect } from "react";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { SectionCard, InputField, SelectField } from "../ui";
import { apiFetch } from "../../utils/api"; // Added apiFetch utility

const AdminSettings = () => {
  const [hospitalName, setHospitalName] = useState("WardLog General Hospital");
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxPatients, setMaxPatients] = useState("200");
  const [backupFreq, setBackupFreq] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // ── Data Fetching (Member 2 Responsibility)  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiFetch("/api/admin/settings"); // Target Member 2 API
        const result = await res.json();
        if (res.ok && result.success) {
          const { data } = result;
          setHospitalName(data.hospitalName || "");
          setTimezone(data.timezone || "Asia/Karachi");
          setSessionTimeout(data.sessionTimeout?.toString() || "30");
          setMaxPatients(data.maxPatients?.toString() || "200");
          setBackupFreq(data.backupFreq || "daily");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ── Save Logic (Member 2 Responsibility) ──────────────────────
  const handleSave = async () => {
    try {
      const payload = {
        hospitalName,
        timezone,
        sessionTimeout: parseInt(sessionTimeout),
        maxPatients: parseInt(maxPatients),
        backupFreq,
      };

      const res = await apiFetch("/api/admin/settings", {
        method: "PUT", // Member 2 implementation for updates
        body: JSON.stringify(payload),
      });

      if (res.ok) {
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
      <div>
        <div className="flex items-center gap-2">
          <HiOutlineCog6Tooth className="w-6 h-6 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Configure hospital system preferences
        </p>
      </div>

      {saved && (
        <div
          className="text-sm text-green-700 bg-green-50 px-4 py-2.5 rounded-lg border border-green-200"
        >
          Settings saved successfully
        </div>
      )}

      <SectionCard title="General" icon={HiOutlineCog6Tooth}>
        <div className="space-y-4">
          <InputField
            label="Hospital Name"
            value={hospitalName}
            onChange={setHospitalName}
            placeholder="Hospital name"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Timezone"
              value={timezone}
              onChange={setTimezone}
              options={[
                { label: "Asia/Karachi (PKT)", value: "Asia/Karachi" },
                { label: "America/New_York (EST)", value: "America/New_York" },
                { label: "Europe/London (GMT)", value: "Europe/London" },
                { label: "Asia/Dubai (GST)", value: "Asia/Dubai" },
              ]}
            />
            <InputField
              label="Session Timeout (minutes)"
              value={sessionTimeout}
              onChange={setSessionTimeout}
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
            value={maxPatients}
            onChange={setMaxPatients}
            type="number"
            placeholder="200"
          />
          <SelectField
            label="Backup Frequency"
            value={backupFreq}
            onChange={setBackupFreq}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
            ]}
          />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#1a5276] hover:bg-[#154360] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;