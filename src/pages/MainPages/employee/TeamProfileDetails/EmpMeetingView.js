import React, { useEffect, useState } from "react";
import PerformanceModal from "../../Meeting/Components/PerformanceModal";
import ClarityFocusModal from "../../Meeting/Components/ClarityFocusModal";
import { useParams, useNavigate } from "react-router-dom";
import {
  getoperationViewbyid,
  fetchoperationalmeetingbyid,
  getTaskPercentage,
  updateTaskcheck,
} from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import {
  getToken,
  isAdmin,
  getUserId,
  ishod,
} from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { MeetingRoute } from "../../../../config/RouteConfig";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowRightArrowLeft,
  faCircleCheck,
  faPencil,
  faThumbsDown,
  faThumbsUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import VerifyModal from "../../Meeting/Components/VerifyModal";
import { FileUrl } from "../../../../config/file_url";

ChartJS.register(ArcElement, Tooltip, Legend);

function EmpMeetingView() {
  const navigate = useNavigate();
  const params = useParams();

  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClarityModal, setShowClarityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [meeting, setMeeting] = useState([]);
  const [editId, setEditId] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [performnacePercentage, setPerformancePercentage] = useState(0);

  const handleShowModal = (id) => {
    setEditId(id);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);

  const handleShowConfirmModal = (id) => {
    setEditId(id);
    setShowConfirmModal(true);
  };
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  const handleShowClarityModal = (id) => {
    setEditId(id);
    setShowClarityModal(true);
  };
  const handleCloseClarityModal = () => setShowClarityModal(false);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        params.id,
        header,
        fetchoperationalmeetingbyid.method,
        fetchoperationalmeetingbyid.url
      );
      if (!res.data?.error) {
        setLoading(false);

        const payload = res?.data?.data;

        setMeeting(payload);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        params.id,
        header,
        getoperationViewbyid.method,
        getoperationViewbyid.url
      );
      if (!res.data?.error) {
        setLoading(false);

        const payload = res?.data?.data;

        setData(payload);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  const fetchTaskPercentage = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        params.id,
        header,
        getTaskPercentage.method,
        getTaskPercentage.url
      );
      if (!res.data?.error) {
        setLoading(false);

        setPerformancePercentage(res?.data?.data[0]);
        setPercentage(res?.data?.data[0]?.completion_percentage);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  useEffect(() => {
    fetchdata();
    fetchMeeting();
    fetchTaskPercentage();
  }, []);
  const handleView = (id) => {
    navigate(`/${MeetingRoute.performancelist}/${id}`);
  };

  const Piedata = {
    labels: ["Good Work", "Try Hard"],
    datasets: [
      {
        label: "# of Votes",
        data: [
          performnacePercentage.completion_percentage,
          performnacePercentage.uncompleted_percentage,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 159, 64, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)"],
        borderWidth: 1,
      },
    ],
  };
  const handleTaskCheckChange = (e, taskId, type) => {
    const isChecked = e.target.checked;
    const status = isChecked ? "1" : "0";

    setData((prevData) =>
      prevData.map((item) => {
        if (!item.prevdate_task_ids || !item.prevdate_tasks_status) return item;

        let taskIdArray, taskStatusArray, updatedField;

        if (type === "prevdate_tasks") {
          taskIdArray =
            item.prevdate_task_ids?.split("|").map((id) => id.trim()) || [];
          taskStatusArray =
            item.prevdate_tasks_status
              ?.split("|")
              .map((status) => status.trim()) || [];
          updatedField = "prevdate_tasks_status";
        } else if (type === "prevdate_contributions") {
          taskIdArray =
            item.prevdate_contribution_ids?.split("|").map((id) => id.trim()) ||
            [];
          taskStatusArray =
            item.prevdate_contributions_status
              ?.split("|")
              .map((status) => status.trim()) || [];
          updatedField = "prevdate_contributions_status";
        } else if (type === "today_tasks") {
          taskIdArray =
            item.today_task_ids?.split("|").map((id) => id.trim()) || [];
          taskStatusArray =
            item.tasks_by_meeting_status
              ?.split("|")
              .map((status) => status.trim()) || [];
          updatedField = "tasks_by_meeting_status";
        } else if (type === "today_contributions") {
          taskIdArray =
            item.today_contribution_ids?.split("|").map((id) => id.trim()) ||
            [];
          taskStatusArray =
            item.contributions_by_meeting_status
              ?.split("|")
              .map((status) => status.trim()) || [];
          updatedField = "contributions_by_meeting_status";
        } else {
          return item;
        }

        const taskIndex = taskIdArray.indexOf(taskId);
        if (taskIndex === -1) return item; // Task not found

        // Update status array
        const newTaskStatusArray = [...taskStatusArray];
        newTaskStatusArray[taskIndex] = status;
        updateTaskStatusInDatabase(taskId, status);
        return {
          ...item,
          [updatedField]: newTaskStatusArray.join("|"),
        };
      })
    );
  };

  const updateTaskStatusInDatabase = async (taskId, status) => {
    const header = {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    };

    const payload = {
      task_id: taskId, // Ensure task ID is correctly passed
      status: status, // Ensure status is passed as '1' or '0'
    };

    try {
      const response = await ApiService(
        payload,
        0,
        header,
        updateTaskcheck.method,
        updateTaskcheck.url
      );

      toast.success("task check successfully");
    } catch (error) {
      toast.error("Error updating task status", error);
    }
  };

  return (
    <>
      <div className="content__wrapper">
        <section className="page-content">
          <div className="page-title mobile-title">
            <h1 className="h4 mb-0">Participants List</h1>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="zed__table card">
                <div className="d-flex aign-items-center justify-content-between">
                  <h5 className="text-shadow-yellow px-2 mb-4">
                    {meeting?.length > 0 && meeting[0]?.date
                      ? new Date(meeting[0].date).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "No Date Available"}
                  </h5>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    {meeting.map((item) => (
                      <div key={item.id} className="main_team_box grey_bg">
                        <div className="team_header">
                          <div className="team_members d-flex">
                            {item.participants_pictures &&
                            item.participants_pictures.length > 0 ? (
                              item.participants_pictures
                                .split(",")
                                .map((participantId, index) => (
                                  <div className="img_box">
                                    <img
                                      src={`${FileUrl}/${participantId}`}
                                      alt="User"
                                      className=""
                                      data-bs-toggle="tooltip"
                                      data-bs-placement="top"
                                    />
                                  </div>
                                ))
                            ) : (
                              <p>-</p>
                            )}
                          </div>
                          <div className="date_text">
                            <span>Reported Date:</span> &nbsp;
                            <span>
                              {new Date(item.Reported_date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="team_box_part d-flex align-items-center justify-content-between">
                          <div>
                            <p className="role">{item.department_name}</p>
                            <p className="facility_name">
                              Facilitator Name:{" "}
                              <span>
                                {item.facilitator_first_name}{" "}
                                {item.facilitator_last_name}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="row mt-3 ">
                      <div className="col-lg-6">
                        <div className="grey_bg tasks_box">
                          <p>Task Completion Ratio</p>
                          <h3>{percentage}%</h3>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="grey_bg tasks_box">
                          <p>Performance ratio</p>
                          <h3>
                            {performnacePercentage.completion_percentage}%
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="chart_main_box grey_bg d-flex align-items-center justify-content-center">
                      <CircularProgressbar
                        value={percentage}
                        className="w-75"
                        text={`${percentage}%`}
                        styles={buildStyles({
                          textColor: "#000",
                          pathColor: "#4caf50",
                          trailColor: "#d6d6d6",
                        })}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="chart_main_box grey_bg">
                      <Pie data={Piedata} />
                    </div>
                  </div>
                </div>

                <div className="chart_main_box grey_bg">
                  <h3 className="main_card_title">Participants List</h3>
                  {data.map((item, index) => (
                    <div key={item.id} className="participent_row">
                      <div className="participent_header d-flex justify-content-between align-items-center">
                        <div className="name_box d-flex align-items-center">
                          <div className="img_box me-3">
                            <img
                              src={`${FileUrl}/${item.profile_picture}`}
                              alt="User"
                              className="w-100"
                            />
                          </div>
                          <div className="content">
                            <p>
                              {" "}
                              {item?.first_name}&nbsp;
                              {item?.last_name}
                            </p>
                            <div className="d-flex align-items-center">
                              <span
                                className={`thumb_icon ${
                                  item.total_uncompleted_prevdate_tasks > 0
                                    ? "thumb_down_red" // Applied when is_ok > 0
                                    : "thumb_down_grey"
                                }`}
                              >
                                <FontAwesomeIcon icon={faThumbsDown} />
                              </span>
                              <span className="main_task_text">
                                {item.total_uncompleted_prevdate_tasks}
                              </span>
                              <span
                                className={`thumb_icon ${
                                  item.total_completed_prevdate_tasks > 0
                                    ? "thumb_up_green" // Applied when is_ok <= 0
                                    : "thumb_up_grey" // Default color when is_ok > 0
                                }`}
                              >
                                <FontAwesomeIcon icon={faThumbsUp} />
                              </span>
                              <span className="main_task_text">{item.total_completed_prevdate_tasks}</span>
                              <span
                                className={`checkmark_icon ${
                                  item.verified === 1
                                    ? "checkmark_blue"
                                    : item.verified === 0
                                    ? "checkmark_grey"
                                    : "checkmark_grey"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  className="cursor-pointer"
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title={item.verified_name}
                                  onClick={() => {
                                    if (isAdmin() || ishod()) {
                                      handleShowConfirmModal(item.id);
                                    }
                                  }}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="arrow_icon">
                          {" "}
                          {isAdmin() && (
                            <>
                              <button className="edit_view ms-2 delete_btn">
                                <FontAwesomeIcon
                                  icon={faArrowRight}
                                  onClick={() => handleView(item.user_id)}
                                />
                              </button>
                            </>
                          )}
                          <>
                            {!isAdmin() && item.user_id === getUserId() && (
                              <>
                                <button className="edit_view ms-2 delete_btn">
                                  <FontAwesomeIcon
                                    icon={faArrowRight}
                                    onClick={() => handleView(item.user_id)}
                                  />
                                </button>
                              </>
                            )}
                            {!isAdmin() &&
                              ishod() &&
                              item.user_id !== getUserId() && (
                                <button className="edit_view edit_btn">
                                  <FontAwesomeIcon
                                    icon={faPencil}
                                    onClick={() => handleShowModal(item.id)}
                                  />
                                </button>
                              )}
                          </>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="participate_detail_box common_detail_box">
                            <h6>Yesterday details</h6>
                            <div className="task_box">
                              <h5 className="key_box_title">Task</h5>
                              {item.prevdate_tasks
                                ?.split("|")
                                .map((task, idx) => {
                                  const taskStatusArray =
                                    item.prevdate_tasks_status?.split("|");
                                  const taskIdArray =
                                    item.prevdate_task_ids?.split("|");
                                  const taskId = taskIdArray?.[idx]?.trim();
                                  const isChecked =
                                    taskStatusArray?.[idx]?.trim() === "1";
                                  const isDisabled =
                                    item.user_id !== getUserId();

                                  return (
                                    <div
                                      key={`${taskId}-${isChecked}`}
                                      className="input_box"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`prevdate-task-${taskId}`}
                                        name={`prevdate-task-${taskId}`}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) =>
                                          handleTaskCheckChange(
                                            e,
                                            taskId,
                                            "prevdate_tasks"
                                          )
                                        }
                                      />
                                      <label
                                        htmlFor={`prevdate-task-${taskId}`}
                                      >
                                        {task}
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="task_box">
                              <h5 className="key_box_title">collabration</h5>
                              {item.prevdate_contributions
                                ?.split("|") // Split tasks into an array
                                ?.map((task, idx) => {
                                  const taskStatusArray =
                                    item.prevdate_contributions_status?.split(
                                      "|"
                                    );
                                  const taskIdArray =
                                    item.prevdate_contribution_ids?.split("|");
                                  const taskId = taskIdArray?.[idx]?.trim();
                                  const isChecked =
                                    taskStatusArray?.[idx]?.trim() === "1"; // Check if the status is '1' for the current task
                                  const isDisabled =
                                    item.user_id !== getUserId();
                                  return (
                                    <div
                                      key={`${taskId}-${isChecked}`}
                                      className="input_box"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`prevdate-contribution-task-${taskId}`}
                                        name={`prevdate-contribution-task-${taskId}`}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) =>
                                          handleTaskCheckChange(
                                            e,
                                            taskId,
                                            "prevdate_contributions"
                                          )
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`prevdate-contribution-task-${taskId}`}
                                      >
                                        {task}
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="participate_detail_today_box common_detail_box">
                            <h6 className="key_box_title">Today details</h6>
                            <div className="task_box">
                              <h5 className="key_box_title">Task</h5>
                              {item.tasks_by_meeting
                                ?.split("|") // Split tasks into an array
                                ?.map((task, idx) => {
                                  const taskStatusArray =
                                    item.tasks_by_meeting_status?.split("|");
                                  const taskIdArray =
                                    item.today_task_ids?.split("|");
                                  const taskId = taskIdArray?.[idx]?.trim();
                                  const isChecked =
                                    taskStatusArray?.[idx]?.trim() === "1"; // Check if the status is '1' for the current task
                                  const isDisabled =
                                    item.user_id !== getUserId();
                                  return (
                                    <div
                                      key={`${taskId}-${isChecked}`}
                                      className="input_box"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`today-task-${taskId}`}
                                        name={`today-task-${taskId}`}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) =>
                                          handleTaskCheckChange(
                                            e,
                                            taskId,
                                            "today_tasks"
                                          )
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`today-task-${taskId}`}
                                      >
                                        {task}
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="task_box">
                              <h5 className="key_box_title">collabration</h5>
                              {item.contributions_by_meeting
                                ?.split("|") // Split tasks into an array
                                ?.map((task, idx) => {
                                  const taskStatusArray =
                                    item.contributions_by_meeting_status?.split(
                                      "|"
                                    );
                                  const taskIdArray =
                                    item.today_contribution_ids?.split("|");
                                  const taskId = taskIdArray?.[idx]?.trim();
                                  const isChecked =
                                    taskStatusArray?.[idx]?.trim() === "1"; // Check if the status is '1' for the current task
                                  const isDisabled =
                                    item.user_id !== getUserId();
                                  return (
                                    <div
                                      key={`${taskId}-${isChecked}`}
                                      className="input_box"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`today-contribution-task-${taskId}`}
                                        name={`today-contribution-task-${taskId}`}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={(e) =>
                                          handleTaskCheckChange(
                                            e,
                                            taskId,
                                            "today_contributions"
                                          )
                                        }
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`today-contribution-task-${taskId}`}
                                      >
                                        {task}
                                      </label>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="clarity_box">Clarity</p>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="main_highlight_box">
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="outcome_title">Top 2 To 3 Outcome</span>
                              <div>
                                {" "}
                                {isAdmin() && (
                                  <>
                                    <button className="edit_view edit_btn">
                                      <FontAwesomeIcon
                                        icon={faPencil}
                                        onClick={() => handleShowModal(item.id)}
                                      />
                                    </button>
                                  </>
                                )}
                                <>
                                  {!isAdmin() &&
                                    item.user_id === getUserId() && (
                                      <>
                                        <button className="edit_view edit_btn">
                                          <FontAwesomeIcon
                                            icon={faPencil}
                                            onClick={() =>
                                              handleShowModal(item.id)
                                            }
                                          />
                                        </button>
                                      </>
                                    )}
                                  {!isAdmin() &&
                                    ishod() &&
                                    item.user_id !== getUserId() && (
                                      <button className="edit_view edit_btn">
                                        <FontAwesomeIcon
                                          icon={faPencil}
                                          onClick={() =>
                                            handleShowModal(item.id)
                                          }
                                        />
                                      </button>
                                    )}
                                </>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-6">
                                <h6 className="key_box_title">Key Highlight</h6>
                                <p>{item?.clarity_1_key_highlight}</p>
                              </div>
                              <div className="col-lg-6">
                                <h6 className="key_box_title">Key Action</h6>
                                <p>{item?.clarity_1_key_action}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="main_highlight_focus_box">
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="outcome_title"> 
                                Focus Accomplishment Reach Goal To tactical Or
                                Strategies Meeting
                              </span>
                              <div>
                                {" "}
                                {isAdmin() && (
                                  <>
                                    <button className="edit_view edit_btn">
                                      <FontAwesomeIcon
                                        icon={faPencil}
                                        onClick={() =>
                                          handleShowClarityModal(item.id)
                                        }
                                      />
                                    </button>
                                  </>
                                )}
                                <>
                                  {!isAdmin() &&
                                    item.user_id === getUserId() && (
                                      <>
                                        <button className="edit_view edit_btn">
                                          <FontAwesomeIcon
                                            icon={faPencil}
                                            onClick={() =>
                                              handleShowClarityModal(item.id)
                                            }
                                          />
                                        </button>
                                      </>
                                    )}
                                  {!isAdmin() &&
                                    ishod() &&
                                    item.user_id !== getUserId() && (
                                      <button className="edit_view edit_btn">
                                        <FontAwesomeIcon
                                          icon={faPencil}
                                          onClick={() =>
                                            handleShowClarityModal(item.id)
                                          }
                                        />
                                      </button>
                                    )}
                                </>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-lg-6">
                                <h6 className="key_box_title">Key Highlight</h6>
                                <p>{item?.clarity_2_key_highlight}</p>
                              </div>
                              <div className="col-lg-6">
                                <h6 className="key_box_title">Key Action</h6>
                                <p>{item?.clarity_2_key_action}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <PerformanceModal
        show={showModal}
        handleClose={handleCloseModal}
        id={editId}
      />
      <ClarityFocusModal
        show={showClarityModal}
        handleClose={handleCloseClarityModal}
        id={editId}
      />
      <VerifyModal
        show={showConfirmModal}
        handleClose={handleCloseConfirmModal}
        id={editId}
      />
    </>
  );
}

export default EmpMeetingView;
