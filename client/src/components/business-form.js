import React, { useState } from 'react'
import {
  FormLabel,
  Divider,
  TextField,
  Button,
  FormGroup,
  Box,
  TextareaAutosize,
  Input,
  FormHelperText,
  option,
  Select,
  FormControl,
  InputLabel
} from '@material-ui/core';

import DayEventList from './day-event-list'
import axios from 'axios';

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
  // required={props.notRequired ? false : true}
  />
)


/**
 * 
 * @todo Add input for menu: single pdf. Add input multiple images, 5 max.
 */
const BusinessForm = (props) => {
  const [error, setError] = useState('')
  // Values for form data and form default state
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [tel, setTel] = useState('')
  const [hours, setHours] = useState([])
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState(0)
  // combine these into a "deals" array when submitting
  const [recurringDeals, setRecurringDeals] = useState([])
  const [limitedDeals, setLimitedDeals] = useState([])

  const [menu, setMenu] = useState([])
  const [photos, setPhotos] = useState([])

  console.log(props.uid)
  const test = () => {
    console.log(name);
    console.log(street);
    console.log(city);
    console.log(state);
    console.log(zip);
    console.log(tel);
    console.log(hours);
    console.log(description);
    console.log(cuisine);
    console.log(recurringDeals);
    console.log(limitedDeals);
    console.log(menu);
    console.log(photos);
  }
  // axios request goes in here
  const handleSubmit = e => {
    e.preventDefault()
    if (error) return

    // Get lat and long
    const fd = new FormData();
    const address = street + ', ' + city + ', ' + state + zip
    const allDeals = [...limitedDeals, ...recurringDeals]
    fd.append('uid', props.uid)
    fd.append('business_id', props.bid || null)
    fd.append('name', name)
    fd.append('address', address)
    fd.append('cuisine', cuisine)
    fd.append('tel', tel)
    fd.append('description', description)
    fd.append('isAdult', 0)
    fd.append('deals', JSON.stringify(allDeals))
    fd.append('hours', JSON.stringify(hours))
    fd.append('menu', menu)
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        fd.append('photo', photos[0])
      }
    }
    test()
    axios({
      method: 'post',
      url: 'http://localhost:3000/api/v1/accounts/businesses',
      data: fd
    })
      .then(res => { console.log(res.data) })
      .catch(err => console.log(err))
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
        </FormGroup>
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Cuisine</FormLabel>
        <FormControl>
          <InputLabel htmlFor='cuisine-select'>Cuisine</InputLabel>
          <Select value={cuisine} inputProps={{ name: 'cuisine', id: 'cuisine-select' }} onChange={e => setCuisine(e.target.value)}>
            <option aria-label="None" value="" />
            <option value={1}>American</option>
            <option value={2}>Thai</option>
            <option value={3}>Asian</option>
            <option value={4}>Mexican</option>
            <option value={5}>Jamaican</option>
            <option value={6}>German</option>
          </Select>
        </FormControl>
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Description</FormLabel>
        <TextareaAutosize id='description' style={{ width: '100%' }} rowsMax={5} rowsMin={5} onChange={e => setDescription(e.target.value)} />
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Images (5 max) </FormLabel>
        <Input type="file" inputProps={{ multiple: true, accept: 'image/x-png,image/gif,image/jpeg,image/jpg' }} onChange={event => setPhotos(event.target.files)} />
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Menu</FormLabel>
        <Input type="file" inputProps={{ multiple: true, accept: 'application/pdf' }} onChange={event => setMenu(event.target.files[0])} />




        <FormHelperText error={true}>{error}</FormHelperText>
        <Divider style={{ margin: '8px' }} />
        <FormLabel component='legend'>Hours</FormLabel>
        <DayEventList items={hours} dateTime="false" description="false" onAdd={data => setHours(data)} onRemove={data => setHours(data)} />
        <FormLabel component='legend'>Specials</FormLabel>
        <DayEventList items={recurringDeals} dateTime="false" description="true" onAdd={data => setRecurringDeals(data)} onRemove={data => setRecurringDeals(data)} />
        <FormLabel component='legend'>Events</FormLabel>
        <DayEventList dateTime="true" items={limitedDeals} description="true" onAdd={data => setLimitedDeals(data)} onRemove={data => setLimitedDeals(data)} />
        <Button variant="contained" color='primary' type='submit'>Submit</Button>
      </form>
    </Box >
  )
}

export default BusinessForm