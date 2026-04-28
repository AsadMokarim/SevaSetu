import CategoryIcon from '@mui/icons-material/Category';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneAllIcon from '@mui/icons-material/DoneAll';

import { v4 as uuidv4 } from 'uuid';


export default function UnassignedTask({ dueTask }) {
    dueTask = [
        {
            name: "Resolve clean area",
            description: "lots of raggs are thrown on the street",
            location: "Sir Syed Nagar, Aligarh",
            dateAdded: Date.now(),
            category: "clean",
            skillsRequired: ["clean",],
            urgency: "high"

        },
        {
            name: "Pads Education",
            description: "Area needs an education of pads in the girls",
            location: "Jamalpur, Aligarh",
            dateAdded: 1774051200000,
            category: "Education",
            skillsRequired: ["education", "teaching"],
            urgency: "medium"

        },
        {
            name: "Pads Education",
            description: "Area needs an education of pads in the girls",
            location: "Jamalpur, Aligarh",
            dateAdded: 1774051200000,
            category: "Education",
            skillsRequired: ["education", "teaching"],
            urgency: "medium"

        },
        {
            name: "Pads Education",
            description: "Area needs an education of pads in the girls",
            location: "Jamalpur, Aligarh",
            dateAdded: 1774051200000,
            category: "Education",
            skillsRequired: ["education", "teaching"],
            urgency: "medium"

        },
        {
            name: "Pads Education",
            description: "Area needs an education of pads in the girls",
            location: "Jamalpur, Aligarh",
            dateAdded: 1774051200000,
            category: "Education",
            skillsRequired: ["education", "teaching"],
            urgency: "medium"

        },
        {
            name: "Pads Education",
            description: "Area needs an education of pads in the girls",
            location: "Jamalpur, Aligarh",
            dateAdded: 1774051200000,
            category: "Education",
            skillsRequired: ["education", "teaching"],
            urgency: "medium"

        },
    ]

    const getDaysText = (dateAdded) => {
        const days = Math.floor(
            (Date.now() - dateAdded) / (1000 * 60 * 60 * 24)
        )

        if (days === 0) return "Due today"
        if (days === 1) return "1 day overdue"
        return `${days} days overdue`
    }
    return (
        <div className="w-116 p-4 dashboardBox">
            <h3 className="font-semibold mb-4 text-lg">Unassigned Tasks</h3>
            <ul className='overflow-y-auto max-h-50'>
                {
                    dueTask.map((task) => (
                        <li
                            className="border border-gray-200 p-4 rounded-lg mb-3"
                            style={
                                task.urgency === "high" ? { borderLeft: "4px solid red" }
                                    : task.urgency === "medium" ? { borderLeft: "4px solid orange" }
                                        : task.urgency === "low" ? { borderLeft: "4px solid green" }
                                            : { borderLeft: "4px solid orange" }

                            }
                            key={uuidv4()}
                        >
                            <div className='flex gap-2 '>

                                <div className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 inset-ring inset-ring-purple-400/30 capitalize ">
                                    <CategoryIcon sx={{ fontSize: 15 }} />
                                    <span className='ml-1'>{task.category}</span>
                                </div>
                                <div className={`capitalize inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring ${task.urgency === "high" ? "  bg-red-400/10 text-red-400 inset-ring-red-400/20"
                                    : task.urgency === "medium" ? "bg-yellow-400/10 text-yellow-500 inset-ring-yellow-400/20"
                                        : task.urgency === "low" ? "bg-green-400/10 text-green-400 inset-ring-green-500/20"
                                            : "bg-yellow-400/10 text-yellow-500 inset-ring-yellow-400/20"
                                    }`}>

                                    {
                                        task.urgency === "high" ? <ErrorOutlineIcon sx={{ fontSize: 15 }} />
                                            : task.urgency === "medium" ? <WarningIcon sx={{ fontSize: 15 }} />
                                                : task.urgency === "low" ? <InfoIcon sx={{ fontSize: 15 }} />
                                                    : <WarningIcon sx={{ fontSize: 15 }} />
                                    }
                                    <span className='ml-1'>{task.urgency}</span>
                                </div>


                                <div className='ml-auto text-sm'>
                                    <button className='text-xs border p-1 pl-3 pr-3 rounded-xl text-green-800 text-center font-semibold transition delay-100 duration-250 ease-in-out hover:bg-green-50 hover:-translate-y-1 hover:scale-115 '>Assign</button>


                                </div>


                            </div>

                            <h4 className="font-medium font-sans mt-2 ">{task.name}</h4>
                            <p className="text-sm text-gray-600">{task.description}</p>
                            <div className='text-sm text-gray-900'>
                                Skills Required: <i className='capitalize'>{task.skillsRequired.join(", ")}</i>
                            </div>

                            <div className='flex gap-2 text-xs mt-2 items-center'>
                                <div className=' text-gray-500 '>
                                    <LocationPinIcon fontSize='small' />
                                    {task.location}
                                </div>
                                <div className='text-red-500 flex gap-1 items-center'>
                                    <AccessTimeIcon fontSize='small' />

                                    {getDaysText(task.dateAdded)}

                                </div>

                            </div>
                            <div className='text-sm mt-3'>
                                <button className='flex gap-2  items-center text-xs border pt-1 pb-1 pl-2 pr-2 text-center rounded-xl text-blue-800 text-center font-semibold transition delay-100 duration-250 ease-in-out hover:bg-blue-50 '>
                                    <DoneAllIcon sx={{ fontSize: 17 }} />
                                    Mark as done
                                </button>


                            </div>


                        </li>
                    ))
                }
            </ul>
        </div>
    )
}