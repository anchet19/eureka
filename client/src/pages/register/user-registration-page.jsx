/*
*  @author Mateusz Koza

  Working:
  - Text field changing and updating
  - Making sure all fields are required
  - Password must follow regex pattern given
  - Date picker
  - Checking for password match between normal password field and confirm password field

  Needs to be done or fixed:
  - Show error message from mismatched passwords in corresponding fields instead of displaying on browser
  - Still need to send axios POST for the given user data

*/
import React, { Component } from 'react';
import axios from 'axios'
import './user-registration.css'

class UserRegistration extends Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      dob: ''
    };

  }

  handleEmailChange = e => {
    this.setState({ username: e.target.value });
  }

  handlePasswordField1Change = e => {
    this.setState({ password: e.target.value });
  }

  handlePasswordField2Change = e => {
    this.setState({ confirm_password: e.target.value });
  }

  handleFirstNameChange = e => {
    this.setState({ first_name: e.target.value }); 
  }

  handleLastNameChange = e => {
    this.setState({ last_name: e.target.value });
  }

  handleDOBChange = e => {
    this.setState({ dob: e.target.value });
  }

  handleSubmit = e => {
    e.preventDefault();

    const { password, confirm_password } = this.state;

    const matches = password === confirm_password;
    matches ? alert("MATCHED") : alert("NO MATCH");

    // Post data to '/accounts/users' if passwords match

    if(matches) {

      const user = {
        username: this.state.username,
        password: this.state.password,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        dob: this.state.dob
      };

      console.log(user);



      axios.post('http://localhost:5000/api/v1/accounts/users', { ...user })

        
      /*
        axios.post('http://localhost:5000/api/v1/accounts/users', { user })

        .then(result => {
          console.log(result);
          console.log(result.data);
        })

        .catch(err => {
          console.log(err);
        })

      */


    }

  }

  render() {
    return (
      <div className="center">


      <h1 className="titleCenter">User Registration</h1>

      <form onSubmit={this.handleSubmit}>

      <div className="container">

        <label><b>Enter Email</b></label>
        <input type="email" placeholder="Enter Email" username="uemail" onChange={this.handleEmailChange} required />

        <label><b>Enter Password</b></label>
        <input type="password" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
        title="Must contain at least 8 characters, one uppercase character, one lowercase character, one number, and one special character" 
        placeholder="Enter Password" password="pwd" onChange={this.handlePasswordField1Change} required />

        <label><b>Retype Password</b></label>
        <input type="password" placeholder="Retype Same Password" password="pwd" onChange={this.handlePasswordField2Change}
        required />

        <label><b>First Name</b></label>
        <input type="password1" placeholder="Enter First Name" name="fname" onChange={this.handleFirstNameChange} required />

        <label><b>Last Name</b></label>
        <input type="password1" placeholder="Enter Last Name" name="lname" onChange={this.handleLastNameChange} required />

        <label><b>Date of Birth</b></label>
        <input type="date" name="dob" onChange={this.handleDOBChange} required />
        
        <button type="submit">Create Account</button>

      </div>

    </form>

    </div>

    );
  }
}

const RegisterPage = () => {
  return (
    <div>
      <UserRegistration />
    </div>
  );
};

export default RegisterPage;
