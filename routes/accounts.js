/**
 * Middleware for controlling requests to the the /api/v1/accounts/ endpoints
 * API DOCUMENTATION AVAILABLE AT https://documenter.getpostman.com/view/8868237/SzYaVJ6Z
 * 
 * @module Route callbacks for all user account info
 * @authors Chris Ancheta, Jaxon Terrell
 */

const express = require('express')
const router = express.Router()
const path = require('path')
// for validating and sanitizing request data
const { body, validationResult } = require('express-validator')
// for handling file uploads and multipart-form data
const multer = require('multer')
const { upload } = require('../middlewares/multer')

const db = require('../db');
const { createHash } = require('../utils/auth')


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
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
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
      if (err) response.status(422).json({ error: err.message })
      return response.status(200).json(results)
    })
})

// Create a new business
router.post(
  '/businesses',
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
    /**
     * @todo Add a field to the database to store this value then modify query.
     */
    // body('tel')
    //   .not()
    //   .isEmpty()
    //   .trim()
    //   .matches(/^[2-9]\d{2}-\d{3}-\d{4}$/) // phone number must be in the form xxx-xxx-xxxx
    //   .withMessage('Telephone number not a valid format'),
    body(['address', 'cuisine'], 'Field required')
      .not()
      .isEmpty(),
    body(['lat', 'lng'], 'Field required').notEmpty().toFloat(),
  ],
  (request, response) => {
    // console.log(request.body);
    // console.log(request.files);
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }
    try {
      // Use the user_id to retrieve the username and password
      const sql1 = 'CALL selectUser(?)'
      db.query(sql1, [request.body.uid], (err, [[user]], fields) => {
        if (err) return response.json({ error: err })
        // Create the business and capture the newly created BID
        const sql2 = 'CALL insertBusiness(?,?,?,?,?,?,?,?,?,?,?)'
        db.query(
          sql2,
          [
            user.user_id,
            user.email,
            user.password,
            request.body.name,
            request.body.address,
            request.body.lat,
            request.body.lng,
            request.files.menu[0].location,
            request.body.cuisine,
            request.body.description,
            request.body.isAdult,
            request.body.owner_id
          ],
          async (err, [[results]]) => {
            if (err) return response.json({ error: err })
            // If user uploaded any photos. Add the url to the database
            if (request.files.photo) {
              const sql3 = 'CALL insertImage(?,?,?)'
              request.files.photo.forEach((photo) => {
                db.query(sql3, [results.BID, photo.originalname, photo.location], (err, results) => {
                  // if (err) return response.json({ error: err })
                  console.log({ photos: results });
                })
              })
            }
            // If the user provided any deals, insert them into the database
            if (request.body.deals) {
              const deals = await JSON.parse(request.body.deals)
              const sql4 = 'CALL insertDeal(?,?,?,?,?,?,?,?)'
              deals.forEach(({ description, type, day, start_time, end_time, start_datetime, end_datetime }) => {
                console.log(description, type, day, start_time, end_time, start_datetime, end_datetime)
                db.query(sql4, [
                  results.BID,
                  description,
                  type, day,
                  start_time,
                  end_time,
                  start_datetime,
                  end_datetime
                ],
                  (err, results) => {
                    if (err) return response.json({ error: err })
                  })
              })
            }
            // Insert business hours of operation into the database
            const hours = await JSON.parse(request.body.hours)
            const sql5 = 'CALL insertBusinessHours(?,?,?,?)'
            hours.forEach(({ day, open_time, close_time }) => {
              db.query(sql5, [results.BID, day, open_time, close_time], (err, results) => {
                if (err) return response.json({ error: err })
              })
            })
          })
      })
    } catch (err) {
      response.status(422).json({ error: err })
    }
  }
)

router.get('/businesses/:business_id', (request, response) => {
  // send back info for a particular business based on their unique business id
  var combinedOutput;
  let sql = 'select * from businesses where business_id = ?';
  let sql1= 'SELECT path FROM business_discovery.business_images WHERE business_id = ?;'
  let sql2 = 'select deal_id from business_discovery.business_deals where bus_deals_id = ?;'
  db.query(sql, request.params.business_id, (error, results) => {
    var queryJSON = results;
    if(error) {
      return console.error(error.message);
    }
    combinedOutput = queryJSON;
  });  
  db.query(sql1, request.params.business_id, (error, results) => {
    var queryJSON1 = results;
    console.log(results)
    if(error) {
      return console.error(error.message);
    }
    combinedOutput.push(queryJSON1);
  });  
  
  db.query(sql2, request.params.business_id, (error, results) => {
    var queryJSON2 = results;
    console.log(results)
    if(error) {
      return console.error(error.message);
    }
    combinedOutput.push(queryJSON2);
    response.json(combinedOutput);
  });  
})

router.get('/users/:user_id', (request, response) => {
  // send back info for a particular user based on their unique user id
})

router.put('/businesses/:business_id', (request, response) => {
  // update info for a particular business based on their unique business id
})

router.put('/users/:user_id', (request, response) => {
  // update info for a particular user based on their unique user id
})

router.patch('/users/:user_id', (request, response) => {
  // send back info for a particular business based on their unique business id
})

router.patch('/users/:user_id/recover', (request, response) => {
  // set a temporary password for a particular user based on their unique user id
  // and send an email to use it to change
  // TBD IF WE NEED
})

module.exports = router