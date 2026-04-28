import Badge from '@mui/material/Badge';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

import ProfileDropDown from './ProfileDropDown.jsx';


import * as React from 'react';
import Popover from '@mui/material/Popover';
import NotificationPanel from './NotifcationPanel.jsx';


export default function Navbar({ navTitle = "Dashboard" }) {

    
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <nav className="bg-white relative shadow-sm after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            {/* <!-- Mobile menu button--> */}
                            {/* <button type="button" command="--toggle" commandfor="mobile-menu" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
                                <span className="absolute -inset-0.5"></span>
                                <span className="sr-only">Open main menu</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6 in-aria-expanded:hidden">
                                    <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6 not-in-aria-expanded:hidden">
                                    <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button> */}
                        </div>
                        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            
                            <div className="sm:ml-6 sm:block">
                                <div className="flex space-x-4">

                                    <h3 className=" px-3 py-2 text-xl font-medium">{navTitle}</h3>


                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            <button aria-describedby={id} variant="contained" onClick={handleClick} className='transition delay-100 duration-200 ease-in-out hover:bg-green-50 rounded-xl p-1'>
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsNoneIcon color="action" />
                                </Badge>
                            </button>
                            <Popover
                                id={id}
                                open={open}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                className='rounded mr-3'
                            >
                               <NotificationPanel onCountChange={setUnreadCount} />
                            </Popover>

                            {/* <!-- Profile dropdown --> */}
                            <ProfileDropDown />
                        </div>
                    </div>
                </div>


            </nav>
        </>
    )
}