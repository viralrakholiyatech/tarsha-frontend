import React, { useState, useEffect, useCallback } from "react";
import { getToken } from "../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { todayDate } from "../../../services/DateAndTimeService";
import { AuthHeader } from "../../../services/FormCommon";
import ApiService from "../../../services/ApiService";
import useValidator from "../../../services/Validation";
import { getMst_Type, getStatus_File } from "../../../services/ConstantService";
import {
  insertFile,
  getMstFileCode,
  getDepartments,
  fetchHod,
  fetchActiveEmployee,
} from "../../../config/config";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../../../services/CustomerService";
import Select from "react-select";
import { FilesRoute } from "../../../config/RouteConfig";

//FileDetails For Project
const Add = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [filecodes, setFileCodes] = useState([]);
  const [custData, setCustData] = useState([]);
  const [department, setDepartment] = useState([]);
  const [hod, setHoD] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Yes");
  const [selectedOptions, setSelectedOptions] = useState("Yes");
  const [selecteddepartment, setSelecteddepartment] = useState();
  const [validator, showValidationMessage] = useValidator({
    rules: {
      remarks: "required|max:255", // Add any necessary validation rules here
    },
  });

  const [status_file, setStatus_file] = useState([]);
  const [MstTypeData, setMstTypeData] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [project, setProject] = useState({
    client_id: "",
    file_name: "",
    file_type: "",
    project_name: "",
    approval_place: "",
    land_detail: "",
    project_date: todayDate(),
    hod: "",
    team: [],
    assign_to: "",
    process: "",
    show_in_expense: selectedOption,
    show_in_todo: selectedOptions,
  });

  function handleSelect(data) {
    setSelecteddepartment(data);
  }

  const handleInput = (e) => {
    const { name, value } = e.target;

    showValidationMessage(true);

    setProject((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const goBack = () => {
    navigate(`/${FilesRoute.listFileOnline}`);
  };

  const handleSubmit = async (e, data) => {
    e.preventDefault();
    try {
      setLoading(true);
      const departmentIds = selecteddepartment.map((dept) => dept.value);
      const updatedProject = {
        ...project,
        departments: departmentIds,
      };

      console.log("insertFile:", insertFile);
      const res = await fetch(insertFile.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProject),
      });

      if (res.ok) {
        const responseData = await res.json();

        if (!responseData.error) {
          setLoading(false);
          toast.success(responseData.message);
          navigate(`/${FilesRoute.listFileOnline}`);
        } else {
          setLoading(false);
          toast.error(responseData.message);
        }
      } else {
        setLoading(false);
        const errorData = await res.json();
        toast.error(
          errorData?.message
            ? errorData.message
            : "Something went wrong with the request"
        );
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error(
        err?.message ? err.message : "Something went wrong with the request"
      );
    }
  };

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
          // Now you have the filtered data, you can use it as needed
          console.log("Process status files: ", processStatusFiles);
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
        if (Array.isArray(payload) && payload.length) {
          setEmployees(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchDepartment();
    fetchHOD();
    fetchStatusFile();
    fetchMstType();
    getEmployees();
  }, []);

  useEffect(() => {
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

    fetchFileCodes();
  }, []);

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
        console.log("hod--->", payload);
        setHoD(payload);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  const departmentData = department.map((departments) => ({
    label: `${departments.name}`,
    value: departments.id,
  }));

  return (
    <>
      <div class="content__wrapper">
        <section class="page-content">
          <div class="page-title mobile-title">
            <h1 class="h4 mb-0">Add</h1>
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
                            id="project_date"
                            name="project_date"
                            onChange={handleInput}
                            value={project.project_date}
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
                            <label htmlFor="client_id">Client Name*</label>
                            <select
                              className="form-control custom-select"
                              name="client_id"
                              onChange={handleInput}
                              value={project.client_id}
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
                                "client_id",
                                project.client_id,
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
                              value={project.file_name}
                            />
                            {validator.message(
                              "file_name",
                              project.file_name,
                              "required"
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div class="form-group col-md-6 col-sm-6">
                            <label htmlFor="file_type">File Type*</label>
                            <select
                              className="form-control custom-select"
                              name="file_type"
                              onChange={handleInput}
                              value={project.file_type}
                            >
                              <option value="">--Select--</option>
                              {filecodes.map((fc) => (
                                <option value={fc?.id}>{fc?.title}</option>
                              ))}
                            </select>
                            {validator.message(
                              "file_type",
                              project.file_type,
                              "required"
                            )}
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
                              value={project.project_name}
                            />
                            {validator.message(
                              "project_name",
                              project.project_name,
                              "required"
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div class="form-group col-md-6 col-sm-6">
                            <label htmlFor="approval_place">
                              Approval Place*
                            </label>
                            <select
                              className="form-control custom-select"
                              name="approval_place"
                              onChange={handleInput}
                              value={project.approval_place}
                            >
                              <option value="">--Select--</option>
                              {MstTypeData.map((row) => (
                                <option value={row.id}>{row.type_name}</option>
                              ))}
                            </select>
                            <span className="text-danger">
                              {validator.message(
                                "approval_place",
                                project.approval_place,
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
                              value={project.land_detail}
                            />
                            {validator.message(
                              "land_detail",
                              project.land_detail,
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
                                value={selecteddepartment}
                                onChange={handleSelect}
                              />
                              {/* {validator.message(
                                "departments",
                                project.departments,
                                "required"
                              )} */}
                            </div>
                          </div>
                          <div className="form-group col-md-6">
                            <label htmlFor="hod">HOD</label>
                            <select
                              name="hod"
                              id="hod"
                              className="form-control"
                              onChange={handleInput}
                              value={project.hod}
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
                            <label htmlFor="assign_to">Assign To*</label>
                            <select
                              className="form-control custom-select"
                              name="assign_to"
                              onChange={handleInput}
                              value={project.assign_to}
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
                                "assign_to",
                                project.assign_to,
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
                              value={project.process}
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
                                project.process,
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
                              value="Yes"
                              checked={selectedOption === "Yes"}
                              onChange={handleOptionChange}
                            />
                            Yes
                            <input
                              type="radio"
                              value="No"
                              checked={selectedOption === "No"}
                              onChange={handleOptionChange}
                            />
                            No
                          </div>
                          <div className="form-group col-md-6">
                            <label>Show in Todo</label>
                            <input
                              type="radio"
                              value="Yes"
                              checked={selectedOptions === "Yes"}
                              onChange={handleOptionsChanges}
                            />
                            Yes
                            <input
                              type="radio"
                              value="No"
                              checked={selectedOptions === "No"}
                              onChange={handleOptionsChanges}
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
    </>
  );
};

export default Add;
