import { useState } from "react"
import "./Sidebar.css"

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';


import { NavLink } from "react-router-dom"


export default function Sidebar() {
    const [open, setOpen] = useState(true)

    return (

        <div className={`bg-white  p-4 transition-all fixed top-0 left-0 h-screen w-64 bg-white shadow ${open ? "w-64" : "w-4"}`}>
            {/* <button onClick={() => setOpen(!open)} className="mb-4">
                ☰
            </button> */}
            <h1 className="text-4xl font-bold font-mono mb-12 text-center p-2">SevaSetu</h1>

            <ul className="space-y-4">
                <li >
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <DashboardOutlinedIcon className="mr-4" />
                        Dashboard
                    </NavLink>
                </li>
                <li >
                    <NavLink
                        to="/volunteers"
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <PeopleOutlinedIcon className="mr-4" />
                        Volunteers
                    </NavLink>
                </li>
                <li >
                    <NavLink
                        to="/survey"
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <LibraryBooksOutlinedIcon className="mr-4" />
                        Survey
                    </NavLink>
                </li>
                <li >
                    <NavLink
                        to="/task"
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive ? "active" : ""
                            }`
                        }
                    >
                        <TaskAltRoundedIcon className="mr-4" />
                        Tasks
                    </NavLink>
                </li>

            </ul>
        </div>


    )
}












