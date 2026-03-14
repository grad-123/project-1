import React, { useEffect, useState } from "react";
import { HiSun, HiOutlineGlobeAlt } from "react-icons/hi";
import { FiUpload, FiMoon } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/");
  };
  const [token, setToken] = useState(localStorage.getItem("token"));
  const storedRole = localStorage.getItem("role");

  let role = null;

  try {
    role = JSON.parse(storedRole);
  } catch {
    role = storedRole;
  }
  const isAdmin = Array.isArray(role)
    ? role.includes("Admin")
    : role === "Admin";

  const isUser = Array.isArray(role) ? role.includes("User") : role === "User";
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(localStorage.getItem("token"));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState("light");
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

  return (
    <nav className="navbar">
      <div className="logo">E D U P R O</div>

      <ul className="nav-link">
        <li>
          <Link to="/">{t("navbar.home")}</Link>
        </li>
        <li>
          <Link to="/Browse">{t("navbar.browse")}</Link>
        </li>
        {token && isUser && (
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
            <Link to="/admin">Admin</Link>
          </li>
        )}
      </ul>

      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon /> : <HiSun />}
        </button>

        <button className="icon-btn" onClick={toggleLang}>
          <HiOutlineGlobeAlt />
        </button>

        {token ? (
          <button className="signin-btn" onClick={handleLogout}>
            Logout
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
