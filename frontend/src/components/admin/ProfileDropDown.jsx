import * as React from 'react';

import { Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


export default function ProfileDropDown() {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <div className='pl-8 -mr-8 transition delay-100 duration-250 ease-in-out'>
            <IconButton onClick={handleClick}>
                <Avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" />
                <ArrowDropDownIcon color='action' />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>Your Profile</MenuItem>
                <MenuItem onClick={handleClose}>Settings</MenuItem>
                <MenuItem onClick={handleClose}>Sign out</MenuItem>
            </Menu>
        </div>
    )
}