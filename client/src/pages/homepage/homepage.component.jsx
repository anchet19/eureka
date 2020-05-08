import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getLocation from '../../locationServices.js'
import { DisplayMapFC } from './map/DisplayMapClass';
import BusinessCard from './businessCard.component';
import './homepage.css';

const HomePage = () => {

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
        {businesses.length !== 0 ? businesses.map((business, index) => <BusinessCard business={business} index={index + 1} />) : null}
      </div>
      {coords.lat && coords.lng && businesses.length !== 0 ? <DisplayMapFC coords={coords} businesses={businesses} /> : null}
      <div className="MobileBusinessList">
        {businesses.length !== 0 ? businesses.map((business, index) => <BusinessCard business={business} index={index + 1} />) : null}
      </div>
    </div>
  );
};

export default HomePage;