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
  var combinedOutput;
  //send back info for a particular business based on their unique business id
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
  
  
  // let sql = 'CALL business_discovery.selectBusiness(?)'
  // db.query(sql, request.params.business_id, (error, results) => {
  //   var queryJSON = results[0];
  //   if(error) {
  //     return console.error(error.message);
  //   }
  //   combinedOutput = queryJSON;
  //   console.log(combinedOutput);
  //   response.json(combinedOutput);
  // });
});

module.exports = router
