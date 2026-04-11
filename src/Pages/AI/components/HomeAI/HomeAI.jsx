import "./HomeAI.css";
import { useTranslation } from "react-i18next";

function HomeAI() {
  const { t } = useTranslation();
  return (
    <div className="ai-home">
      <div className="ai-banner">
        <div className="banner-content">
          <h2>{t("aiHome.title")}</h2>
          <p>{t("aiHome.description")}</p>
          <div className="tags">
            <span>🎥 {t("browse.types.lecture")}</span>
            <span>🧾 {t("browse.types.exam")}</span>
            <span>📚 {t("browse.types.book")}</span>
            <span>📌 {t("browse.types.assignment")}</span>
          </div>
        </div>
      </div>

      <h4 className="section-title">{t("aiHome.whatYouCanDo")}</h4>

      <div className="cards-grid">
        <div className="card">
          <span className="emoji">⚡</span>
          <strong>{t("aiHome.cards.instant")}</strong>
          <p>{t("aiHome.cards.instantDesc")}</p>
        </div>
        <div className="card">
          <span className="emoji">✨</span>
          <strong>{t("aiHome.cards.summary")}</strong>
          <p>{t("aiHome.cards.summaryDesc")}</p>
        </div>
        <div className="card">
          <span className="emoji">🎯</span>
          <strong>{t("aiHome.cards.context")}</strong>
          <p>{t("aiHome.cards.contextDesc")}</p>
        </div>
        <div className="card">
          <span className="emoji">📚</span>
          <strong>{t("aiHome.cards.types")}</strong>
          <p>{t("aiHome.cards.typesDesc")}</p>
        </div>
      </div>

      <h4 className="section-title">{t("aiHome.capabilities")}</h4>

      <div className="capabilities">
        <div className="cap-card">
          <span className="number-badge">01</span>
          <div className="text-content">
            <strong>{t("aiHome.cap.deep")}</strong>
            <p>{t("aiHome.cap.deepDesc")}</p>
          </div>
        </div>

        <div className="cap-card">
          <span className="number-badge">02</span>
          <div className="text-content">
            <strong>{t("aiHome.cap.qa")}</strong>
            <p>{t("aiHome.cap.qaDesc")}</p>
          </div>
        </div>

        <div className="cap-card">
          <span className="number-badge">03</span>
          <div className="text-content">
            <strong>{t("aiHome.cap.summary")}</strong>
            <p>{t("aiHome.cap.summaryDesc")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeAI;