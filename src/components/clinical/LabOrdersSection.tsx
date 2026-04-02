import React from "react";
import { HiOutlinePlus } from "react-icons/hi2";
import Badge from "../ui/Badge";

export interface LabOrder {
  id: string;
  orderType: string;
  patient: string;
  patientMrn: string;
  doctor: string;
  date: string;
  priority: string;
  status: string;
  tests: string[];
}

const LabOrdersSection: React.FC<{
  orders: LabOrder[];
  onCreateOrder?: () => void;
}> = ({ orders, onCreateOrder }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Lab Orders</h2>
        {onCreateOrder && (
          <button
            onClick={onCreateOrder}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1a5276] text-white text-sm font-bold rounded-xl transition-all hover:bg-gray-800 shadow-md active:scale-95"
          >
            <HiOutlinePlus className="w-5 h-5" /> Create Order
          </button>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {order.orderType}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Patient: {order.patient} ({order.patientMrn})
                </p>
                <p className="text-sm text-gray-400">
                  Ordered by {order.doctor} - {order.date}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge text={order.priority} variant="gray" />
                <Badge
                  text={order.status}
                  variant={
                    order.status.toLowerCase() === "completed"
                      ? "green"
                      : "outline"
                  }
                />
              </div>
            </div>

            {order.tests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Tests:</p>
                <ul className="space-y-1">
                  {order.tests.map((test, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      {test}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabOrdersSection;
