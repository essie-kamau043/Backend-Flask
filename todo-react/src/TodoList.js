import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, ListGroup,  Nav, Tab } from "react-bootstrap";
import './TodoList.css';
const TodoList = ({ token, setToken }) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch todos only if there's a token (user is logged in)
    if (token) {
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
    }
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
    <Container className="mt-5">
      <Tab.Container id="left-tabs-example" defaultActiveKey="home">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="home">Welcome back !</Nav.Link>
              </Nav.Item>
              {!token && (
                <Nav.Item>
                  <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                </Nav.Item>
              )}
              {token && (
                <Nav.Item>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </Nav.Item>
              )}
            </Nav>
          </Col>
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="home">
                <h1 className="text-center mb-4">To-Do List</h1>
                <Form className="mb-4">
                  <Form.Group controlId="newTodo">
                    <Form.Control
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Enter a new task"
                    />
                  </Form.Group>
                  <Button variant="primary" className="mt-2" onClick={handleAddTask}>
                    Add Task
                  </Button>
                </Form>
                <ListGroup>
                  <AnimatePresence>
                    {todos.map((todo) => (
                      <motion.div
                        key={todo.task_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <ListGroup.Item className="d-flex justify-content-between align-items-center">
                          <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                            {todo.name}
                          </span>
                          <div className="d-flex">
                            <Button
                              variant="success"
                              size="sm"
                              bg={todo.done ? "success" : "warning"}
                              className="me-2"
                              onClick={() => handleToggleTask(todo.task_id)}
                              style={{ cursor: "pointer" }}
                            >
                              {todo.done ? "Done" : "Pending"}
                            </Button>


                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteTask(todo.task_id)}
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
                {/* Here you would add your Signup component or form */}
                <h2>Sign Up</h2>
                {/* Placeholder for signup form */}
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