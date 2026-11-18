import {
  fetchEmployee,
  deleteEmployee,
  deleteInward,
  deleteOutWard,
  insertEmployee,
  fetchEmployeeById,
  updateEmployeeById,
  deletePost,
  deleteLeads
} from "../config/config";
import { callApi } from "../utils";

export const GetEmployees = async (token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      fetchEmployee.method,
      fetchEmployee.url,
      {},
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const DeleteEmployee = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteEmployee.method,
      deleteEmployee.url,
      { id },
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const DeleteInward = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteInward.method,
      deleteInward.url,
      { id },
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const DeleteLead = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteLeads.method,
      deleteLeads.url,
      { id },
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const DeleteOutward = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteOutWard.method,
      deleteOutWard.url,
      { id },
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const getEmployeeById = async (id, token) => {
  try {
    const header = {
      Authorization: `Bearer ${token}`,
      ["Content-type"]: "application/json",
    };
    const res = await callApi(
      fetchEmployeeById.method,
      fetchEmployeeById.url,
      null,
      id,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const addEmployee = async (data, token) => {
  try {
    const header = {
      Authorization: `Bearer ${token}`,
      ["Content-type"]: "application/json",
    };
    const res = await callApi(
      insertEmployee.method,
      insertEmployee.url,
      data,
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const updateEmployee = async (data, token) => {
  try {
    const header = {
      Authorization: `Bearer ${token}`,
      ["Content-type"]: "application/json",
    };
    const res = await callApi(
      updateEmployeeById.method,
      updateEmployeeById.url,
      data,
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const DeletePost = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deletePost.method,
      deletePost.url,
      { id },
      0,
      header
    );
    return res;
  } catch (err) {
    return err;
  }
};
