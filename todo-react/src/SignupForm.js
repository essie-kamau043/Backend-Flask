import React, { useState } from 'react';

const SignupForm = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value) => {
    if (!value) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError('Email is invalid');
    } else {
      setEmailError('');
    }
  };

  const validateUsername = (value) => {
    if (!value) {
      setUsernameError('Username is required');
    } else {
      setUsernameError('');
    }
  };

  const validatePassword = (value) => {
    let errors = [];

    if (value.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/\d/.test(value)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('Password must contain at least one special character');
    }

    if (errors.length > 0) {
      setPasswordError(errors.join(', '));
    } else {
      setPasswordError('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!emailError && !usernameError && !passwordError && email && username && password) {
      onSubmit({ email, username, password }); 
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }} 
          placeholder="Email"
        />
        {emailError && <p style={{color: 'red'}}>{emailError}</p>}
      </div>
      <div>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => {
            setUsername(e.target.value);
            validateUsername(e.target.value);
          }} 
          placeholder="Username"
        />
        {usernameError && <p style={{color: 'red'}}>{usernameError}</p>}
      </div>
      <div>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }} 
          placeholder="Password"
        />
        {passwordError && <p style={{color: 'red'}}>{passwordError}</p>}
      </div>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;