import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const TodoList = ({ token, setToken }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/api/todos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setTodos(response.data))
      .catch((error) => {
        console.error("Error fetching todos:", error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          setToken("");
          navigate("/login");
        }
      });
  }, [token, navigate, setToken]);

  const handleAddTask = () => {
    if (!newTodo.trim()) return;

    axios
      .post(
        "http://127.0.0.1:5000/api/todos",
        { name: newTodo },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        setTodos([...todos, response.data]);
        setNewTodo("");
      })
      .catch((error) => console.error("Error adding task:", error));
  };

  const handleToggleTask = (task_id) => {
    axios
      .put(`http://127.0.0.1:5000/api/todos/${task_id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setTodos(
          todos.map((todo) =>
            todo.task_id === task_id ? { ...todo, done: response.data.done } : todo
          )
        );
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  const handleDeleteTask = (task_id) => {
    axios
      .delete(`http://127.0.0.1:5000/api/todos/${task_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setTodos(todos.filter((todo) => todo.task_id !== task_id));
      })
      .catch((error) => console.error("Error deleting task:", error));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/login");
  };

  return (
    <div>
      <h1>To-Do List</h1>
      <button onClick={handleLogout}>Logout</button>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Enter a new task"
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        <AnimatePresence>
          {todos.map((todo) => (
            <motion.li key={todo.task_id}>
              <span>{todo.name}</span>
              <button onClick={() => handleToggleTask(todo.task_id)}>
                {todo.done ? "Undo" : "Done"}
              </button>
              <button onClick={() => handleDeleteTask(todo.task_id)}>Delete</button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default TodoList;
