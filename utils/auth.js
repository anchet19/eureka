const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const saltRounds = 10

/**
 * Takes a plain text password and creates a hash to be stored in the database
 */
exports.createHash = async (password) => {
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Checks a plain text password against a hash
 */
exports.validate = (password, hash) => new Promise((resolve, reject) => {
  bcrypt.compare(password, hash, (err, result) => {
    if (err) reject({ error: err.message })
    resolve(result)
  })
})

exports.updateToken = (authorizedData, business_id, name) => new Promise(async (resolve, reject) => {
  const { uid, businesses } = authorizedData
  let newBusinesses = []
  if (!businesses) {
    newBusinesses.push({ bid: business_id, name: name })
  } else {
    newBusinesses = await businesses.map(business => {
      if (business.bid == business_id) {
        return { bid: business.bid, name: name }
      } else {
        return true
      }
    })
  }
  jwt.sign({ uid: uid, businesses: newBusinesses }, process.env.JWT_SECRET, (err, token) => {
    if (err) { reject({ error: err }) }
    resolve(token)
  })
})




