import { Navigate, Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { setAuthToken } from "../api";

function ProtectedLayout() {
  const token = localStorage.getItem("resqlink_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  setAuthToken(token);

  return (
    <div className="app-layout">
      <Navigation />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default ProtectedLayout;