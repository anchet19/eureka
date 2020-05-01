import React, { useState } from 'react'
import DayEventList from './day-event-list'
import axios from 'axios';
import {
  FormLabel,
  Divider,
  TextField,
  Button,
  FormGroup,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Input,
} from '@material-ui/core';

/**
 * TextField wrapper that applies some default styles
 * @param props Any additional props passed to the wrapper element 
 */
const OutlinedTextField = (props) => (
  <TextField
    {...props}
    style={{ paddingRight: '8px' }}
    margin='dense'
    variant='outlined'
    required={props.notRequired ? false : true}
  />
)


/**
 * 
 * @todo Add input for menu: single pdf. Add input multiple images, 5 max.
 */
const BusinessForm = (props) => {
  const tags = ['Chinese', 'American', 'Japanese', 'Italian', 'Deli', 'Dessert', 'Mexican', 'Vietnamese']

  // Values for form data and form default state
  const [name, setName] = useState()
  const [street, setStreet] = useState()
  const [city, setCity] = useState()
  const [state, setState] = useState()
  const [zip, setZip] = useState()
  const [tel, setTel] = useState()
  const [description, setDescription] = useState()
  const [hours, setHours] = useState([])
  const [selectedTag, setSelectedTag] = useState('Select')



  // combine these into a "deals" array when submitting
  const [recurringDeals, setRecurringDeals] = useState([])
  const [limitedDeals, setLimitedDeals] = useState([])

  const deals = [recurringDeals, limitedDeals];

  const [menu, setMenu] = useState()
  const [photos, setPhotos] = useState()

  // Geocode function to get lat, long
  function Geocode(){
    var location = 'address';
    axios.get('GET https://geocode.search.hereapi.com/v1/geocode', {
      params:{
        address: location,
        key: '' // not sure what the key is
      }
    })
    // console log respone
    .then(function(response){
      console.log(response);

       // Geometry
       var lat = response.data.results[0].geometry.location.lat;
       var lng = response.data.results[0].geometry.location.lng;
       var geometryOutput = `
         <ul class="list-group">
           <li class="list-group-item"><strong>Latitude</strong>: ${lat}</li>
           <li class="list-group-item"><strong>Longitude</strong>: ${lng}</li>
         </ul>
       `;

       document.getElementById('geometry').innerHTML = geometryOutput;

    })
    // catch errors
    .catch(function(error){
      console.log(error);
    });
  }

  // axios request goes in here
  const handleSubmit = e => {
    e.preventDefault()
    axios.post('localhost:5000/api/v1/accounts/businesses',
    /*
    {
       name = name,
       address= address,
       cuisine = selectedTag,
       lat=39.739892,
       lng=-75.077385,
       uid=95,
       description= description,
       isAdult=0,
       tel= tel,
       deals= deals,
       hours= hours,
       menu= menu,
       photo = photos
    }
    */
    )
    console.log('submitted');
  }

  return (
    <Box m={2} >
      <form onSubmit={handleSubmit}>
        <FormLabel component='legend'>Business Info</FormLabel>
        <FormGroup >
          <OutlinedTextField value={name} onChange={event => setName(event.target.value)} id='name' label='Business name' type='text' />
          <OutlinedTextField value={street} onChange={event => setStreet(event.target.value)} id='street' label='Street' type='text' />
          <OutlinedTextField value={city} onChange={event => setCity(event.target.value)} id='city' label='City' type='text' />
          <OutlinedTextField value={state} onChange={event => setState(event.target.value)} id='state' label='State' type='text' />
          <OutlinedTextField value={zip} onChange={event => setZip(event.target.value)} id='zip' label='Zip' type='text' />
          <OutlinedTextField value={tel} onChange={event => setTel(event.target.value)} id='tel' label='Telephone' type='tel' />
          <OutlinedTextField value={description} onChange={event => setDescription(event.target.value)} id='description' label='Description' type='tel' />
          </FormGroup>
          <FormGroup>
          <FormControl >
                <InputLabel id='tag-selector'> Tags</InputLabel>
                <Select labelId='tag-selector' value={selectedTag} onChange={event => setSelectedTag(event.target.value)}>
                  {tags.map(tag => (<MenuItem key={tag} value={tag} > {tag} </MenuItem>))}
                </Select>
                <br/>
            </FormControl>
            <InputLabel id='photos-selector'> Import Photos</InputLabel>
            <Input type="file" inputProps={{ multiple: true, accept: 'image/x-png,image/gif,image/jpeg,image/jpg' }} value = {photos} onChange = {event => setPhotos(event.target.value)}/>
                <InputLabel id='photos-selector'> Import Menu</InputLabel>
                <Input type="file" inputProps={{ multiple: true, accept: 'image/x-png,image/gif,image/jpeg,image/jpg' }} value = {menu} onChange = {event => setMenu(event.target.value)}/>
          </FormGroup>
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Hours</FormLabel>
        <DayEventList items={hours} onAdd={data => setHours(data)} onRemove={data => setHours(data)} />
        <FormLabel component='legend'>Specials</FormLabel>
        <DayEventList items={recurringDeals} onAdd={data => setRecurringDeals(data)} onRemove={data => setRecurringDeals(data)} />
        <FormLabel component='legend'>Events</FormLabel>
        <DayEventList dateTime={true} items={limitedDeals} onAdd={data => setLimitedDeals(data)} onRemove={data => setLimitedDeals(data)} />
        <Button type='submit'>Submit</Button>
      </form>
    </Box >
  )
}

export default BusinessForm
