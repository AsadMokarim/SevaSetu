import React from "react";
import VolunteerCard from "./VolunteerCard";

/**
 * VolunteerGrid — flex-wrap grid of VolunteerCards
 * Props: volunteers {Array}, onView, onEdit, onDelete, onToggle
 */
export default function VolunteerGrid({ volunteers = [], onView, onEdit, onDelete, onToggle }) {
  if (!volunteers.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <p className="text-sm font-semibold text-gray-400">No volunteers found</p>
        <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-5">
      {volunteers.map((v) => (
        <div key={v.id} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
          <VolunteerCard
            volunteer={v}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        </div>
      ))}
    </div>
  );
}