import React from "react";
import ListAdmin from "./AdminList";
import ListTeam from "./TeamList";
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

const List = () => {
  const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <ListAdmin />
      ) : isEmp() ? (
        <ListTeam />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
};

export default List;
