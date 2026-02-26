import "./Login.css";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Login() {
  const { t } = useTranslation();

  return (
    <div className="login-box">

      <h2>{t("login.title")}</h2>
      <p className="subtitle">{t("login.subtitle")}</p>

      <div className="input-group">
        <label>{t("login.email")}</label>
        <div className="input-field">
          <FaEnvelope className="icon" />
          <input type="email" placeholder="email@******.com" />
        </div>
      </div>

      <div className="input-group">
        <label>{t("login.password")}</label>
        <div className="input-field">
          <FaLock className="icon" />
          <input type="password" placeholder="••••••••" />
        </div>
      </div>

      <button className="login-btn">
        {t("login.signIn")}
      </button>

      <p className="forgot">{t("login.forgot")}</p>

      <div className="login-footer">
        <p>{t("login.footerText")}</p>
      </div>

    </div>
  );
}

export default Login;