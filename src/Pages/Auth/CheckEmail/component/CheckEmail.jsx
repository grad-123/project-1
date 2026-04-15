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

  /*const handleResend = async () => {
    try {
     await axios.post(`https://corny-unevacuated-willy.ngrok-free.dev/api/v1/Authentication/Register`, { email });
      setMessage(t("checkEmail.resendSuccess"));
    } catch (error) {
      setMessage(t("checkEmail.resendFail"));
    }
  };*/
  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
navigate("/auth/register", { replace: true });    }
  }, [email, navigate]);

  return (
    <div className="register-box">
      <h2>✅ {t("checkEmail.title")}</h2>

      <p>
        {t("checkEmail.description")}
        <b> {email} </b>
      </p>
      {/*<button onClick={handleResend}>Resend Verification Email</button> */}
      {message && <p>{message}</p>}
<button onClick={() => navigate("/auth/login", { replace: true })} className="register-btn">        {t("checkEmail.goToLogin")}{" "}
      </button>
    </div>
  );
}

export default CheckEmail;
