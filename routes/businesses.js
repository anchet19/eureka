/**
 * 
 * 
 * @module Route callbacks for consumer-user facing business info
 * @author Jaxon Terrell
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');


router.get('/', (request, response) => {
  // send back dummy data array of objects with data for homepage

})

router.get('/:business_id', (request, response) => {
  //send back info for a particular business based on their unique business id
  let sqlArray = ['call selectBusiness(?);', 'call selectBusinessImages(?);', 'call selectBusinessHours(?);', 'call selectDeals(?);', 'call selectDealHours(?);'] 
  var jsonArray = [];
  for (let step = 0; step <= sqlArray.length-1; step++) {
    db.query(sqlArray[step], request.params.business_id, (error, [[results]]) => {
      if(error) {
        return console.error(error.message);
      }
      //makes sure we only get a response once we've executed the last SQL proc 
      if(step == (sqlArray.length-1)) {
        jsonArray.push(results);
        response.json(jsonArray);
        console.log(jsonArray);
      }
      else {
        jsonArray.push(results);
      }
    });  
  };
});

module.exports = router
