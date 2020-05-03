import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../../hooks/useAuth'
import BusinessForm from '../../components/business-form';
import { Container } from '@material-ui/core';

const AccountPage = () => {
  const { user } = useAuth()
  const { bid } = useParams();
  const [connected, setConnected] = useState(false)
  useEffect(() => {
    const fetchAccount = async () => {
      const response = await axios.get(`/api/v1/accounts/businesses/${bid}`);
      setConnected(response.data);
    }

    // fetchAccount();
  }, [bid])

  return (
    <Container maxWidth='md'>
      <BusinessForm bid={bid} uid={user.uid} />
    </Container>
  )
};

export default AccountPage;