import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  Ambulance,
  GitCompare,
  LogOut,
} from "lucide-react";
import { setAuthToken } from "../api";

function Navigation() {
  const navigate = useNavigate();

  const role =
    localStorage.getItem("resqlink_role") || "VIEWER";

  function handleLogout() {
    localStorage.removeItem("resqlink_token");
    localStorage.removeItem("resqlink_role");
    localStorage.removeItem("resqlink_username");

    setAuthToken(null);

    navigate("/login");
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">R</div>

        <div>
          <h1>ResQLink</h1>
          <span>Emergency Coordination</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/incidents"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <AlertTriangle size={18} />
          <span>Incidents</span>
        </NavLink>

        <NavLink
          to="/resources"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Ambulance size={18} />
          <span>Resources</span>
        </NavLink>

        <NavLink
          to="/matching"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <GitCompare size={18} />
          <span>Resource Matching</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-role">
          <span>Current Role</span>
          <strong>{role}</strong>
        </div>

        <button
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Navigation;