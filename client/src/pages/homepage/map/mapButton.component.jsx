/*  mapButton.component.jsx
    Author: Matthew Tam
*/
import React, { useState } from 'react'
import { Button, Popover, } from '@material-ui/core';

function MapButton( props ) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className="MapButton">
            <Button aria-describedby={id} variant="contained" onClick={handleClick} style={{minWidth: "0px", height:"40px", backgroundColor: "white"}}>
                {props.image}
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
                }}
            >
                {props.children}
            </Popover>
        </div>
    )
}

export default MapButton