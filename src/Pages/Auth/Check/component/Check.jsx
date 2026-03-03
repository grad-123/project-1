import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";
function Check() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const Email = searchParams.get("email") || "";

  const [Code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleResend = async () => {
    try {
      await axios.post(
    `Authentication/SendResetPasswordCode`,null,{
         params: { Email }
    }

);

      alert("Link resent successfully");
    } catch {
      alert("Resend failed");
    }
  };

  const handleReset = async () => {
    if (!Code) {
      setError("Please enter the reset code");
      return;
    }

    try {
      const response = await axios.get(
        "Authentication/ConfirmResetPassword",
        {
          params: {
            Code: Code,
            Email: Email,
          },
        },
      );

      if (response.data?.succeeded !== true) {
        setError(response.data?.message || "Invalid or expired code");
        return;
      }

navigate(
 `/auth/reset?email=${encodeURIComponent(Email)}&code=${encodeURIComponent(Code)}`
);
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid or expired code");
    }
  };

  return (
    <div>
      <h2>Check your email</h2>
      <p>We sent a reset code to {Email}</p>
      <input
        type="email"
        placeholder="Enter your email"
        value={Email}
        disabled
      />
      <input
        placeholder="Enter code"
        value={Code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleResend}>Resend</button>
      <button onClick={handleReset}>Reset Password</button>

      {error && <p>{error}</p>}
    </div>
  );
}

export default Check;
