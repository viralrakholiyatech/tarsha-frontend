// Vercel forwards /backend requests to the live server on port 7600 without browser mixed content.
const LIVE_BACKEND = "http://62.72.30.155:7600";
const resolveBackendUrl = (url) => {
  const normalized = url.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production"
    ? normalized.replace(/^http:\/\/62\.72\.30\.155:\d+(?=\/|$)/, "/backend")
    : normalized;
};
const API_URL = resolveBackendUrl(`${LIVE_BACKEND}/api`);
const BACKEND_URL = API_URL.replace(/\/api$/, "");
const PUBLIC_URL = BACKEND_URL + "/public";
module.exports = { API_URL, BACKEND_URL, PUBLIC_URL, resolveBackendUrl };
