import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import Img from 'react-image'
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
  InputLabel,
  Link,
  MenuItem
} from '@material-ui/core';

import DayEventList from './day-event-list'


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

const TAGS = [
  'American',
  'Thai',
  'Japanese',
  'Mexican',
  'Jamaican',
  'German'
]


const BusinessForm = (props) => {
  const history = useHistory()
  const [error, setError] = useState()
  // Values for form data and form default state
  const [name, setName] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [tel, setTel] = useState('')
  const [hours, setHours] = useState([])
  const [description, setDescription] = useState('')
  const [cuisine, setCuisine] = useState('')
  // combine these into a "deals" array when submitting
  const [recurringDeals, setRecurringDeals] = useState([])
  const [limitedDeals, setLimitedDeals] = useState([])
  const [menu, setMenu] = useState()
  const [photos, setPhotos] = useState([])

  // if probs.bid changes, refetch the data
  useEffect(() => {
    loadBusinessData()
  }, [props.bid])

  // fetch the data for the given business id from the server
  const loadBusinessData = () => {
    axios.get(`http://localhost:3000/api/v1/accounts/businesses/${props.bid}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem('eurekajwt')}` } } // provide token from local storage for auth
    )
      .then(response => {
        // destructure the response to get all fields needed
        const { name, address: { street, city, state, zip }, tel, menu, description, cuisine } = response.data.info
        const images = response.data.images
        const { limited, recurring } = response.data.deals
        const hours = response.data.hours
        console.log(limited);
        // Set the form state using newly fetched data
        setName(name)
        setStreet(street)
        setCity(city)
        setState(state)
        setZip(zip)
        setTel(tel)
        setMenu(menu)
        setDescription(description)
        setPhotos(images)
        setHours(hours)
        setRecurringDeals(recurring)
        setLimitedDeals(limited)
        setCuisine(TAGS.indexOf(cuisine))
      })
      .catch(error => {
        console.log(error);
      })
  }

  // Ensure tel is entered in the right format
  const handleTelChange = (e) => {
    const pattern = /^[2-9][0-9]{0,2}-?[0-9]{0,3}-?[0-9]{0,4}$/
    const val = e.target.value
    if (pattern.test(val) || val === '') {
      if (val.length === 3 || val.length === 7) {
        setTel(val + '-')
      } else {
        setTel(val)
      }
    }
  }
  // Validate zipcode format before changing
  const handleZipChange = (e) => {
    const val = e.target.value
    const pattern = /^[0-9]{0,5}$/
    if (pattern.test(val) || val === '') {
      setZip(val)
    }
  }
  //Validate state format before changing
  const handleStateChange = (e) => {
    const val = e.target.value.toUpperCase()
    const pattern = /^$|^[A-Z]{0,2}$/
    if (pattern.test(val)) {
      setState(val)
    }
  }

  /**
   * Generate an Img component to render as a preview
   * @param {File | Object} photo Either a File or an Object with a name and a path
   */
  const generatePreviewImage = (photo) => {
    const url = photo instanceof File ? URL.createObjectURL(photo) : photo.path
    return (<Img key={photo.name} src={url} width={150} height={125} />)
  }

  // if any of the required fields are empty display an error for each and return false
  const validateForm = () => {
    let isValid = true;
    const errs = {
      name: !!name || "Name is required",
      street: !!street || "Street is required",
      city: !!city || "City is required",
      state: !!state || "State is required",
      zip: !!zip || "Zip code is required",
      tel: !!tel || "Telephone number is required",
      cuisine: !!cuisine || "Cuisine is required",
      menu: !!menu || "Menu is required",
      hours: hours.length > 0 || "Hours of operation are required",
      photos: photos.length < 6 || "Too many photos selected, 5 max"
    }
    setError(errs)
    for (let [key, value] of Object.entries(errs)) {
      if (value !== true) {
        isValid = false
      }
    }
    return isValid
  }

  // const test = () => {
  //   console.log(name);
  //   console.log(street);
  //   console.log(city);
  //   console.log(state);
  //   console.log(zip);
  //   console.log(tel);
  //   console.log(hours);
  //   console.log(description);
  //   console.log(cuisine);
  //   console.log(recurringDeals);
  //   console.log(limitedDeals);
  //   console.log(menu);
  //   console.log(photos);
  // }
  // axios request goes in here
  const handleSubmit = e => {
    e.preventDefault()
    console.log(JSON.stringify(limitedDeals));
    if (validateForm()) {
      let httpMethod = ''
      let url = ''
      let callback = undefined  // depends on if the form is for updating or creating a business
      if (props.bid) {
        httpMethod = 'put'
        url = `http://localhost:3000/api/v1/accounts/businesses/${props.bid}`
        callback = () => {
          loadBusinessData()
        }
      } else {
        httpMethod = 'post'
        url = `http://localhost:3000/api/v1/accounts/businesses`
        callback = (bid) => {
          history.push(`/accounts/businesses/${bid}`)
        }
      }
      // construct the FormData object to be sent to the backend
      const fd = new FormData();
      const address = street + ', ' + city + ', ' + state + ' ' + zip
      const allDeals = [...limitedDeals, ...recurringDeals]
      fd.append('uid', props.uid)
      fd.append('name', name)
      fd.append('address', address)
      fd.append('cuisine', TAGS[cuisine])
      fd.append('tel', tel)
      fd.append('description', description)
      fd.append('isAdult', 0)
      fd.append('deals', JSON.stringify(allDeals))
      fd.append('hours', JSON.stringify(hours))
      if (menu instanceof File) {
        fd.append('menu', menu)
      }
      if (photos.length > 0 && photos[0] instanceof File) {
        for (let i = 0; i < photos.length; i++) {
          fd.append('photo', photos[i])
        }
      }
      axios({
        method: httpMethod,
        url: url,
        data: fd,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('eurekajwt')}`
        }
      })
        .then(res => {
          if (res.status === 200) {
            alert(res.data.message + ', Business ID: ' + res.data.bid)
            callback(res.data.bid)
          }
        })
        .catch(err => console.log(err))
    }
  }

  return (
    <Box m={2} >
      <form onSubmit={handleSubmit}>
        <FormLabel component='legend'>Business Info</FormLabel>
        <FormGroup >
          <FormHelperText error={true}><label>{error ? error.name : ''}</label></FormHelperText>
          <OutlinedTextField value={name} onChange={event => setName(event.target.value)} id='name' label='Business name' type='text' />

          <FormHelperText error={true}><label>{error && error.street}</label></FormHelperText>
          <OutlinedTextField value={street} onChange={event => setStreet(event.target.value)} id='street' label='Street' type='text' />

          <FormHelperText error={true}><label>{error ? error.city : ''}</label></FormHelperText>
          <OutlinedTextField value={city} onChange={event => setCity(event.target.value)} id='city' label='City' type='text' />

          <FormHelperText error={true}><label>{error ? error.state : ''}</label></FormHelperText>
          <OutlinedTextField value={state} onChange={handleStateChange} id='state' label='State' type='text' />

          <FormHelperText error={true}><label>{error ? error.zip : ''}</label></FormHelperText>
          <OutlinedTextField value={zip} onChange={handleZipChange} id='zip' label='Zip' type='text' />

          <FormHelperText error={true}><label>{error ? error.tel : ''}</label></FormHelperText>
          <OutlinedTextField value={tel} onChange={handleTelChange} id='tel' label='Telephone' type='tel' />
        </FormGroup>
        <Divider style={{ margin: '8px' }} />

        <FormLabel component='legend'>Cuisine</FormLabel>
        <FormControl>
          <FormHelperText error={true}><label>{error ? error.cuisine : ''}</label></FormHelperText>
          <Select
            value={cuisine}
            native={true}
            inputProps={{ name: 'cuisine', id: 'cuisine-select' }}
            onChange={e => setCuisine(e.target.value)}
          >
            {
              TAGS.map((val, index) => (<option key={index} value={index}>{val}</option>))
            }
          </Select>
        </FormControl>
        <Divider style={{ margin: '8px' }} />

        <FormLabel component='legend'>Description</FormLabel>
        <TextareaAutosize id='description' value={description} style={{ width: '100%' }} rowsMax={5} rowsMin={5} onChange={e => setDescription(e.target.value)} />
        <Divider style={{ margin: '8px' }} />

        <FormLabel component='legend'>Images (5 max) </FormLabel>
        <FormHelperText error={true}><label>{error ? error.photos : ''}</label></FormHelperText>
        <div>
          {
            [...photos].map(photo => generatePreviewImage(photo))
          }
        </div>
        <Input type="file" inputProps={{ multiple: true, accept: 'image/x-png,image/gif,image/jpeg,image/jpg' }} onChange={event => setPhotos(event.target.files)} />
        <Divider style={{ margin: '8px' }} />

        <FormLabel component='legend'>Menu {menu && <Link href={menu instanceof File ? URL.createObjectURL(menu) : menu}>Preview</Link>}</FormLabel>
        <FormHelperText error={true}><label>{error ? error.menu : ''}</label></FormHelperText>
        <Input type="file" inputProps={{ multiple: true, accept: 'application/pdf' }} onChange={event => setMenu(event.target.files[0])} />
        <Divider style={{ margin: '8px' }} />

        <FormLabel component='legend'>Hours</FormLabel>
        <FormHelperText error={true}><label>{error ? error.hours : ''}</label></FormHelperText>
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