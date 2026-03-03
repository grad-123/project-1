import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useState } from "react";
function CheckEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  /*const handleResend = async () => {
    try {
     await axios.post(`https://corny-unevacuated-willy.ngrok-free.dev/api/v1/Authentication/Register`, { email });
      setMessage("Verification email sent again.");
    } catch (error) {
      setMessage("Failed to resend email.");
    }
  };*/
  const email = location.state?.email;
  useEffect(() => {
    if (!email) {
      navigate("/auth/register");
    }
  }, [email, navigate]);

  return (
    <div className="register-box">
      <h2>✅ Check Your Email</h2>

      <p>
        We sent verification link to:
        <b> {email} </b>
      </p>
    {/*<button onClick={handleResend}>Resend Verification Email</button> */}  
      {message && <p>{message}</p>}
      <button onClick={() => navigate("/auth/login")} className="register-btn">
        Go to Login
      </button>
    </div>
  );
}

export default CheckEmail;
