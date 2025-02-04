import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import Login from "./Login";
import Signup from "./Signup";
import TodoList from "./TodoList";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from "./LandingPage";  // Import the new LandingPage component

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:5000/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          console.error("Error fetching todos:", error);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            setToken("");
            const toastOptions = {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            };
            toast.error("Your session has expired. Please login again.", toastOptions);
          } else {
            const toastOptions = {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            };
            toast.error("An error occurred while fetching your todos.", toastOptions);
          }
        });
    }
  }, [token]);

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Landing page as the home route */}
          <Route
            path="/"
            element={token ? <Navigate to="/todos" /> : <LandingPage />}  // Change to show LandingPage when not authenticated
          />

          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protect TodoList Route */}
          <Route
            path="/todos"
            element={token ? <TodoList token={token} setToken={setToken} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <ToastContainer />  
    </Router>
  );
};

export default App;