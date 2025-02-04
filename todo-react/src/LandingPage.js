import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="hero-section">
        <h1 className="title">Welcome to the Todo List App!</h1>
        <p className="subtitle">Organize Your Life, One Task at a Time</p>
      </header>

     

      <section className="cta-section">
        <h3>Get Started Today!</h3>
        <div className="button-group">
          <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          <Link to="/login" className="btn btn-secondary">Log In</Link>
        </div>
      </section>

      <footer className="footer-section">
        <p>Already have an account? <Link to="/login">Log In</Link></p>
      </footer>
    </div>
  );
};

export default LandingPage;