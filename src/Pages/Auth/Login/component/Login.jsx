import "./Login.css";
import { GoogleLogin } from "@react-oauth/google";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import axios from "../../../../api/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState({
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    setFieldError({
      ...fieldError,
      [name]: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoginError("");
    setEmailNotVerified(false);
    setLoading(true);

    try {
      if (!user.email || !user.password) {
        setLoginError(t("login.enterEmailPassword"));
        setFieldError({
          email: !user.email,
          password: !user.password,
        });
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(user.email)) {
        setLoginError(t("login.invalidEmailFormat"));
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("Email", user.email);
      formData.append("Password", user.password);

      const response = await axios.post(
        `/api/v1/Authentication/SignIn`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = response.data;

      if (!data || !data.succeeded) {
        setLoginError(data?.message || t("login.failed"));
        return;
      }

      localStorage.setItem("token", data.data.accessToken);

      const decoded = jwtDecode(data.data.accessToken);
      if (data.data.refreshToken?.tokenString) {
        localStorage.setItem(
          "refreshToken",
          data.data.refreshToken.tokenString,
        );
      }
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const isAdmin = Array.isArray(role)
        ? role.includes("Admin")
        : role === "Admin";

      localStorage.setItem("role", JSON.stringify(role));

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data);

      const backendMessage = error.response?.data?.message;

      if (backendMessage) {
        if (backendMessage?.toLowerCase().includes("email not confirmed")) {
          setEmailNotVerified(true);
          setLoginError("");
          return;
        }

        setLoginError(backendMessage);
      } else {
        setLoginError(t("login.invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const response = await axios.post("/api/v1/Authentication/GoogleSignIn", {
        idToken: idToken,
      });
      const data = response.data;
      if (!data.succeeded) {
        setLoginError(data.message);
        return;
      }

      localStorage.setItem("token", data.data.accessToken);

      if (data.data.refreshToken?.tokenString) {
        localStorage.setItem("refreshToken", data.data.refreshToken.tokenString);
      }

      const decoded = jwtDecode(data.data.accessToken);

      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const isAdmin = Array.isArray(role)
        ? role.includes("Admin")
        : role === "Admin";

      localStorage.setItem("role", JSON.stringify(role));

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setLoginError("Google login failed");
    }
  };

  return (
    <div className="login-box">
      <h2>{t("login.title")}</h2>
      <p className="subtitle">{t("login.subtitle")}</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t("login.email")}</label>
          <div
            className={`input-field ${fieldError.email ? "input-error" : ""}`}
          >
            <FaEnvelope className="icon" />
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={user.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <label>{t("login.password")}</label>
          <div
            className={`input-field ${fieldError.password ? "input-error" : ""}`}
          >
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={user.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {loginError && <p className="error-text">{loginError}</p>}
        {emailNotVerified && (
          <p className="error-text">{t("login.verifyFirst")}</p>
        )}

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? t("login.loading") : t("login.signIn")}
        </button>
      </form>

      <div className="google-btn">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            setLoginError("Google Login Failed");
          }}
        />
      </div>

      <Link to="/auth/forgot" className="forgot">
        {t("login.forgot")}
      </Link>

      <div className="login-footer">
        <p>{t("login.footerText")}</p>
      </div>
    </div>
  );
}

export default Login;
