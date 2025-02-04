import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import './signup.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignupForm from './SignupForm';




const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (formData) => {
    setIsLoading(true);

    axios
      .post("https://backend-flask-zg7r.onrender.com/signup", formData)
      .then((response) => {
        console.log("Signup successful!:", response.data);
        toast.success("Account created! Please login.", {
          ...toastOptions,
        });
        navigate("/login");
      })
      .catch((error) => {
        console.error("Signup failed:", error);
        
        if (error.response) {
          let errorMessage = error.response.data?.msg || "An error occurred during signup. Please try again.";
          toast.error(errorMessage, toastOptions);
        } else if (error.request) {
          toast.error("No response from server. Please check your connection and try again.", toastOptions);
        } else {
          toast.error("An error occurred. Please try again later.", toastOptions);
        }
      })
      .finally(() => setIsLoading(false));
  };

  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  return (
    <div className="signup-page">
      <div className="signup-form">
        <h1>Create Your Account</h1>
        <p>Join us to start organizing your tasks effortlessly.</p>
        <SignupForm onSubmit={handleSignup} />
        <p>Already have an account? <Link to="/login" className="link-btn">Log In</Link></p>
        {isLoading && <p>Loading...</p>}
      </div>
    </div>
  );
};

export default Signup;