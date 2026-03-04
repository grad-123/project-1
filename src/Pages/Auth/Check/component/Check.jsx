import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Check() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const Email = searchParams.get("email") || "";

  const [Code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    try {
      await axios.post(`Authentication/SendResetPasswordCode`, null, {
        params: { Email },
      });

      setMessage(t("checkReset.resendSuccess"));
    } catch (err) {
      setMessage(err?.response?.data?.message || t("checkReset.resendFail"));
    }
  };

  const handleReset = async () => {
    if (!Code) {
      setError(t("checkReset.codeRequired"));
      return;
    }

    try {
      const response = await axios.get("Authentication/ConfirmResetPassword", {
        params: {
          Code: Code,
          Email: Email,
        },
      });

      if (response.data?.succeeded !== true) {
        setError(response.data?.message || t("checkReset.invalidCode"));
        return;
      }

      navigate(
        `/auth/reset?email=${encodeURIComponent(Email)}&code=${encodeURIComponent(Code)}`,
      );
    } catch (err) {
      setError(err?.response?.data?.message || t("checkReset.invalidCode"));
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
          <button className="check-btn secondary" onClick={handleResend}>
            {" "}
            {t("checkReset.resend")}
          </button>
          <button className="check-btn primary" onClick={handleReset}>
            {" "}
            {t("checkReset.resetPassword")}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Check;
