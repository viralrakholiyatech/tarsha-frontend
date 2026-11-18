import { isExpired, decodeToken } from "react-jwt";
import { defaultuserpic } from "../config/file_url";
import {
  adminKey,
  customerKey,
  empKey,
  subadmin,
  cordinator,
  HoD,
} from "../config/RoleConfig";

const { BACKEND_URL: FileUrl } = require("../config/backend");

const setInLocalStorage = (key, value) => {
  if (key) {
    const v = JSON.stringify(value);
    localStorage.setItem(key, v);
  }
};

export const getToken = () => {
  if (localStorage.getItem("userinfo")) {
    const token = JSON.parse(localStorage.getItem("userinfo")).token;
    return token;
  }

  return "";
};

export const getUserProfilePic = () => {
  if (localStorage.getItem("userinfo")) {
    const profile_pic = JSON.parse(
      localStorage.getItem("userinfo")
    )?.profile_picture;
    if (profile_pic) {
      return `${FileUrl}/${profile_pic}`;
    } else {
      return `${FileUrl}/${defaultuserpic}`;
    }
  }

  return defaultuserpic;
};

export const getFirstName = () => {
  if (localStorage.getItem("userinfo")) {
    const first_name = JSON.parse(localStorage.getItem("userinfo"))?.first_name;
    if (first_name) {
      return first_name;
    } else {
      return "";
    }
  }
  return "";
};

export const getLastName = () => {
  if (localStorage.getItem("userinfo")) {
    const last_name = JSON.parse(localStorage.getItem("userinfo"))?.last_name;
    if (last_name) {
      return last_name;
    } else {
      return "";
    }
  }
  return "";
};

export const getFullName = () => {
  if (localStorage.getItem("userinfo")) {
    const fullname = JSON.parse(localStorage.getItem("userinfo"))?.fullname;
    if (fullname) {
      return fullname;
    } else {
      return "";
    }
  }
  return "";
};

export const getRole = () => {
  const token = getToken();

  return decodeToken(token)?.role;
};

export const getUserRoles = () => {
  const token = getToken();

  try {
    const arr = decodeToken(token)?.user_roles;
    // console.log("roles====>",arr)

    if (Array.isArray(arr)) {
      return arr;
    }

    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const superAccess = (roles_arr = [adminKey]) => {
  try {
    return getUserRoles().some((r) => roles_arr.includes(r));
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getUserId = () => {
  try {
    const token = getToken();
    return decodeToken(token)?.id;
  } catch (err) {
    return 0;
  }
};

export const isCust = () => {
  try {
    return getUserRoles().includes(customerKey);
  } catch (err) {
    return false;
  }
};

export const isAdmin = () => {
  try {
    // return [adminKey].includes(getUserRoles())
    return getUserRoles().includes(adminKey);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const isSuperAdmin = () => {
  try {
    return getUserRoles().includes(subadmin);
  } catch (err) {
    console.log(err);
    return false;
  }
};
export const ishod = () => {
  try {
    return getUserRoles().includes(HoD);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const isEmp = () => {
  try {
    return getUserRoles().includes(empKey);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const Cordinator = () => {
  try {
    return getUserRoles().includes(cordinator);
  } catch (err) {
    console.log(err);
    return false;
  }
};

export default function useLocalStorage(key, value) {
  if (key !== undefined && key) {
    setInLocalStorage(key, value);
  }
}

export const shouldAllowedOfRoles = (
  roles_allowed_arr,
  roles_arr = [adminKey]
) => {
  try {
    if (Array.isArray(roles_allowed_arr)) {
      // console.log(roles_allowed_arr.some((r)=>r.includes(roles_arr)));
      return roles_allowed_arr.some((r) => roles_arr.includes(r));
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const getCompanyLogo = () => {
  try {
    if (localStorage.getItem("userinfo")) {
      const u = JSON.parse(localStorage.getItem("userinfo"));
      if (u?.company_logo) return u.company_logo;
      if (u?.firm_logo) return u.firm_logo;
    }
    const stored = localStorage.getItem("company_logo");
    if (stored) return stored;
  } catch (err) {}
  return "/img/tarsha_logo.png";
};

export const getCompanyFeatures = () => {
  try {
    const raw = localStorage.getItem("company_features");
    if (raw) {
      const parsed = typeof raw === "string" && (raw.startsWith("[") || raw.startsWith("{")) ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const userinfoStr = localStorage.getItem("userinfo");
    if (userinfoStr) {
      const userinfo = JSON.parse(userinfoStr);
      if (Array.isArray(userinfo?.features) && userinfo.features.length > 0) {
        return userinfo.features;
      }
    }
  } catch (e) {
    console.error("Failed to parse company features:", e);
  }
  return null;
};

export const isSessionExpired = () => {
  try {
    const token = getToken();
    if (!token) return true;

    // 1. Check JWT expiration via react-jwt
    if (isExpired(token)) return true;

    // 2. Check 3-hour limit from login timestamp
    const loginTimeStr = localStorage.getItem("login_time");
    if (loginTimeStr) {
      const loginTime = parseInt(loginTimeStr, 10);
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
      if (Date.now() - loginTime >= THREE_HOURS_MS) {
        return true;
      }
    }
  } catch (err) {
    return true;
  }
  return false;
};

export const clearSession = () => {
  try {
    [
      "userinfo",
      "token",
      "login_time",
      "wallet",
      "path",
      "company_features",
    ].forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
};

