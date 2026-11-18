import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { getCustomers } from "../../../services/CustomerService";
import {
  fetchActiveEmployee,
  fetchEmployee,
  fetchFile,
  getTodosById,
  insertTodo,
  updateTodo,
} from "../../../config/config";
import toast from "react-hot-toast";
import {
  displayError,
  formclass,
  isDateSameOrAfter,
  isDateSameOrBefore,
} from "../../../services/ValidationService";

const EditTodo = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState([]);
  const [dropdownData, setDropDownData] = useState({
    team_id: "",
    mst_file_id: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm({
    mode: "onChange",
  });

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        getTodosById.method,
        getTodosById.url
      );
      if (!res?.data?.error) {
        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length) {
          const data = payload[0];

          reset({
            id: parseInt(params?.id),
            title: data?.title,
            description: data?.description,
            team_id: data?.team_id,
            mst_file_id: data?.mst_file_id,
            execution_date: data?.execution_date
              ? GetDate(data?.execution_date, "YYYY-MM-DD")
              : todayDate(),
            completed_date: data?.completed_date
              ? GetDate(data?.completed_date, "YYYY-MM-DD")
              : todayDate(),
            extended_date: data?.extended_date
              ? GetDate(data?.extended_date, "YYYY-MM-DD")
              : todayDate(),
          });

          setDropDownData({
            team_id: data?.team_id,
            mst_file_id: data?.mst_file_id,
          });
        }

        setLoading(false);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
        navigate(`/${TodosRoute.list}`);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };

  const getEmployees = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url
      );
      if (!res.data.error) {
        setLoading(false);
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setEmployees(payload);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getFiles = async () => {
    try {
      setLoading(true);
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
        setLoading(false);
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setFile(payload);
        }
        fetchTodo();
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        data,
        0,
        header,
        updateTodo.method,
        updateTodo.url
      );
      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        const myKey = localStorage.getItem("myKey");
        const path = localStorage.getItem("path");
        if (myKey && path) {
          localStorage.removeItem("myKey");
          //   localStorage.removeItem('path');
          navigate(path);
        } else {
          navigate(`/${TodosRoute.list}`);
        }
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        err?.response?.data?.messsage
          ? err?.response?.data?.messsage
          : "Something went wrong"
      );
      console.log(err);
    }
  };

  useEffect(async () => {
    const FETCH_1 = getEmployees();
    const FETCH_2 = getFiles();

    await FETCH_1;
    await FETCH_2;
  }, []);

  const handleButtonClick = () => {
    const myKey = localStorage.getItem("myKey");
    const path = localStorage.getItem("path");

    if (myKey && path) {
      localStorage.removeItem("myKey");
      //   localStorage.removeItem('path');
      navigate(path);
    } else {
      navigate("/todos");
    }
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Edit</h1>
          <p className="mb-4">Todo</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Edit Todo
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
                          <select
                            name="team_id"
                            id="team_id"
                            className={formclass(errors?.team_id)}
                            {...register("team_id", {
                              required: "Select the team",
                            })}
                            defaultValue={dropdownData?.team_id}
                          >
                            <option value={""}>--Select Team--</option>
                            {employees.map((data, index) => (
                              <option
                                key={index}
                                value={data.id}
                                selected={data?.id == getValues(`team_id`)}
                              >
                                {data.first_name} {data.last_name}
                              </option>
                            ))}
                          </select>
                          {displayError(errors?.team_id?.message)}
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
                            defaultValue={dropdownData?.mst_file_id}
                          >
                            <option value={"0"}>--Select File--</option>
                            {file.map((file, index) => (
                              <option
                                key={index}
                                value={file.id}
                                selected={file.id == getValues("mst_file_id")}
                              >
                                {file.file_name}
                              </option>
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
                        <button
                          type="submit"
                          className="btn"
                        //   onClick={handleButtonClick}
                        >
                          Submit
                        </button>
                      </div>
                      <div className="form-group mb-0 col-md-4">
                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className="btn"
                        >
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

export default EditTodo;
