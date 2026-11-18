import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  deleteCampaign,
  fetchcampaign,
  StatusCampaign,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { CampaignRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { FileUrl } from "../../../config/file_url";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";
import { format } from "date-fns";

const EmpList = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => navigate(`/${CampaignRoute.add}`);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        0,
        header,
        fetchcampaign.method,
        fetchcampaign.url,
      );

      if (!res.data.error) {
        const payload = res?.data?.data || [];
        console.log("Fetched Campaigns:", payload);
        setData(payload);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.log("Fetch error:", err);
      toast.error(
        err?.response?.data?.message || "Something went wrong while fetching",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupByMonth = (data) => {
    const grouped = {};
    data.forEach((item) => {
      let createdDate = item.created_at || item.start_date;
      if (!createdDate) return;

      let parsedDate = new Date(createdDate);
      if (isNaN(parsedDate)) return;

      const key = format(parsedDate, "MMMM yyyy");
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  };

  // ➤ Confirm delete
  const onRemovesites = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result?.isConfirmed) {
          await removesites(id);
        }
      })
      .catch(() => toast.error("Unable to remove"));
  };

  // ➤ Delete campaign API
  const removesites = async (id) => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        id,
        header,
        deleteCampaign.method,
        deleteCampaign.url,
      );

      if (!res?.data?.error) {
        toast.success(res?.data?.message || "Deleted successfully");
        fetchData();
      } else {
        toast.error(res?.data?.message || "Delete failed");
      }
    } catch (err) {
      console.log("Delete error:", err);
      toast.error(
        err?.response?.data?.message || "Something went wrong while deleting",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const body = { id, status: newStatus };
      const res = await ApiService(
        body,
        0,
        header,
        StatusCampaign.method,
        StatusCampaign.url,
      );

      if (!res.data.error) {
        toast.success("Status updated successfully");
        setData((prevData) =>
          prevData.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          ),
        );
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update Status Error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const filteredData = useMemo(
    () => [...data].sort((a, b) => b.id - a.id),
    [data],
  );
  const groupedData = groupByMonth(filteredData);

  const budgetTypeMap = {
    1: "Monthly",
    2: "Weekly",
    3: "Daily",
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="row">
          <div className="col-md-12">
            <div className="zed__table card">
              <div className="d-xl-flex align-items-center justify-content-between mb-3">
                <h5 className="text-shadow-yellow px-2 mb-4"> Emp Campaign</h5>
                <div className="gap-3 d-flex flex-lg-nowrap flex-wrap align-items-center">
                  <button className="form_save_btn" onClick={handleAdd}>
                    Add
                  </button>
                </div>
              </div>

              <div ref={printRef}>
                {Object.keys(groupedData).length === 0 ? (
                  <div className="p-4 text-center">
                    {loading ? "Loading..." : "No records found"}
                  </div>
                ) : (
                  Object.keys(groupedData).map((monthKey) => (
                    <div key={monthKey} className="meeting-date-group">
                      <h5
                        style={{ padding: "10px", backgroundColor: "#f4f4f4" }}
                      >
                        {monthKey}
                      </h5>

                      <div className="table-responsive">
                        <table className="table datatable">
                          <thead>
                            <tr>
                              <th>Sr.No</th>
                              <th>Date</th>
                              <th>Campaign</th>
                              <th>Post</th>
                              <th>Budget</th>
                              <th>Type</th>
                              <th>Campaign Platform</th>
                              <th className="no-print">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedData[monthKey].map((campaign) => (
                              <tr key={campaign.id}>
                                <td>{index + 1}</td>
                                <td>
                                  {campaign.start_date
                                    ? format(
                                        new Date(campaign.start_date),
                                        "dd MMM yyyy",
                                      )
                                    : "-"}
                                </td>
                                <td>{campaign.name}</td>

                                <td className="no-print">
                                  {campaign.screenshot ? (
                                    <a
                                      href={getFileDisplayUrl(campaign.screenshot, FileUrl)}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        openFileInNewTab(campaign.screenshot, FileUrl);
                                      }}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        className="in__svg"
                                        src={`${FileUrl}/img/icons/view.svg`}
                                        alt="View"
                                      />
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </td>

                                <td>{campaign.budget}</td>
                                <td>
                                  {budgetTypeMap[campaign.budget_type] || "-"}
                                </td>

                                <td>
                                  {Array.isArray(campaign.campaign_platform) &&
                                  campaign.campaign_platform.length > 0
                                    ? campaign.campaign_platform.map(
                                        (id, index) => {
                                          switch (String(id)) {
                                            case "1":
                                              return (
                                                <img
                                                  className="social-icon"
                                                  key={index}
                                                  src={`${FileUrl}/img/Instagram.svg`}
                                                  alt="Instagram"
                                                  title="Instagram"
                                                />
                                              );
                                            case "2":
                                              return (
                                                <img
                                                  className="social-icon"
                                                  key={index}
                                                  src={`${FileUrl}/img/linkedin.svg`}
                                                  alt="LinkedIn"
                                                  title="LinkedIn"
                                                />
                                              );
                                            case "3":
                                              return (
                                                <img
                                                  className="social-icon"
                                                  key={index}
                                                  src={`${FileUrl}/img/facebook.svg`}
                                                  alt="Facebook"
                                                  title="Facebook"
                                                />
                                              );
                                            default:
                                              return null;
                                          }
                                        },
                                      )
                                    : "-"}
                                </td>

                                <td className="no-print">
                                  <div
                                    className="toggle-wrapper"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                    }}
                                  >
                                    <input
                                      id={`status-${campaign.id}`}
                                      type="checkbox"
                                      className="tgl tgl-light"
                                      checked={campaign.status === 0}
                                      onChange={() =>
                                        updateStatus(
                                          campaign.id,
                                          campaign.status === 0 ? 1 : 0,
                                        )
                                      }
                                    />
                                    <label
                                      htmlFor={`status-${campaign.id}`}
                                      className="tgl-btn"
                                    ></label>

                                    <a className="cursor-pointer">
                                      <img
                                        className="in__svg"
                                        src={`${FileUrl}/img/icons/delete.svg`}
                                        alt="Delete"
                                        onClick={() =>
                                          onRemovesites(campaign.id)
                                        }
                                      />
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmpList;
