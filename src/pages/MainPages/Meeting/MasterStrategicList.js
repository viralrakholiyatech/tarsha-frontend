import React from "react";
import StrategicList from "./StrategicList";
import EmpStrategicList from "./EmpStrategicList";
import HodStrategicList from "./HodStrategicList";
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
import { login } from "../../../config/RouteConfig";
import { Navigate, useLocation } from "react-router-dom";
function MasterStrategicList() {
  const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <StrategicList />
      ) : ishod() ? (
        <HodStrategicList />
      ) : isEmp() ? (
        <EmpStrategicList />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
}

export default MasterStrategicList;
