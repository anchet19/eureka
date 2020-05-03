import React from 'react';
import Container from '@material-ui/core/Container'
import BusinessForm from '../../components/business-form';
import { useAuth } from '../../hooks/useAuth'
const BusinessRegistrationPage = () => {
  const { user } = useAuth()
  return (
    <Container maxWidth='md'>
      <BusinessForm uid={user.uid} />
    </Container>
  )
}

export default BusinessRegistrationPage;
