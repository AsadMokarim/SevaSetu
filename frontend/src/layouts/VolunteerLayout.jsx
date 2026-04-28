import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// We will build these shortly
import VolunteerDashboard from "../pages/volunteer/Dashboard/VolunteerDashboard";
import VolunteerTasksPage from "../pages/volunteer/Tasks/VolunteerTasksPage";
import VolunteerProfilePage from "../pages/volunteer/Profile/VolunteerProfilePage";

import NotificationPrompt from "../components/common/NotificationPrompt";

export default function VolunteerLayout() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <NotificationPrompt />
      <Routes>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VolunteerDashboard />} />
        <Route path="tasks" element={<VolunteerTasksPage />} />
        <Route path="profile" element={<VolunteerProfilePage />} />
      </Routes>
    </div>
  );
}
