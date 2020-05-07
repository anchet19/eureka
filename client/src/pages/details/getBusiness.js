/*
*  @author Mateusz Koza
*/

import React from 'react'
import axios from 'axios'
import { withRouter } from 'react-router-dom';

import Slider from 'infinite-react-carousel';
import { Card, CardContent, Typography, Fab, Button } from '@material-ui/core';
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

let counter = 0;

var moment = require('moment');

class GetBusiness extends React.Component {

      constructor(props) {
          super(props);
    
          // State variables to store specific data
          // specified from business GET request
          this.state = {
              business: null,
              bid: null,
              name: '',
              address: '',
              phone: null,
              tags: null,
              hours: null,
              limited: null,
              recurring: null,
              description: null,
              images: null,
              imgCount: 0,
              menu: '',
              opened: false
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

            // Business ID to determine between displaying an error page or actual business
            this.setState({ bid: this.state.business.info.business_id });

            // Business Name
            this.setState({ name: this.state.business.info.name });
            
            // Business Address for address field and for navigation
            this.setState({ address: this.state.business.info.address });

            // Business Phone Number so a user can call if they please
            this.setState({ phone: this.state.business.info.tel });

            // Business Tags so a user can determine if the style presented interests them
            this.setState({ tags: this.state.business.info.cuisine });

            // Business Images to show through Image Carousel
            this.setState({ images: this.state.business.images });

            // Images length to provide correct formatting for Image Carousel based on size
            this.setState({ imgCount: this.state.business.images.length });

            // Business Menu path to provide for the clickable pdf link
            this.setState({ menu: this.state.business.info.menu }); // Actual access to Business Menu

            // Business Hours to display in a list all available times
            this.setState({ hours: this.state.business.hours });
             
            // Business Limited Deals (Promos) to display in a list for a current promo
            this.setState({ limited: this.state.business.deals.limited });

            // Business Recurring Deals (Weekly) to display in a list for current weekly deals
            this.setState({ recurring: this.state.business.deals.recurring });

            // Business Description to provide the user with a little more information about the business
            this.setState({ description: this.state.business.info.description });

        })
        .catch(err => {
          console.log(err);
          console.log("Error loading business.")
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

        // Handles error of loading an business id that has no data
        if(this.state.bid === null && counter > 0) {
          return(
            <div>
              <div>Error loading business.</div>
            </div>
          );
        }
        else if(this.state.bid === null){
          counter++;
          return(
            <div>
              <div>Loading business...</div>
              <div><CircularProgress /></div>
            </div>
          );
        }
        
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

  {/* Change the layout based on desktop or mobile */}
  {!isMobile ?

    <div class="card-grid">

      <div class="card-item">

        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    <AccessTimeIcon />
                    &nbsp;Business Hours
                  </Typography>
                  {this.state.hours ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                  
                    {this.state.hours.map(({weekday, open_time, closing_time}) => (
                      <li>{weekday + " - Opens: " + moment(open_time, ["hh:mm:ss"]).format("hh:mm:ss A") +
                         " | Closes:  " + moment(closing_time, ["hh:mm:ss"]).format("hh:mm:ss A")} <br/><br/>
                      </li>
                    ))}
                  
                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No hours available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>
      
      <div class="itemMain">
        
        <Card className="main-card">
            <CardContent>
              <br/>
                <Typography gutterBottom variant="h3" component="h2" style={{fontFamily: 'Verdana'}}>
                  {this.state.name}
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<LocationOnIcon />}
                      size="small"
                      disableElevation='true'
                    >
                      Location
                    </Button>
                  </div>
                  {this.state.address}
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<CallIcon />}
                      size="small"
                      disableElevation="true"
                    >
                      Phone Number
                    </Button>
                  </div>
                  {this.state.phone ?
                    this.state.phone : "No phone number available."
                  }
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                  <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<LocalDiningIcon />}
                      size="small"
                      disableElevation="true"
                    >
                      Tags
                    </Button>
                  </div>
                  {this.state.tags ?
                    this.state.tags : "No tags available."
                  }
                </Typography>
                <br/>
                <div style={{fontFamily: 'Verdana'}}>
                  <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      size="small"
                      disableElevation="true"
                    >
                      Menu
                    </Button>
                    <h3><a href={this.state.menu} target="_blank" rel="noopener noreferrer">Menu</a></h3>
                </div>
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
      </div>
      <div class="card-item">
  
        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    <MonetizationOnIcon />
                    &nbsp;Deals
                  </Typography>
                  {this.state.recurring ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>

                    {this.state.recurring.map(({weekday, start_time, end_time, description}) => (
                      <li>{weekday + " - " + moment(start_time, ["hh:mm:ss"]).format("hh:mm:ss A") + 
                      " to " + moment(end_time, ["hh:mm:ss"]).format("hh:mm:ss A")} <br/> {"*" + description + "*"} <br/><br/>
                      </li>
                    ))}

                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}> 
                    No deals available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>  
      <div class="card-item">
  
        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    Description
                  </Typography>
                  {this.state.description ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    {this.state.description}
                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No description available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>
      <div class="card-item">
  
        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}> 
                    <StarsIcon />
                    &nbsp;Promos
                  </Typography>
                  {this.state.limited ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                  
                    {this.state.limited.map(({start_datetime, end_datetime, description}) => (
                      <li>{moment(start_datetime, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("dd, MM-DD-YYYY hh:mm:ss A") + 
                      " to " + moment(end_datetime, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("dd, MM-DD-YYYY hh:mm:ss A")}
                      <br/> {"*" + description + "*"} <br/><br/>
                      </li>
                    ))}

                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No promos available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>
      <div class="itemImages">
  
        <Card className="carousel-card">
            {this.state.images ? 
          
              <div>
                <div className="border-carousel" style={{fontFamily: 'Verdana'}}>
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
              </div> : 

              <div className="no-images" style={{fontFamily: 'Verdana'}}>
                <h2>No images available.</h2>
              </div> }
        </Card>
      </div>

</div>

:

<div class="card-grid">

<div class="itemImages">
  
    <Card>
        
        {this.state.images ? 
      
          <div>
            <div className="border-carousel" style={{fontFamily: 'Verdana'}}>
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
          </div> : 

          <div className="no-images" style={{fontFamily: 'Verdana'}}>
            <h2>No images available.</h2>
          </div> }
    </Card>
  </div>
  
  <div class="itemMain">
    
    <Card className="main-card">
        <CardContent>
                <br/>
                <Typography gutterBottom variant="h2" component="h2" style={{fontFamily: 'Verdana'}}>
                  {this.state.name}
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<LocationOnIcon />}
                      size="small"
                      disableElevation='true'
                    >
                      Location
                    </Button>
                  </div>
                  {this.state.address}
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                    <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<CallIcon />}
                      size="small"
                      disableElevation="true"
                    >
                      Phone Number
                    </Button>
                  </div>
                  {this.state.phone ?
                    this.state.phone : "No phone number available."
                  }
                </Typography>
                <br/>
                <Typography variant="subtitle1" color="textPrimary" component="p" style={{fontFamily: 'Verdana'}}>
                  <div>
                  <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<LocalDiningIcon />}
                      size="small"
                      disableElevation="true"
                    >
                      Tags
                    </Button>
                  </div>
                  {this.state.tags ?
                    this.state.tags : "No tags available."
                  }
                </Typography>
                <br/>
                <div style={{fontFamily: 'Verdana'}}>
                  <Button
                      variant="outlined"
                      color="primary"
                      className="main-buttons"
                      startIcon={<LocalDiningIcon />}
                      size="small"
                      disableElevation="true"
                    >
                      Menu
                    </Button>
                    <h3><a href={this.state.menu} target="_blank" rel="noopener noreferrer">Menu</a></h3>
                </div>
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
    </div>
    <div class="card-item" >

      <Card className="card-info" style={{overflowY: 'auto'}}>
          <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    <AccessTimeIcon />
                    &nbsp;Business Hours
                  </Typography>
                  {this.state.hours ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                  
                  {this.state.hours.map(({weekday, open_time, closing_time}) => (
                      <li>{weekday} <br/> {"Opens: " + moment(open_time, ["hh:mm:ss"]).format("hh:mm:ss A") + 
                      " | Closes:  " + moment(closing_time, ["hh:mm:ss"]).format("hh:mm:ss A")}</li>
                    ))}
                  
                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No hours available.
                  </Typography>
                  }
          </CardContent>
      </Card>
    </div>
    <div class="card-item">

        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    Description
                  </Typography>
                  {this.state.description ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    {this.state.description}
                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No description available.
                  </Typography>
                  }
            </CardContent>
        </Card>
    </div>
    <div class="card-item">
  
        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    <MonetizationOnIcon />
                    &nbsp;Deals
                  </Typography>
                  {this.state.recurring ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>

                    {this.state.recurring.map(({weekday, start_time, end_time, description}) => (
                      <li>{weekday + " - " + moment(start_time, ["hh:mm:ss"]).format("hh:mm:ss A") + 
                      " to " + moment(end_time, ["hh:mm:ss"]).format("hh:mm:ss A")} <br/> {"*" + description + "*"}</li>
                    ))}

                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No deals available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>  
      <div class="card-item">
  
        <Card className="card-info" style={{overflowY: 'auto'}}>
            <CardContent>
                  <Typography variant="h6" component="h2" style={{fontFamily: 'Verdana'}}>
                    <StarsIcon />
                    &nbsp;Promos
                  </Typography>
                  {this.state.limited ?
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                  
                    {this.state.limited.map(({start_datetime, end_datetime, description}) => (
                      <li>{"Starts: " + moment(start_datetime, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("dd, MM-DD-YYYY hh:mm:ss A")}<br/>
                      &nbsp;&nbsp;{"Ends: " + moment(end_datetime, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("dd, MM-DD-YYYY hh:mm:ss A")}<br/>
                      {"*" + description + "*"}
                      </li>
                    ))}

                  </Typography>
                  :
                  <Typography variant="body1" component="p" style={{fontFamily: 'Verdana'}}>
                    No promos available.
                  </Typography>
                  }
            </CardContent>
        </Card>
      </div>

    </div>
    
    }

</div>
          )
    }
}

export default withRouter(GetBusiness);
