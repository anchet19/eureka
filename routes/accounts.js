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
// for validating and sanitizing request data
const { body, validationResult } = require('express-validator')

// for handling file uploads and multipart-form data
const multer = require('multer')
const { upload } = require('../middlewares/multer')

const db = require('../db');
const { createHash } = require('../utils/auth')
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
  console.log(request.body);

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
      if (err) response.status(422).json({ error: err.message })
      return response.status(200).json(results)
    })
})

// Create a new business
router.post(
  '/businesses', checkToken,
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
    // if (!errors.isEmpty()) {
    //   return response.status(422).json({ errors: errors.array() })
    // }
    try {
      console.log(request.body);
      console.log(request.files);
      console.log('==========================================================');
      const { uid, name, address, cuisine, description, isAdult, owner_id, tel } = request.body
      const { lat, lng } = await getGeocode(address)
      // Use the user_id to retrieve the username and password
      const sql1 = 'CALL selectUser(?)'
      db.query(sql1, [request.body.uid], (err, results, fields) => {
        const [[user]] = results
        console.log(user);
        if (err) return response.json({ error: err.message })
        const { email, password } = user
        const menu = request.files.menu[0].location
        const photos = request.files.photo
        console.log(photos);
        console.log(menu);
        console.log('==========================================================');

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
            if (err) { return response.json({ error: err }) }
            console.log(results)
            console.log('==========================================================');

            const [[{ BID }]] = results
            // If user uploaded any photos. Add the urls to the database
            if (photos) {
              const sql3 = 'CALL insertImage(?,?,?)'
              photos.forEach((photo) => {
                db.query(sql3, [BID, photo.originalname, photo.location], (err, results) => {
                  if (err) return response.json({ error: err })
                })
              })
            }
            // If the user provided any deals, insert them into the database
            let deals = request.body.deals
            console.log(deals);
            console.log('==========================================================');

            if (deals) {
              deals = await JSON.parse(request.body.deals)
              const sql4 = 'CALL insertDeal(?,?,?,?,?,?,?,?)'
              deals.forEach(({ description, type, day, start_time, end_time, start_datetime, end_datetime }) => {
                db.query(sql4, [
                  BID,
                  description,
                  type, day,
                  start_time,
                  end_time,
                  start_datetime,
                  end_datetime
                ],
                  (err, results) => {
                    if (err) { console.error(err.stack) }
                  })
              })
            }
            // Insert business hours of operation into the database
            const hours = await JSON.parse(request.body.hours)
            console.log(hours);
            console.log('==========================================================');

            const sql5 = 'CALL insertBusinessHours(?,?,?,?)'
            hours.forEach(({ day, starts, ends }) => {
              db.query(sql5, [BID, day, starts, ends], (err, results) => {
                if (err) return response.json({ error: err })
              })
            })
            return response.status(200).json('Business Created')
          })
      })
    } catch (err) {
      response.status(422).json({ error: err.stack })
    }
  }
)


router.get('/businesses/:business_id', async (request, response) => {

  // send back info for a particular business based on their unique business id
  const { business_id } = request.params
  const result = await getBusinessDetails(business_id)
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
  body(['uid', 'isAdult'], 'Field required').notEmpty().toInt(),
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
  body(['lat', 'lng'], 'Field required').notEmpty().toFloat(),
  body('menu').not().isEmpty().trim(),
  body('description'),
  body('isAdult').toBoolean(), //must be an int of 0 or 1
  ], 
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ errors: errors.array() })
    }
    try {
      const { uid, name, address, lat, lng, cuisine, description, isAdult, tel } = request.body
      const sql1 = 'CALL selectUser(?)'
      db.query(sql1, [request.body.uid], (err, [[user]]) =>   {
        if (err) return response.json({ error: err.message });
        const { email, password } = user;
        const menu = request.files.menu[0].location;
        const photos = request.files.photo;
        // update info for a particular business based on their unique business id
        const sql2 = 'CALL updateBusiness(?,?,?,?,?,?,?,?,?,?)';
        db.query(
          sql2,
          [
            request.params.business_id,
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
          async (err, results) => {
            if(err) response.status(422).json({ error: err.essage })
            const  BID  = results
            if (photos) {
              const sql3 = 'CALL insertImage(?,?,?)'
              photos.forEach((photo) => {
                db.query(sql3, [BID, photo.originalname, photo.location], (err, results) => {
                  if (err) return response.json({ error: err })
                })
              })
            }
            // If the user provided any deals, insert them into the database
            if (request.body.deals) {
              const deals = await JSON.parse(request.body.deals)
              const sql4 = 'CALL insertDeal(?,?,?,?,?,?,?,?)'
              deals.forEach(({ description, type, day, start_time, end_time, start_datetime, end_datetime }) => {
                db.query(sql4, [
                  BID,
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
            //const hours = await JSON.parse(request.body.hours)
            //const sql5 = 'CALL insertBusinessHours(?,?,?,?)'
            //hours.forEach(({ day, open_time, close_time }) => {
            //  db.query(sql5, [BID, day, open_time, close_time], (err, results) => {
            //    if (err) return response.json({ error: err })
            //  })
            //})
            response.status(200).json('Business Updated')
            })
          })
        } catch (err) {
        response.status(422).json({ error: err })
        }
})

router.put('/users/:user_id', checkToken, checkToken, (request, response) => {
  // update info for a particular user based on their unique user id
})

router.patch('/users/:user_id', checkToken, (request, response) => {
  // send back info for a particular business based on their unique business id
})

router.patch('/users/:user_id/recover', checkToken, (request, response) => {
  // set a temporary password for a particular user based on their unique user id
  // and send an email to use it to change
  // TBD IF WE NEED
})

module.exports = router