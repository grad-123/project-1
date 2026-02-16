import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="hero">
      <div className="overlay"></div>
      <div className="content">
        <div className="main">
          <h1 className="main-title">
            Master Your <span className="word-studies">Studies</span>
          </h1>
        </div>
        <h2 className="sub-title">With Intelligent Insight</h2>
        <p className="description">
          The intelligent platform for university students to share ideas,
          summarize complex materials with LLM-AI, and collaborate on global
          academic scale.
        </p>

        <div className="home-buttons">
          <button
            className="btn browse-btn"
            onClick={() => navigate("/Browse")}
          >
            Browse Material
          </button>
          <button
            className="btn get-started-btn"
            onClick={() => navigate("/SignIn")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
