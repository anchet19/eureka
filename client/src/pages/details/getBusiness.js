/*
*  @author Mateusz Koza

  Needs to be done or fixed:
  - Styling
  - Displaying information more smoothly (Hours, Prmomos, Deals, Description mainly)
  - Error if no complete data from business id

*/

import React from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom';

import Slider from 'infinite-react-carousel';
import { Card, CardContent, Typography, Fab, GridList } from '@material-ui/core';
import NavigationIcon from '@material-ui/icons/Navigation';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CallIcon from '@material-ui/icons/Call';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import StarsIcon from '@material-ui/icons/Stars';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import LocalDiningIcon from '@material-ui/icons/LocalDining';
import CircularProgress from '@material-ui/core/CircularProgress';

import './detailspage.css';

// Determine which styling to use based on screen size
const width = window.innerWidth;
const mobileWidth = 600;
const isMobile = width <= mobileWidth;

// Example mock data only for phone number and tags
let business = {
  phone: "(609) 456-7890",
  tags: "American, Pub",
}

class GetBusiness extends React.Component {

      constructor(props) {
          super(props);
    
          // State variables to store specific data
          // specified from business GET request
          this.state = {
              business: null,
              name: '',
              address: '',
              hours: [],
              limited: [],
              recurring: [],
              description: '',
              images: null,
              imgCount: 0,
              menu: ''
          };
    
      }

      componentDidMount() {
          // Gets the number at the end of details page url which is the business id
          // for the business and to be used in the GET request
          const id = this.props.match.params.bid;

          // GET request from api to get the business with the specified id from the params of the current url
          axios.get(`http://localhost:5000/api/v1/businesses/${id}`)
          .then(result => {
            // Store the data to use in various sections
            const bus = result.data;
            console.log(bus); // Shows the business object in the console

            // Business data from api, needed to access other business info
            this.setState({ business: bus});

            // Business Name
            this.setState({ name: this.state.business.info.name });
            
            // Business Address for address field and for navigation
            this.setState({ address: this.state.business.info.address });

            // Business Images to show through Image Carousel
            this.setState({ images: this.state.business.images });

            // Images length to provide correct formatting for Image Carousel based on size
            this.setState({ imgCount: this.state.business.images.length });

            // Business Menu path to provide for the clickable pdf link
            //this.setState({ menu: this.state.business.info.menu }); // Actual access to Business Menu
            this.setState({ menu: "https://senior-project-eureka.s3.amazonaws.com/94/menus/1587321188585.pdf" });

            // Business Hours to display in a list all available times
            this.setState({ hours: this.state.business.hours });
             
            // Business Limited Deals (Promos) to display in a list for a current promo
            this.setState({ limited: this.state.business.deals.limited });

            // Business Recurring Deals (Weekly) to display in a list for current weekly deals
            this.setState({ recurring: this.state.business.deals.recurring });

            // Business Description to provide the user with a little more information about the business
            this.setState({ description: this.state.business.info.description });

        });
      }

      /*
      Handle the navigation for the consumer
      Opens a new window for the consumer with directions already loaded to the business
      - Uses the consumer's current location
      - Need the business's latitude and longitude
      */
      handleOpen = (e) => {
        let des = this.state.address;

        /* Handle Browser Maps */
        if(!isMobile) {
          e.preventDefault(); // Prevents reloading the browser
          window.open('https://www.google.com/maps/dir/?api=1&destination='+des);
          console.log("Destination: " + des);
        }
        /* Handle Mobile Maps */
        else {
          e.preventDefault(); // Prevents reloading the browser
          this.mobileMapSelector(des);
        }
      };

      /*
      Determines what platform the user has (Android, iOS)
      Android:
      - Android handles the opening of a map application
      iOS:
      - Will automatically open Apple Maps or whatever version of google maps
        iOS uses
      
        *Andriod has been tested successfully, iOS has not been tested
      */
      mobileMapSelector(des) {
        const user = navigator.userAgent || navigator.vendor || window.opera;
        let platorm;

        /* Determins if an Android phone is being used */
        if (/android/i.test(user)) {
          platorm = "Android";
        }

        /* Determins if an iOS phone is being used */
        if (/iPad|iPhone|iPod/.test(platorm) && !window.MSStream) {
          platorm = "iOS";
        }

        /* Use the appropriate link for different mobile platforms */
        if(platorm === "iOS") { /* Handles iOS */
          window.open('maps://maps.google.com/maps/dir/?api=1&destination='+des);
        }
        else { /* Handles Android */
          window.open('https://www.google.com/maps/dir/?api=1&destination='+des);
        }
      }

      render() {
        
        // Handle whether a business only uploads 1 image, 2 images, or multiple images
        const imageCount = this.state.imgCount;
        let slidesToShow;
  
        // Handle the different styling of the carousel based on how many images a business has
        if(imageCount === 1 || imageCount === 0) {
          slidesToShow = 1;
        }
        else if(imageCount === 2) {
          slidesToShow = 2;
        }
        else {
          slidesToShow = 3;
        }

        // Handle number of images to show based on if mobile is being used
        if(isMobile) {
          slidesToShow = 1;
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
      
        return(

          <div className="col-centered">

            <Card>
              <CardContent>
              <br />
                <Typography gutterBottom variant="h4" component="h2"  >
                  {this.state.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" component="p">
                  <LocationOnIcon />
                  {this.state.address}
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

              <a href="/#" onClick={this.handleOpen}>
              <Fab color="primary" variant="extended" size="large">
                <NavigationIcon />
                  Navigate
                  </Fab>
              </a>

              </CardContent>
              <br />
            </Card>

            {this.state.images ? 
          
              <div>
                <div className="border-carousel">
                <span></span>
                <Slider {...settings}>

                  {this.state.images.map(({name, path}) => {
                    return (
                      <div>
                        {<img className="image-style" src={ path } alt={ name } />}
                      </div>
                    )
                  })}

                </Slider>
                </div >
                <br /><h3><a href={this.state.menu} target="_blank" rel="noopener noreferrer">menu.pdf</a></h3>
              </div> : 

              <div className="border-carousel">
                <Slider>
                  {/* Needed because images may be undefined, so to avoid just use a 
                  temporary component that goes away from images is loaded */}
                  <CircularProgress />
                </Slider>
              </div> }

            <GridList cols={3}>
              <Card className="card-style">
                <CardContent>
                  <Typography variant="h6" component="h2">
                    <AccessTimeIcon />
                    Business Hours
                  </Typography>
                  <br/>
                  <Typography variant="body1" component="p">
                  
                    {this.state.hours.map(({weekday, open_time, closing_time}) => (
                      <li>{weekday + ": " + open_time + " - " + closing_time} </li>
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

                    {this.state.recurring.map(({weekday, start_time, end_time, description}) => (
                      <li>{weekday + ": " + start_time + " - " + end_time + " *" + description} </li>
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
                  
                    {this.state.limited.map(({start_datetime, end_datetime, description}) => (
                      <li>{start_datetime + " - " + end_datetime + " *" + description} </li>
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
                    {this.state.description}
                  </Typography>
                </CardContent>
              </Card>
            </div>

          </div>
          )
      }
}

export default withRouter(GetBusiness);
