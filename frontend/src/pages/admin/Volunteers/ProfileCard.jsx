import CircleIcon from '@mui/icons-material/Circle';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CategoryIcon from '@mui/icons-material/Category';
import HandymanIcon from '@mui/icons-material/Handyman';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import ProfileCardHighlightBox from './ProfileCardHighlightBox';

export default function ProfileCard({ volunteer }) {
    function getInitials(name) {
        return name
            .trim()
            .split(" ")
            .map(word => word[0].toUpperCase())
            .join("");
    }
    return (
        <li className="text-black border border-gray-300 h-36 bg-white rounded-2xl flex gap-8 p-4 items-center " >
            <div className=" w-18 h-16 border border-blue-400 rounded-full bg-blue-50 text-blue-400 flex items-center justify-center">{getInitials(volunteer.name)}</div>
            <div className="self-start flex flex-col w-full">
                <div className="flex gap-12 max-h-8">
                    <h1 className="text-lg font-medium min-w-20">{volunteer.name}</h1>
                    <div className={`border text-sm p-1 rounded-lg pl-3 pr-3 flex justify-center items-center gap-2 h-8 ${volunteer.available ? "border-green-700 bg-[#a5f9b491] text-green-700" : "border-red-600 bg-red-50 text-red-700"
                        } `}>
                        <CircleIcon sx={{ fontSize: 10 }} />
                        {
                            volunteer.available ? "Available" : "Not Available"
                        }
                    </div>
                    <div className='ml-auto'>
                        <IconButton aria-label="View">
                            <OpenInNewIcon sx={{fontSize:30}}  />
                        </IconButton>
                    </div>
                </div>
                <div className='flex gap-3 mt-4'>
                    <ProfileCardHighlightBox title={`${volunteer.historyOfTask.length} Tasks`} color='orange' Icon={PlaylistAddCheckIcon} />

                    <ProfileCardHighlightBox title={volunteer.category} color='purple' Icon={CategoryIcon} />

                    <ProfileCardHighlightBox title={`${volunteer.skills.length} Skills`} color='rose' Icon={HandymanIcon} />

                    <ProfileCardHighlightBox title={volunteer.location} color='slate' Icon={LocationPinIcon} />

                </div>
            </div>
        </li>
    )
}