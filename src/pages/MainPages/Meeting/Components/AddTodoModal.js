import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import {
  addMeetingTask,
  fetchActiveEmployee,
  fetchallStage,
  fetchallproject,
} from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import Select from "react-select";

const AddTodoModal = ({ show, handleClose }) => {
  const [stage, setStage] = useState([]);
  const [project, setProject] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    status: "",
    works: "",
    project: "",
    stage: "",
    note: "",
    contribution: [],
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getEmployees = async () => {
    try {
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
        const options = payload.map((member) => ({
          value: member.id,
          label: `${member.first_name} ${member.last_name}`,
        }));

        setEmp(options);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getproject = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchallStage.method,
        fetchallStage.url
      );

      if (!res.data.error) {
        setLoading(false);
        const payload = res.data?.data;
        console.log("ssjs==>", payload);
        setProject(payload);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getStage = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchallproject.method,
        fetchallproject.url
      );

      if (!res.data.error) {
        setLoading(false);
        const payload = res.data?.data;

        setStage(payload);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    getEmployees();
    getproject();
    getStage();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };
      const res = await ApiService(
        formData,
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
                <div className="form-group col-md-6">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="status">Status</label>
                  <select
                    name="status"
                    id="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">--Select--</option>
                    <option value="breakthrough">Breakthrough</option>
                    <option value="breakdown">Breakdown</option>
                  </select>
                </div>
                <div className="form-group col-md-12">
                  <label htmlFor="works">Task</label>
                  <input
                    type="text"
                    className="form-control"
                    id="works"
                    name="works"
                    value={formData.works}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <select
                    name="project"
                    id="project"
                    className="form-control"
                    value={formData.project}
                    onChange={handleChange}
                  >
                    <option value="">Select project</option>
                    {project.map((item, index) => (
                      <option value={item.id}>{item.case_id}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-md-6">
                  <select
                    name="stage"
                    id="stage"
                    className="form-control"
                    value={formData.stage}
                    onChange={handleChange}
                  >
                    <option value="">Select Stage</option>
                    {stage.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-md-12">
                  <label htmlFor="contribution">Contribution</label>
                  <Select
                    isMulti
                    value={formData.contribution.map((memberId) =>
                      emp.find((option) => option.value === memberId)
                    )}
                    onChange={(selectedOptions) => {
                      const contribution = selectedOptions.map(
                        (option) => option.value
                      );
                      setFormData({ ...formData, contribution });
                    }}
                    options={emp}
                    className="basic-multi-select"
                    classNamePrefix="select"
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

export default AddTodoModal;
