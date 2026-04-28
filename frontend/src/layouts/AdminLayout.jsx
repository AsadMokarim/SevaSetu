import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "../components/admin/Navbar";
import Sidebar from "../components/admin/Sidebar";

import Dashboard from "../pages/admin/Dashboard/Dashboard";
import Volunteers from "../pages/admin/Volunteers/VolunteersPage";
import SurveyPage from "../pages/admin/Survey/SurveyPage";
import TaskPage from "../pages/admin/Task/TaskPage";
import HeatmapPage from "../pages/admin/Heatmap/HeatmapPage";

const routeTitles = {
  "/admin/": "Dashboard",
  "/admin/volunteers": "Volunteer Management",
  "/admin/survey": "Survey Management",
  "/admin/task": "Task Management",
  "/admin/heatmap": "Heatmap Analytics",
};

export default function AdminLayout() {
  const location = useLocation();
  const navTitle = routeTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full">
        <div className="fixed top-0 left-64 right-0 z-1000">
          <Navbar navTitle={navTitle} />
        </div>

        <div className="mt-14 p-4 pl-8 bg-gray-50 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/survey" element={<SurveyPage />} />
            <Route path="/task" element={<TaskPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
