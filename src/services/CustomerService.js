import { callApi } from "../utils";
import {
  fetchCust,
  deleteCust,
  insertCust,
  updateCust,
  fetchCustById,
  deleteVillage,
  deletetpscheme,
  deleteShift,
  deletePaymentcategoryConfig,
  deleteVendor,
  deleteLedger,
  deleteCity
} from "../config/config";

export const getCustomers = async (token) => {
  try {
    const header = {
      Authorization: `bearer ${token}`,
      ["Content-Type"]: "application/x-www-form-urlencoded",
    };
    const res = await callApi(fetchCust.method, fetchCust.url, null, 0, header);
    return res;
  } catch (err) {
    return err;
  }
};

export const getCustomerById = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      fetchCustById.method,
      fetchCustById.url,
      null,
      id,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const deleteCustomer = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteCust.method,
      deleteCust.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const deleteTpscheme = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deletetpscheme.method,
      deletetpscheme.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const deletevillage = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteVillage.method,
      deleteVillage.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};


export const deleteCitites = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteCity.method,
      deleteCity.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const deleteshift = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteShift.method,
      deleteShift.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const deletePaymentcategory = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deletePaymentcategoryConfig.method,
      deletePaymentcategoryConfig.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const addCustomer = async (data, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      insertCust.method,
      insertCust.url,
      data,
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const updateCustomer = async (data, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      updateCust.method,
      updateCust.url,
      data,
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }

  
};


export const deletevendor = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteVendor.method,
      deleteVendor.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};



export const deleteledger = async (id, token) => {
  try {
    const header = { Authorization: `Bearer ${token}` };
    const res = await callApi(
      deleteLedger.method,
      deleteLedger.url,
      { id },
      0,
      header,
    );
    return res;
  } catch (err) {
    return err;
  }
};
