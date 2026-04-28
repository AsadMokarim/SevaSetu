import React, { useState } from "react";
import SurveyTableRow from "./SurveyTableRow";

/**
 * SurveyTable — Full survey listing table
 *
 * Props:
 *  data       {Array}    Array of survey row objects
 *  onView     {function} (row) => void
 *  onEdit     {function} (row) => void
 *  onDelete   {function} (row) => void
 */

const COLUMNS = [
  { key: "title",    label: "Title"    },
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  { key: "urgency",  label: "Urgency"  },
  { key: "date",     label: "Date"     },
  { key: "status",   label: "Status"   },
  { key: "actions",  label: "Actions"  },
];

const DEFAULT_DATA = [
  { id: 1, title: "Food Security Assessment",  category: "Food",       location: "East District",    urgency: "Critical", date: "2026-04-15", status: "Active"    },
  { id: 2, title: "Healthcare Access Survey",  category: "Healthcare", location: "North District",   urgency: "High",     date: "2026-04-14", status: "Active"    },
  { id: 3, title: "Education Needs Analysis",  category: "Education",  location: "Central District", urgency: "Medium",   date: "2026-04-12", status: "Completed" },
  { id: 4, title: "Shelter Requirements",      category: "Shelter",    location: "West District",    urgency: "High",     date: "2026-04-10", status: "Active"    },
  { id: 5, title: "Employment Opportunities",  category: "Employment", location: "South District",   urgency: "Low",      date: "2026-04-08", status: "Pending"   },
];

export default function SurveyTable({
  data = DEFAULT_DATA,
  onView,
  onEdit,
  onDelete,
}) {
  const [rows, setRows] = useState(data);

  React.useEffect(() => {
    setRows(data);
  }, [data]);

  function handleDelete(row) {
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    onDelete?.(row);
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6M4 6h16M4 10h16M4 14h8M4 18h6" />
          </svg>
          <p className="text-sm font-semibold text-gray-400">No surveys found</p>
          <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* Head */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row) => (
              <SurveyTableRow
                key={row.id}
                row={row}
                onView={onView}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}