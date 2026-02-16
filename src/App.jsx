import React from "react";
import Home from "./Pages/Home/component/Home";
import Browse from "./Pages/Browse/component/Browse";
import Favorites from "./Pages/Favorites/component/Favorites";
import Upload from "./Pages/Upload/component/Upload";
import SignIn from "./Pages/Sign In/component/SignIn";
import NotFound from "./component/NotFound/NotFound";
import Categories from "./Pages/categories/component/Categories";
import Root from "./routes/Root";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/Browse",
        element: <Browse />,
      },
      {
        path: "/Upload",
        element: <Upload />,
      },
      /*{
 path:'/categories',
 element:<Categories/> 
},*/
      {
        path: "/Favorites",
        element: <Favorites />,
      },
      {
        path: "/SignIn",
        element: <SignIn />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
