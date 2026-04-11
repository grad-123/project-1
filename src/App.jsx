import "./Theme.css";
import React from "react";
import Profile from "./Pages/profile/component/Profile";
import AI from "./Pages/AI/component/AI";
import AIHome from "./Pages/AI/components/homeAI/HomeAI";  // ✅ المسار الصحيح
import Chat from "./Pages/AI/components/chat/Chat";        // ✅ المسار الصحيح
import AuthPage from "./Pages/Auth/AuthPage/component/AuthPage";
import Admin from "./Pages/Admin/component/Admin";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Root from "./routes/Root";
import Home from "./Pages/Home/component/Home";
import Browse from "./Pages/Browse/component/Browse";
import Favorites from "./Pages/Favorites/Favorites";
import Upload from "./Pages/Upload/component/Upload";
import Courses from "./Pages/Courses/component/Courses";
import Files from "./Pages/Files/component/Files";
import CheckEmail from "./Pages/Auth/CheckEmail/component/CheckEmail";
import Register from "./Pages/Auth/Register/component/Register";
import Login from "./Pages/Auth/Login/component/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword/component/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword/component/ResetPassword";
import VerifyEmail from "./Pages/Auth/VerifyEmail/component/VerifyEmail";
import NotFound from "./component/NotFound/NotFound";
import ProtectedRoutes from "./component/ProtectedRoutes";
import Check from "./Pages/Auth/Check/component/Check";
import axios from "axios";
import ProtectedAdmin from "./component/ProtectedAdmin";
import PublicProfile from "./Pages/PublicProfile/component/PublicProfile";
import ConfirmEmailChange from "./Pages/Auth/CheckEmail/component/ConfirmEmailChange";

// axios settings
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "browse", element: <Browse /> },
      { path: "courses/:categoryId", element: <Courses /> },
      { path: "files/:courseId", element: <Files /> },
      {
        path: "admin",
        element: (
          <ProtectedAdmin>
            <Admin />
          </ProtectedAdmin>
        ),
      },
      {
        path: "upload",
        element: (
          <ProtectedRoutes>
            <Upload />
          </ProtectedRoutes>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoutes>
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "PublicProfile/:userId",
        element: <PublicProfile />,
      },
      {
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "ai",
        element: <AI />,
        children: [
          { index: true, element: <AIHome /> },
          { path: "file/:fileId", element: <Chat /> },
        ],
      },
      {
        path: "auth",
        element: <AuthPage />,
        children: [
          { index: true, element: <Navigate to="login" replace /> },
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "forgot", element: <ForgotPassword /> },
          { path: "reset", element: <ResetPassword /> },
          { path: "check", element: <Check /> },
          { path: "checkemail", element: <CheckEmail /> },
          { path: "verify", element: <VerifyEmail /> },
          { path: "confirm-email-change", element: <ConfirmEmailChange /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;