import React from "react";
import OperationalList from "./OperationalList";
import EmpOperationalList from "./EmpOperationalList";
import HodOperationalList from "./HodOperationalList";
import {
  Cordinator,
  getRole,
  isEmp,
  superAccess,ishod,
} from "../../../services/useLocalStorage";
import {
  adminKey,
  empKey,
  subadmin,
  cordinator,
  HoD,
} from "../../../config/RoleConfig";
import { login } from "../../../config/RouteConfig";
import { Navigate, useLocation } from "react-router-dom";
function MasterOperationalList() {
    const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <OperationalList />
      ) : ishod() ? (
        <HodOperationalList />
      ) : isEmp() ? (
        <EmpOperationalList />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
}

export default MasterOperationalList;




