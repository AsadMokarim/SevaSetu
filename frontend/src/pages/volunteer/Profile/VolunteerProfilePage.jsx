import React from "react";
import DashboardHeader from "../Dashboard/DashboardHeader";

export default function VolunteerProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader name="Rajesh Kumar" email="rajesh.kumar@email.com" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h2>
          <p className="text-gray-500">Coming soon in the next update.</p>
        </div>
      </main>
    </div>
  );
}
