import { useState } from "react";
import "./AuthPage.css";
import Login from "../../Login/component/Login";
import Register from "../../Register/component/Register";
import { useTranslation } from "react-i18next";

function AuthPage() {
  const [mode, setMode] = useState("login");
  const { t } = useTranslation();

  return (
    <div className="auth-container">
      <div className="auth-image-side"></div>

      <div className="auth-form-side">
        <div className="auth-content">
          {mode === "login" ? <Login /> : <Register />}

          <div className="auth-switch">
            {mode === "login" ? (
              <p>
                {t("auth.noAccount")}
                <button onClick={() => setMode("register")}>
                  {t("auth.register")}
                </button>
              </p>
            ) : (
              <p>
                {t("auth.haveAccount")}
                <button onClick={() => setMode("login")}>
                  {t("auth.login")}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
