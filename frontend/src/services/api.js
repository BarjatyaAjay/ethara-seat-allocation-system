import axios from "axios";

let rawUrl = import.meta.env.VITE_API_URL;

// Normalize baseURL to ensure /api/v1 is appended correctly without duplication or localhost issues in production
let baseURL;
if (rawUrl && rawUrl.trim() !== "") {
  rawUrl = rawUrl.trim().replace(/\/+$/, "");
  if (rawUrl.endsWith("/api/v1")) {
    baseURL = rawUrl;
  } else if (rawUrl.endsWith("/api")) {
    baseURL = `${rawUrl}/v1`;
  } else {
    baseURL = `${rawUrl}/api/v1`;
  }
} else {
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    baseURL = `${window.location.origin}/api/v1`;
  } else {
    baseURL = "http://127.0.0.1:8000/api/v1";
  }
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;