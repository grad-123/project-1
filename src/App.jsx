import "./Theme.css";
import React from "react";
import Chat from "./Pages/AI/components/chat/Chat";
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
import Favorites from "./Pages/Favorites/component/Favorites";
import Upload from "./Pages/Upload/component/Upload";
import Courses from "./Pages/Courses/component/Courses";
import Files from "./Pages/Files/component/Files";
import CheckEmail from "./Pages/Auth/CheckEmail/component/CheckEmail";
import Register from "./Pages/Auth/Register/component/Register";
import Login from "./Pages/Auth/Login/component/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword/component/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword/component/ResetPassword";
import VerifyEmail from "./Pages/Auth/VerifyEmail/component/VerifyEmail";
import AI from "./Pages/AI/component/AI";
import NotFound from "./component/NotFound/NotFound";
import ProtectedRoutes from "./component/ProtectedRoutes";
import Check from "./Pages/Auth/Check/component/Check";
import axios from "axios";
import ProtectedAdmin from "./component/ProtectedAdmin";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "browse", element: <Browse /> },
      { path: "courses/:categoryId",element: <Courses />,},
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
        path: "favorites",
        element: (
          <ProtectedRoutes>
          <Favorites />
          </ProtectedRoutes>
        ),
      },
      {
  path: "ai",
  element: (
    //<ProtectedRoutes>
    <AI />
    //</ProtectedRoutes>
  ),
  children: [
    { index: true, element: <div>Select a file</div> },
    { path: "file/:id", element: <Chat /> },
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
        ],
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";
function App() {
  return <RouterProvider router={router} />;
}

export default App;
