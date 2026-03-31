import { Badge } from "../ui";

const WardOccupancy = () => {
  const wards = [
    {
      name: "Ward A",
      count: 2,
      patients: [
        {
          id: "1",
          name: "Patient 1",
          mrn: "MRN001234",
          bed: "Ward A A-101",
          diagnosis: "Pneumonia",
        },
        {
          id: "2",
          name: "Patient 2",
          mrn: "MRN001235",
          bed: "Ward A A-102",
          diagnosis: "Diabetes Management",
        },
      ],
    },
    {
      name: "Ward B",
      count: 2,
      patients: [
        {
          id: "3",
          name: "Patient 1",
          mrn: "MRN001294",
          bed: "Ward B B-101",
          diagnosis: "Cardiac Arrhythmia",
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">👥</span>
        <h2 className="text-lg font-bold text-gray-900">Ward Occupancy</h2>
      </div>

      <div className="space-y-6">
        {wards.map((ward) => (
          <div
            key={ward.name}
            className="border border-gray-100 rounded-xl p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">{ward.name}</h3>
              <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full">
                {ward.count} patients
              </span>
            </div>
            <div className="space-y-4">
              {ward.patients.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-sm"
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-gray-400 text-xs">
                      {p.mrn} • {p.bed}
                    </p>
                  </div>
                  <Badge text={p.diagnosis} variant="outline" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WardOccupancy;
