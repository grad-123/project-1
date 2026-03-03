import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const Email = searchParams.get("email") || "";
  const [Code, setCode] = useState("");
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

  const handleReset = async () => {
    setError("");
    setMessage("");

    if (Password !== ConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("Email", Email);
      formData.append("Password", Password);
      formData.append("ConfirmPassword", ConfirmPassword);

      const response = await axios.post(
        "Authentication/ResetPassword",
        formData,
      );

      if (response.data?.succeeded !== true) {
        setError(response.data?.message || "Reset password failed");
        return;
      }

      setMessage("Password updated successfully");

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          "Reset password failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>

      {message && <div className="message success">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <input value={Email} disabled placeholder="Email" />

      <input
        type="password"
        placeholder="New Password"
        value={Password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={ConfirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleReset} disabled={loading}>
        {loading ? "Processing..." : "Reset Password"}
      </button>
    </div>
  );
}

export default ResetPassword;
