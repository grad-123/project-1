import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import "./Check.css";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Check() {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const Email = searchParams.get("email") || "";

  const [Code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    try {
      await axios.post(`/api/v1/Authentication/SendResetPasswordCode`, null, {
        params: { Email },
      });

      setMessage(t("checkReset.resendSuccess"));
    } catch (err) {
      setMessage(err?.response?.data?.message || t("checkReset.resendFail"));
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!Code) {
      setError(t("checkReset.codeRequired"));
      return;
    }

    try {
      const response = await axios.get(
        `/api/v1/Authentication/ConfirmResetPassword?Code=${encodeURIComponent(Code)}&Email=${encodeURIComponent(Email)}`,
      );
      if (response.data?.succeeded) {
        setMessage(response.data.message);
        setTimeout(() => {
  navigate(`/auth/reset?email=${encodeURIComponent(Email)}`, { replace: true });
}, 1000);
      } else {
        setError(response.data?.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-container">
      <div className="check-card">
        <h2>{t("checkReset.title")}</h2>
        <p className="check-card">
          {t("checkReset.description")} {Email}
        </p>
        <input
          className="check-input"
          type="email"
          placeholder={t("checkReset.emailPlaceholder")}
          value={Email}
          disabled
        />
        <input
          className="check-input"
          placeholder={t("checkReset.codePlaceholder")}
          value={Code}
          onChange={(e) => setCode(e.target.value)}
        />
        {message && <p className="success-text">{message}</p>}
        <div className="check-buttons">
          <button
            type="button"
            className="check-btn secondary"
            onClick={handleResend}
          >
            {" "}
            {t("checkReset.resend")}
          </button>
          <button
            type="button"
            className="check-btn primary"
            onClick={handleReset}
            disabled={loading}
          >
            {loading
              ? t("checkReset.loooding")
              : t("checkReset.resetPassword")}{" "}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Check;
