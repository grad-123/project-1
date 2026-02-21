
import "./Theme.css";
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/Root";
import Home from "./Pages/Home/component/Home";
import Browse from "./Pages/Browse/component/Browse";
import Favorites from "./Pages/Favorites/component/Favorites";
import Upload from "./Pages/Upload/component/Upload";
import SignIn from "./Pages/Sign In/component/SignIn";
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
      { path: "/SignIn", element: <SignIn /> },
      { path: "/AI", element: <AI /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;