import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../../../../api/axiosInstance";
import { useEffect, useState } from "react";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const code = searchParams.get("code");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        if (!userId || !code) {
          setError("Invalid verification link");
          return;
        }

        await axios.get(
          "https://corny-unevacuated-willy.ngrok-free.dev/api/v1/Authentication/ConfirmEmail",
          {
            params: {
              UserId: userId,
              Code: encodeURIComponent(code),
            },
          }
        );

        navigate("/auth/login");
      } catch (err) {
        setError("Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [userId, code, navigate]);

  return (
    <div>
      {loading && <p>Verifying...</p>}
      {!loading && error && <p>{error}</p>}
    </div>
  );
}

export default VerifyEmail;