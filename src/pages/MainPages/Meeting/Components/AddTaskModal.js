import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { addMeetingTask } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";

const AddTaskModal = ({ show, handleClose,meetingId }) => {
  const [formData, setFormData] = useState({
    task: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = { ...formData,meeting_id:meetingId  }
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };
      const res = await ApiService(
        dataToSend,
        0,
        header,
        addMeetingTask.method,
        addMeetingTask.url
      );
      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "task added successfully");
        handleClose();
 
      } else {
        const errorMessage = res.data?.message || "An error occurred";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <div
      className={`modal ${show ? "show" : ""}`}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Task</h5>
            <button type="button" className="close" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group col-md-12">
                  <label htmlFor="task">Task</label>
                  <input
                    type="text"
                    className="form-control"
                    id="task"
                    name="task"
                    value={formData.task}
                    onChange={handleChange}
                  />
                </div> 
              </div>
              
           
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" className="form_save_btn">
                 Add Task
                </button>
                <button
                  type="button"
                  className="form_cancel_btn"
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
