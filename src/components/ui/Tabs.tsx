import React from "react";

interface Tab {
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeIndex: number;
  onChange: (index: number) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeIndex, onChange }) => {
  return (
    <div className="w-full flex justify-center mb-6">
      <div
        className="w-full flex rounded-full bg-gray-100 p-1 overflow-x-auto no-scrollbar"
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#d1d5db",
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => onChange(i)}
            className={`flex-1 min-w-fit whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200
              ${
                activeIndex === i
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-700"
              }`}
            style={
              activeIndex === i
                ? {
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#d1d5db",
                  }
                : {
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "transparent",
                  }
            }
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-gray-400">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
