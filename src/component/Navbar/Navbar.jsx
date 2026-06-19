import React, { useEffect, useState } from "react";
import { HiSun, HiOutlineGlobeAlt } from "react-icons/hi";
import { FiUpload, FiMoon, FiUser } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../api/axiosInstance";
import logo from "/image-grad.png";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [theme, setTheme] = useState("light");

  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("0");
  const [message, setMessage] = useState("");

  let role = [];
  const storedRole = localStorage.getItem("role");
  try {
    const parsed = JSON.parse(storedRole);
    role = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    role = storedRole ? storedRole.split(",") : [];
  }
  const isAdmin = role.includes("Admin");
  const isStudent = role.includes("Student");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };

  useEffect(() => {
    const interval = setInterval(
      () => setToken(localStorage.getItem("token")),
      500,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleLang = async () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    localStorage.setItem("lang", newLang);
    await i18n.changeLanguage(newLang);
    document.documentElement.setAttribute(
      "dir",
      newLang === "ar" ? "rtl" : "ltr",
    );
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    const savedLang = localStorage.getItem("lang") || "en";
    i18n.changeLanguage(savedLang);
    document.documentElement.setAttribute(
      "dir",
      savedLang === "ar" ? "rtl" : "ltr",
    );
  }, []);

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleSearch = () => {
    if (!searchTerm) {
      setMessage(t("browse.enterKeyword"));
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const searchKeyword = searchTerm;

    setSearchTerm("");

    const params = new URLSearchParams();
    params.append("keyword", searchKeyword);
    const searchUrl = `/search-results?${params.toString()}`;

    if (location.pathname === "/search-results") {
      navigate(searchUrl, { replace: true });
    } else {
      navigate(searchUrl);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="EduPro Logo" className="logo-img" />E D U P R O
      </div>

      <ul className="nav-link">
        <li>
          <Link to="/">{t("navbar.home")}</Link>
        </li>
        {token && isStudent && (
          <>
            <li>
              <Link to="/favorites">{t("navbar.favorites")}</Link>
            </li>
            <li>
              <Link to="/upload">
                <FiUpload /> {t("navbar.upload")}
              </Link>
            </li>
            <li>
              <Link to="/ai">{t("navbar.ai")}</Link>
            </li>
          </>
        )}
        {token && isAdmin && (
          <li>
            <Link to="/admin">{t("navbar.admin")}</Link>
          </li>
        )}
      </ul>

      <div className="navbar-search-wrapper">
        <div className="navbar-search-bar">
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder={t("browse.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="navbar-search-btn" onClick={handleSearch}>
            {t("browse.searchButton")}
          </button>
        </div>
        {message && <div className="navbar-message-search">{message}</div>}
      </div>

      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon /> : <HiSun />}
        </button>
        <button className="icon-btn" onClick={toggleLang}>
          <HiOutlineGlobeAlt />
        </button>
        {token && isStudent && (
          <Link
            to="/profile"
            className="icon-btn profile-btn"
            title={t("navbar.profile")}
          >
            <FiUser />
          </Link>
        )}
        {token ? (
          <button className="signin-btn" onClick={handleLogout}>
            {t("navbar.logout")}
          </button>
        ) : (
          <Link to="/auth/login" className="signin-btn">
            {t("navbar.login")}
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
