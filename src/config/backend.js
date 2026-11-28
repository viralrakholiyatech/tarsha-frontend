const LIVE_BACKEND = "http://62.72.30.155:0018";
const resolveBackendUrl = (url) => {
  return url ? url.replace(/\/+$/, "") : "";
};
const API_URL = `${LIVE_BACKEND}/api`;
const BACKEND_URL = `${LIVE_BACKEND}`;
const PUBLIC_URL = `${BACKEND_URL}/public`;
module.exports = { API_URL, BACKEND_URL, PUBLIC_URL, resolveBackendUrl };
