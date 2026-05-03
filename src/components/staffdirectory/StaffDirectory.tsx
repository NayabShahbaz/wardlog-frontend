import { useState, useEffect } from "react";
import { SearchBar } from "../ui";
import StaffGroup from "./StaffGroup";
import { type StaffMember } from "./StaffCard";
import { apiFetch } from "../../utils/api";

const roleOrder = ["Doctors", "Nurses", "Admin"];

const StaffDirectory = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ── Member 2: Fetch Staff (Ward Coordination Responsibility) ────
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/api/staff");
        const result = await res.json();
        if (res.ok && result.success) {
          setStaff(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch staff directory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  });

  // Group by role according to Member 2's schema[cite: 17, 20]
  const grouped: Record<string, StaffMember[]> = {};
  filtered.forEach((s) => {
    const groupName =
      s.role === "Doctor" ? "Doctors" : s.role === "Nurse" ? "Nurses" : "Admin";
    if (!grouped[groupName]) grouped[groupName] = [];
    grouped[groupName].push(s);
  });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm text-gray-500">
            Contact information for all hospital staff
          </span>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search staff by name, role, department, or specialty ..."
      />

      {/* Staff Groups */}
      {roleOrder.map((roleName) =>
        grouped[roleName] && grouped[roleName].length > 0 ? (
          <StaffGroup
            key={roleName}
            role={roleName}
            members={grouped[roleName]}
          />
        ) : null,
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-gray-400">
          No staff found matching your search
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;