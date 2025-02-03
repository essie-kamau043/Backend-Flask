import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './signup.css'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignupForm from './SignupForm'; // Assuming SignupForm is in the same directory

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Using useState here

  const handleSignup = (email) => {
    setIsLoading(true); // Set loading state
    const signupData = { email }; 

    axios
      .post("http://127.0.0.1:5000/signup", signupData)
      .then((response) => {
        console.log("Signup successful!:", response.data);
        toast.success("Account created! Please login.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        navigate("/login");
      })
      .catch((error) => {
        console.error("Signup failed:", error.response);
        toast.error("Signup failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .finally(() => setIsLoading(false)); // Reset loading state
  };

  return (
    <div className="signup-page">
      <div className="signup-form">
        <h1>Signup</h1>
        <SignupForm onSubmit={handleSignup} />
        <p>Already have an account? <Link to="/login">Login</Link></p>
        {isLoading && <p>Loading...</p>} 
      </div>
    </div>
  );
};

export default Signup;