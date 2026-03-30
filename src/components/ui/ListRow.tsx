import React from "react";

interface ListRowProps {
  children: React.ReactNode;
}

const ListRow: React.FC<ListRowProps> = ({ children }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
      {children}
    </div>
  );
};

export default ListRow;
