import React from "react";
import TacticalList from "./TacticalList";
import EmpTacticalList from "./EmpTacticalList";
import HodTacticalList from "./HodTacticalList";
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
function MasterTacticalList() {
    const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <TacticalList />
      ) : ishod() ? (
        <HodTacticalList />
      ) : isEmp() ? (
        <EmpTacticalList />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
}

export default MasterTacticalList;




