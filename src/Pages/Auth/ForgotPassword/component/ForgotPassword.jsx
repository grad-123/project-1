import React, { useEffect, useState } from "react";
import { FaEnvelope, FaUnlockAlt } from "react-icons/fa";
import "./ForgotPassword.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import Check from "../../Check/component/Check";
function ForgotPassword() {
  const navigate = useNavigate();
  const [fieldError, setFieldError] = useState(false);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [Email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleSend = async (e) => {
  e.preventDefault();

  if (!Email) {
    setError(t("forgot.requiredEmail"));
    setFieldError(true);
    return;
  }

  if (!/\S+@\S+\.\S+/.test(Email)) {
    setError(t("forgot.invalidEmail"));
    setFieldError(true);
    return;
  }

  setError("");
  setLoading(true);

  try {
    const response = await axios.post(
  "/api/v1/Authentication/SendResetPasswordCode",
      null,
      {
        params: {
          Email: Email,
        },
      }
    );

    if (!response.data?.succeeded) {
      setError(response.data?.message);
      return;
    }

    navigate(`/auth/check?email=${encodeURIComponent(Email)}`);

  } catch (err) {
    console.error(err);

    const backendMessage = err?.response?.data?.message;

    setError(backendMessage || t("forgot.somethingWrong"));

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="forgot-container">
      <FaUnlockAlt className="lock-icon" />
      <h2>{t("forgot.title")}</h2>
      <p className="forgot-subtitle">{t("forgot.subtitle")}</p>

      <div className="input">
        <label>{t("forgot.Label")}</label>
<div className={`input-field ${fieldError ? "input-error" : ""}`}>          <FaEnvelope className="icon" />
          <input
            type="email"
            placeholder={t("forgot.Placeholder")}
            value={Email}
            onChange={(e) => {setEmail(e.target.value);  setFieldError(false);
            }}
            disabled={loading}
          />
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>

      <button className="send-btn" onClick={handleSend} disabled={loading}>
        {loading ?t("forgot.loading"): t("forgot.btn")}
      </button>
    </div>
  );
}

export default ForgotPassword;
