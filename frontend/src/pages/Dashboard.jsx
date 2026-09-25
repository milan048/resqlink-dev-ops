import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Ambulance,
  Activity,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  incidentAPI,
  resourceAPI,
  setAuthToken,
} from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const username =
    localStorage.getItem("resqlink_username") || "User";

  const role =
    localStorage.getItem("resqlink_role") || "VIEWER";

  const token = localStorage.getItem("resqlink_token");

  const [incidentCount, setIncidentCount] = useState("—");
  const [resourceCount, setResourceCount] = useState("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setAuthToken(token);

      try {
        const [incidentResponse, resourceResponse] =
          await Promise.all([
            incidentAPI.get("/incidents"),
            resourceAPI.get("/resources"),
          ]);

        setIncidentCount(
          Array.isArray(incidentResponse.data)
            ? incidentResponse.data.length
            : "—"
        );

        setResourceCount(
          Array.isArray(resourceResponse.data)
            ? resourceResponse.data.length
            : "—"
        );
      } catch {
        setIncidentCount("—");
        setResourceCount("—");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  function handleLogout() {
    localStorage.removeItem("resqlink_token");
    localStorage.removeItem("resqlink_role");
    localStorage.removeItem("resqlink_username");

    setAuthToken(null);

    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark">R</div>

          <div>
            <h1>ResQLink</h1>
            <span>Emergency Coordination</span>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="user-info">
            <strong>{username}</strong>
            <span>{role}</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-label">
              COMMAND CENTER
            </p>

            <h2>
              Welcome back, <span>{username}</span>
            </h2>

            <p>
              Monitor incidents and coordinate emergency
              resources from one central dashboard.
            </p>
          </div>

          <div className="status-indicator">
            <span className="status-dot" />
            System Operational
          </div>
        </section>

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={21} />
            </div>

            <div>
              <span>Active Incidents</span>
              <strong>
                {loading ? "..." : incidentCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Ambulance size={21} />
            </div>

            <div>
              <span>Available Resources</span>
              <strong>
                {loading ? "..." : resourceCount}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={21} />
            </div>

            <div>
              <span>System Status</span>
              <strong>Online</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Users size={21} />
            </div>

            <div>
              <span>Your Role</span>
              <strong>{role}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panels">
          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Incident Management</h3>
                <p>
                  Monitor and manage emergency incidents.
                </p>
              </div>

              <AlertTriangle size={22} />
            </div>

            <button
              className="panel-button"
              onClick={() => navigate("/incidents")}
            >
              View Incidents
            </button>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Resource Management</h3>
                <p>
                  View and coordinate available resources.
                </p>
              </div>

              <Ambulance size={22} />
            </div>

            <button
              className="panel-button"
              onClick={() => navigate("/resources")}
            >
              View Resources
            </button>
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Resource Matching</h3>
                <p>
                  Find resources for an active incident.
                </p>
              </div>

              <ShieldCheck size={22} />
            </div>

            <button
              className="panel-button"
              onClick={() => navigate("/matching")}
            >
              Find Resources
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;