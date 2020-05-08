const db = require('../../db')

const self = {
  /**
   * Retrieves a list of tuples (bid, name) where bid is a unique business id and name is the business name
   * @param {number} UID - The unique user_id
   * @returns {Promise} Promise object represents the business info or an sql error
   */
  getUserBusinesses: (UID) => new Promise((resolve, reject) => {
    const sql = 'call selectUserBusinesses(?)'
    db.query(sql, UID, (err, [results]) => {
      if (err) reject({ error: err.sqlMessage })
      resolve(results)
    })
  })
}

module.exports = self;