import React, { useState, useEffect } from "react";
import { HiMoon, HiSun, HiOutlineGlobeAlt } from "react-icons/hi";
import './Navbar.css'
import { FiUpload,FiMoon } from "react-icons/fi";
import { Link } from "react-router-dom";
function Navbar() {
  const [theme,setTheme]=useState("light");
  useEffect(()=>{
        document.documentElement.setAttribute("data-theme", theme);
  },[theme]);
const toggleTheme =()=>{
  setTheme(theme==="light"?"dark":"light");
}
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
          <button className="icon-btn" onClick={toggleTheme}>
            {theme==="light"?<FiMoon/>:<HiSun/>}</button>
          <button className="icon-btn"><HiOutlineGlobeAlt/></button>
          <Link to="/SignIn" className="signin-btn">
            Sign In
          </Link>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
