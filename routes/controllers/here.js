const axios = require('axios')


module.exports = getGeocode = (address) => new Promise((resolve, reject) => {
  const base = 'https://geocode.search.hereapi.com/v1/geocode'
  const nospaces = address.replace(/\s/g, '+')
  const escapedQuery = nospaces.replace(/,/g, '%2C')
  axios({
    method: 'get',
    url: base,
    params: {
      q: escapedQuery,
      apiKey: process.env.HERE_SECRET_REST_API
    }
  })
    .then(res => {
      resolve(res.data.items[0].position)
    })
    .catch(err => { reject(err) })
})