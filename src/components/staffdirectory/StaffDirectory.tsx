import { useState } from "react";
import { SearchBar } from "../ui";
import StaffGroup from "./StaffGroup";
import { type StaffMember } from "./StaffCard";

// ── Consistent dummy data used across the app ───────────────────────
const allStaff: StaffMember[] = [
  {
    id: "staff-1",
    name: "Dr. Sarah Johnson",
    role: "Doctor",
    specialty: "Internal Medicine",
    department: "General Medicine",
    phone: "555-0101",
    email: "sarah.johnson@hospital.com",
  },
  {
    id: "staff-2",
    name: "Dr. Michael John",
    role: "Doctor",
    specialty: "Internal Medicine",
    department: "General Medicine",
    phone: "555-0102",
    email: "michael.john@hospital.com",
  },
  {
    id: "staff-3",
    name: "Emily Chen",
    role: "Nurse",
    department: "Ward A",
    phone: "555-0201",
    email: "emily.chen@hospital.com",
  },
  {
    id: "staff-4",
    name: "Jessica Wilson",
    role: "Nurse",
    department: "Ward B",
    phone: "555-0202",
    email: "jessica.wilson@hospital.com",
  },
  {
    id: "staff-5",
    name: "Michael Brown",
    role: "Nurse",
    department: "Ward C",
    phone: "555-0203",
    email: "michael.brown@hospital.com",
  },
  {
    id: "staff-6",
    name: "James Wilson",
    role: "Nurse",
    department: "Ward B",
    phone: "555-0204",
    email: "james.wilson@hospital.com",
  },
  {
    id: "staff-7",
    name: "Robert Davis",
    role: "Admin",
    department: "Administration",
    phone: "555-0301",
    email: "robert.davis@hospital.com",
  },
  {
    id: "staff-8",
    name: "Linda Martinez",
    role: "Admin",
    department: "Administration",
    phone: "555-0302",
    email: "linda.martinez@hospital.com",
  },
];

const roleOrder = ["Doctors", "Nurses", "Admin"];

const StaffDirectory = () => {
  const [search, setSearch] = useState("");

  const filtered = allStaff.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      (s.specialty && s.specialty.toLowerCase().includes(q))
    );
  });

  // Group by role
  const grouped: Record<string, StaffMember[]> = {};
  filtered.forEach((s) => {
    const groupName =
      s.role === "Doctor" ? "Doctors" : s.role === "Nurse" ? "Nurses" : "Admin";
    if (!grouped[groupName]) grouped[groupName] = [];
    grouped[groupName].push(s);
  });

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
