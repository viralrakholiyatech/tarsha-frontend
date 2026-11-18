import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { ApprovedLeave, LeaveApprovedbyid } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

const ApprovedModal = ({ editshow, handleeditClose, editId }) => {

  const [formData, setFormData] = useState({
    notes: "",
    status: "",
    id: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const header = {
          Authorization: `Bearer ${getToken()}`,
          ["Content-Type"]: "application/json",
        };
        const res = await ApiService(
          formData,
          editId,
          header,
          LeaveApprovedbyid.method,
          LeaveApprovedbyid.url
        );
        console.log("API Response:", res);
        setFormData({
          notes: res.data.data.notes || "",
          status: res.data.data.status || "",
          id: res.data.data.id || editId, // ✅ Ensure ID is set
        });
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error("An unexpected error occurred.");
      }
    };

    fetch();
  }, [editId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
        ApprovedLeave.method,
        ApprovedLeave.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Leave Update successfully");
        handleeditClose();
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
      className={`modal ${editshow ? "show" : ""}`}
      style={{ display: editshow ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Status</h5>
            <button type="button" className="close" onClick={handleeditClose}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group col-md-12">
                  <label htmlFor="status">Status</label>
                  <select
                    className="form-control"
                    id="status"
                    name="status"
                    value={formData?.status}
                    onChange={handleChange}
                  >
                    <option value="">Select status</option>
                    <option value="1">Approved</option>
                    <option value="2">Reject</option>
                  </select>
                </div>
                <div className="form-group col-md-12">
                  <label htmlFor="notes">Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    id="notes"
                    name="notes"
                    value={formData?.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 mt-3">
                <button type="submit" className="form_save_btn">Submit</button>
                <button type="button" className="form_cancel_btn" onClick={handleeditClose}>Close</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovedModal;
