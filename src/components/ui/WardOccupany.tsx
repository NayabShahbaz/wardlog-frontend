import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineComputerDesktop, HiOutlineUsers } from "react-icons/hi2";

type BedStatus = "empty" | "stable" | "monitoring" | "critical";

interface Bed {
  number: number;
  status: BedStatus;
  patientName?: string;
  mrn?: string;
}

interface Ward {
  name: string;
  totalBeds: number;
  beds: Bed[];
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

const mockWards: Ward[] = [
  {
    name: "Ward A",
    totalBeds: 20,
    beds: [
      { number: 1, status: "stable", patientName: "J. Doe", mrn: "MRN001234" },
      { number: 2, status: "empty" },
      {
        number: 3,
        status: "monitoring",
        patientName: "M. Smith",
        mrn: "MRN001235",
      },
      { number: 4, status: "empty" },
      { number: 5, status: "empty" },
      { number: 6, status: "empty" },
      {
        number: 7,
        status: "stable",
        patientName: "J. Wilson",
        mrn: "MRN001237",
      },
      { number: 8, status: "empty" },
      { number: 9, status: "empty" },
      {
        number: 10,
        status: "critical",
        patientName: "P. Moore",
        mrn: "MRN001239",
      },
      { number: 11, status: "empty" },
      { number: 12, status: "empty" },
      { number: 13, status: "empty" },
      { number: 14, status: "empty" },
      {
        number: 15,
        status: "monitoring",
        patientName: "D. Thomas",
        mrn: "MRN001240",
      },
      { number: 16, status: "empty" },
      { number: 17, status: "empty" },
      { number: 18, status: "empty" },
      { number: 19, status: "empty" },
      { number: 20, status: "empty" },
    ],
  },
  {
    name: "Ward B",
    totalBeds: 20,
    beds: [
      { number: 1, status: "empty" },
      {
        number: 2,
        status: "stable",
        patientName: "M. Taylor",
        mrn: "MRN001241",
      },
      { number: 3, status: "empty" },
      { number: 4, status: "empty" },
      {
        number: 5,
        status: "critical",
        patientName: "R. Williams",
        mrn: "MRN001242",
      },
      { number: 6, status: "empty" },
      { number: 7, status: "empty" },
      {
        number: 8,
        status: "monitoring",
        patientName: "E. Anderson",
        mrn: "MRN001238",
      },
      { number: 9, status: "empty" },
      { number: 10, status: "empty" },
      { number: 11, status: "empty" },
      { number: 12, status: "stable", patientName: "K. Lee", mrn: "MRN001243" },
      { number: 13, status: "empty" },
      { number: 14, status: "empty" },
      { number: 15, status: "empty" },
      { number: 16, status: "empty" },
      { number: 17, status: "empty" },
      { number: 18, status: "empty" },
      { number: 19, status: "empty" },
      { number: 20, status: "empty" },
    ],
  },
];

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

const WardOccupancy = () => {
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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineComputerDesktop className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-900">Ward Bed Map</h2>
      </div>

      <div className="space-y-8">
        {mockWards.map((ward) => {
          const occupied = ward.beds.filter((b) => b.status !== "empty").length;
          const pct = Math.round((occupied / ward.totalBeds) * 100);

          return (
            <div
              key={ward.name}
              className="rounded-xl p-4"
              style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#e5e7eb",
              }}
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

              <div
                className="flex items-center justify-between pt-3"
                style={{
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "#f3f4f6",
                }}
              >
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
      </div>
    </div>
  );
};

export default WardOccupancy;
