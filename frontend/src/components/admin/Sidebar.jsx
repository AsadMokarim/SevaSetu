import { useState } from "react"
import "./Sidebar.css"

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';


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
            <h1 className="text-4xl text-white font-semibold font-stretch-expanded font-monto mb-8 text-center p-2">SevaSetu</h1>

            <ul
                className="space-y-12 w-full absolute"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
                <li className="mt-5">
                    <NavLink
                        to="/"
                        onMouseEnter={() => setHovered("/")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/"
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
                        to="/volunteers"
                        onMouseEnter={() => setHovered("/volunteers")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/volunteers"
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
                        to="/survey"
                        onMouseEnter={() => setHovered("/survey")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/survey"
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
                        to="/task"
                        onMouseEnter={() => setHovered("/task")}
                        onMouseLeave={() => setHovered(null)}
                        className={({ isActive }) =>
                            `sideElement flex items-center ${isActive
                                ? hovered && hovered !== "/task"
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

            </ul>
        </div>


    )
}












