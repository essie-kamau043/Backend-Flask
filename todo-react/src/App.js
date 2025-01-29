import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import Login from "./Login";
import Signup from "./Signup";
import TodoList from "./TodoList";

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
          }
        });
    }
  }, [token]);

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Redirect home page to login if not authenticated */}
          <Route
            path="/"
            element={token ? <Navigate to="/todos" /> : <Navigate to="/login" />}
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
    </Router>
  );
};

export default App;
