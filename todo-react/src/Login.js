import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

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
        setUsername("");
        setPassword("");
        navigate("/todos");
      })
      .catch((error) => {
        console.error("Login failed:", error.response);
        toast.error("Login failed. Please check your credentials and try again.", toastOptions);
      });
  };

  return (
    <div className="login-page">
      <div className="login-form">
        <h1>Login</h1>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleLogin}>Login</button>
        <p>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;