import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getLocation from '../../locationServices.js'
import { DisplayMapFC } from './map/DisplayMapClass';
import BusinessCard from './businessCard.component';
import './homepage.css';
import { Button, Slider, Popover, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const HomePage = () => {

  const marks = [
    {
      value: 5,
      label: '5m',
    },
    {
      value: 15,
      label: '15m',
    },
    {
      value: 30,
      label: '30m',
    },
    {
      value: 45,
      label: '45m',
    },
  ];
  
  function valuetext(value) {
    return `${value}°C`;
  }

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // Getting Location
  const [coords, setCoords] = useState({
    lat: false,
    lng: false,
  });

  // Initializing default radius
  const [radius, setRadius] = useState(15);

  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    getLocation.then((results) => {
      // setCoords({ lat: results.lat, lng: results.long })
      // Setting a dummy location:
      const lat = 39.7191968
      const lng = -75.1543866
      setCoords({ lat: lat, lng: lng })
      axios({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/businesses',
        params: {
          "radius": radius,
          "lat": lat,   //results.lat,
          "lng": lng    //results.lng
        }
      })
        .then(res => {
          setBusinesses(res.data);
          //console.log(res.data);
        })
    })
  }, [radius]);

  // Example mock data for proper formatting
  let demoBusinesses = [
    {
        business_id: 1,
        name: "McDonalds",
        address: "656 Delsea Dr, Glassboro, NJ 08028",
        cuisine: "fast food",
        open: "false",
        lat: 39.7059,
        long: -75.1808,
        image: "/images/image.png",
        distance: 0
    },
    {
        business_id: 7,
        name: "Wendys",
        address: "620 Woodbury Glassboro Rd, Sewell, NJ 08080",
        cuisine: "fast food",
        open: "false",
        lat: 39.7307,
        long: -75.1314,
        image: "images/testing/test.jpg",
        distance: 3.135449827421824
    }
];
  return (
    <div className="HomepageComponent">
      <div className="DesktopBusinessList">
        {demoBusinesses.length !== 0 ? demoBusinesses.map((business, index) => <BusinessCard business={business} index={index + 1} />) : null}
      </div>
      <div className="MapContainer">
        <div className=""
          style={{
            position: "absolute",
            padding: "5px",
            width: "100px",
            zIndex: 2,
            
        }}>
        <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
          RADIUS
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
          <div style={{paddingLeft: "20px", paddingRight: "20px", paddingTop: "25px"}}>
            <br />
            <Slider
              defaultValue={15}
              getAriaValueText={valuetext}
              aria-labelledby="discrete-slider-small-steps"
              step={5}
              marks={marks}
              min={5}
              max={45}
              valueLabelDisplay="auto"
              style={{padding: "10px", width: "300px", height: "10px"}}
            />
          </div>
        </Popover>
        </div>
        {coords.lat && coords.lng && demoBusinesses.length !== 0 ? <DisplayMapFC coords={coords} businesses={demoBusinesses} /> : null}
      </div>
      <div className="MobileBusinessList">
      {demoBusinesses.length !== 0 ? demoBusinesses.map((business, index) => <BusinessCard business={business} index={index + 1} />) : null}
      </div>
    </div>
  );
};

export default HomePage;