/*
*  @author Mateusz Koza
*/
import React from 'react';
import { useParams } from 'react-router-dom';
import './detailspage.css';
import GetBusiness from './getBusiness.js'
 
const DetailsPage = () => {
  let { bid } = useParams();
  
  return (
    <div className="col-centered">
      <GetBusiness />
    </div>
  );
};
 
export default DetailsPage;
