import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import { differenceInDays, format } from "date-fns";
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { getTodosById, markAsDoneTodo } from "../../../config/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCircleUser,
  faClipboardList,
  faPen,
  faUser,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
// import { format } from "date-fns";

const MarkTodoForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState({});
  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        getTodosById.method,
        getTodosById.url
      );

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setTodo(payload[0]);
          reset({ reason: payload[0]?.reason });
          reset({ work_done: payload[0]?.work_done });
          reset({ work_pending: payload[0]?.work_pending });
        }
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

  const submitTheForm = async (data) => {
    try {
      setLoading(true);
      const res = await ApiService(
        { ...data, id: parseInt(params?.id) },
        0,
        header,
        markAsDoneTodo.method,
        markAsDoneTodo.url
      );
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
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };

  const onSubmit = async (data) => {
    SwalAlert({ confirmButtonText: "Mark as done" })
      .then(async (result) => {
        if (result?.isConfirmed) {
          await submitTheForm(data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchTodo();
  }, []);

  const validJson = (json_string) => {
    try {
      JSON.parse(json_string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const getLastCard = (jsonData) => {
    try {
      if (validJson(jsonData)) {
        const data = JSON.parse(jsonData);
        if (Array.isArray(data) && data?.length) {
          return data[data.length - 1]?.card_type;
        }
      } else {
        return "";
      }
    } catch (err) {
      console.log(err);
      return "";
    }
  };

  // const todayDate = format(new Date(), "dd-MM-yyyy");
  // const dueDate = format(new Date(todo.completed_date), "dd-MM-yyyy");

  // console.log("dueDate==>", dueDate);
  // console.log("todayDate==>", todayDate);

  // if (todayDate > dueDate) {
  //   console.log("todayDate > due date");
  // } else {
  //   console.log("todayDate is not > due date");
  // }

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Your</h1>
          <p className="mb-4">Task</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Your task
                    </h6>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  displayLoader()
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="table-responsive">
                      <div className="main_card mt-3">
                        <div className="date_row">
                          <p>{GetDate(todo.created_at, "DD-MM-YYYY")}</p>
                        </div>
                        <div className="row bg-white pr-4">
                          <div className="col-lg-5">
                            <p className="project_name"> {todo.file_name}</p>

                            <div className="list_box">
                              <div className="list_view">
                                <p className="d-flex">
                                  <div className="edit_icon">
                                    {" "}
                                    <FontAwesomeIcon
                                      icon={faClipboardList}
                                      className="mx-2"
                                      style={{
                                        fontSize: "14px",
                                        color: "#fff",
                                      }}
                                    />
                                  </div>{" "}
                                  <textarea
                                    name="description"
                                    id="description"
                                    cols="3"
                                    value={todo.description}
                                    disabled
                                    style={{
                                      flex: "1",
                                      // resize: "none",
                                      overflow: "hidden",
                                      minHeight: 0,
                                      border: "0",
                                      backgroundColor: "#fff",
                                    }}
                                    rows={5}
                                  ></textarea>
                                </p>
                              </div>
                              <div className="edit_view">
                                <p className="d-flex">
                                  <div className="edit_icon">
                                    {" "}
                                    <FontAwesomeIcon
                                      icon={faPen}
                                      className="mx-2"
                                      style={{
                                        fontSize: "14px",
                                        color: "#fff",
                                      }}
                                    />
                                  </div>

                                  <textarea
                                    name="reason"
                                    id="reason"
                                    cols="3"
                                    {...register("reason")}
                                    // disabled={
                                    //   new Date(todo.completed_date) < new Date()
                                    // }
                                    style={{
                                      width: "100%",
                                      color: "#3D441F",
                                    }}
                                    rows={5}
                                  ></textarea>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3">
                            <div className="status_box">
                              <p className="incomplete_text">
                                {" "}
                                {todo.todo_status === 0
                                  ? "In Progress"
                                  : todo.todo_status === 1
                                  ? "Pending"
                                  : todo.todo_status === 2
                                  ? "Completed"
                                  : ""}
                              </p>
                              {/* <p className="incomplete_text">
                                {" "}
                                {todo.mark_as_done === 0
                                  ? "Incomplete"
                                  : "Complete"}
                              </p> */}
                              <button
                                className={`status_btn ${
                                  todo.card ? getLastCard(todo.card) : "-"
                                }`}
                              >
                                {todo.card ? getLastCard(todo.card) : "-"}
                              </button>
                              <p className="green_text complete_day">
                                Reminder Day{" "}
                                {differenceInDays(
                                  new Date(),
                                  new Date(todo.completed_date)
                                ) === 0
                                  ? "0"
                                  : differenceInDays(
                                      new Date(),
                                      new Date(todo.completed_date)
                                    )}
                              </p>
                              <p className="due_date_text">
                                Due Date -{" "}
                                {GetDate(todo.completed_date, "DD-MM-YYYY")}
                              </p>
                            </div>
                          </div>
                          <div className="col-lg-4">
                            <div className="hod_box">
                              <p className="hod_text">{todo.hod_name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      {/* {todo?.mark_as_done == 0 ? ( */}
                      <div className="form-group mb-0 col-md-2">
                        <button type="submit" className="btn">
                          Submit
                        </button>
                      </div>
                      {/* ) : (
                        ""
                      )} */}

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

export default MarkTodoForm;
