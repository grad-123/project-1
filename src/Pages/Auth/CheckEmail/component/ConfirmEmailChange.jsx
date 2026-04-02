import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";

function ConfirmEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const confirm = async () => {
      const userId = searchParams.get("userId");
      const newEmail = searchParams.get("newEmail");
      const token = searchParams.get("token");

      try {
        const res = await axios.get("/Api/Profile/ConfirmEmailChange", {
          params: { userId, newEmail, token }
        });

        if (res.data.succeeded) {
          setStatus("success");
          setTimeout(() => navigate("/auth/login"), 3000);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    confirm();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "loading" && <p>⏳ Confirming your email...</p>}
      {status === "success" && (
        <>
          <h2>✅ Email changed successfully!</h2>
          <p>Redirecting to login...</p>
        </>
      )}
      {status === "error" && (
        <>
          <h2>❌ Invalid or expired link</h2>
          <p>Please try again.</p>
        </>
      )}
    </div>
  );
}

export default ConfirmEmailChange;