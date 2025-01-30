// src/Login.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUsername("");
    setPassword("");
  }, []);
  

  const handleLogin = () => {
    console.log("Attempting to login:", { username, password });
    axios
      .post("http://127.0.0.1:5000/login", { username, password })
      .then((response) => {
        console.log("Login successful, response:", response.data);
        setToken(response.data.access_token);
        localStorage.setItem("token", response.data.access_token);

        // Clear input fields before navigating
        setUsername("");
        setPassword("");

        navigate("/todos");
      })
      .catch((error) => {
        console.error("Login failed:", error.response);
        alert("Login failed. Please check your credentials and try again.");
      });
  };

  return (
    <div>
      <h1>Login</h1>
      <label htmlFor="username">Username:</label>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;