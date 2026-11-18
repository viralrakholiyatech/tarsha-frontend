import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetFile } from "../../../services/FileService";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useForm, reset } from "react-hook-form";
import { getCustomers } from "../../../services/CustomerService";
import {
  fetchActiveEmployee,
  getDpartmentempoloyee,
  getProjectsForSuperUser,
  getDepartment,
  getHOD,
  insertTodo,
} from "../../../config/config";
import toast from "react-hot-toast";
import {
  displayError,
  formclass,
  isDateSameOrAfter,
  isDateSameOrBefore,
} from "../../../services/ValidationService";
import { Accordion, Tab, Nav } from "react-bootstrap";
import { FileUrl } from "../../../config/file_url";

import Select from "react-select";
const AddTodo = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [department, setdepartment] = useState([]);
  const [hod, setHoD] = useState([]);
  const [file, setFile] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [todoBoxes, setTodoBoxes] = useState([{ id: 0, data: {} }]);
  const [selectedOption, setSelectedOption] = useState("tp");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm({
    mode: "onChange",
  });

  const addTodoBox = () => {
    const newBox = { id: todoBoxes.length, data: {} };
    setTodoBoxes([...todoBoxes, newBox]);
  };
  const removeTodoBox = (index) => {
    console.log("Current todoBoxes state:", todoBoxes);
    const updatedBoxes = todoBoxes.filter((_, i) => i !== index);
    console.log("Updated todoBoxes state:", updatedBoxes);
    setTodoBoxes(updatedBoxes);

    // Clear corresponding data from form state
    setValue(`boxes[${index}]`, {});
    console.log("Cleared form data for index:", `boxes[${index}]`);
  };

  const getEmployees = async (department_id) => {
    try {
      console.log("department_id==>", department_id);
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        department_id,
        header,
        getDpartmentempoloyee.method,
        getDpartmentempoloyee.url
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

  const getDepartments = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        getDepartment.method,
        getDepartment.url
      );
      if (!res.data.error) {
        const payload = res.data?.data;
        console.log("payload==>", payload);
        if (Array.isArray(payload) && payload.length) {
          setdepartment(payload);
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
      const res = await ApiService(null, 0, header, getHOD.method, getHOD.url);
      if (!res.data.error) {
        const payload = res.data?.data;
        console.log("payload==>", payload);
        if (Array.isArray(payload) && payload.length) {
          setHoD(payload);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await GetFile(`${getToken()}`);
      if (!res.data.error) {
        setFile(res.data.data);
      } else {
        toast.error(res.data.message);
        navigate(`/${login.page}`, {
          state: { from: location },
          replace: true,
        });
      }
    } catch (err) {
      console.log(err);
      if (err.response.data.error) {
        toast.error(err.response.data.message);
        navigate(`/${login.page}`, {
          state: { from: location },
          replace: true,
        });
      }
    }
  };

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const nonEmptyTodoBoxes = data.boxes.filter(
        (todoBox) => Object.keys(todoBox).length > 0
      );
      const userinfo = JSON.parse(localStorage.getItem("userinfo"));
      const comp_id = userinfo.comp_id;

      // Extracting team_ids from selectedOptions
      const team_ids = selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [];

      // Include team_ids in the data payload
      const payload = {
        ...data,
        team_ids: team_ids,
        comp_id: comp_id,
        boxes: nonEmptyTodoBoxes,
      };

      console.log("Data to be inserted:", payload);

      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        payload,
        0,
        header,
        insertTodo.method,
        insertTodo.url
      );

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        // navigate(`/${TodosRoute.list}`);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
      // reset();
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
    fetchFiles();
    getDepartments();
    fetchHOD();
  }, []);

  const handleDepartmentChange = async (event) => {
    const selectedDeptId = event.target.value;
    setSelectedDepartment(selectedDeptId);

    // Fetch HODs based on the selected department
    try {
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        selectedDeptId,
        header,
        getHOD.method,
        getHOD.url
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
    getEmployees(selectedDeptId);
  };

  const handleAccordionToggle = (index) => {
    if (activeAccordion === index) {
      setActiveAccordion(null);
    } else {
      setActiveAccordion(index);
    }
  };
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Add</h1>
          <p className="mb-4">Approval Process</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line  mb-0 pb-3">
                      <input type="radio" value="tp"  checked={selectedOption === "tp"} onChange={handleOptionChange}/> <label>TP</label>
                      <input type="radio" value="nontp"checked={selectedOption === "nontp"} onChange={handleOptionChange}/> <label>NON TP</label>
                      <input type="radio" value="gamtal"checked={selectedOption === "gamtal"}onChange={handleOptionChange} />
                      <label>GAMTAL</label>
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
                          <label htmlFor="department">Department</label>
                          <select
                            name="department"
                            id="department"
                            className={formclass(errors?.team_id)}
                            {...register("department", {
                              required: "Select the Department",
                            })}
                            onChange={handleDepartmentChange}
                          >
                            <option value={""}>--Select Department--</option>
                            {department.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.name}
                              </option>
                            ))}
                          </select>

                          {/* {displayError(errors?.team_id?.message)} */}
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="hod">HOD</label>
                          <select
                            name="hod"
                            id="hod"
                            className={formclass(errors?.hod)}
                            {...register("hod", {
                              required: false,
                            })}
                          >
                            <option value={"0"}>--Select HOD--</option>
                            {hod.map((hod) => (
                              <option value={hod.id}>
                                {" "}
                                {hod.first_name} {hod.last_name}
                              </option>
                            ))}
                          </select>
                          {/* {displayError(errors?.mst_file_id?.message)} */}
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="team_id">Team Members</label>
                          <select
                            name="team_id"
                            id="team_id"
                            className={formclass(errors?.team_id)}
                            {...register("team_id", {
                              required: "Select the team",
                            })}
                          >
                            <option value={""}>--Select Team--</option>
                            {employees.map((data) => (
                              <option key={data.id} value={data.id}>
                                {data.first_name} {data.last_name}
                              </option>
                            ))}
                          </select>
                          {displayError(errors?.mst_file_id?.message)}
                        </div>
                      </div>
                    </div>

                    <Accordion className="addtodo">
                      {todoBoxes.map((todoBox, index) => (
                        <Accordion.Item key={index} className="border-0">
                          <div
                            className="todo_box mt-4 mb-4"
                            style={{ backgroundColor: "#F8F5ED" }}
                          >
                            <Accordion.Header
                              key={todoBox.id}
                              className="todo_header"
                              style={{ backgroundColor: "#F8F5ED" }}
                            >
                              <div className="row">
                                <div className="col-lg-4">
                                  <div className="form-group mb-0">
                                    <label htmlFor={`mst_file_id_${index}`}>
                                      Project name
                                    </label>

                                    <Select
                                      options={file.map((file) => ({
                                        label: file.file_name,
                                        value: file.id,
                                      }))}
                                      className="basic-single"
                                      classNamePrefix="select"
                                      placeholder="Select Project"
                                      isSearchable
                                      onChange={(selectedOption) => {
                                        const valueToSet = selectedOption
                                          ? selectedOption.value
                                          : ""; // Ensure a default value if nothing is selected
                                        setValue(
                                          `boxes[${index}].mst_file_id`,
                                          valueToSet
                                        );
                                      }}
                                      required // HTML5 validation attribute
                                      aria-required={true}
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                    />
                                    {displayError(
                                      errors?.[`mst_file_id_${index}`]?.message
                                    )}
                                  </div>
                                </div>
                                <div className="col-lg-4">
                                  <div className="form-group mb-0">
                                    <label htmlFor={`execution_date_${index}`}>
                                      Execution Date
                                    </label>
                                    <input
                                      type="date"
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                      name={`execution_date_${index}`}
                                      style={{ background: "#fff" }}
                                      id={`execution_date_${index}`}
                                      {...register(
                                        `boxes[${index}].execution_date`,
                                        {
                                          required: "Required",
                                          validate: (value) => {
                                            return (
                                              isDateSameOrBefore(
                                                value,
                                                getValues(
                                                  `boxes[${index}].completed_date`
                                                )
                                              ) ||
                                              "It should be same or before Completed date"
                                            );
                                          },
                                        }
                                      )}
                                      defaultValue={todayDate()}
                                      className={formclass(
                                        errors?.[`execution_date_${index}`]
                                      )}
                                    />
                                    {displayError(
                                      errors?.[`execution_date_${index}`]
                                        ?.message
                                    )}
                                  </div>
                                </div>
                                <div className="col-lg-4">
                                  <div className="d-flex">
                                    <div className="form-group mb-0 w-100">
                                      <label
                                        htmlFor={`completed_date_${index}`}
                                      >
                                        Completed Date (Due date)
                                      </label>
                                      <input
                                        type="date"
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                        style={{ background: "#fff" }}
                                        name={`completed_date_${index}`}
                                        id={`completed_date_${index}`}
                                        {...register(
                                          `boxes[${index}].completed_date`,
                                          {
                                            required: "Required",
                                            validate: (value) => {
                                              return (
                                                isDateSameOrAfter(
                                                  value,
                                                  getValues(
                                                    `boxes[${index}].execution_date`
                                                  )
                                                ) ||
                                                "It should be same or after Execution date"
                                              );
                                            },
                                          }
                                        )}
                                        defaultValue={todayDate()}
                                        className={formclass(
                                          errors?.[`completed_date_${index}`]
                                        )}
                                      />
                                      {displayError(
                                        errors?.[`completed_date_${index}`]
                                          ?.message
                                      )}
                                    </div>
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        className="danger_btn  "
                                        onClick={() => {
                                          removeTodoBox(index);
                                        }}
                                      >
                                        <img
                                          src={`${FileUrl}/img/icons/todo_delete.svg`}
                                          className="in__svg pr-2"
                                          alt="project"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body>
                              <div className="row">
                                <div className="col">
                                  <div className="form-group mb-0">
                                    <label htmlFor={`description_${index}`}>
                                      Description
                                    </label>
                                    <textarea
                                      name={`description_${index}`}
                                      id={`description_${index}`}
                                      cols="30"
                                      rows="5"
                                      style={{ backgroundColor: "white" }}
                                      className={formclass(
                                        errors?.[`description_${index}`]
                                      )}
                                      {...register(
                                        `boxes[${index}].description`,
                                        {
                                          required: false,
                                        }
                                      )}
                                    ></textarea>
                                    {displayError(
                                      errors?.[`description_${index}`]?.message
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Accordion.Body>
                          </div>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="row  ">
                        <div className="form-group d-flex mb-0">
                          <button type="submit" className="submit_btn">
                            Submit
                          </button>
                          <button
                            type="button"
                            onClick={goBack}
                            className="back_btn"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                      <div className="text-right ">
                        <button
                          type="button"
                          className="  outline-extra-btn mx-2"
                          onClick={addTodoBox}
                        >
                          + <span>Add Task</span>
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
