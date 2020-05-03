const express = require('express')
const router = express.Router()
// for validating and sanitizing request data
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const db = require('../db');
const { validate } = require('../utils/auth')

router.post('/', [
  body('username', 'Enter a username').notEmpty(),
  body('username', 'Invalid email format').isEmail().normalizeEmail(),
  body('password', 'Enter a password').notEmpty()
], (request, response) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    return response.json({ error: "Invalid usrename and password combination" })
  }
  const { username, password } = request.body

  // Retrieve the hashed password for the given email if it exists
  const sql1 = 'SELECT email, password as hash from users where email=?'
  db.query(sql1, [username], async (err, [results]) => {
    if (err) return response.json({ error: err })
    if (!results) return response.json({ error: "Invalid username and password combination" })
    try {
      // Validate the given password agains the hash from the DB
      const isValid = await validate(password, results.hash)
      if (isValid) {
        const user = {}
        // retrieve the user_id
        const sql2 = 'SELECT user_id from users where email = ?'
        db.query(sql2, [results.email], (err, [{ user_id }]) => {
          if (err) return response.json({ error: err })
          const sql3 = 'SELECT business_id as bid, name from businesses where owner_id = ?'
          db.query(sql3, [user_id], (err, results) => {
            const businesses = results
            // create token and send response
            jwt.sign({ uid: user_id, businesses: businesses }, process.env.JWT_SECRET, (err, token) => {
              if (err) { return response.json({ error: err }) }
              response.send({ token: token })
            })
          })

        })
      } else {
        response.json({ error: "Invalid username and password combination" })
      }
    } catch (err) {
      console.log(err);
    }
  })
})

module.exports = router