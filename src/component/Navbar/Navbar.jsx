import './Navbar.css'
import { FiUpload } from "react-icons/fi";
import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">EDUPRO</div>
        <ul className="nav-link">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Browse">Browse</Link>
          </li>
          <li>
            <Link to="/Favorites">Favorites</Link>
          </li>
          <li>
            <Link to="/Upload"><FiUpload/>Upload</Link>
          </li>
          <li>
            <Link to="/AI">AI</Link>
          </li>
        </ul>
        <div className="nav-right">
          <button className="icon-btn">🌙</button>
          <button className="icon-btn">🌐</button>
          <Link to="/SignIn" className="signin-btn">
            Sign In
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
