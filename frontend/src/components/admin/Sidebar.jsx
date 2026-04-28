import { useState } from "react"
import "./Sidebar.css"

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';


import { NavLink } from "react-router-dom"


// #287bff

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [hovered, setHovered] = useState(null);

    return (

        <div
            className={`bg-[#287bff] pt-4 transition-all delay-100 overflow-hidden fixed top-0 left-0 h-screen w-64  ${open ? "w-64" : "w-4"}`}
            style={{
                borderLeft: "10px solid #287bff"
            }}

        >
            {/* <button onClick={() => setOpen(!open)} className="mb-4">
                ☰
            </button> */}
            <div className="flex justify-center mb-8 p-4">
                <img src="/sevasetu logo-bg-removed.svg" alt="SevaSetu" className="h-32 w-auto brightness-0 invert" />
            </div>

            <ul
                className="space-y-12 w-full absolute"
            >
                <li className="mt-5">
                    <NavLink
                        to="/admin/"
                        end
                        onMouseEnter={() => setHovered("/admin/")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/admin/"
                                    ? "active-hover"
                                    : "active"
                                : ""
                            }`
                        }
                    >
                        <DashboardOutlinedIcon className="mr-4" />
                        Dashboard
                    </NavLink>
                </li>
                <li >
                    <NavLink
                        to="/admin/volunteers"
                        onMouseEnter={() => setHovered("/admin/volunteers")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/admin/volunteers"
                                    ? "active-hover"
                                    : "active"
                                : ""
                            }`
                        }
                    >
                        <PeopleOutlinedIcon className="mr-4" />
                        Volunteers
                    </NavLink>
                </li>
                <li >
                    <NavLink
                        to="/admin/survey"
                        onMouseEnter={() => setHovered("/admin/survey")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/admin/survey"
                                    ? "active-hover"
                                    : "active"
                                : ""
                            }`
                        }
                    >
                        <LibraryBooksOutlinedIcon className="mr-4" />
                        Survey
                    </NavLink>
                </li>
                <li className="mb-5" >
                    <NavLink
                        to="/admin/task"
                        onMouseEnter={() => setHovered("/admin/task")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/admin/task"
                                    ? "active-hover"
                                    : "active"
                                : ""
                            }`
                        }
                    >
                        <TaskAltRoundedIcon className="mr-4" />
                        Tasks
                    </NavLink>
                </li>
                <li className="mb-5">
                    <NavLink
                        to="/admin/heatmap"
                        onMouseEnter={() => setHovered("/admin/heatmap")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/admin/heatmap"
                                    ? "active-hover"
                                    : "active"
                                : ""
                            }`
                        }
                    >
                        <LocalFireDepartmentIcon className="mr-4" />
                        Heatmap
                    </NavLink>
                </li>

            </ul>
        </div>


    )
}












