import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getTodosById, markAsDoneTodo } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { GetDate } from "../../../services/DateAndTimeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { useForm } from "react-hook-form";
import { differenceInDays, format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardList, faPen } from "@fortawesome/free-solid-svg-icons";
import { eyeButtonSvg, FileUrl  } from "../../../config/file_url";

function EmpTodoModal({ show, handleClose, todoId }) {
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
        setLoading(false);
        const payload = res?.data?.data;
        // console.log("payload-->", payload);
        if (Array.isArray(payload) && payload.length) {
          setTodo(payload[0]);
          reset({ reason: payload[0]?.reason });
        }
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
        { ...data, id: parseInt(todoId) },
        0,
        header,
        markAsDoneTodo.method,
        markAsDoneTodo.url
      );
      if (!res?.data?.error) {
        setLoading(false);
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
                {" "}
                {GetDate(todo.completed_date, "DD-MM-YYYY")}
              </p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Remainder Task :</p>
              <p className="value">
                {" "}
                {todo.remainder !== null && todo.remainder !== 0 && (
                  <span className="counter_show">{todo.remainder}</span>
                )}
              </p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Remainder Date:</p>
              <p className="value">
                {GetDate(todo.remainder_date, "DD-MM-YYYY")}
              </p>
            </div>

            <div className="d-flex align-items-center line_row">
              <p className="key">Status:</p>
              <p className="value">
                {todo.todo_status === 0
                  ? "In Progress"
                  : todo.todo_status === 1
                  ? "Pending"
                  : todo.todo_status === 2
                  ? "Completed"
                  : ""}
              </p>
            </div>
            <div className="d-flex align-items-center line_row">
              <p className="key">Member Card :</p>
              <p className="value">
                <button
                  className={`status_btn ${
                    todo.card ? getLastCard(todo.card) : "-"
                  }`}
                >
                  {todo.card ? getLastCard(todo.card) : "-"}
                </button>
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
                  {" "}
                  {todo.admin_card ? getLastCard(todo.admin_card) : "-"}
                </button>
              </p>
            </div>

            <p className="">
              <div className="edit_icon d-flex">
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
                  //   disabled={new Date() > new Date(todo.completed_date)}
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
              <p className="private_comment">1 Private Comment</p>
              <div className="reply_box">
                <div className="main_chat_view_box">
                  <div className="d-flex">
                    <div className="profile_img">
                      <img src={`${FileUrl}/${todo.hod_profile}`} alt="HOD" />
                    </div>
                    <div className="ps-2 w-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <h3 className="hod_text">{todo.hod_name}</h3>
                          <p className="date_text">
                            {" "}
                            {GetDate(todo.hod_comment_date, "DD-MM-YYYY")}
                          </p>
                        </div>
                      </div>
                      <p className="chat_msg_text">{todo.hod_remarks}</p>
                    </div>
                  </div>
                </div>
                <div className="main_chat_view_box">
                  <div className="d-flex">
                    <div className="profile_img">
                      {" "}
                      <img
                        src={`${FileUrl}/${todo.admin_profile}`}
                        alt="admin"
                      />
                    </div>
                    <div className="ps-2 w-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <div className="d-flex align-items-center">
                          <h3 className="hod_text">{todo.admin_name}</h3>
                          <p className="date_text">{todo.admin_comment_date}</p>
                        </div>
                      </div>
                      <p className="chat_msg_text">
                        <textarea
                          name="admin_remarks"
                          id="admin_remarks"
                          placeholder="Add Comment"
                          value={todo.admin_remarks}
                          className="reply_input"
                        />
                      </p>
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

export default EmpTodoModal;
