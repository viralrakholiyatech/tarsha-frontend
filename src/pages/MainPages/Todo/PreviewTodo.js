import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import {
  Cordinator,
  getToken,
  superAccess,
} from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { adminKey } from "../../../config/RoleConfig";
import { checkTodo, getTodosById } from "../../../config/config";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { differenceInDays, format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faCircleUser,
  faClipboardList,
  faPen,
  faUser,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

//For admin only
const PreviewTodo = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState({});
  const [counter, setCounter] = useState(0);

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

  const handleButtonClick = () => {
    const path = localStorage.getItem("path");
    const view = localStorage.getItem("view");

    if (path && view) {
      localStorage.removeItem("view");
      navigate(path);
    } else {
      navigate(`/${TodosRoute.list}`);
    }
  };

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const validJson = (json_string) => {
    try {
      JSON.parse(json_string);
      return true;
    } catch (err) {
      return false;
    }
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
        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length) {
          const data = payload[0];
          console.log("data----->", data);
          console.log("payload==>", payload);
          setTodo(data);
         
          const cardData = validJson(data?.card) ? JSON.parse(data?.card) : [];

          var cardNo = 0;

          if (Array.isArray(cardData) && cardData.length) {
            cardNo = cardData[cardData.length - 1]?.card_no;
          }

          reset({
            reason: payload[0]?.reason,
            card_no: cardNo ? cardNo : "",
            remarks: data?.remarks,
            is_approved: data?.is_approved,
            hod_remarks: data?.hod_remarks,
            description: data?.description,
            remainder: data?.remainder,
           
          });
          setCounter(data?.remainder ? data.remainder : 0);
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



  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await ApiService(
        { ...data, id: parseInt(params?.id), remainder: counter },
        0,
        header,
        checkTodo.method,
        checkTodo.url
      );
      if (!res.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        const path = localStorage.getItem("path");
        const view = localStorage.getItem("view");
        if (path && view) {
          localStorage.removeItem("view");
          navigate(path);
        } else {
          navigate(`/${TodosRoute.list}`);
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

  useEffect(() => {
    fetchTodo();
  }, []);

  const incrementCounter = () => {
    setCounter((prevCounter) => prevCounter + 1);
  };

  const decrementCounter = () => {
    if (counter > 0) {
      setCounter((prevCounter) => prevCounter - 1);
    }
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Preview</h1>
          <p className="mb-4">Todo</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Preview Todo
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
                        <div className="row">
                          <div className="col-lg-5">
                            <div className="name_row">
                              <div className="icon">
                                {" "}
                                <FontAwesomeIcon
                                  icon={faUser}
                                  style={{ fontSize: "16px", color: "#887549" }}
                                />
                              </div>
                              <p>
                                {todo.team_fullname}- <span> Architecture</span>
                              </p>
                            </div>
                            <div className="date_row">
                              <p>{GetDate(todo.created_at, "DD-MM-YYYY")}</p>
                            </div>

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
                                      resize: "none",
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
                                    value={todo.reason}
                                    disabled
                                    style={{
                                      flex: "1",
                                      resize: "none",
                                      overflow: "hidden",
                                      minHeight: 0,
                                      border: "0",
                                      backgroundColor: "#fff",
                                    }}
                                    rows={5}
                                  ></textarea>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3">
                            <div className="status_box">
                              {/* <p className="incomplete_text">
                                {" "}
                                {todo.mark_as_done === 0
                                  ? "Incomplete"
                                  : "Complete"}
                              </p> */}
                            
                              <div className="form-group">
                                <select
                                  name="is_approved"
                                  id="is_approved"
                                  {...register("is_approved", {
                                    required: true,
                                  })}
                                  className="form-control"
                                >
                                  <option value="">--Select Status--</option>
                                  <option value="0">Inprogress</option>
                                  <option value="1">Pending</option>
                                  <option value="2">Completed</option>
                                </select>
                              </div>
                              <div className="hod_box form-group">
                                <select
                                  name="card_no"
                                  id="card_no"
                                  {...register("card_no", { required: true })}
                                  className="form-control"
                                >
                                  <option value={""}>--Select Card--</option>
                                  <option value="1">Green</option>
                                  <option value="2">Yellow</option>
                                  <option value="3">Red</option>
                                  <option value="4">Cyan</option>
                                </select>
                              </div>

                              <p className="green_text complete_day">
                                Reminder Day
                                {differenceInDays(
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
                              <div className="d-flex align-items-center justify-content-end">
                                <span className="reminder_text">
                                  Add Remainder
                                </span>
                                <div className="d-flex align-items-center counter_box">
                                  <span
                                    className="action_btn"
                                    onClick={decrementCounter}
                                  >
                                    -
                                  </span>
                                  <span
                                    className="counter_show"
                                    name="remainder"
                                    id="remainder"
                                    {...register("remainder")}
                                  >
                                    {" "}
                                    {counter}{" "}
                                  </span>

                                  <span
                                    className="action_btn"
                                    onClick={incrementCounter}
                                  >
                                    {" "}
                                    +{" "}
                                  </span>
                                </div>
                              </div>

                              <p className="hod_text">{todo.hod_name}</p>

                              <div className="remark_box">
                                <p className="private_comment">
                                  <FontAwesomeIcon
                                    icon={faUser}
                                    style={{
                                      fontSize: "16px",
                                      color: "#212322",
                                      marginRight: "7px",
                                    }}
                                  />
                                  Private Comment
                                </p>
                                <p className="hod_name_row">
                                  <div className="icon">
                                    <FontAwesomeIcon
                                      icon={faUser}
                                      style={{
                                        fontSize: "16px",
                                        color: "#212322",
                                        marginRight: "7px",
                                      }}
                                    />
                                  </div>
                                  <div className="w-100">
                                    <div className="d-flex">
                                      <p className="hod_name">
                                        {" "}
                                        {todo.hod_name}
                                      </p>
                                      <span className="date">
                                        {" "}
                                        {GetDate(
                                          todo.approved_date,
                                          "DD-MM-YYYY"
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="comment_text">
                                        <textarea
                                          name="hod_remarks"
                                          id="hod_remarks"
                                          placeholder="Add Comment"
                                          {...register("hod_remarks")}
                                          className="form-control"
                                        ></textarea>
                                      </p>
                                    </div>
                                  </div>
                                </p>
                              </div>
                            </div>
                          </div>
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

export default PreviewTodo;
