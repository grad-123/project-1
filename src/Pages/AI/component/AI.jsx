import "./AI.css";
import Sidebar from "../components/sidebar/SideBar";
import { Outlet } from "react-router-dom";

function AI() {
  return (
    <div className="ai-wrapper">
      <Sidebar />

      <div className="ai-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AI;