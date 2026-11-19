// Override with REACT_APP_API_URL for a different deployment (include /api).
const API_URL = (process.env.REACT_APP_API_URL || "http://62.72.30.155:18/api").replace(/\/+$/, "");
const BACKEND_URL = API_URL.replace(/\/api$/, "");
const PUBLIC_URL = BACKEND_URL + "/public";
module.exports = { API_URL, BACKEND_URL, PUBLIC_URL };
