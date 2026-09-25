import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentAPI } from "../api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "VIEWER",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await incidentAPI.post("/auth/register", form);

      setSuccess("Account created successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">R</div>

          <div>
            <h1>ResQLink</h1>
            <p>Emergency Resource Coordination</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Create account</h2>
          <p>Create an account to access the ResQLink system.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>

            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>

            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="VIEWER">VIEWER</option>
              <option value="OPERATOR">OPERATOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {error && <div className="login-error">{error}</div>}

          {success && (
            <div className="login-success">
              {success}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <button
          type="button"
          className="register-back-button"
          onClick={() => navigate("/login")}
        >
          Already have an account? Sign in
        </button>

        <div className="login-footer">
          <span>ResQLink</span>
          <span>•</span>
          <span>Secure Emergency Coordination</span>
        </div>
      </div>
    </div>
  );
}

export default Register;