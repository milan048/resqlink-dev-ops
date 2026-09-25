import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Plus,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";
import { incidentAPI, setAuthToken } from "../api";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    severity: "MEDIUM",
  });

  const token = localStorage.getItem("resqlink_token");
  const role = localStorage.getItem("resqlink_role");

  async function fetchIncidents() {
    setLoading(true);
    setError("");

    try {
      setAuthToken(token);

      const response = await incidentAPI.get("/incidents");

      setIncidents(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to load incidents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIncidents();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleCreate(event) {
    event.preventDefault();

    setError("");

    try {
      setAuthToken(token);

      await incidentAPI.post("/incidents", form);

      setForm({
        title: "",
        description: "",
        location: "",
        severity: "MEDIUM",
      });

      setShowForm(false);

      await fetchIncidents();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to create incident."
      );
    }
  }

  async function handleDelete(incidentId) {
    if (!incidentId) {
      setError("Unable to identify this incident.");
      return;
    }

    setDeletingId(incidentId);
    setError("");

    try {
      setAuthToken(token);

      await incidentAPI.delete(`/incidents/${incidentId}`);

      await fetchIncidents();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to delete incident."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getIncidentId(incident) {
    return (
      incident.id ||
      incident._id ||
      incident.incident_id
    );
  }

  function getSeverityClass(severity) {
    const value = String(severity || "").toLowerCase();

    if (value === "critical") return "severity-critical";
    if (value === "high") return "severity-high";
    if (value === "low") return "severity-low";

    return "severity-medium";
  }

  const canManage =
    role === "ADMIN" || role === "OPERATOR";

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="dashboard-label">
            INCIDENT MANAGEMENT
          </p>

          <h2 className="page-title">
            Emergency Incidents
          </h2>

          <p className="page-description">
            Monitor and manage reported emergency incidents.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={fetchIncidents}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {canManage && (
            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={17} />
              New Incident
            </button>
          )}
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && canManage && (
        <div className="form-panel">
          <div className="form-panel-header">
            <div>
              <h3>Create Incident</h3>
              <p>
                Enter the emergency incident details.
              </p>
            </div>

            <button
              className="icon-button"
              onClick={() => setShowForm(false)}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Title</label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Incident title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="Incident location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group form-full">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the incident"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="severity">
                  Severity
                </label>

                <select
                  id="severity"
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">
                    CRITICAL
                  </option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Create Incident
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-panel">
        <div className="data-panel-header">
          <div>
            <h3>Incident List</h3>
            <p>
              {incidents.length} incident(s) found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={28} />

            <strong>No incidents found</strong>

            <span>
              Reported incidents will appear here.
            </span>
          </div>
        ) : (
          <div className="incident-list">
            {incidents.map((incident) => {
              const incidentId =
                getIncidentId(incident);

              return (
                <div
                  className="incident-row"
                  key={incidentId}
                >
                  <div className="incident-main">
                    <div className="incident-icon">
                      <AlertTriangle size={18} />
                    </div>

                    <div>
                      <h4>
                        {incident.title ||
                          incident.name ||
                          "Untitled Incident"}
                      </h4>

                      <p>
                        {incident.description ||
                          "No description available."}
                      </p>

                      <span>
                        {incident.location ||
                          "Location unavailable"}
                      </span>
                    </div>
                  </div>

                  <div className="incident-meta">
                    <span
                      className={`severity-badge ${getSeverityClass(
                        incident.severity
                      )}`}
                    >
                      {incident.severity || "MEDIUM"}
                    </span>

                    <span className="incident-status">
                      {incident.status || "ACTIVE"}
                    </span>

                    {canManage && incidentId && (
                      <button
                        className="delete-button"
                        title="Delete incident"
                        disabled={
                          deletingId === incidentId
                        }
                        onClick={() =>
                          handleDelete(incidentId)
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Incidents;