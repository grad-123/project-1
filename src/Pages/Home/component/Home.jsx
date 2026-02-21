// src/Pages/Home/component/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div className="hero">
        <div className="overlay"></div>
        <div className="content">
          <div className="badge">{t("home.badge")}</div>

          <div className="main">
            <h1 className="main-title">
              {t("home.master")} <span className="word-studies">{t("home.studies")}</span>
            </h1>
          </div>

          <h2 className="sub-title">{t("home.subtitle")}</h2>

          <p className="description">{t("home.description")}</p>

          <div className="home-buttons">
            <button className="btn browse-btn" onClick={() => navigate("/Browse")}>
              {t("home.browseBtn")} <span className="arrow">→</span>
            </button>

            <button className="btn get-started-btn" onClick={() => navigate("/SignIn")}>
              {t("home.getStartedBtn")}
            </button>
          </div>
        </div>
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
            <button className="mainbtn" onClick={() => navigate("/SignIn")}>
              {t("home.createAccountBtn")}
            </button>
            <button className="secbtn" onClick={() => navigate("/Upload")}>
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