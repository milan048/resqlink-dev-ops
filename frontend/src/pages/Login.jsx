import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentAPI, setAuthToken } from "../api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
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
    setLoading(true);

    try {
      const response = await incidentAPI.post("/auth/login", form);

      const { access_token, role } = response.data;

      localStorage.setItem("resqlink_token", access_token);
      localStorage.setItem("resqlink_role", role);
      localStorage.setItem("resqlink_username", form.username);

      setAuthToken(access_token);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Unable to login. Please check your credentials."
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
          <h2>Welcome back</h2>
          <p>
            Sign in to access your emergency coordination dashboard.
          </p>
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          className="register-back-button"
          onClick={() => navigate("/register")}
        >
          Don't have an account? Create one
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

export default Login;