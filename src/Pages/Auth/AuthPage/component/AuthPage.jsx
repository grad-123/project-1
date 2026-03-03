import "./AuthPage.css";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function AuthPage() {
  const { t } = useTranslation();
  const location = useLocation();

  const path = location.pathname;

  const isRegisterPage = path.includes("/register");
  const isLoginPage = path.includes("/login");
  return (
    <div className="auth-container">
      <div className="auth-image-side">
        <div className="auth-image-content">
          <h1 className="brand">EDUPRO</h1>

          <h2 className="title">{t("image.title")}</h2>
          <p className="description">{t("image.subtitle")}</p>

          <div className="stats">
            <div>
              <h3>{t("image.stats")}</h3>
              <span>{t("image.student")}</span>
            </div>

            <div>
              <h3>{t("image.ai")}</h3>
              <span>{t("image.procces")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-content">
          <Outlet />

          <div className="auth-switch">
            {isLoginPage && (
              <p>
                {t("auth.noAccount")}{" "}
                <Link to="/auth/register" className="auth-link">
                  {t("auth.register")}
                </Link>
              </p>
            )}

            {isRegisterPage && (
              <p>
                {t("auth.haveAccount")}{" "}
                <Link to="/auth/login" className="auth-link">
                  {t("auth.login")}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
