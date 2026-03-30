import React from "react";

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No data available",
}) => {
  return (
    <div className="flex items-center justify-center py-8 text-sm text-gray-400">
      {message}
    </div>
  );
};

export default EmptyState;
