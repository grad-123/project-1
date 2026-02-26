import "./Theme.css";
import React from "react";
import AuthPage from "./Pages/Auth/AuthPage/component/AuthPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import Home from "./Pages/Home/component/Home";
import Browse from "./Pages/Browse/component/Browse";
import Favorites from "./Pages/Favorites/component/Favorites";
import Upload from "./Pages/Upload/component/Upload";
import Courses from "./Pages/Courses/component/Courses";
import Files from "./Pages/Files/component/Files";
import Categories from "./Pages/categories/component/Categories";

import Register from "./Pages/Auth/Register/component/Register";
import Login from "./Pages/Auth/Login/component/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword/component/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword/component/ResetPassword";
import VerifyEmail from "./Pages/Auth/VerifyEmail/component/VerifyEmail";
import AI from "./Pages/AI/component/AI";
import NotFound from "./component/NotFound/NotFound";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/Browse", element: <Browse /> },
      { path: "/Upload", element: <Upload /> },
      { path: "/Favorites", element: <Favorites /> },
      { path: "/Login", element: <Login /> },
      { path: "/AI", element: <AI /> },
      { path: "*", element: <NotFound /> },
      { path: "/Register", element: <Register /> },
      { path: "/Auth", element: <AuthPage /> },
      { path: "/ForgotPassword", element: <ForgotPassword /> },
      { path: "/ResetPassword/:token", element: <ResetPassword /> },
      { path: "/VerifyEmail/:token", element: <VerifyEmail /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
