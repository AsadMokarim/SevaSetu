import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

import * as React from 'react';

export default function SearchFilters() {
    let location = [
        "Aligarh", "Delhi", "Rourkela"
    ]

    const [category, setCategory] = React.useState('');
    const [available, setAvailable] = React.useState('');

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
    };
    const handleAvailableChange = (event) => {
        setAvailable(event.target.value);
    };
    return (
        <div className='mt-8 flex items-center gap-4 flex-wrap'>

            <div className='border border-gray-300 p-1 rounded-2xl flex items-center bg-white '>
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search Volunteer"
                    inputProps={{ 'aria-label': 'Search Volunteer' }}
                    className=' w-108 '
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </div>

            <FormControl sx={{ minWidth: 140 }} style={{ width: "120px" }} size='small' className='bg-white' >
                <InputLabel id="category-label" className='mt-1'>Category</InputLabel>
                <Select
                    labelId="category-label"
                    id="demo-simple-select-helper"
                    value={category}
                    label="Category"
                    onChange={handleCategoryChange}
                    className='h-11'
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="clean">Clean</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                </Select>
            </FormControl>


            <FormControl sx={{ minWidth: 100 }} size='small' className='bg-white' >
                <Select
                    value={available}
                    onChange={handleAvailableChange}
                    className='h-11'
                    displayEmpty
                >
                    <MenuItem value="">
                        All
                    </MenuItem>
                    <MenuItem value="education">Available</MenuItem>
                    <MenuItem value="clean">Not Available</MenuItem>
                </Select>
            </FormControl>
            <Autocomplete
                disablePortal
                options={location}
                sx={{ width: 160 }}
                renderInput={(params) => <TextField {...params} label="Location" variant="outlined" size='small' className='scale-107' />}
                className='ml-2 bg-white'

            />
        </div>
    )
}