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
      {/* 10%–90% width of the content below */}
      <div className="w-[80%] flex justify-center border border-gray-300 rounded-full bg-gray-100 p-1 shadow-sm">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => onChange(i)}
            className={`flex-1 py-3 text-sm font-medium rounded-full border transition-all duration-200
              ${
                activeIndex === i
                  ? "bg-white text-gray-900 border-gray-300 shadow-sm"
                  : "bg-transparent text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200"
              }`}
          >
            {tab.label}
            {tab.count !== undefined && ` (${tab.count})`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
