/**
 * Middleware for controlling requests to the the /api/v1/accounts/ endpoints
 * API DOCUMENTATION AVAILABLE AT https://documenter.getpostman.com/view/8868237/SzYaVJ6Z
 * 
 * @module Route callbacks for all user account info
 * @author Chris Ancheta, Jaxon Terrell
 */

const express = require('express')
const router = express.Router()
const path = require('path')
const moment = require('moment')
// for validating and sanitizing request data
const { body, validationResult } = require('express-validator')

// for handling file uploads and multipart-form data
const multer = require('multer')
const { upload } = require('../middlewares/multer')

const db = require('../db');

const { createHash, updateToken } = require('../utils/auth')
const { checkToken } = require('../middlewares/auth')

const { getBusinessDetails } = require('./controllers/business.controllers')
const getGeocode = require('./controllers/here')

/**
 * Create a new Consumer user
 */
router.post('/users', [
  body('username').isEmail().normalizeEmail(), // username must be an email
  body('password')
    // password must be at least 8 characters long, have both upper and lower case letters, 
    // at least 1 number and 1 special character
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage(`must be at least 8 characters long, 
      contain an uppercase letter, a number, and a special character`
    ),
  body('dob').isISO8601(), // check DOB for ISO8601 format yyyy-mm-dd
  body('first_name')
    .not().isEmpty()
    .trim(),
  body('last_name')
    .not().isEmpty()
    .trim()

], async (request, response) => {
  // Check for any express-validator errors
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    console.log(errors);
    return response.status(422).json({ errors: errors.array() })
  }
  const hashedPass = await createHash(request.body.password)
  const sql = 'CALL insertUser("consumer",?,?,?,?,?,@new_user_id)'
  db.query(
    sql,
    [
      request.body.username,
      hashedPass,
      request.body.dob,
      request.body.first_name,
      request.body.last_name,
    ],
    (err, results) => {
      if (err) response.status(422).json({ error: err.sqlMessage })
      return response.status(200).json(results)
    })
})

// Create a new business
router.post(
  '/businesses',
  checkToken,
  (request, response, next) => {
    /**
     * middleware to handle multipart-form and file uploads
     * uploads files to AWS S3 and separates request form into
     * request.body and request.files
     */
    upload(request, response, (err) => {
      if (request.fileValidationError) {
        return response.send(request.fileValidationError);
      }
      else if (err instanceof multer.MulterError) {
        return response.send(err.message);
      }
      else if (err) {
        return response.send(err);
      }
      else {
        next()
      }
    })
  },
  /**
   * Middlewares for validation and sanitization of incomming data
   */
  [
    body(['uid', 'isAdult'], 'Field required').notEmpty().toInt(),
    body('name', 'Field required').not().isEmpty(),
    // phone number must be in the form xxx-xxx-xxxx and not begin with 0 or 1
    body('tel')
      .not()
      .isEmpty()
      .trim()
      .matches(/^[2-9]\d{2}-\d{3}-\d{4}$/)
      .withMessage('Telephone number not a valid format'),
    body(['address', 'cuisine'], 'Field required')
      .not()
      .isEmpty(),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }
    try {
      const { uid, name, address, cuisine, description, isAdult, owner_id, tel } = request.body
      const { lat, lng } = await getGeocode(address)
      // Use the user_id to retrieve the username and password
      const sql1 = 'CALL selectUser(?)'
      db.query(sql1, [request.body.uid], (err, results, fields) => {
        const [[user]] = results

        if (err) return response.json({ error: err.sqlMessage })
        const { email, password } = user
        const menu = request.files.menu[0].location
        const photos = request.files.photo

        // Create the business and capture the newly created BID
        const sql2 = 'CALL insertBusiness(?,?,?,?,?,?,?,?,?,?,?,?)'
        db.query(
          sql2,
          [
            uid,
            null,
            null,
            name,
            address,
            lat,
            lng,
            menu,
            cuisine,
            description,
            isAdult,
            tel
          ],
          async (err, results, fields) => {
            if (err) { return response.json({ error: err.sqlMessage }) }
            const [[{ business_id }]] = results
            // If user uploaded any photos. Add the urls to the database
            if (photos) {
              const sql3 = 'CALL insertImage(?,?,?)'
              photos.forEach((photo) => {
                db.query(sql3, [business_id, photo.originalname, photo.location], (err, results) => {
                  if (err) return response.json({ error: err.sqlMessage })
                })
              })
            }
            // If the user provided any deals, insert them into the database
            // Procedure requires null for some fields to distinguish between the types and how they're stored
            let deals = request.body.deals
            if (deals) {
              deals = await JSON.parse(request.body.deals)
              let sql4 = ''
              deals.forEach(({ description, day, starts, ends }) => {
                if (day) {
                  sql4 = 'CALL insertDeal(?,?,"Recurring",?,?,?,null,null)'
                } else {
                  sql4 = 'CALL insertDeal(?,?,"Limited",?,null,null,?,?)'
                }
                db.query(sql4, [
                  business_id,
                  description,
                  day ? day : null,
                  starts,
                  ends,
                ],
                  (err, results) => {
                    if (err) { response.json({ error: err.sqlMessage }) }
                  })
              })
            }
            // Insert business hours of operation into the database
            const hours = await JSON.parse(request.body.hours)
            const sql5 = 'CALL insertBusinessHours(?,?,?,?)'
            hours.forEach(({ day, starts, ends }) => {
              db.query(sql5, [business_id, day, starts, ends], (err, results) => {
                if (err) return response.json({ error: err.sqlMessage })
              })
            })
            const token = await updateToken(request.authorizedData, business_id, name)
            return response.status(200).json({ bid: business_id, message: 'Business Created', token: token })
          })
      })
    } catch (err) {
      console.error(err.stack);
      response.status(422).json({ error: err.stack })
    }
  }
)


