import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./NotFound.css";

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="notfound">
      <h1>404</h1>
      <h2>{t("found.page")}</h2>
      <p>{t("found.sorry")}</p>

      <Link to="/" className="home-btn">
        {t("found.go")}
      </Link>
    </div>
  );
}

export default NotFound;