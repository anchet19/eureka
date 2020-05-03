import React, { Fragment, useState } from 'react'
import moment from 'moment'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { KeyboardDateTimePicker, TimePicker, KeyboardTimePicker } from '@material-ui/pickers'
import {
  Divider,
  Select,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  IconButton,
  MenuItem,
  InputLabel,
  FormControl,
  FormGroup,
  TextareaAutosize,
} from '@material-ui/core';

/**
 * An Object containg DateTime information and an optional description
 * @typedef {Object.(<String,Time,Time,[String]>|<DateTime,DateTime,[String])} EventItem
 */
/**
 * A component that generates and displays an interactive list of elements that can be
 * dynamically changed
 * @prop {Object[EventItem]} items - An Array of EventItems or an empty Array
 * @prop {callback} onAdd - A callback function that accepts the transformed list
 * @prop {callback} onRemove - A callback function that accepts the transformed list
 * @prop {boolean} [dateTime=false] - Used for providing a DateTime range
 */
const DayEventList = ({ onAdd, onRemove, dateTime, ...props }) => {
  const hasDescription = props.description === "true" ? true : false
  const isDateTime = dateTime === "true" ? true : false
  let STORAGE_FORMAT = ''
  if (isDateTime) {
    STORAGE_FORMAT = 'YYYY-MM-DD HH:mm'
  } else {
    STORAGE_FORMAT = 'HH:mm'
  }
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const [selectedDay, setSelectedDay] = useState('Monday')
  const [start, setStart] = useState(new moment())
  const [end, setEnd] = useState(new moment())
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState({})
  const Picker = ({ label, value, onChange }) => (
    <div style={{ display: 'grid' }}>
      {

        isDateTime ?
          <KeyboardDateTimePicker
            label={label}
            helperText={errors.timeError}
            autoOk
            disablePast
            value={value}
            error={errors.timeError}
            onChange={onChange}
            showTodayButton
          />
          :
          <KeyboardTimePicker
            label={label}
            autoOk
            error={errors.timeError}
            helperText={errors.timeError}
            mask="__:__ _M"
            value={value}
            onChange={onChange}
          />
      }
    </div>
  )

  const setDefaultState = () => {
    const now = new moment()
    setSelectedDay('Monday')
    setStart(now)
    setEnd(now)
    setDescription("")
  }
  const onAddItem = () => {
    const startTime = moment(start).day()
    const endTime = moment(end).day()
    if (startTime > endTime) {
      setErrors({ timeError: 'End date cannot be before start date' })
    } else {
      setErrors({})
      onAdd([
        ...props.items,
        {
          day: isDateTime ? false : selectedDay,
          starts: moment(start).format(STORAGE_FORMAT),
          ends: moment(end).format(STORAGE_FORMAT),
          description: description
        }
      ])
      setDefaultState()
    }
  }
  const onRemoveItem = (removeIndex) => () => {
    onRemove(props.items.filter((_, index) => {
      return index !== removeIndex
    }))
  }

  return (
    <List {...props} >
      {
        props.items.map((item, index) => (
          <ListItem key={index} style={{ display: 'grid', justifyContent: 'space-between', gridTemplateColumns: '1fr, 1fr, 1fr, 50px', gridTemplateAreas: '"dt1 dt2 dt3 btn" "nu desc desc btn"', border: '1px solid lightgrey', borderRadius: '5px' }}>
            <ListItemText style={{ gridArea: 'dt1' }}>{item.day ? item.day : moment(item.starts, STORAGE_FORMAT).format('LL')}</ListItemText>
            <ListItemText style={{ gridArea: 'dt2' }}>
              {moment(item.starts, STORAGE_FORMAT).format('LT')}
            </ListItemText>
            <ListItemText style={{ gridArea: 'dt3' }}>
              {moment(item.ends, STORAGE_FORMAT).format('LT')}
            </ListItemText>
            <ListItemText style={{ gridArea: 'desc' }} >{item.description}</ListItemText>
            <ListItemIcon style={{ gridArea: 'btn' }}>
              <IconButton onClick={onRemoveItem(index)}><DeleteIcon /></IconButton>
            </ListItemIcon>
          </ListItem>
        ))
      }

      < ListItem style={{ display: 'grid', width: '100%', gridTemplateColumns: '1fr' }}>
        {
          isDateTime ? false :
            <FormControl >
              <InputLabel id='day-selector'>Day of week</InputLabel>
              <Select labelId='day-selector' value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                {DAYS.map(day => (<MenuItem key={day} value={day} >{day}</MenuItem>))}
              </Select>
            </FormControl>
        }
        <Picker label='Start' value={start} onChange={time => setStart(time)} />
        <Picker label='End' value={end} onChange={time => setEnd(time)} />
        {hasDescription &&
          <Fragment>
            <InputLabel id='description'>Description</InputLabel>
            <TextareaAutosize rowsMin={3} rowsMax={3} label='Description' multiline="true" value={description} onChange={e => setDescription(e.target.value)} />
          </Fragment>
        }
        <ListItemIcon style={{ justifySelf: 'end' }} children={<IconButton onClick={onAddItem}><AddIcon /></IconButton>} />
      </ListItem >
      <Divider style={{ marginTop: '8px' }} />
    </List >
  )
}

export default DayEventList