import React from "react";

export interface Column {
  key: string;
  header: string;
  render?: (row: unknown) => React.ReactNode;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  data: unknown[];
  keyField: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, keyField }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={(row as Record<string, unknown>)[keyField] + "-" + i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-sm text-gray-700 ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : ((row as Record<string, unknown>)[
                          col.key
                        ] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-50">
        {data.map((row, i) => (
          <div
            key={(row as Record<string, unknown>)[keyField] + "-" + i}
            className="p-4 space-y-2"
          >
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {col.header}
                </span>
                <span className="text-sm text-gray-700 text-right">
                  {col.render
                    ? col.render(row)
                    : ((row as Record<string, unknown>)[
                        col.key
                      ] as React.ReactNode)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;
