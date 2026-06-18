import React, { useEffect, useState } from "react";
import {
  MdPeople,
  MdFolder,
  MdLibraryBooks,
  MdCategory,
  MdDownload,
} from "react-icons/md";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Home.css";
import axios from "../../../api/axiosInstance";

function Home() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [stats, setStats] = useState({
    studentsCount: 0,
    filesCount: 0,
    coursesCount: 0,
    categoriesCount: 0,
    totalDownloads: 0,
  });

  // State للكاتاجوريات
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // جلب الإحصائيات
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/v1/Stats/GetStats");
        setStats(res.data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  // جلب الكاتاجوريات
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

  return (
    <>
      <div className="hero">
        <div className="overlay"></div>
        <div className="content">
          <div className="badge">{t("home.badge")}</div>

          <div className="main">
            <h1 className="main-title">
              {t("home.master")}{" "}
              <span className="word-studies">{t("home.studies")}</span>
            </h1>
          </div>

          <h2 className="sub-title">{t("home.subtitle")}</h2>

          <p className="description">{t("home.description")}</p>

          <div className="home-buttons">
           
            {!token && (
              <button
                className="btn get-started-btn"
                onClick={() => navigate("/Auth")}
              >
                {t("home.getStartedBtn")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <MdPeople size={50} color="#FF6B6B" />
            </div>
            <p>{t("home.studentsCount")}</p>
            <h2>{stats.studentsCount}+</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MdFolder size={50} color="#FFD93D" />
            </div> 
            <p>{t("home.filesCount")}</p>
            <h2>{stats.filesCount}+</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MdLibraryBooks size={50} color="#6BCB77" />
            </div>
            <p>{t("home.coursesCount")}</p>
            <h2>{stats.coursesCount}+</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MdCategory size={50} color="#4D96FF" />
            </div>
            <p>{t("home.categoriesCount")}</p>
            <h2>{stats.categoriesCount}+</h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MdDownload size={50} color="#ff6efa" />
            </div> 
            <p>{t("home.totalDownloads")}</p>
            <h2>{stats.totalDownloads}+</h2>
          </div>
        </div>
      </div>

      {/* ========== قسم الكاتاجوريات ========== */}
      <div className="home-categories-section">
        <h2 className="home-categories-title">{t("browse.categories")}</h2>
        <p className="home-categories-description">{t("browse.description")}</p>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="home-categories-container">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/courses/${cat.id}`}
                state={{ categoryName: cat.name }}
                className="home-category-link"
              >
                <div className="home-category-card">
                  <div className="home-card-content">
                    <h3>{cat.name}</h3>
                    <p>{cat.description}</p>
                  </div>
                  <div className="home-card-arrow">›</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="features-section">
        <h2 className="features-title">{t("home.featuresTitle")}</h2>
        <p className="features-subtitle">{t("home.featuresSubtitle")}</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t("home.feature1.title")}</h3>
            <p>{t("home.feature1.desc")}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>{t("home.feature2.title")}</h3>
            <p>{t("home.feature2.desc")}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌙</div>
            <h3>{t("home.feature3.title")}</h3>
            <p>{t("home.feature3.desc")}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>{t("home.feature4.title")}</h3>
            <p>{t("home.feature4.desc")}</p>
          </div>
        </div>
      </div>

      <div className="bbox">
        <div className="box">
          <h1>{t("home.readyTitle")}</h1>
          <p>{t("home.readyDesc")}</p>

          <div className="anotherButtons">
            {!token && (
              <button className="mainbtn" onClick={() => navigate("/Auth")}>
                {t("home.createAccountBtn")}
              </button>
            )}
            
            <button className="secbtn" onClick={() => navigate((token ? "/Upload" : "/Auth"))}>
              {t("home.shareNotesBtn")}
            </button>
          </div>

          <span className="copy">{t("home.copyRight")}</span>
        </div>
      </div>
    </>
  );
}

export default Home;