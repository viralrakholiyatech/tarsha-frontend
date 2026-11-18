import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import { getCustomers } from "../../../services/CustomerService";
import { getMst_Type, getStatus_File } from "../../../services/ConstantService";
import { getFileById, updateFile } from "../../../services/FileService";
import useValidator from "../../../services/Validation";

import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { FilesRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import {
  fetchActiveEmployee,
  getDepartments,
  fetchHod,
  fetchEmployee,
  getMstFileCode,
} from "../../../config/config";
import { AuthHeader } from "../../../services/FormCommon";
import axios from "axios";
import Select from "react-select";

//File
const Edit = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [filecodes, setFileCodes] = useState([]);

  const [custData, setCustData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [validator, showValidationMessage] = useValidator();
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState([]);
  const [selecteddepartment, setSelecteddepartment] = useState([]);
  const [hod, setHoD] = useState([]);
  const [showInExpense, setShowInExpense] = useState(0);
  const [showInTodo, setShowInTodo] = useState(0);

  const handleSelect = (selectedOptions) => {
    // Extract the array of selected department IDs
    const selectedIds = selectedOptions.map((option) => option.value);
    // Update the selecteddepartment state
    setSelecteddepartment(selectedIds);
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers(getToken());
      if (!res.data.error) {
        const custData = res.data?.data;
        custData ? setCustData(custData) : "";
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response.request.status === 501) {
        toast.error("Internal server error");
      } else if (err.response.data?.error) {
        toast.error(err.response.data?.message);
      }
    }
  };

  const fetchDepartment = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        getDepartments.method,
        getDepartments.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;

        if (Array.isArray(payload) && payload.length) {
          setDepartment(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchHOD = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchHod.method,
        fetchHod.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;

        if (Array.isArray(payload) && payload.length) {
          setHoD(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getEmployees = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length > 0) {
          setEmployees(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const [MstTypeData, setMstTypeData] = useState([]);

  const fetchMstType = async () => {
    try {
      const res = await getMst_Type(getToken());
      if (!res.data.error) {
        const MstTypeData = res.data?.data;
        MstTypeData ? setMstTypeData(MstTypeData) : "";
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response.request.status === 501) {
        toast.error("Internal server error");
      } else if (err.response.data?.error) {
        toast.error(err.response.data?.message);
      }
    }
  };

  const [status_file, setStatus_file] = useState([]);

  const fetchStatusFile = async () => {
    try {
      const res = await getStatus_File(getToken());
      if (!res.data.error) {
        const status_file = res.data?.data;
        if (status_file) {
          // Filter the status_file array where types === 'Process'
          const processStatusFiles = status_file.filter(
            (item) => item.types === "Process"
          );

          setStatus_file(processStatusFiles); // If you want to set state with filtered data
        }
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(err);
      if (err.response.request.status === 501) {
        toast.error("Internal server error");
      } else if (err.response.data?.error) {
        toast.error(err.response.data?.message);
      }
    }
  };

  const initialFileValue = {
    cus_id: "",
    file_name: "",
    code: "",
    land_detail:'',
    file_type: "",
    project_name: "",
    process: 0,
    hod: "",
    departments: [],
    show_exp: 0,
    show_todo: 0,
    team_id: "",
    dates: todayDate(),
  };

  const [file, setFile] = useState(() => initialFileValue);

  const fetchFile = async () => {
    try {
      const res = await getFileById(parseInt(params.id), getToken());
      if (!res.data?.error) {
        const fileData = JSON.parse(JSON.stringify(res.data.data[0]));

        setFile(fileData);
        setShowInExpense(fileData.show_exp);
        setShowInTodo(fileData.show_todo);
        const departmentIds = fileData.departments
          .split(",")
          .map((id) => parseInt(id));

        setSelecteddepartment(departmentIds);
      } else {
        toast.error(res.data?.message);
        localStorage.getItem("lastPath")
          ? navigate(`/${localStorage.getItem("lastPath")}`)
          : navigate(`/${FilesRoute.listFileOnline}`);
      }
    } catch (err) {
      console.log(`Edit.js(File)-${err}`);
      toast.error(err.response.data.message);
      navigate(`/${FilesRoute.list}`);
    }
  };

  const goBack = () => {
    // navigate(`/${FilesRoute.list}`);
    localStorage.getItem("lastPath")
      ? navigate(`/${localStorage.getItem("lastPath")}`)
      : navigate(`/${FilesRoute.listFileOnline}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validator.allValid()) {
      showValidationMessage(true);
      return;
    }
 

    try {
      setLoading(true);

      const payload = {
        id:params.id,
        cus_id: file.cus_id,
        file_name: file.file_name,
        code: file.code,
        file_type: file.file_type,
        project_name: file.project_name,
        land_detail:file.land_detail,
        process: file.process,
        hod: file.hod,
        departments: selecteddepartment,
        show_exp: showInExpense,
        show_todo: showInTodo,
        team_id: file.team_id,
        dates: file.dates,
       
      };
    console.log("fdagdshd==>",payload)
      const res = await updateFile(payload, `${getToken()}`);
      if (!res.data?.error) {
        setLoading(false);
        toast.success(res.data?.message);
        localStorage.getItem("lastPath")
          ? navigate(`/${localStorage.getItem("lastPath")}`)
          : navigate(`/${FilesRoute.listFileOnline}`);
      } else {
        setLoading(false);
        toast.error(res.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data?.message);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    showValidationMessage(true);
    setFile((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const fetchFileCodes = async () => {
    try {
      const res = await axios({
        method: getMstFileCode.method,
        url: getMstFileCode.url,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setFileCodes(res?.data?.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchFileCodes();
    fetchDepartment();
    getEmployees();
    fetchCustomers();
    fetchMstType();
    fetchStatusFile();
    fetchHOD();
    fetchFile();
  }, []);

  const departmentData = department.map((departments) => ({
    label: `${departments.name}`,
    value: departments.id,
  }));

  const handleExpenseChange = (e) => {
    const value = e.target.value;

    setShowInExpense(value);
    setFile((prevState) => ({
      ...prevState,
      show_exp: value,
    }));
  };

  const handleTodoChange = (e) => {
    const value = e.target.value;
    setShowInTodo(value);
    setFile((prevState) => ({
      ...prevState,
      show_todo: value,
    }));
  };


  return (
    <div class="content__wrapper">
      <section class="page-content">
        <div class="page-title mobile-title">
          <h1 class="h4 mb-0">Edit</h1>
          <p class="mb-4">Liasoning Details</p>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Liasoning
                    </h6>
                  </div>
                  <div className="col-md-2 text-right status__selection-col">
                    <div className="status__selection">
                      <div className="status__selection-wrapper form-group">
                        <input
                          type="date"
                          className="form-control"
                          id="dates"
                          name="dates"
                          onChange={handleInput}
                          value={file.dates}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body p-0">
                {!loading ? (
                  <form onSubmit={handleSubmit}>
                    <input
                      name="hiddenInput"
                      value="hiddenValue"
                      type="hidden"
                      id="0"
                    />
                    <fieldset id="fieldset">
                      <div className="row">
                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="cus_id">Client Name*</label>
                          <select
                            className="form-control custom-select"
                            name="cus_id"
                            onChange={handleInput}
                            value={file.cus_id}
                          >
                            <option value="">--Select--</option>
                            {custData.map((row) => (
                              <option value={row.id}>
                                {row.first_name} {row.last_name}
                              </option>
                            ))}
                          </select>
                          <span className="text-danger">
                            {validator.message(
                              "cus_id",
                              file.cus_id,
                              "required"
                            )}
                          </span>
                        </div>

                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="file_name">File Name*</label>
                          <input
                            type="text"
                            name="file_name"
                            id="file_name"
                            className="form-control"
                            placeholder="Enter Name."
                            onChange={handleInput}
                            value={file.file_name}
                          />
                          {validator.message(
                            "file_name",
                            file.file_name,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="code">File Type*</label>
                          <select
                            className="form-control custom-select"
                            name="code"
                            onChange={handleInput}
                            value={file.code}
                          >
                            <option value="">--Select--</option>
                            {filecodes.map((fc) => (
                              <option value={fc?.id}>{fc?.title}</option>
                            ))}
                          </select>
                          {validator.message("code", file.code, "required")}
                        </div>
                        <div className="form-group col-md-6">
                          <label htmlFor="project_name">Project Name</label>
                          <input
                            type="text"
                            name="project_name"
                            id="project_name"
                            className="form-control"
                            placeholder="Enter Name."
                            onChange={handleInput}
                            value={file.project_name}
                          />
                          {validator.message(
                            "project_name",
                            file.project_name,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="file_type">Approval Place*</label>
                          <select
                            className="form-control custom-select"
                            name="file_type"
                            onChange={handleInput}
                            value={file.file_type}
                          >
                            <option value="">--Select--</option>
                            {MstTypeData.map((row) => (
                              <option value={row.id}>{row.type_name}</option>
                            ))}
                          </select>
                          <span className="text-danger">
                            {validator.message(
                              "file_type",
                              file.file_type,
                              "required"
                            )}
                          </span>
                        </div>

                        <div className="form-group col-md-6">
                          <label>Land Detail</label>
                          <input
                            className="form-control"
                            placeholder="Enter Land Detail"
                            name="land_detail"
                            id="land_detail"
                            onChange={handleInput}
                            value={file.land_detail}
                          />
                          {validator.message(
                            "land_detail",
                            file.land_detail,
                            "required"
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-6">
                          <div className="form-group">
                            <label htmlFor="team">Team</label>

                            <Select
                              options={departmentData}
                              isMulti
                              placeholder="Select Team"
                              name="team"
                              id="team"
                              value={selecteddepartment.map((id) => ({
                                value: id,
                                label: department.find((d) => d.id === id)
                                  ?.name, 
                              }))}
                              onChange={handleSelect}
                            />
                          
                          </div>
                        </div>
                        <div className="form-group col-md-6">
                          <label htmlFor="hod">HOD</label>
                          <select
                            name="hod"
                            id="hod"
                            className="form-control"
                            onChange={handleInput}
                            value={file.hod}
                          >
                            <option value={""}>--Select HOD--</option>
                            {hod.map((hod) => (
                              <option value={hod.id}>
                                {" "}
                                {hod.first_name} {hod.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="row">
                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="team_id">Assign To*</label>
                          <select
                            className="form-control custom-select"
                            name="team_id"
                            onChange={handleInput}
                            value={file.team_id}
                          >
                            <option value="">--Select--</option>
                            {employees.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.first_name} {data.last_name}
                              </option>
                            ))}
                          </select>
                          <span className="text-danger">
                            {validator.message(
                              "team_id",
                              file.team_id,
                              "required"
                            )}
                          </span>
                        </div>

                        <div class="form-group col-md-6 col-sm-6">
                          <label htmlFor="process">Process*</label>
                          <select
                            className="form-control custom-select"
                            name="process"
                            onChange={handleInput}
                            value={file.process}
                          >
                            <option value="">--Select--</option>
                            {status_file.map((row) => (
                              <option value={row.id}>
                                {row.status_file_name}
                              </option>
                            ))}
                          </select>
                          <span className="text-danger">
                            {validator.message(
                              "process",
                              file.process,
                              "required"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-6">
                          <label>Show in Expense</label>
                          <input
                            type="radio"
                            value="1"
                            checked={showInExpense == "1"}
                            onChange={handleExpenseChange}
                          />
                          Yes
                          <input
                            type="radio"
                            value="0"
                            checked={showInExpense == "0"}
                            onChange={handleExpenseChange}
                          />
                          No
                        </div>
                        <div className="form-group col-md-6">
                          <label>Show in Todo</label>
                          <input
                            type="radio"
                            value="1"
                            checked={showInTodo == "1"}
                            onChange={handleTodoChange}
                          />
                          Yes
                          <input
                            type="radio"
                            value="0"
                            checked={showInTodo == "0"}
                            onChange={handleTodoChange}
                          />
                          No
                        </div>
                      </div>

                      <div className="row mt-3">
                        <div className="form-group mb-0 col-md-2">
                          <button type="submit" className="btn">
                            Submit
                          </button>
                        </div>
                        <div className="form-group mb-0 col-md-4">
                          <button
                            type="button"
                            onClick={goBack}
                            className="btn"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </fieldset>
                  </form>
                ) : (
                  <Loader
                    type="spinner-default"
                    bgColor={"#000000"}
                    title={"Please wait"}
                    color={"#000000"}
                    size={50}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Edit;
