import React from "react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBgColor = "bg-emerald-500",
  iconColor = "text-white",
  valueColor = "text-emerald-500",
  badgeText,
  badgeBgColor = "bg-emerald-100",
  badgeTextColor = "text-emerald-500",
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full flex flex-col justify-between relative">
      {/* Badge (Optional) */}
      {badgeText && (
        <div
          className={`absolute top-6 right-6 px-2.5 py-1 rounded-full text-xs font-bold ${badgeBgColor} ${badgeTextColor}`}
        >
          {badgeText}
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${iconBgColor} ${iconColor}`}
      >
        <Icon />
      </div>

      {/* Content */}
      <div>
        <p className="text-sm font-bold text-gray-800 mb-1">{title}</p>
        <h2 className={`text-3xl font-bold ${valueColor}`}>{value}</h2>
      </div>
    </div>
  );
}
