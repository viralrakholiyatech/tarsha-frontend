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
import { adminKey } from "../../../config/RoleConfig";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { checkhodTodo, getTodosById } from "../../../config/config";
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
const HodPreviewTodo = () => {
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

          const cardData = validJson(data?.admin_card)
            ? JSON.parse(data?.admin_card)
            : [];

          var cardNo = 0;

          if (Array.isArray(cardData) && cardData.length) {
            cardNo = cardData[cardData.length - 1]?.card_no;
          }

          reset({
            reason: payload[0]?.reason,
            card_no: cardNo ? cardNo : "",
            remarks: data?.remarks,
            is_approved: data?.is_approved,
            admin_remarks: data?.admin_remarks,
            hod_remarks: data?.hod_remarks,
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

  const onRegenerate = async () => {
    SwalAlert({
      confirmButtonText: "Continue",
      title: "Do you wanna regenerate?",
    })
      .then(async (result) => {
        if (result?.isConfirmed) {
          const validate = await trigger();

          if (validate) {
            const values = getValues()[`${formname}`];
            const formData = new FormData();
            console.log(values);
            exit;
            let i = 0;

            const arr = [];
            for (var e of values) {
              let obj = {
                index: i,
                id: parseInt(params?.id),
                mst_file_id: params?.id,
                mst_type_id: e?.mst_type_id,
                show_website: e?.show_website,
                description: e?.description,
                amount: e?.amount,
                date: e?.date,
              };

              if (e?.file_doc != undefined) {
                const file = e?.file_doc[0] ? e?.file_doc[0] : "";
                if (file) {
                  // obj = {...obj,file_doc:file}
                  formData.append(`${i}_file`, file);
                }
              }

              arr.push(obj);
              i++;
            }

            formData.append("data", JSON.stringify(arr));
            formData.append("is_save", 1);

            console.log(arr);

            await onSubmit(formData);
            // console.log("formData=====>",formData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await ApiService(
        { ...data, id: parseInt(params?.id) },
        0,
        header,
        checkhodTodo.method,
        checkhodTodo.url
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

  useEffect(() => {
    fetchTodo();
  }, []);

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
                              <p className="incomplete_text">
                                {" "}
                                {todo.mark_as_done === 0
                                  ? "Incomplete"
                                  : "Complete"}
                              </p>
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
                                 
                                </select>
                              </div>
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
                                  1 Private Comment
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
                                        {todo.hod_remarks}
                                      </p>
                                    </div>
                                  </div>
                                </p>
                                <div className="reply_box">
                                  <textarea
                                    name="admin_remarks"
                                    id="admin_remarks"
                                    placeholder="Add Comment"
                                    {...register("admin_remarks")}
                                    className="reply_input"
                                  />
                                </div>
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

export default HodPreviewTodo;
