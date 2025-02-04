import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, ListGroup, Nav, Tab } from "react-bootstrap";
import './TodoList.css';

const TodoList = ({ token, setToken }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch todos only if there's a token (user is logged in)
    if (token) {
      axios
        .get("", {
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
    }
  }, [token, navigate, setToken]);

  const handleAddTask = () => {
    if (!newTodo.trim()) return;

    axios
      .post(
        "https://backend-flask-zg7r.onrender.com/api/todos",
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
      .put(`https://backend-flask-zg7r.onrender.com/api/todos/${task_id}`, {}, {
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
      .delete(`https://backend-flask-zg7r.onrender.com/api/todos/${task_id}`, {
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
    <Container className="todo-container">
      <Tab.Container id="left-tabs-example" defaultActiveKey="home">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="todo-nav flex-column">
              <Nav.Item>
                <Nav.Link eventKey="home" className="todo-nav-link">Welcome back!</Nav.Link>
              </Nav.Item>
              {!token && (
                <Nav.Item>
                  <Nav.Link eventKey="signup" className="todo-nav-link">Sign Up</Nav.Link>
                </Nav.Item>
              )}
              {token && (
                <Nav.Item>
                  <Nav.Link onClick={handleLogout} className="todo-nav-link">Logout</Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="home">
                <h1 className="text-center mb-4" style={{color: '#FF6B6B'}}>To-Do List</h1>
                <Form className="mb-4 todo-form">
                  <Form.Group controlId="newTodo">
                    <Form.Control
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Enter a new task"
                      className="form-control-lg"
                      style={{backgroundColor: '#F4F9F9', borderColor: '#4ECDC4'}}
                    />
                  </Form.Group>
                  <Button variant="success" className="mt-2 todo-button" onClick={handleAddTask}>
                    Add Task
                  </Button>
                </Form>
                <ListGroup className="todo-list">
                  <AnimatePresence>
                    {todos.map((todo) => (
                      <motion.div
                        key={todo.task_id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ListGroup.Item className="todo-list-item d-flex justify-content-between align-items-center" style={{backgroundColor: todo.done ? '#D5F5E3' : '#FFF'}}>
                          <span style={{ textDecoration: todo.done ? "line-through" : "none", color: todo.done ? '#58D68D' : '#333' }}>
                            {todo.name}
                          </span>
                          <div className="d-flex">
                            <Button
                              variant={todo.done ? "success" : "info"}
                              size="sm"
                              className="me-2"
                              onClick={() => handleToggleTask(todo.task_id)}
                              style={{ backgroundColor: todo.done ? '#58D68D' : '#4ECDC4', borderColor: todo.done ? '#58D68D' : '#4ECDC4', color: '#fff' }}
                            >
                              {todo.done ? "Done" : "Pending"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteTask(todo.task_id)}
                              style={{backgroundColor: '#FF6B6B', borderColor: '#FF6B6B'}}
                            >
                              Delete
                            </Button>
                          </div>
                        </ListGroup.Item>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ListGroup>
              </Tab.Pane>
              <Tab.Pane eventKey="signup">
                <h2 style={{color: '#4ECDC4'}}>Sign Up</h2>
                <p>Sign up form goes here</p>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default TodoList;