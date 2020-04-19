/*
*  @author Mateusz Koza
*/
import React, { Component } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Slider from 'infinite-react-carousel';
import { Card, CardContent, Typography, Fab, GridList, Modal } from '@material-ui/core';
import './detailspage.css';
 
import NavigationIcon from '@material-ui/icons/Navigation';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CallIcon from '@material-ui/icons/Call';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import StarsIcon from '@material-ui/icons/Stars';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import LocalDiningIcon from '@material-ui/icons/LocalDining';

const width = window.innerWidth;
const mobileWidth = 600;
const isMobile = width <= mobileWidth;

// Example mock data for proper formatting
let business = {
  name: "Burger Barn",
  address: "222 State St, Philadelphia, PA, 19146",
  phone: "(609) 456-7890",
  hours : [
    "11am - 12am Sunday - Thursday",
    "10am - 2am Friday - Saturday"
  ],
  tags: "American, Pub",
  description: "This is the description of the business.",
  deals : [
    "Monday 3pm - 6pm",
    "$2 Tacos $3 Corona"
  ],
  promos : [
    "Tuesday 3pm - 6pm",
    "1/2 price wings $2 domestics"
  ],
  lat: 39.710380,
  lng: -75.124900
}

/*
Carousel for the business page
Contains features:
  - Dragging left or right inside the carousel
  - Clicking on the arrows on the far left and right sides
  - Clicking on the dots under and in the center of the carousel
  - Auto Scroll
*/
class CarouselSlider extends Component {
  render() {
    // Business images will be retrieved by obtaining the path name for each image that the specified
    // business included, which will then be pushed into an array. That array will then be used to display
    // all the images into the carousel with correct formatting
    const images = [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ38qOVpglmXDfKJq2vapG9M6bSPOA7XA7Qf0uE7WQCNJHEEVyo",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT16Y0m177smdXxETz5SlrdJ-9xz-wVoWIe5kE27IkK6YFc8MHi",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRHr0ge0k97ZMhUdML4LNrvhUez5Yr-1KEW2YHBCNnWYfOOncgZ",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSXqBMTHmbMfWaoGjd5np4NXet3fb1ANq1Cf4Ds-TS2TBtYLg3V",
      "https://pngimage.net/wp-content/uploads/2018/05/burger-and-fries-png-2.png"
    ];
 
    // Fixes image overlap if the screen view port width is <= 500
    let slidesToShow;
 
    if(isMobile) {
      slidesToShow = 1;
    }
    else {
      slidesToShow = 3;
    }
    
    // Different features for the carousel
    const settings =  {
      arrowsBlock: true,
      autoplay: true,
      autoplaySpeed: 3000,
      dots: true,
      duration: 100,
      slidesToShow
    };
 
    // Returns the carousel with all the businesses images loaded into it
    return (
      <div>
        <span></span>
        <Slider { ...settings }>
              {images.map((value, index) => {
                return (
                <div key={ index }>
                  <img className="image-style" src={ value } alt={ "image"+ (index + 1) } />
                </div>
                )
            })}
        </Slider>
        { /* Change the href to pdf file from business */ }
        <br /><h3><a href={"http://localhost:3000/static/media/menu.f56022d4.pdf"} target="_blank">menu.pdf</a></h3>
      </div>
    );
  }
}
 
/*
Handle the navigation for the consumer
Opens a new window for the consumer with directions already loaded to the business
- Uses the consumer's current location
- Need the business's latitude and longitude
*/
 
// Mock Data
// Rowan University Coordinates 
const latitude = business.lat; // Business latitude
const longitude = business.lng; // Business longitude
let des = latitude+','+longitude; // Concatenate lat and lng to use in URL
 
class OpenDirections extends Component {
  handleOpen = (e) => {
    /* Handle Browser Maps */
    if(!isMobile) {
      e.preventDefault(); // Prevents the reloading the browser
      window.open('https://www.google.com/maps/dir/?api=1&destination='+des);
      console.log("Destination: " + des);
    }
    /* Handle Mobile Maps */
    else {
      e.preventDefault(); // Prevents the reloading the browser
      mobileMapSelector();
    }
  };
  render() {
    return(
      <a href="/#" onClick={this.handleOpen}>
        <Fab color="primary" variant="extended" size="large">
          <NavigationIcon />
            Navigate
        </Fab>
      </a>
    );
  }
}

/*
    Determines what platform the user has (Android, iOS)
    Android:
      - Android handles the opening of a map application
    iOS:
      - Will automatically open Apple Maps or whatever version of google maps
        iOS uses
*/
function mobileMapSelector() {
  const user = navigator.userAgent || navigator.vendor || window.opera;
  let plat;

  /* Determins if an Android phone is being used */
  if (/android/i.test(user)) {
    plat = "Android";
  }

  /* Determins if an iOS phone is being used */
  if (/iPad|iPhone|iPod/.test(plat) && !window.MSStream) {
    plat = "iOS";
  }

  /* Use the appropriate link for different mobile platforms */
  if(plat == "iOS") { /* Handles iOS */
    window.open('maps://maps.google.com/maps/dir/?api=1&destination='+des);
  }
  else { /* Handles Android */
    window.open('https://www.google.com/maps/dir/?api=1&destination='+des);
  }
}
 
const DetailsPage = () => {
  let { bid } = useParams();

  return (
    <div className="col-centered">
      <div>
        <Card>
          <CardContent>
            <br />
            <Typography gutterBottom variant="h4" component="h2"  >
              {business.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" component="p">
              <LocationOnIcon />
              {business.address}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" component="p">
              <CallIcon />
              {business.phone}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" component="p">
              <LocalDiningIcon />
              {business.tags}
            </Typography>

            <br/>
 
            <OpenDirections />
 
          </CardContent>
 
          <br />
 
        </Card>
      </div>
 
      <br />
      
      <div className="border-carousel">
        <CarouselSlider />
      </div>
 
      <br />
      <br />
 
        <GridList cols={3}>
          
            <Card className="card-style">
              <CardContent>
                <Typography variant="h6" component="h2">
                  <AccessTimeIcon />
                  Business Hours
                </Typography>
                <br/>
                <Typography variant="body1" component="p">
                  {business.hours.map((val,i) => (
                    <li key={i}> {val} </li>
                  ))}
                </Typography>
              </CardContent>
            </Card>
 
            <Card className="card-style">
              <CardContent>
                <Typography variant="h6" component="h2">
                  <MonetizationOnIcon />
                  Deals
                </Typography>
                <br/>
                <Typography variant="body1" component="p">
                  {business.deals.map((val,i) => (
                    <li key={i}> {val} </li>
                  ))}
                </Typography>
              </CardContent>
            </Card>
 
            <Card className="card-style">
              <CardContent>
                <Typography variant="h6" component="h2">
                  <StarsIcon />
                  Promos
                </Typography>
                <br/>
                <Typography variant="body1" component="p">
                  {business.promos.map((val,i) => (
                    <li key={i}> {val} </li>
                  ))}
                </Typography>
              </CardContent>
            </Card>
 
        </GridList>
 
      <br />

      <div>
        <Card className="card-style">
 
        <CardContent>
          <Typography variant="h6" component="h2">
           Description
          </Typography>
          <Typography variant="body1" component="p">
            {business.description}
          </Typography>
        </CardContent>
 
        </Card>
      </div>

      <br />
 
    </div>
  );
};
 
export default DetailsPage;
