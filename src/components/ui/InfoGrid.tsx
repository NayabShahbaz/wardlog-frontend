interface InfoItem {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface InfoGridProps {
  items: InfoItem[];
}

const InfoGrid = ({ items }: InfoGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-16">
      {items.map((item, index) => (
        <div key={index} className={item.fullWidth ? "sm:col-span-2" : ""}>
          <p className="text-xs text-gray-400 mb-1">{item.label}</p>
          <p className="text-sm font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default InfoGrid;
