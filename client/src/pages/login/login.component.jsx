import React, { useState } from 'react';
import './login.css';

import { useAuth } from '../../hooks/useAuth'

const LoginInput = () => {
  const { login, getErrors } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('')
  const handleUsernameChange = e => {
    setUsername(e.target.value)
  }

  const handlePasswordChange = e => {
    setPassword(e.target.value);
  }

  const handleSubmit = e => {
    e.preventDefault();
    login(username, password)
  }
  return (
    <div className="center">

      <form onSubmit={handleSubmit}>

        <div className="container">
          <label htmlFor="uname"><b>Username</b></label>
          <input type="username" placeholder="Enter Username" username="uname" value={username} onChange={handleUsernameChange} required />
          <label htmlFor="psw"><b>Password</b></label>
          <input type="password" placeholder="Enter Password" password="pwd" value={password} onChange={handlePasswordChange} required />
          <p style={{ color: 'red' }}>{getErrors()}</p>

          <button type="submit">Login</button>

        </div>

      </form>

    </div>
  );
}

const LoginPage = () => {
  return (
    <LoginInput />
  );
};

export default LoginPage;