import './Navbar.css'
import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    <>
      <nav className="navbar">
        <div className="logo">Edu Pro</div>
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
            <Link to="/Upload">Upload</Link>
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
