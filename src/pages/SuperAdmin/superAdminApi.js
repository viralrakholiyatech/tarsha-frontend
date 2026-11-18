import axios from "axios";

const { API_URL } = require("../../config/backend");
const API_BASE = (process.env.REACT_APP_SUPER_ADMIN_API || `${API_URL}/super-admin`).replace(/\/+$/, "");

const getAuthHeaders = () => {
  const token = localStorage.getItem("super_admin_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const superAdminApi = {
  login: async (email, password) => {
    const res = await axios.post(`${API_BASE}/login`, { email, password });
    if (res.data && res.data.data?.token) {
      localStorage.setItem("super_admin_token", res.data.data.token);
      localStorage.setItem("super_admin_user", JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("super_admin_token");
    localStorage.removeItem("super_admin_user");
  },

  getDashboard: async () => {
    const res = await axios.get(`${API_BASE}/dashboard`, { headers: getAuthHeaders() });
    return res.data;
  },

  getCompanies: async () => {
    const res = await axios.get(`${API_BASE}/companies`, { headers: getAuthHeaders() });
    return res.data;
  },

  createCompany: async (companyData) => {
    const res = await axios.post(`${API_BASE}/companies`, companyData, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  toggleStatus: async (companyId) => {
    const res = await axios.put(
      `${API_BASE}/companies/${companyId}/status`,
      {},
      { headers: getAuthHeaders() }
    );
    return res.data;
  },

  updateSubscription: async (companyId, data) => {
    const res = await axios.put(`${API_BASE}/companies/${companyId}/subscription`, data, {
      headers: getAuthHeaders(),
    });
    return res.data;
  },

  getToken: () => localStorage.getItem("super_admin_token"),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("super_admin_user") || "null");
    } catch (e) {
      return null;
    }
  },
};
