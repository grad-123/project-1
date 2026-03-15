import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./I18n.js";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="868763549486-t6sd8k51mrancir58ets5k9g7edijuaj.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
