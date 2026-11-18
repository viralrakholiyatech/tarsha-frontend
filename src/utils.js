import axios from "axios";

export const callApi = (Method, Url, Data, Id, setHeader) => {
  let option = {
    method: Method,
    url: Url,
  };

  if (Data != null) {
    option = { ...option, data: Data };
  }

  if (Id != 0) {
    option = { ...option, url: `${Url}/${Id}` };
  }

  let headers = setHeader ? { ...setHeader } : {};

  // Attach tenant database and company headers automatically
  try {
    const tenantDb = localStorage.getItem("tenant_db");
    const companyCode = localStorage.getItem("company_code");
    const userinfoStr = localStorage.getItem("userinfo");
    const userinfo = userinfoStr ? JSON.parse(userinfoStr) : {};
    const token = userinfo.token || localStorage.getItem("token");

    if (tenantDb && !headers["x-tenant-db"]) {
      headers["x-tenant-db"] = tenantDb;
    }
    if (companyCode && !headers["x-company-code"]) {
      headers["x-company-code"] = companyCode;
    }
    if (token && !headers["Authorization"] && !headers["authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }

  option.headers = headers;

  console.log(option);

  return axios(option)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      if (err?.response?.status === 401) {
        try {
          [
            "userinfo",
            "token",
            "login_time",
            "wallet",
            "path",
            "company_features",
          ].forEach((k) => localStorage.removeItem(k));
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/"
          ) {
            window.location.href = "/login";
          }
        } catch (e) {}
      }
      throw err;
    });
};
