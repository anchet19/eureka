import React, { useState, useEffect } from 'react';
import { Slider, Typography, SvgIcon } from '@material-ui/core';
import TuneIcon from '@material-ui/icons/Tune';
import axios from 'axios';
import { DisplayMapFC } from './map/DisplayMapClass';
import BusinessCard from './businessCard.component';
import MapButton from './map/mapButton.component';
import getLocation from '../../locationServices.js';
import './homepage.css';

const HomePage = () => {

  // Initalizing items for Slider
  const marks = [
    {
      value: 0,
      label: '0mi',
    },
    {
      value: 5,
      label: '5mi',
    },
    {
      value: 10,
      label: '10mi',
    },
    {
      value: 15,
      label: '15mi',
    },
    {
      value: 20,
      label: '20mi',
    },
  ];
  
  function valuetext(value) {
    return `${value}°C`;
  }

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
        {businesses.length !== 0 ? businesses.map((business, index) => <BusinessCard business={business} key={index + 1} />) : null}
      </div>
      {coords.lat && coords.lng && businesses.length !== 0 ? 
        <div className="MapContainer">
          <div className="MapControls">
            <MapButton className="RadiusControls" 
            image={
              <SvgIcon viewBox="0 0 1024 1024" color="action" style={{fontSize: "30px"}}>
                <path d= "
                M512 85.333333c141.226667 0 256 113.493333 256 253.866667C768 
                529.493333 512 810.666667 512 810.666667S256 529.493333 256 
                339.2C256 198.826667 370.773333 85.333333 512 85.333333m0 
                170.666667a85.333333 85.333333 0 0 0-85.333333 85.333333 
                85.333333 85.333333 0 0 0 85.333333 85.333334 85.333333 
                85.333333 0 0 0 85.333333-85.333334 85.333333 85.333333 0 0 
                0-85.333333-85.333333m341.333333 554.666667c0 94.293333-152.746667
                170.666667-341.333333 170.666666s-341.333333-76.373333-341.333333
                -170.666666c0-55.04 52.053333-104.106667 
                132.693333-135.253334l27.306667 38.826667C284.586667 733.44 256 
                759.893333 256 789.333333c0 58.88 114.773333 106.666667 256 
                106.666667s256-47.786667 256-106.666667c0-29.44-28.586667-55.893333
                -74.666667-75.093333l27.306667-38.826667C801.28 706.56 853.333333 
                755.626667 853.333333 810.666667z" />
              </SvgIcon>}
            >
              <div style={{paddingLeft: "20px", paddingRight: "20px", paddingTop: "25px", overflow: "hidden"}}>
                <Typography id="discrete-slider-restrict" gutterBottom>
                  Radius
                </Typography>
                <Slider
                  defaultValue={radius}
                  getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider-small-steps"
                  step={1}
                  marks={marks}
                  min={1}
                  max={20}
                  valueLabelDisplay="auto"
                  style={{padding: "10px", width: "150px", height: "10px"}}
                  onChange={ (e, val) => setRadius(val) }  
                  onDragStop={ () => this.props.update(this.state.radius)}
                />
              </div>
            </MapButton>
            <MapButton className="FilterControls" image={<TuneIcon color="action"/>}>
              <div style={{paddingLeft: "20px", paddingRight: "20px", paddingTop: "25px", overflowY: "hidden"}}>
                <br />
                <Slider
                  defaultValue={radius}
                  getAriaValueText={valuetext}
                  aria-labelledby="discrete-slider-small-steps"
                  step={5}
                  marks={marks}
                  min={5}
                  max={45}
                  valueLabelDisplay="auto"
                  style={{padding: "10px", width: "150px", height: "10px"}}
                />
              </div>
            </MapButton>
          </div>
          <DisplayMapFC coords={coords} businesses={businesses} />
        </div>
      : null}
      <div className="MobileBusinessList">
      {businesses.length !== 0 ? businesses.map((business, index) => <BusinessCard business={business} key={index + 1} />) : null}
      </div>
    </div>
  );
};

export default HomePage;