import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import axios from "axios";
import { fetchActiveEmployee,addoperationalmetting } from "../../../../config/config";
import Select from "react-select";

const OperationalModalAdd = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    department_name: "",
    date: "",
    facilator: "",
    participants:[],
  });
  const [hod, setHoD] = useState([]);
  const [emp, setEmp] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        const options = payload.map((member) => ({
          value: member.id,
          label: `${member.first_name} ${member.last_name}`,
        }));
        setHoD(payload);
        setEmp(options);
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
        addoperationalmetting.method,
        addoperationalmetting.url
      );
      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Daily Overview Meeting added successfully");
        handleClose();
        window.location.reload();
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
            <h5 className="modal-title">Add  Daily Review Meeting </h5>
            <button type="button" className="close" onClick={handleClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="department_name">Team Name/Department</label>
                  <input
                    type="text"
                    className="form-control"
                    id="department_name"
                    name="department_name"
                    value={formData.department_name}
                    onChange={handleChange}
                  />
                </div>
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
                <div className="form-group col-md-12">
                <label htmlFor="facilator">Facilator</label>
                  <select
                    name="facilator"
                    id="facilator"
                    className="form-control"
                    value={formData.facilator}
                    onChange={handleChange}
                  >
                    <option value="">--Select--</option>
                    {hod.map((hod) => (
                      <option value={hod.id}>
                        {" "}
                        {hod.first_name} {hod.last_name}
                      </option>
                    ))}
                  </select>
                </div> 
                <div className="form-group col-md-12">
                <label htmlFor="participants">Participants</label>
                  <Select
                    isMulti
                    value={formData.participants.map((memberId) =>
                      emp.find((option) => option.value === memberId)
                    )}
                    onChange={(selectedOptions) => {
                      const participants = selectedOptions.map((option) => option.value);
                      setFormData({ ...formData, participants });
                    }}
                    options={emp}
                    className="basic-multi-select"
                    classNamePrefix="select"
                  />
                </div>
              </div> 
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" className="form_save_btn">
                  Submit
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

export default OperationalModalAdd;
