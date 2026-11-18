import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import {
  updateMeetingTask,
  fetchAllemp,
  fetchActiveEmployee,
} from "../../../config/config";
import { getToken, isAdmin, ishod } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

const TransferTaskModal = ({ show, handleClose, id }) => {
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState([]);
  const [transfer, setTransfer] = useState([]);
  const [formData, setFormData] = useState({
    transferto: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const getTransferfrom = async (id) => {
    console.log("idid==>", id);
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchAllemp.method,
        fetchAllemp.url
      );

      if (!res.data.error) {
        setLoading(false);
        const payload = res.data?.data;

        const employee = payload.find((member) => member.id === id);

        setTransfer(`${employee.first_name} ${employee.last_name}`);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
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

  useEffect(() => {
    getTransferfrom(id);
    getEmployees();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };

      const payload = {
        ...formData,
        id: id, // Add EditId to the payload
      };
      const res = await ApiService(
        payload,
        0,
        header,
        updateMeetingTask.method,
        updateMeetingTask.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "task added successfully");
        window.location.reload();
        // handleClose();
      } else {
        const errorMessage = res.data?.message || "An error occurred";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  if (!show) return null;

  return (
    <div className="tt-modal-overlay">
      <div className="tt-modal">
        <div className="tt-modal-header">
          <div className="tt-title-bar">
            <span className="tt-title-accent" />
            <h5 className="tt-title">Transfer Task</h5>
          </div>
          <button
            type="button"
            className="tt-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="tt-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="tt-row">
              <div className="tt-field">
                <label className="tt-label">Transfer From</label>
                <input
                  type="text"
                  className="tt-input"
                  value={transfer}
                  readOnly
                />
              </div>

              <div className="tt-field">
                <label htmlFor="transferto" className="tt-label">
                  Transfer To <span className="tt-required">*</span>
                </label>
                <select
                  id="transferto"
                  name="transferto"
                  className="tt-input tt-select"
                  value={formData?.transferto}
                  onChange={handleChange}
                >
                  <option value="">--Select--</option>
                  {emp.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tt-modal-footer">
              <button
                type="button"
                className="tt-btn tt-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button type="submit" className="tt-btn tt-btn-primary">
                ✓ Transfer Task
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .tt-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 30, 30, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }

        .tt-modal {
          width: 100%;
          max-width: 640px;
          background: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
          font-family: inherit;
        }

        .tt-modal-header {
          background: #FBF6EA;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tt-title-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tt-title-accent {
          width: 4px;
          height: 24px;
          background: #8C7A3D;
          border-radius: 2px;
          display: inline-block;
        }

        .tt-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #1B2436;
        }

        .tt-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #E3DCC8;
          background: #ffffff;
          color: #8a8a8a;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }

        .tt-close-btn:hover {
          background: #f2efe6;
        }

        .tt-modal-body {
          padding: 28px 24px 8px;
        }

        .tt-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .tt-field {
          flex: 1 1 240px;
          display: flex;
          flex-direction: column;
        }

        .tt-label {
          font-size: 15px;
          font-weight: 600;
          color: #1B2436;
          margin-bottom: 8px;
        }

        .tt-required {
          color: #d9534f;
        }

        .tt-input {
          border: 1.5px solid #8C7A3D;
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 15px;
          color: #1B2436;
          background: #ffffff;
          outline: none;
          width: 100%;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .tt-input:focus {
          border-color: #6f602e;
          box-shadow: 0 0 0 3px rgba(140, 122, 61, 0.15);
        }

        .tt-select {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238C7A3D' stroke-width='2' fill='none' fill-rule='evenodd'/></svg>");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .tt-modal-footer {
          border-top: 1px solid #EFEAE0;
          margin-top: 24px;
          padding: 18px 0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .tt-btn {
          padding: 11px 22px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: filter 0.15s ease, background 0.15s ease;
        }

        .tt-btn-cancel {
          background: #ffffff;
          border-color: #E3DCC8;
          color: #1B2436;
        }

        .tt-btn-cancel:hover {
          background: #f7f4ec;
        }

        .tt-btn-primary {
          background: #8C7A3D;
          border-color: #8C7A3D;
          color: #ffffff;
        }

        .tt-btn-primary:hover {
          filter: brightness(0.94);
        }
      `}</style>
    </div>
  );
};

export default TransferTaskModal;