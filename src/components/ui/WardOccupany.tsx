import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineComputerDesktop, HiOutlineUsers } from "react-icons/hi2";
import { apiFetch } from "../../utils/api";

type BedStatus = "empty" | "stable" | "monitoring" | "critical";

interface Bed {
  number: number;
  status: BedStatus;
  patientName?: string;
  mrn?: string;
}

interface Ward {
  _id: string;
  name: string;
  totalBeds: number;
  beds: Bed[];
}
interface WardOccupancyProps {
  patients?: any[];
}

const statusConfig: Record<
  BedStatus,
  { bg: string; border: string; badge: string; badgeText: string; text: string }
> = {
  empty: {
    bg: "bg-white",
    border: "#e5e7eb",
    badge: "",
    badgeText: "",
    text: "text-gray-400",
  },
  stable: {
    bg: "bg-green-50",
    border: "#86efac",
    badge: "bg-green-500",
    badgeText: "text-white",
    text: "text-gray-700",
  },
  monitoring: {
    bg: "bg-yellow-50",
    border: "#fde047",
    badge: "bg-yellow-400",
    badgeText: "text-yellow-900",
    text: "text-gray-700",
  },
  critical: {
    bg: "bg-red-50",
    border: "#fca5a5",
    badge: "bg-red-500",
    badgeText: "text-white",
    text: "text-gray-700",
  },
};

const Legend = () => (
  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
    {(["empty", "stable", "monitoring", "critical"] as BedStatus[]).map((s) => (
      <div key={s} className="flex items-center gap-1.5">
        <div
          className={`w-3 h-3 rounded-sm ${s !== "empty" ? statusConfig[s].bg : ""}`}
          style={{
            borderWidth: "1.5px",
            borderStyle: "solid",
            borderColor: statusConfig[s].border,
            backgroundColor: s === "empty" ? "#fff" : undefined,
          }}
        />
        <span className="capitalize">{s}</span>
      </div>
    ))}
  </div>
);

const BedCell = ({ bed, onClick }: { bed: Bed; onClick?: () => void }) => {
  const config = statusConfig[bed.status];
  const isOccupied = bed.status !== "empty";

  return (
    <button
      type="button"
      onClick={isOccupied ? onClick : undefined}
      disabled={!isOccupied}
      className={`${config.bg} rounded-lg p-2 flex flex-col items-center justify-center text-center min-h-20 transition-all duration-150 ${
        isOccupied
          ? "cursor-pointer hover:scale-105 hover:shadow-md active:scale-95"
          : "cursor-default"
      }`}
      style={{
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: config.border,
      }}
    >
      <HiOutlineComputerDesktop
        className={`w-4 h-4 mb-1 ${isOccupied ? "text-gray-600" : "text-gray-300"}`}
      />
      <p className={`text-xs font-bold ${config.text}`}>{bed.number}</p>
      {isOccupied && bed.patientName ? (
        <>
          <p className="text-[10px] font-semibold text-gray-800 mt-0.5 leading-tight">
            {bed.patientName}
          </p>
          <span
            className={`${config.badge} ${config.badgeText} text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 capitalize`}
          >
            {bed.status}
          </span>
        </>
      ) : (
        <p className="text-[10px] text-gray-400 mt-0.5">Empty</p>
      )}
    </button>
  );
};

const WardOccupancy = ({ patients = [] }: WardOccupancyProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith("/nurse")
    ? "/nurse"
    : location.pathname.startsWith("/admin")
      ? "/admin"
      : "/doctor";

  const handleBedClick = (bed: Bed) => {
    if (bed.mrn) {
      navigate(`${basePath}/patients/${bed.mrn}`);
    }
  };

  // Dynamically generate the wards based on the patients prop
  const WARD_NAMES = ["Ward A", "Ward B", "Ward C"];
  const BEDS_PER_WARD = 10;

  const wards: Ward[] = WARD_NAMES.map((wardName) => {
    // Find patients assigned to this specific ward
    const wardPatients = patients.filter((p) => p.ward === wardName);

    // Generate 10 beds for the ward
    const beds: Bed[] = Array.from({ length: BEDS_PER_WARD }, (_, i) => {
      const bedNum = i + 1;
      
      const bedSuffix = bedNum < 10 ? `0${bedNum}` : `${bedNum}`;

      // Look for a patient whose bed number matches (e.g., "A-101" ends with "1")
      const patientInBed = wardPatients.find(
        (p) => p.bedNumber && p.bedNumber.trim().endsWith(bedSuffix)
      );

      if (patientInBed) {
        return {
          number: bedNum,
          status: patientInBed.condition?.toLowerCase() as BedStatus || "stable", // Default status for admitted patients
          patientName: `${patientInBed.firstName} ${patientInBed.lastName}`,
          mrn: patientInBed.mrn,
        };
      }

      return {
        number: bedNum,
        status: "empty",
      };
    });

    return {
      _id: wardName,
      name: wardName,
      totalBeds: BEDS_PER_WARD,
      beds,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineComputerDesktop className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-900">Ward Bed Map</h2>
      </div>

      <div className="space-y-8">
        {wards.map((ward) => {
          const occupied = ward.beds.filter((b) => b.status !== "empty").length;
          const pct = Math.round((occupied / ward.totalBeds) * 100);

          return (
            <div
              key={ward._id}
              className="rounded-xl p-4 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  {ward.name}
                </h3>
                <Legend />
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                {ward.beds.map((bed) => (
                  <BedCell
                    key={bed.number}
                    bed={bed}
                    onClick={() => handleBedClick(bed)}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <HiOutlineUsers className="w-4 h-4" />
                  <span>
                    Occupancy: {occupied}/{ward.totalBeds} beds
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {pct}% full
                </span>
              </div>
            </div>
          );
        })}
        {wards.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">
            No ward data available
          </div>
        )}
      </div>
    </div>
  );
};

export default WardOccupancy;