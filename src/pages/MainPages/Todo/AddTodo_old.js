import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCustomers } from "../../../services/CustomerService";
import {
  fetchActiveEmployee,
  fetchEmployee,
  fetchFile,
  insertTodo,
} from "../../../config/config";
import toast from "react-hot-toast";
import {
  displayError,
  formclass,
  isDateSameOrAfter,
  isDateSameOrBefore,
} from "../../../services/ValidationService";

import Select from "react-select";
const AddTodo = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState();
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    mode: "onChange",
  });

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

  const getFiles = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchFile.method,
        fetchFile.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setFile(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
  
      // Extracting team_ids from selectedOptions
      const team_ids = selectedOptions ? selectedOptions.map(option => option.value) : [];
  
      // Include team_ids in the data payload
      const payload = {
        ...data,
        team_ids: team_ids,
      };
  
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(payload, 0, header, insertTodo.method, insertTodo.url);
  
      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        navigate(`/${TodosRoute.list}`);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
      console.log(err);
    }
  };
  
  useEffect(() => {
    getEmployees();
    getFiles();
  }, []);
  function handleSelect(data) {
    setSelectedOptions(data);
  }

  const transformedEmployees = employees.map((employee) => ({
    label: `${employee.first_name} ${employee.last_name}`,
    value: employee.id,
  }));

  console.log("employees---->", employees);
  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Add</h1>
          <p className="mb-4">Todo</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Add Todo
                    </h6>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  displayLoader()
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="title">Title</label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            {...register("title", {
                              required: "Required",
                            })}
                            placeholder="Title"
                            className={formclass(errors?.title)}
                          />
                          {displayError(errors?.title?.message)}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="description">Description</label>
                          <textarea
                            name="description"
                            id="description"
                            cols="30"
                            rows="5"
                            className={formclass(errors?.description)}
                            {...register("description", {
                              required: false,
                            })}
                          ></textarea>
                          {displayError(errors?.title?.message)}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="team_id">Team</label>
                          {/* <select 
                                            name="team_id" 
                                            id="team_id" 
                                            className={formclass(errors?.team_id)}
                                            {...register("team_id",
                                            {
                                                required:"Select the team"
                                            })}
                                        >
                                            <option value={""}>--Select Team--</option>
                                            {employees.map((data) => (
                                                    <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                            ))}     
                                        </select> */}
                          <Select
                            options={transformedEmployees}
                            placeholder="Select Team"
                            name="team_id"
                            id="team_id"
                            {...register("team_id")}
                            value={selectedOptions}
                            onChange={handleSelect}
                            isSearchable={true}
                            isMulti
                          />
                          {/* {displayError(errors?.team_id?.message)} */}
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="mst_file_id">File</label>
                          <select
                            name="mst_file_id"
                            id="mst_file_id"
                            className={formclass(errors?.mst_file_id)}
                            {...register("mst_file_id", {
                              required: false,
                            })}
                          >
                            <option value={"0"}>--Select File--</option>
                            {file.map((file) => (
                              <option value={file.id}>{file.file_name}</option>
                            ))}
                          </select>
                          {displayError(errors?.mst_file_id?.message)}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="execution_date">Execution Date</label>
                          <input
                            type="date"
                            name="execution_date"
                            id="execution_date"
                            {...register("execution_date", {
                              required: "Required",
                              validate: (value) => {
                                return (
                                  isDateSameOrBefore(
                                    value,
                                    getValues("completed_date")
                                  ) ||
                                  "It should be same or before Completed date"
                                );
                              },
                            })}
                            defaultValue={todayDate()}
                            className={formclass(errors?.execution_date)}
                          />
                          {displayError(errors?.execution_date?.message)}
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="completed_date">
                            Completed Date (Due date)
                          </label>
                          <input
                            type="date"
                            name="completed_date"
                            id="completed_date"
                            {...register("completed_date", {
                              required: "Required",
                              validate: (value) => {
                                return (
                                  isDateSameOrAfter(
                                    value,
                                    getValues("execution_date")
                                  ) ||
                                  "It should be same or after Execution date"
                                );
                              },
                            })}
                            defaultValue={todayDate()}
                            className={formclass(errors?.completed_date)}
                          />
                          {displayError(errors?.completed_date?.message)}
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="extended_date">Extended Date</label>
                          <input
                            type="date"
                            name="extended_date"
                            id="extended_date"
                            {...register("extended_date", {
                              required: "Required",
                              validate: (value) => {
                                return (
                                  isDateSameOrAfter(
                                    value,
                                    getValues("completed_date")
                                  ) ||
                                  "It should be same or after Extended date"
                                );
                              },
                            })}
                            defaultValue={todayDate()}
                            className={formclass(errors?.extended_date)}
                          />
                          {displayError(errors?.extended_date?.message)}
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="form-group mb-0 col-md-2">
                        <button type="submit" className="btn">
                          Submit
                        </button>
                      </div>
                      <div className="form-group mb-0 col-md-4">
                        <button type="button" onClick={goBack} className="btn">
                          Back
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddTodo;

