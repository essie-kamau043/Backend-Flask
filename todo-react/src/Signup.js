// src/Signup.js
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    console.log('Signup request data:', { username, password });

    axios
      .post("http://127.0.0.1:5000/signup", { username, password })
      .then((response) => {
        console.log("Signup successful!:", response.data);
        alert("Account created! Please login.");

        setUsername("");
        setPassword("");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Signup failed:", error.response);
        alert("Signup failed. Please try again.");
      });
    };


  return (
    <div>
      <h1>Signup</h1>
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Sign Up</button>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Signup;
