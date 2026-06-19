import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./CheckEmail.css";
function CheckEmail() {
  const { t } = useTranslation();

  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
      navigate("/auth/register", { replace: true });
    }
  }, [email, navigate]);

  return (
    <div className="register-box">
      <h2>✅ {t("checkEmail.title")}</h2>

      <p>
        {t("checkEmail.description")}
        <b> {email} </b>
      </p>
      {message && <p>{message}</p>}
      <button
        onClick={() => navigate("/auth/login", { replace: true })}
        className="register-btn"
      >
        {t("checkEmail.goToLogin")}{" "}
      </button>
    </div>
  );
}

export default CheckEmail;
