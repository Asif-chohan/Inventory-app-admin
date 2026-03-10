import axios from "axios";

// Use the local proxy endpoint so the server can read HttpOnly cookie and
// attach the Authorization header when forwarding to the real API.
const baseURL = "/api/proxy";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default api;
