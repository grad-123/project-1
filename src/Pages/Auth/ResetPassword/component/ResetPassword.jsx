import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";
import axios from "../../../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const Email = searchParams.get("email") || "";
  const Code = searchParams.get("code") || "";
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Email) {
      navigate("/auth/forgot");
    }
  }, [Email, navigate]);

  const validatePassword = (password, confirmPassword) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

    if (!password) return t("reset.passwordRequired");
    if (password.length < 8) return t("reset.passwordMin");
    if (!pattern.test(password)) return t("reset.passwordPattern");
    if (password !== confirmPassword) return t("reset.passwords_not_match");

    return null;
  };

  const handleReset = async () => {
    setError("");
    setMessage("");

    const validationError = validatePassword(Password, ConfirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("Email", Email);
      formData.append("Password", Password);
      formData.append("ConfirmPassword", ConfirmPassword);

      const response = await axios.post(
        "/api/v1/Authentication/ResetPassword",
        formData,
      );

      if (response.data?.succeeded !== true) {
        setError(response.data?.message || t("reset.failed"));
        return;
      }

      setMessage(t("reset.success"));

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || t("reset.failed"));
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (message || error) {
    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [message, error]);

  return (
    <div className="reset-container">
      <h2>{t("reset.title")}</h2>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <input
        className="reset-input"
        value={Email}
        disabled
        placeholder={t("reset.email")}
      />

      <input
        className="reset-input"
        type="text"
        placeholder={t("reset.new_password")}
        value={Password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        className="reset-input"
        type="text"
        placeholder={t("reset.confirm_password")}
        value={ConfirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <p className="password-note">{t("reset.message")}</p>
      <button className="reset-button" onClick={handleReset} disabled={loading}>
        {loading ? t("reset.processing") : t("reset.button")}
      </button>
    </div>
  );
}

export default ResetPassword;
