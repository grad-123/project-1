import React, { useEffect, useState } from "react";
import "./Browse.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";
import { FaSearch } from "react-icons/fa";
function Browse() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    axios
      .get("https://localhost:7090/api/v1/Category/GetList")
      .then((res) => {
        setCategories(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="browse-page">
      <h1 className="browse-title">{t("browse.categories")}</h1>
      <div className="search-wrapper">
      
      <input
        type="text"
        placeholder={t("browse.searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <FaSearch className="search-icon" />
      </div>
      <div className="categories-container">
        {categories.map((cat) => (
          <Link key={cat.id} to={`/courses/${cat.id}`}>
            <div className="category-card">
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Browse;