router.get('/businesses/:business_id', checkToken, async (request, response) => {
  // send back info for a particular business based on their unique business id
  const { business_id } = request.params
  if (business_id === 'undefined') {
    return response.json({ error: 'no businesses found' })
  }

  const result = await getBusinessDetails(business_id)
  // split the string to get street and city
  const [street, city, rest] = result.info.address.split(', ')
  // state and zip are not separated by a comma so they must be split as a separate action
  const [state, zip] = rest.split(' ')
  // reconstruct the address to have the format we need in our response
  result.info.address = {
    street: street,
    city: city,
    state: state,
    zip: zip
  }
  result.deals.limited = result.deals.limited.map(deal => ({
    day: deal.weekday,
    description: deal.description,
    starts: deal.start_time || deal.start_datetime,
    ends: deal.end_time || deal.end_datetime
  }))
  result.deals.recurring = result.deals.recurring.map(deal => ({
    day: deal.weekday,
    description: deal.description,
    starts: deal.start_time || deal.start_datetime,
    ends: deal.end_time || deal.end_datetime
  }))
  result.hours = result.hours.map(item => ({
    day: item.weekday,
    starts: item.open_time,
    ends: item.closing_time
  }))
  response.json(result)
})

router.get('/users/:user_id', checkToken, (request, response) => {
  // send back info for a particular user based on their unique user id
  let userInfo = 'call selectUser(?)';
  db.query(userInfo, request.params.user_id, (error, [[results]]) => {
    if (error) {
      return console.error(error.message);
    };
    //makes sure we only get a response once we've executed the last SQL proc 
    response.json(results);
  });
});



