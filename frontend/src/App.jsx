import "./App.css"
import Navbar from "./components/admin/Navbar.jsx"
import Sidebar from "./components/admin/Sidebar.jsx"

import { Routes, Route } from "react-router-dom"
import Dashboard from "./pages/admin/Dashboard/Dashboard.jsx"
import Volunteers from "./pages/admin/Volunteers.jsx"
import Survey from "./pages/admin/Survey.jsx"
import Task from "./pages/admin/Task.jsx"

function App() {
  return (
    <>
      <div className="flex">
        <Sidebar />

        <div className="ml-64 w-full ">
          <div className="fixed top-0 left-64 right-0 h-16">
            <Navbar />
          </div>

          <div className="mt-16 p-4 bg-gray-50 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/volunteers" element={<Volunteers />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/task" element={<Task />} />
            </Routes>
          </div>

        </div>
      </div>

    </>
  )
}

export default App
