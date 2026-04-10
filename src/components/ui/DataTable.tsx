import React from "react";

type DataRow = Record<string, unknown>;

export interface Column {
  key: string;
  header: string;
  render?: (row: DataRow) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  isPrimary?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: DataRow[];
  keyField: string;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, keyField }) => {
  const toCellContent = (value: unknown): React.ReactNode => {
    if (React.isValidElement(value)) return value;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    )
      return value;
    if (value == null) return null;
    return String(value);
  };

  if (data.length === 0) {
    return (
      <div
        className="bg-white rounded-xl py-16 text-center"
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#e5e7eb",
        }}
      >
        <p className="text-sm text-gray-400">No records found</p>
      </div>
    );
  }

  const nameCol =
    columns.find((c) => c.key === "name" || c.isPrimary) || columns[0];
  const statusCol = columns.find((c) => c.key === "status");
  const actionsCol = columns.find((c) => c.key === "actions");
  const detailCols = columns.filter(
    (c) =>
      c !== nameCol && c !== statusCol && c !== actionsCol && !c.hideOnMobile,
  );

  return (
    <div className="overflow-hidden">
      {/* ── Desktop Table ── */}
      <div
        className="hidden md:block bg-white rounded-xl overflow-x-auto"
        style={{
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#e5e7eb",
        }}
      >
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
                key={String(row[keyField]) + "-" + i}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-sm text-gray-700 ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : toCellContent(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden space-y-3">
        {data.map((row, i) => (
          <div
            key={String(row[keyField]) + "-m-" + i}
            className="bg-white rounded-xl p-4"
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "#e5e7eb",
            }}
          >
            {/* Header: Name + Status */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                {nameCol.render ? (
                  nameCol.render(row)
                ) : (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {toCellContent(row[nameCol.key])}
                  </p>
                )}
              </div>
              {statusCol && statusCol.render && (
                <div className="shrink-0">{statusCol.render(row)}</div>
              )}
            </div>

            {/* Details: each on its own line with generous spacing */}
            <div className="space-y-0 divide-y divide-gray-50">
              {detailCols.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {col.header}
                  </span>
                  <div className="text-sm text-gray-800 font-medium text-right max-w-[60%]">
                    {col.render
                      ? col.render(row)
                      : toCellContent(row[col.key]) || "—"}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {actionsCol && actionsCol.render && (
              <div
                className="flex justify-end pt-3 mt-2"
                style={{
                  borderTopWidth: "1px",
                  borderTopStyle: "solid",
                  borderTopColor: "#e5e7eb",
                }}
              >
                {actionsCol.render(row)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;
