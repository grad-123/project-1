import { useSearchParams, useNavigate } from "react-router-dom";
import "./VerifyEmail.css";
import axios from "../../../../api/axiosInstance";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
function VerifyEmail() {
  const navigate = useNavigate();
    const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId");
  const code = searchParams.get("code");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        if (!userId || !code) {
          setError(t("verifyEmail.invalidLink"));
          setLoading(false);
          return;
        }

        await axios.get(
          "/api/v1/Authentication/ConfirmEmail",
          {
            params: {
              UserId: userId,
              Code: encodeURIComponent(code),
            },
          },
        );

        navigate("/auth/login");
      } catch (err) {
        setError(t("verifyEmail.failed"));
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [userId, code, navigate, t]);

  return (
    <div className="register-box">
      {loading && <p className="verify-message">{t("verifyEmail.loading")}</p>}
      {!loading && error && <p className="verify-error">{error}</p>}
    </div>
  );
}

export default VerifyEmail;
