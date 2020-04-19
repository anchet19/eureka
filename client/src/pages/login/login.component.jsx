import React, { Component } from 'react';
import './login.css';
import axios from 'axios';

class LoginInput extends Component {
  state = {
    username: '',
    password: '',
  };

  handleUsernameChange = e => {
    this.setState({ username: e.target.value });
  }

  handlePasswordChange = e => {
    this.setState({ password: e.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();

    const user = {
      username: this.state.username,
      password: this.state.password
    };

    console.log({ user });
  }

  render() {
    return (
      <div className="center">

      <form onSubmit={this.handleSubmit}>

      <div class="container">

        <label for="uname"><b>Username</b></label>
        <input type="username" placeholder="Enter Username" username="uname" onChange={this.handleUsernameChange} required />

        <label for="psw"><b>Password</b></label>
        <input type="password" placeholder="Enter Password" password="pwd" onChange={this.handlePasswordChange} required />
        
        <button type="submit">Login</button>

      </div>

    </form>

    </div>
    );
  }
}

const LoginPage = () => {
  return (
    <LoginInput />
  );
};

export default LoginPage;
