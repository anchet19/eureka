const jwt = require('jsonwebtoken')

/**
 * Middleware for protected routes
 * Checks the provided Bearer tokens validity. If invalid returns 403: Forbidden
 */
exports.checkToken = (request, response, next) => {
  const header = request.headers['authorization'];

  if (typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, authorizedData) => {
      let isValid = false
      authorizedData.businesses.forEach(item => {
        if (item.bid == request.params.business_id) {
          isValid = true
        }
      })
      if (err || !isValid) { return response.sendStatus(403) }
      request.authorizedData = authorizedData
      next()
    })
  } else {
    //If header is undefined return Forbidden (403)
    response.sendStatus(403)
  }
}