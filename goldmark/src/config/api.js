// src/config/api.js
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-production-domain.com/api"
    : "http://localhost:5000/api";

export default API_BASE_URL;

// Helper function for authenticated requests
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
