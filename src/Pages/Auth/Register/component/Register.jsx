import "./Register.css";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Register() {
  const { t } = useTranslation();

  return (
    <div className="register-box">

      <h2>{t("register.title")}</h2>
      <p className="subtitle">{t("register.subtitle")}</p>

      {/* Full Name */}
      <div className="input-group">
        <label>{t("register.fullName")}</label>
        <div className="input-field">
          <FaUser className="icon" />
          <input type="text" placeholder={t("register.fullNamePlaceholder")} />
        </div>
      </div>

      {/* Email */}
      <div className="input-group">
        <label>{t("register.email")}</label>
        <div className="input-field">
          <FaEnvelope className="icon" />
          <input type="email" placeholder="email@******.com" />
        </div>
      </div>

      {/* Password */}
      <div className="input-group">
        <label>{t("register.password")}</label>
        <div className="input-field">
          <FaLock className="icon" />
          <input type="password" placeholder="••••••••" />
        </div>
      </div>

      <button className="register-btn">
        {t("register.createAccount")}
      </button>

      <div className="register-footer">
        <p>{t("register.footerText")}</p>
      </div>

    </div>
  );
}

export default Register;