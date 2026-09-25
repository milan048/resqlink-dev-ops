import { useEffect, useState } from "react";
import {
  Ambulance,
  Plus,
  RefreshCw,
  X,
  Package,
  Trash2,
} from "lucide-react";
import { resourceAPI, setAuthToken } from "../api";

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    quantity: 1,
    status: "AVAILABLE",
  });

  const token = localStorage.getItem("resqlink_token");
  const role = localStorage.getItem("resqlink_role");

  const canManage =
    role === "ADMIN" || role === "OPERATOR";

  async function fetchResources() {
    setLoading(true);
    setError("");

    try {
      setAuthToken(token);

      const response = await resourceAPI.get("/resources");

      setResources(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to load resources."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResources();
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

      await resourceAPI.post("/resources", {
        ...form,
        quantity: Number(form.quantity),
      });

      setForm({
        name: "",
        type: "",
        location: "",
        quantity: 1,
        status: "AVAILABLE",
      });

      setShowForm(false);

      await fetchResources();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to create resource."
      );
    }
  }

  function getResourceId(resource) {
    return (
      resource.id ||
      resource._id ||
      resource.resource_id
    );
  }

  async function handleDelete(resourceId) {
    if (!resourceId) {
      setError("Unable to identify this resource.");
      return;
    }

    setDeletingId(resourceId);
    setError("");

    try {
      setAuthToken(token);

      await resourceAPI.delete(
        `/resources/${resourceId}`
      );

      await fetchResources();
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to delete resource."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusClass(status) {
    const value = String(status || "").toLowerCase();

    if (value === "available") {
      return "resource-available";
    }

    if (value === "unavailable") {
      return "resource-unavailable";
    }

    if (value === "deployed") {
      return "resource-deployed";
    }

    return "resource-status-default";
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="dashboard-label">
            RESOURCE MANAGEMENT
          </p>

          <h2 className="page-title">
            Emergency Resources
          </h2>

          <p className="page-description">
            View and coordinate emergency resources.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="secondary-button"
            onClick={fetchResources}
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
              New Resource
            </button>
          )}
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && canManage && (
        <div className="form-panel">
          <div className="form-panel-header">
            <div>
              <h3>Create Resource</h3>
              <p>
                Enter the emergency resource details.
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
                <label htmlFor="name">
                  Resource Name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Resource name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">
                  Resource Type
                </label>

                <input
                  id="type"
                  name="type"
                  type="text"
                  placeholder="e.g. Ambulance, Medical Kit"
                  value={form.type}
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
                  placeholder="Resource location"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantity">
                  Quantity
                </label>

                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="AVAILABLE">
                    AVAILABLE
                  </option>

                  <option value="DEPLOYED">
                    DEPLOYED
                  </option>

                  <option value="UNAVAILABLE">
                    UNAVAILABLE
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
                Create Resource
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-panel">
        <div className="data-panel-header">
          <div>
            <h3>Resource List</h3>
            <p>
              {resources.length} resource(s) found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading resources...
          </div>
        ) : resources.length === 0 ? (
          <div className="empty-state">
            <Package size={28} />

            <strong>No resources found</strong>

            <span>
              Available emergency resources will
              appear here.
            </span>
          </div>
        ) : (
          <div className="resource-list">
            {resources.map((resource) => {
              const resourceId =
                getResourceId(resource);

              return (
                <div
                  className="resource-row"
                  key={resourceId}
                >
                  <div className="resource-main">
                    <div className="resource-icon">
                      <Ambulance size={18} />
                    </div>

                    <div>
                      <h4>
                        {resource.name ||
                          resource.resource_name ||
                          "Unnamed Resource"}
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
                    <span className="resource-quantity">
                      Qty: {resource.quantity ?? 0}
                    </span>

                    <span
                      className={`resource-status ${getStatusClass(
                        resource.status
                      )}`}
                    >
                      {resource.status || "AVAILABLE"}
                    </span>

                    {canManage && resourceId && (
                      <button
                        className="delete-button"
                        title="Delete resource"
                        disabled={
                          deletingId === resourceId
                        }
                        onClick={() =>
                          handleDelete(resourceId)
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

export default Resources;