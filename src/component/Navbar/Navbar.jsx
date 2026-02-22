import React, { useEffect, useState } from "react";
import { HiSun, HiOutlineGlobeAlt } from "react-icons/hi";
import { FiUpload, FiMoon } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

function Navbar() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleLang = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute(
      "dir",
      newLang === "ar" ? "rtl" : "ltr",
    );
    localStorage.setItem("lang", newLang);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

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
      <div className="logo">EDUPRO</div>

      <ul className="nav-link">
        <li>
          <Link to="/">{t("navbar.home")}</Link>
        </li>
        <li>
          <Link to="/Browse">{t("navbar.browse")}</Link>
        </li>
        <li>
          <Link to="/Favorites">{t("navbar.favorites")}</Link>
        </li>
        <li>
          <Link to="/Upload">
            <FiUpload /> {t("navbar.upload")}
          </Link>
        </li>
        <li>
          <Link to="/AI">{t("navbar.ai")}</Link>
        </li>
      </ul>

      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon /> : <HiSun />}
        </button>

        <button className="icon-btn" onClick={toggleLang}>
          <HiOutlineGlobeAlt />
        </button>

        <Link to="/SignIn" className="signin-btn">
          {t("navbar.signin")}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
