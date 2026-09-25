import { useEffect, useState } from "react";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  Ambulance,
} from "lucide-react";
import { incidentAPI, setAuthToken } from "../api";

function Matching() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState("");
  const [matches, setMatches] = useState([]);

  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("resqlink_token");

  useEffect(() => {
    async function fetchIncidents() {
      setLoadingIncidents(true);
      setError("");

      try {
        setAuthToken(token);

        const response = await incidentAPI.get("/incidents");

        setIncidents(response.data);
      } catch (error) {
        setError(
          error.response?.data?.detail ||
            "Unable to load incidents."
        );
      } finally {
        setLoadingIncidents(false);
      }
    }

    fetchIncidents();
  }, [token]);

  async function handleMatch(event) {
    event.preventDefault();

    if (!selectedIncident) {
      setError("Please select an incident.");
      return;
    }

    setMatching(true);
    setError("");
    setMatches([]);

    try {
      setAuthToken(token);

      const response = await incidentAPI.get(
        `/incidents/${selectedIncident}/match-resources`
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setMatches(data);
      } else if (Array.isArray(data.resources)) {
        setMatches(data.resources);
      } else if (Array.isArray(data.matches)) {
        setMatches(data.matches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to find matching resources."
      );
    } finally {
      setMatching(false);
    }
  }

  function getIncidentId(incident) {
    return (
      incident.id ||
      incident._id ||
      incident.incident_id ||
      ""
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="dashboard-label">RESOURCE MATCHING</p>

          <h2 className="page-title">
            Find Emergency Resources
          </h2>

          <p className="page-description">
            Select an active incident and find suitable emergency
            resources.
          </p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="matching-panel">
        <div className="matching-heading">
          <div className="matching-heading-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3>Resource Matching</h3>
            <p>
              Choose an incident to search for matching resources.
            </p>
          </div>
        </div>

        <form className="matching-form" onSubmit={handleMatch}>
          <div className="form-group">
            <label htmlFor="incident">Incident</label>

            <select
              id="incident"
              value={selectedIncident}
              onChange={(event) =>
                setSelectedIncident(event.target.value)
              }
              disabled={loadingIncidents}
              required
            >
              <option value="">
                {loadingIncidents
                  ? "Loading incidents..."
                  : "Select an incident"}
              </option>

              {incidents.map((incident) => {
                const id = getIncidentId(incident);

                return (
                  <option key={id} value={id}>
                    {incident.title ||
                      incident.name ||
                      `Incident ${id}`}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="submit"
            className="primary-button matching-button"
            disabled={matching || loadingIncidents}
          >
            <Search size={17} />

            {matching
              ? "Finding Resources..."
              : "Find Resources"}
          </button>
        </form>
      </div>

      <div className="data-panel matching-results">
        <div className="data-panel-header">
          <div>
            <h3>Matching Resources</h3>
            <p>{matches.length} resource(s) found</p>
          </div>
        </div>

        {matching ? (
          <div className="empty-state">
            <Search size={28} />
            <strong>Searching resources...</strong>
          </div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle size={28} />

            <strong>No matching resources</strong>

            <span>
              Select an incident and run resource matching.
            </span>
          </div>
        ) : (
          <div className="resource-list">
            {matches.map((resource, index) => (
              <div
                className="resource-row"
                key={
                  resource.id ||
                  resource._id ||
                  resource.resource_id ||
                  index
                }
              >
                <div className="resource-main">
                  <div className="resource-icon">
                    <Ambulance size={18} />
                  </div>

                  <div>
                    <h4>
                      {resource.name ||
                        resource.resource_name ||
                        "Emergency Resource"}
                    </h4>

                    <p>
                      {resource.type ||
                        resource.resource_type ||
                        "Resource"}
                    </p>

                    <span>
                      {resource.location ||
                        "Location unavailable"}
                    </span>
                  </div>
                </div>

                <div className="resource-meta">
                  {resource.quantity !== undefined && (
                    <span className="resource-quantity">
                      Qty: {resource.quantity}
                    </span>
                  )}

                  <span className="resource-status resource-available">
                    {resource.status || "AVAILABLE"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Matching;