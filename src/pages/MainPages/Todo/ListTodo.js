import React from "react";
import ListAdmin from "./child/ListAdmin";
import ListTeam from "./child/ListTeam";
import ListHod from "./child/ListHod";
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

const ListTodo = () => {
  const location = useLocation();
  return (
    <>
      {/* {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <ListAdmin />
      ) : isEmp() ? (
        <ListTeam />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )} */}
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <ListAdmin />
      ) : ishod() ? (
        <ListHod />
      ) : isEmp() ? (
        <ListTeam />
      ):(
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
};

export default ListTodo;