router.put(
  '/businesses/:business_id',
  checkToken,
  (request, response, next) => {
    /**
     * middleware to handle multipart-form and file uploads
     * uploads files to AWS S3 and separates request form into
     * request.body and request.files
     */
    upload(request, response, (err) => {
      if (request.fileValidationError) {
        return response.send(request.fileValidationError);
      }
      else if (err instanceof multer.MulterError) {
        return response.send(err.message);
      }
      else if (err) {
        return response.send(err);
      }
      else {
        next()
      }
    })
  },
  [
    //may need to add a param for business_id, depending on if we ask for user to input
    body(['isAdult'], 'Field required').notEmpty().toInt(),
    body('name', 'Field required').not().isEmpty(),
    body('tel')
      .not()
      .isEmpty()
      .trim()
      .matches(/^[2-9]\d{2}-\d{3}-\d{4}$/) // phone number must be in the form xxx-xxx-xxxx
      .withMessage('Telephone number not a valid format'),
    body(['address', 'cuisine'], 'Field required')
      .not()
      .isEmpty(),
    body('description'),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }
    try {
      const { uid, name, address, cuisine, description, isAdult, tel } = request.body
      const { business_id } = request.params
      const menu = request.files.menu ? request.files.menu[0].location : null
      const photos = request.files.photo;
      const { lat, lng } = await getGeocode(address)
      // update info for a particular business based on their unique business id
      const sql2 = 'CALL updateBusiness(?,?,?,?,?,?,?,?,?,?)';
      db.query(
        sql2,
        [
          business_id,
          name,
          address,
          lat,
          lng,
          menu,
          cuisine,
          description,
          isAdult,
          tel
        ],
        (err, results, fields) => {
          if (err) response.json({ error: err.sqlMessage })

        })
      if (photos) {
        const stmt = 'CALL clearImages(?)'
        db.query(stmt, [business_id], (err, results) => {
          if (err) return response.json({ error: err.sqlMessage })
          const sql3 = 'CALL insertImage(?,?,?)'
          photos.forEach((photo) => {
            db.query(sql3, [business_id, photo.originalname, photo.location], (err, results, fields) => {
              if (err) return response.json({ error: err.sqlMessage })

            })
          })
        })

      }
      // If the user provided any deals clear old deals and insert new deals into the database
      if (request.body.deals) {
        const deals = await JSON.parse(request.body.deals)
        const stmt2 = 'CALL clearDeals(?)'
        db.query(stmt2, [business_id], (err, results, fields) => {
          if (err) return response.json({ error: err.sqlMessage })
          // Each deal type requires certain fields to be null so generate the procedure call dynamically
          let sql4 = ''
          deals.forEach(({ description, day, starts, ends, }) => {
            if (day) {
              sql4 = 'CALL insertDeal(?,?,"Recurring",?,?,?,null,null)'
            } else {
              sql4 = 'CALL insertDeal(?,?,"Limited",?,null,null,?,?)'
              starts = moment(starts, "YYYY-MM-DD HH-mm Z").format("YYYY-MM-DD HH-mm").toString()
              ends = moment(ends, "YYYY-MM-DD HH-mm Z").format("YYYY-MM-DD HH-mm").toString()
            }
            db.query(sql4, [
              business_id,
              description,
              day ? day : null, // null here instead of in statement to make each call have 5 wildcards 
              starts,
              ends,
            ],
              (err, results, fields) => {
                if (err) { console.error(err.stack) }
              })
          })
        })
      }

      // Update business hours of operation
      if (request.body.hours) {
        const hours = await JSON.parse(request.body.hours)
        const stmt3 = 'CALL clearBusinessHours(?)'
        db.query(stmt3, [business_id], (err, results) => {
          const sql5 = 'CALL insertBusinessHours(?,?,?,?)'
          hours.forEach(({ day, starts, ends }) => {
            db.query(sql5, [business_id, day, starts, ends], (err, results) => {
              if (err) return response.json({ error: err.sqlMessage })
            })
          })
        })
      }
      setTimeout(async () => {
        const token = await updateToken(request.authorizedData, business_id, name)
        response.status(200).json({ bid: business_id, message: 'Business Updated', token: token })
      }, 1000);
    } catch (err) {
      console.error(err.stack)
      response.status(422).json({ error: err.stack })
    }
  })




router.get('/test', checkToken, async (req, res) => {
  console.log(req.authorizedData);
  const token = await updateToken(req.authorizedData, 55, "sharkeys")
  res.json(req.authorizedData)
})

module.exports = router