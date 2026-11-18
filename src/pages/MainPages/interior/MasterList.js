import React from "react";
import AdminList from "./AdminList";
import EmpList from "./EmpList";
import { Navigate, useLocation } from "react-router-dom";
import {
  Cordinator,
  getRole,
  isEmp,
  superAccess,
  ishod,
} from "../../../services/useLocalStorage";
import {
  adminKey,
  empKey,
  subadmin,
  cordinator,
  HoD,
} from "../../../config/RoleConfig";

function MasterList() {
  const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <AdminList />
      ) : isEmp() ? (
        <EmpList />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
}

export default MasterList;
