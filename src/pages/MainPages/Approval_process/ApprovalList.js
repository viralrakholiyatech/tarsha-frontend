import React from "react";
import ApprovalProcess_list from "./ApprovalProcess_list";
import EmpApprovalProcessList from "./EmpApprovalProcessList";
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

function ApprovalList() {
  const location = useLocation();
  return (
    <>
      {superAccess([adminKey, subadmin]) || Cordinator(cordinator) ? (
        <ApprovalProcess_list />
      ) : isEmp() ? (
        <EmpApprovalProcessList />
      ) : (
        <Navigate to={`/${login.list}`} state={{ from: location }} replace />
      )}
    </>
  );
}

export default ApprovalList;
