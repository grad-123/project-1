import { Outlet } from "react-router-dom";
import Navbar from "../component/Navbar/Navbar";
import Footer from "../component/Footer/Footer";
import "./Root.css";
import ScrollToTop from "../component/ScrollToTop";

function Root() {
  return (
    <div className="app-layout">
      <Navbar />
      <ScrollToTop />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Root;