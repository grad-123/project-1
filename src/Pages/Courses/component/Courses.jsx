import React, { useEffect, useState } from "react";
import "./Courses.css";
import { useTranslation } from "react-i18next";
import { useParams, Link ,useLocation} from "react-router-dom";
import axios from "../../../api/axiosInstance";
function Courses() {
  const { t } = useTranslation();
  const location = useLocation();
  const categoryName = location.state?.categoryName;
  const { categoryId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <h1 className="courses-title">
         {t("Course.course")} {categoryName && `- ${categoryName}`}
      </h1>
      <div className="courses-grid">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/files/${course.id}`}
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
