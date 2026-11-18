// Override with REACT_APP_API_URL for a different deployment (include /api).
const API_URL = (process.env.REACT_APP_API_URL || "https://tarsha-backend-1.onrender.com/api").replace(/\/+$/, "");
const BACKEND_URL = API_URL.replace(/\/api$/, "");
const PUBLIC_URL = BACKEND_URL + "/public";
module.exports = { API_URL, BACKEND_URL, PUBLIC_URL };
