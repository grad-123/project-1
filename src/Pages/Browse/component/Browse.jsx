import React, { useEffect, useState } from "react";
import "./Browse.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";

function Browse() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => {
        setCategories(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <h1 className="browse-title">{t("browse.categories")}</h1>
      <p className="browse-description">{t("browse.description")}</p>

      <div className="categories-container">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/courses/${cat.id}`}
            state={{ categoryName: cat.name }}
            className="category-link"
          >
            <div className="category-card">
              <div className="card-content">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
              <div className="card-arrow">›</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Browse;