import React from 'react';
import { Redirect, useParams } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth'
import BusinessForm from '../../components/business-form';
import { Container } from '@material-ui/core';

const AccountPage = () => {
  const { user } = useAuth()
  const { bid } = useParams();
  console.log(user.businesses)
  console.log(bid)
  const ownsBusiness = () => {
    let owns = false
    user.businesses.forEach(entry => {
      if (entry.bid == bid) {
        owns = true
      }
    })
    return owns
  }
  return (
    <Container maxWidth='md'>
      {
        // Redirect if the current user does not own the given business
        ownsBusiness() ? <BusinessForm bid={bid} uid={user.uid} /> : <Redirect to='/login' />
      }
    </Container>
  )
};

export default AccountPage;