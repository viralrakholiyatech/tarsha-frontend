import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getTodosById, checkTodo,  deleteHodcomment, } from "../../../config/config";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { GetDate } from "../../../services/DateAndTimeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { useForm } from "react-hook-form";
import { FileUrl } from "../../../config/file_url";
import { format } from "date-fns";
import { ActionButtonJsx } from "../../../services/FormCommon";

function HodModal({ show, handleClose, todoId }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });

  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState({});
  const [counter, setCounter] = useState(0);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        parseInt(todoId),
        header,
        getTodosById.method,
        getTodosById.url
      );
      // console.log("res-->", res);

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
            admin_remarks: data?.admin_remarks,
            hod_remarks: data?.hod_remarks,
            remainder_date: data?.remainder_date,
          });
          setCounter(data?.remainder || 0);
        }

        setLoading(false);
      } else {
        setLoading(false);
        // toast.error(res?.data?.message);
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
  }, [todoId]);

  const submitTheForm = async (data) => {
    try {
      setLoading(true);
      const res = await ApiService(
        { ...data, id: parseInt(todoId), remainder: counter },
        0,
        header,
        checkTodo.method,
        checkTodo.url
      );
      if (!res?.data?.error) {
        setLoading(false);
        window.location.reload();
        toast.success(res?.data?.message);
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
          handleClose();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  const todayDate = new Date();
  const dueDate = new Date(todo.completed_date);

  if (dueDate < todayDate) {
    console.log("true");
  } else {
    console.log("false");
  }

  const incrementCounter = () => {
    setCounter((prevCounter) => prevCounter + 1);
  };

  const decrementCounter = () => {
    if (counter > 0) {
      setCounter((prevCounter) => prevCounter - 1);
    }
  };

  const onRemoveHodComment = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removehodcomment(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const removehodcomment = async (id) => {
    try {
      const res = await ApiService(
        null,
        parseInt(id),
        header,
        deleteHodcomment.method,
        deleteHodcomment.url
      );
      if (!res?.data?.error) {
        // setTodos(id);
        toast.success(res?.data?.message);
        window.location.reload();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };
  return (
    <>
      <Modal show={show} onHide={handleClose} className="todos_sidebar_div">
        <Modal.Header closeButton>
          <Modal.Title> Task Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="project_name"> {todo.file_name}</p>
            <p className="start_date">Task completed 5 days After DUe date</p>
            <div className="d-flex align-items-center line_row">
              <p className="key">Start Date:</p>
              <p className="value">{GetDate(todo.created_at, "DD-MM-YYYY")}</p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Due Date:</p>
              <p className="value">
                <input
                  type="date"
                  // value={GetDate(todo.completed_date, "DD-MM-YYYY")}
                  {...register("completed_date")}
                  id="completed_date"
                  name="completed_date"
                />
              </p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Remainder Task :</p>
              <p className="value">
                <div className=" align-items-center counter_box">
                  <span className="action_btn" onClick={decrementCounter}>
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

                  <span className="action_btn" onClick={incrementCounter}>
                    {" "}
                    +{" "}
                  </span>
                </div>
              </p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Remainder Date:</p>
              <p className="value">
                {GetDate(todo.remainder_date, "DD-MM-YYYY")}
              </p>
            </div>
            <div>
              <div className="d-flex align-items-center line_row">
                <p className="key">Status:</p>
                <p className="value">
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
                </p>
              </div>
              <div className="d-flex align-items-center line_row">
                <p className="key">Member Card :</p>
                <p className="value">
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
                </p>
              </div>
              <div className="d-flex align-items-center line_row">
                <p className="key">HOD Card :</p>
                <p className="value">
                  <button
                    className={`status_btn ${
                      todo.admin_card ? getLastCard(todo.admin_card) : "-"
                    }`}
                  >
                    {todo.admin_card ? getLastCard(todo.admin_card) : "-"}
                  </button>
                </p>
              </div>
            </div>

            <p className="">
              <div className="edit_icon d-flex">
                {" "}
                <img
                  src={`${FileUrl}/img/icons/clipboard.svg`}
                  className="in__svg pr-2"
                  alt="project"
                />{" "}
                Task assigned
              </div>{" "}
              <textarea
                name="description"
                id="description"
                cols="3"
                value={todo.description}
                disabled
                style={{
                  flex: "1",
                  overflow: "hidden",
                  minHeight: 0,
                  width: "100%",
                  backgroundColor: "transparent",
                  border: "1px solid transparent",
                  padding: "7px 10px",
                }}
                rows={5}
              ></textarea>
            </p>
            <div className="edit_view">
              <p className="">
                <div className="edit_icon d-flex">
                  {" "}
                  <img
                    src={`${FileUrl}/img/icons/edit_pencil.svg`}
                    className="in__svg pr-2"
                    alt="project"
                  />
                  Reply from
                </div>

                <textarea
                  name="reason"
                  id="reason"
                  cols="3"
                  // {...register("reason")}
                  value={todo.reason}
                  disabled={new Date() > new Date(todo.completed_date)}
                  style={{
                    flex: "1",
                    resize: "none",
                    overflow: "hidden",
                    minHeight: 0,
                    width: "100%",
                    backgroundColor: "#F8F8F8",
                    border: "1px solid #AEAEAE",
                    padding: "7px 10px",
                    borderRadius: "6px",
                  }}
                  rows={5}
                ></textarea>
              </p>
            </div>
            <div className="remark_box">
              <p className="private_comment">Comment</p>

              <div className="reply_box">
                <div className="main_chat_view_box">
                  <div className="d-flex">
                    <div className="profile_img">P</div>
                    <div className="ps-2 w-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <h3 className="hod_text">{todo.hod_name}</h3>
                          <p className="date_text">
                            {" "}
                            {GetDate(todo.hod_comment_date, "DD-MM-YYYY")}
                          </p>
                        </div>
                        <div>
                          {" "}
                          <React.Fragment>
                            <div className="dropdown text-right  edit_dropdown">
                              <button
                                className="btn btn_action_menu"
                                type="button"
                                data-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <b>
                                  <ActionButtonJsx />
                                </b>
                              </button>
                              <div className="dropdown-menu">
                                <a
                                  className="dropdown-item"
                                  role={"button"}
                                  onClick={() => onRemoveHodComment(todo.id)}
                                >
                                  delete
                                </a>
                              </div>
                            </div>
                          </React.Fragment>
                        </div>
                      </div>
                      <p className="chat_msg_text">
                        {" "}
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
                </div>
                <div className="main_chat_view_box">
                  <div className="d-flex">
                    <div className="profile_img">P</div>
                    <div className="ps-2 w-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <h3 className="hod_text">{todo.admin_name}</h3>
                          <p className="date_text">{todo.admin_comment_date}</p>
                        </div>
                       
                      </div>
                      <p className="chat_msg_text">{todo.admin_remarks}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group mb-0 col-md-2 d-flex">
              <div>
                <button type="submit" className="btn btn-primary mx-4">
                  Submit
                </button>
              </div>
              <div>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default HodModal;
