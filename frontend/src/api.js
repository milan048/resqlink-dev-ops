import axios from "axios";

export const INCIDENT_SERVICE_URL =
  import.meta.env.VITE_INCIDENT_SERVICE_URL;

export const RESOURCE_SERVICE_URL =
  import.meta.env.VITE_RESOURCE_SERVICE_URL;

export const incidentAPI = axios.create({
  baseURL: INCIDENT_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const resourceAPI = axios.create({
  baseURL: RESOURCE_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    incidentAPI.defaults.headers.common.Authorization = `Bearer ${token}`;
    resourceAPI.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete incidentAPI.defaults.headers.common.Authorization;
    delete resourceAPI.defaults.headers.common.Authorization;
  }
}

const savedToken = localStorage.getItem("resqlink_token");

if (savedToken) {
  setAuthToken(savedToken);
}