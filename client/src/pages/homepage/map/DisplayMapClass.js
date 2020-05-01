// src/DisplayMapFC.js
import {Button} from '@material-ui/core';
import * as React from 'react';



export const DisplayMapFC = ( {coords, businesses, ...props} ) => {
  // Create a reference to the HTML element we want to put the map on
  const mapRef = React.useRef(null);

  // Example of the coords object that Here Maps API likes
  // Ex: Initializing coordinates to Null Island
  // let coords = {lat: 0, lng: 0}

  /**
   * Create the map instance
   * While `useEffect` could also be used here, `useLayoutEffect` will render
   * the map sooner
   */
  React.useLayoutEffect(() => {
    // `mapRef.current` will be `undefined` when this hook first runs; edge case that
    if (!mapRef.current) return;
    const H = window.H;
    const platform = new H.service.Platform({
        apikey: process.env.REACT_APP_HERE_API_KEY
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: coords,
      zoom: 15,
      pixelRatio: window.devicePixelRatio || 1
    }, [coords, businesses]);

    // add a resize listener to make sure that the map occupies the whole container
    window.addEventListener('resize', () => hMap.getViewPort().resize());

    // Create an icon and a marker:
    const icon = new H.map.Icon("/Google_Maps_pin.svg"),
    marker = new H.map.Marker(coords, {icon: icon});

    // Add the marker to the map:
    hMap.addObject(marker);

    businesses.map((business, index) => {
      // Create an icon and a marker:
      
      // Define a variable holding SVG mark-up that defines an icon image:
      const svgMarkup = 
      '<svg ' +
        'width="24" ' +
        'height="24" ' +
        'xmlns="http://www.w3.org/2000/svg"' + 
      '>' +
        '<rect ' +
          'stroke="white" ' +
          'fill="#3f51b5" ' + 
          'x="1" ' + 
          'y="1" ' +
          'width="22" ' +
         'height="22" ' +
        '/> ' +
        '<text ' + 
        'x="12" ' + 
        'y="18"  ' +
        'font-size="12pt" ' +
        'font-family="Arial" ' +
        'text-anchor="middle" ' +
        'fill="white" ' + 
        '>' + 
          (index + 1) + 
        '</text> ' +
      '</svg>';
      
      const {name, address, cuisine, lat, long} = business
  
      const marker = new H.map.Marker(
        {lat: lat, lng: long}, 
        {icon: 
          new H.map.Icon(svgMarkup)
        });
  
      marker.setData(name + "<br />" + cuisine);
  
      marker.addEventListener("tap", event => {
        const bubble = new H.ui.InfoBubble(
          event.target.getGeometry(),
          {
            content: event.target.getData()
          }
        );
        ui.addBubble(bubble);
      }, false);
  
      // Add marker
      hMap.addObject(marker);
  
      })

    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));

    // Create the default UI components
    const ui = H.ui.UI.createDefault(hMap, defaultLayers);
    // Set the UI unit system to imperial measurement
    ui.setUnitSystem(H.ui.UnitSystem.IMPERIAL);

    // This will act as a cleanup to run once this hook runs again.
    // This includes when the component un-mounts
    return () => {
      hMap.dispose();
    };
  }, [mapRef]); // This will run this hook every time this ref is updated

  return <div className="map" ref={mapRef} ></div>;
};