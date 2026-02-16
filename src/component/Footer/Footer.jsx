import React from "react";
import "./Footer.css";

import {
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaBookOpen,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1 */}
        <div className="footer-col">
          <div className="logo">
            <div className="logo-icon">
              <FaBookOpen />
            </div>
            <h2>EDUPRO</h2>
          </div>

          <p>
            Empowering university students with AI-driven summaries and a
            collaborative academic resource platform.
          </p>

          <div className="social-icons">
  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
    <FaTwitter />
  </a>

  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
    <FaLinkedinIn />
  </a>

  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
    <FaGithub />
  </a>

  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
    <FaFacebookF />
  </a>
</div>

        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h3>Resources</h3>
          <ul>
            <li>Browse Materials</li>
            <li>Course Summaries</li>
            <li>Past Papers</li>
            <li>AI Summarizer</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h3>Platform</h3>
          <ul>
            <li>Upload Content</li>
            <li>My Collection</li>
            <li>Quality Assurance</li>
            <li>Contributor Program</li>
          </ul>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <h3>Legal</h3>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Academic Integrity</li>
            <li>Contact Support</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 EDUPRO Platform. Developed for Palestine Technical University -
          Kadoorie.
        </p>

        <div className="engine">
          <span className="dot"></span>
          AI Engine: LLaMA 3.1 Online
        </div>

        <p>
          Made with <span className="heart">❤</span> for students
        </p>
      </div>
    </footer>
  );
}

export default Footer;
