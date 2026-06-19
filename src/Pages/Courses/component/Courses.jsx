import React, { useEffect, useState } from "react";
import "./Courses.css";
import { useTranslation } from "react-i18next";
import { useParams, Link, useLocation } from "react-router-dom";
import axios from "../../../api/axiosInstance";

function Courses() {
  const { t } = useTranslation();
  const location = useLocation();
  const categoryName = location.state?.categoryName;
  const categoryIdFromState = location.state?.categoryId;
  const { categoryId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const actualCategoryId = categoryId || categoryIdFromState;
    if (actualCategoryId) {
      axios
        .get(`/api/v1/Category/GetById/${actualCategoryId}`)
        .then((res) => {
          if (res.data && res.data.succeeded) {
            setCategory(res.data.data);
          }
        })
        .catch((err) => console.error("Error fetching category:", err));
    }
  }, [categoryId, categoryIdFromState]);

  useEffect(() => {
    axios
      .get(`/Api/Course/GetList/${categoryId}`)
      .then((res) => {
        setCourses(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [categoryId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="breadcrumbs">
        <Link to="/" className="breadcrumb-link">
          {t("navbar.home")}
        </Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">
          {category?.name || categoryName || t("course.course")}
        </span>
      </div>

      <h1 className="courses-title">{t("course.course")}</h1>
      <p className="course-description">{t("course.description")}</p>

      <div className="courses-grid">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/files/${course.id}`}
            state={{
              categoryName: category?.name || categoryName,
              categoryId: categoryId,
            }}
            className="course-link"
          >
            <div className="course-box">
              <div className="course-info">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
              </div>
              <div className="course-arrow">›</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Courses;
