import "./Register.css";
import axios from "../../../../api/axiosInstance";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { object, string, ref } from "yup";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const RegisterSchema = object({
    fullName: string().required(t("validation.usernameRequired")),

    email: string()
      .email(t("validation.emailInvalid"))
      .required(t("validation.emailRequired")),

    password: string()
      .required(t("validation.passwordRequired"))
      .min(6, t("validation.passwordMin"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
        t("validation.passwordPattern"),
      ),
    confirmPassword: string()
      .required(t("validation.passwordConfirmRequired"))
      .when("password", {
        is: (password) => password && password.length > 0,
        then: (schema) =>
          schema.oneOf([ref("password")], t("validation.passwordMatch")),
      }),
  });

  const handleChange = async (e) => {
    const { name, value } = e.target;

    const updatedUser = {
      ...user,
      [name]: value,
    };

    setUser(updatedUser);

    setTouched({
      ...touched,
      [name]: true,
    });

    try {
      await RegisterSchema.validateAt(name, updatedUser);

      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [name]: err.message,
      }));
    }
  };

  const validateData = async () => {
    try {
      await RegisterSchema.validate(user, { abortEarly: false });

      setErrors({});
      return true;
    } catch (error) {
      const validationErrors = {};

      error.inner.forEach((err) => {
        validationErrors[err.path] = err.message;
      });

      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!(await validateData())) return;

    try {
      setLoading(true);
      setErrors({});
      const response = await axios.post(
        `/api/v1/Authentication/Register`,
        user,
      );

      if (response.data?.succeeded === true) {
        navigate("/auth/checkemail", {
          state: { email: user.email },
        });
        return;
      }

      setErrors({
        general: response.data?.message || "Register failed",
      });
    } catch (error) {
      setErrors({
        general: error?.response?.data?.message || "Network error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-box">
      <h2>{t("register.title")}</h2>
      <p className="subtitle">{t("register.subtitle")}</p>
      {errors.general && (
        <p className="error-text general-error">{errors.general}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>{t("register.fullName")}</label>

          <div
            className={`input-field ${
              errors.fullName && submitted ? "input-error" : ""
            }`}
          >
            <FaUser className="icon" />

            <input
              type="text"
              value={user.fullName}
              name="fullName"
              onChange={handleChange}
              placeholder={t("register.fullNamePlaceholder")}
            />
          </div>

          {errors.fullName && submitted && (
            <p className="error-text">{errors.fullName}</p>
          )}
        </div>
        <div className="input-group">
          <label>{t("register.email")}</label>

          <div
            className={`input-field ${
              errors.email && submitted ? "input-error" : ""
            }`}
          >
            <FaEnvelope className="icon" />

            <input
              type="email"
              value={user.email}
              name="email"
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>

          {errors.email && submitted && (
            <p className="error-text">{errors.email}</p>
          )}

          <p className="helper-text">{t("register.emailHint")}</p>
        </div>
        <div className="input-group">
          <label>{t("register.password")}</label>

          <div
            className={`input-field ${
              errors.password && submitted ? "input-error" : ""
            }`}
          >
            <FaLock className="icon" />

            <input
              type={showPassword ? "text" : "password"}
              value={user.password}
              name="password"
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.password && submitted && (
            <p className="error-text">{errors.password}</p>
          )}

          <p className="helper-text">{t("register.passwordHint")}</p>
        </div>
        <div className="input-group">
          <label>{t("register.passwordconfirm")}</label>

          <div
            className={`input-field ${
              errors.confirmPassword && submitted ? "input-error" : ""
            }`}
          >
            <FaLock className="icon" />

            <input
              type={showPassword ? "text" : "password"}
              value={user.confirmPassword}
              name="confirmPassword"
              onChange={handleChange}
              placeholder="••••••••"
            />
             <button
              type="button"
              className="show-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {errors.confirmPassword && submitted && (
            <p className="error-text">{errors.confirmPassword}</p>
          )}
        </div>
        <button className="register-btn" disabled={loading}>
          {loading ? t("register.processing") : t("register.createAccount")}
        </button>{" "}
      </form>
    </div>
  );
}

export default Register;
