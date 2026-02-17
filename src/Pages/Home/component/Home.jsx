import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
  <>
    <div className="hero">
  <div className="overlay"></div>
  <div className="content">
    <div className="badge">✨ Empowering Academic Excellence with AI</div>

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
        Browse Material <span className="arrow">→</span>
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



<div className="features-section">
  <h2 className="features-title">Intelligent Learning Ecosystem</h2>

  <p className="features-subtitle">
    Designed specifically for the rigorous demands of modern higher education,
    combining community knowledge with cutting-edge AI.
  </p>

  <div className="features-grid">

    <div className="feature-card">
      <div className="feature-icon">⚡</div>
      <h3>AI-Powered Insights</h3>
      <p>
        Instantly summarize complex academic papers and textbooks using
        advanced AI tools.
      </p>
    </div>

    <div className="feature-card">
      <div className="feature-icon">🤝</div>
      <h3>Collaborative Learning</h3>
      <p>
        Share your notes and insights with peers and build a collective
        academic knowledge base.
      </p>
    </div>

    <div className="feature-card">
      <div className="feature-icon">🌙</div>
      <h3>Deep Focus Mode</h3>
      <p>
        Optimized reading experience designed to reduce eye strain during
        long study sessions.
      </p>
    </div>

    <div className="feature-card">
      <div className="feature-icon">🔍</div>
      <h3>Smart Search</h3>
      <p>
        Quickly find exactly what you need with intelligent semantic search.
      </p>
    </div>

  </div>
</div>

</>
    
  );
}

export default Home;
