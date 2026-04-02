import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";

export interface ERound {
  id: string;
  title: string;
  patient: string;
  patientMrn: string;
  doctor: string;
  date: string;
  vitals: {
    temperature?: string;
    bp?: string;
    heartRate?: string;
    respRate?: string;
    o2Sat?: string;
  };
  assessment: string;
  plan: string;
}

const VitalBox = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) => (
  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">
    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-1">
      {label}
    </p>
    <p className="text-sm font-bold text-gray-800">
      {value}{" "}
      <span className="text-[10px] font-normal text-gray-500">{unit}</span>
    </p>
  </div>
);

const ERoundsSection: React.FC<{
  rounds: ERound[];
  onRecordRound?: () => void;
}> = ({ rounds, onRecordRound }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">E-Rounds</h2>
        {onRecordRound && (
          <button
            onClick={onRecordRound}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a5276] text-white text-sm font-bold rounded-xl transition-all hover:bg-gray-800 shadow-md"
          >
            <HiOutlinePlus className="w-5 h-5" /> Record E-Round
          </button>
        )}
      </div>

      <div className="space-y-4">
        {rounds.map((round) => (
          <div
            key={round.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{round.title}</h3>
              <p className="text-sm text-gray-600">
                Patient: {round.patient} ({round.patientMrn})
              </p>
              <p className="text-sm text-gray-400">
                Recorded by {round.doctor}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-bold text-gray-900 mb-3">
                Vital Signs:
              </p>
              <div className="flex flex-wrap gap-3">
                <VitalBox
                  label="Temperature"
                  value={round.vitals.temperature || "--"}
                  unit="°F"
                />
                <VitalBox label="BP" value={round.vitals.bp || "--"} />
                <VitalBox
                  label="Heart Rate"
                  value={round.vitals.heartRate || "--"}
                  unit="bpm"
                />
                <VitalBox
                  label="Resp. Rate"
                  value={round.vitals.respRate || "--"}
                  unit="/min"
                />
                <VitalBox
                  label="O2 Sat"
                  value={round.vitals.o2Sat || "--"}
                  unit="%"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 bg-blue-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Assessment</p>
                  <p className="text-sm text-gray-600">{round.assessment}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1 bg-green-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Plan</p>
                  <p className="text-sm text-gray-600">{round.plan}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ERoundsSection;
