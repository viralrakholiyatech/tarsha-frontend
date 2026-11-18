import React, { useState, useEffect } from "react";
import { FileUrl } from "../../../config/file_url";
import { getFileDisplayUrl } from "../../../services/S3Service";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { useNavigate, useParams } from "react-router-dom";
import { CampaignRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { fetchcampaignbyid, StatusCampaign } from "../../../config/config";

const CampaignDetail = ({ campaign }) => {
  const params = useParams();
  const navigate = useNavigate();
  const [campaignData, SetcampaignData] = useState([]);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const fetchData = async () => {
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };

      const res = await ApiService(
        {},
        params.id,
        header,
        fetchcampaignbyid.method,
        fetchcampaignbyid.url
      );

      console.log("API Response:", res);

      if (res?.data?.data?.length > 0) {
        const postData = res.data.data[0];

        const platformValue =
          Array.isArray(postData.platform_add) &&
          postData.platform_add.length > 0
            ? postData.platform_add[0]
            : "";
        SetcampaignData(postData);
      } else {
        toast.error("No post found with this ID.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An unexpected error occurred while fetching data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const handleBack = () => {
    navigate(`/${CampaignRoute.list}`);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const body = { id, status: newStatus };
      const res = await ApiService(
        body,
        0,
        header,
        StatusCampaign.method,
        StatusCampaign.url
      );

      if (!res?.data?.error) {
        toast.success("Status updated successfully");
        fetchData()
      } else {
        toast.error(res?.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update Status Error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };
  const getPlatformIcon = (platformId) => {
    switch (String(platformId)) {
      case "1":
        return (
          <img
            src={`${FileUrl}/img/Instagram.svg`}
            alt="Instagram"
            title="Instagram"
            className="platform-icon"
          />
        );
      case "2":
        return (
          <img
            src={`${FileUrl}/img/linkedin.svg`}
            alt="LinkedIn"
            title="LinkedIn"
            className="platform-icon"
          />
        );
      case "3":
        return (
          <img
            src={`${FileUrl}/img/facebook.svg`}
            alt="Facebook"
            title="Facebook"
            className="platform-icon"
          />
        );
      default:
        return null;
    }
  };

  const CAMPAIGN_TYPES = {
    1: "Monthly",
    2: "Weekly",
    3: "Daily",
  };

  return (
    <div className="campaign-detail-container">
      {/* Header */}
      <div className="campaign-header">
        <div className="header-left">
          <button className="back-button" onClick={handleBack}>
            ←
          </button>
          <h1 className="header-title">{campaignData.name}</h1>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={campaignData.status === "0"}
            onChange={() =>
              handleStatusChange(
                campaignData.id,
                campaignData.status === "0" ? "1" : "0"
              )
            }
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="campaign-content">
        <div className="campaign-info-section">
          <div className="campaign-title-section">
            <div className="campaign-title-row">
              <div className="campaign-icon">
                {campaignData.screenshot ? (
                  <img
                    src={getFileDisplayUrl(campaignData.screenshot, FileUrl)}
                    alt="Campaign"
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      color: "#999",
                    }}
                  >
                    📷
                  </div>
                )}
              </div>
              <div className="campaign-title-info">
                <h2 className="campaign-name">{campaignData.name}</h2>
                <span className="campaign-type">
                  {" "}
                  {CAMPAIGN_TYPES[campaignData.type] || "Unknown"}
                </span>
              </div>
            </div>
            <div className="platform-icons">
              {Array.isArray(campaignData.campaign_platform) &&
                campaignData.campaign_platform.map((id, index) => (
                  <React.Fragment key={index}>
                    {getPlatformIcon(id)}
                  </React.Fragment>
                ))}
            </div>
          </div>

          <p className="campaign-description">{campaignData.description}</p>

          {/* Info Cards Row 1 */}
          <div className="info-cards-row">
            <div className="info-card">
              <span className="info-label">Budget & Spending</span>
              <span className="info-value-blue">
                {campaignData.spending}/{campaignData.budget}
              </span>
            </div>
            <div className="info-card">
              <div className="date-time-card">
                <div>
                  <span className="info-label">Start Date & Time</span>
                  <span className="info-value">{campaignData.start_date}</span>
                </div>
                <span className="time-value">({campaignData.start_time})</span>
              </div>
            </div>
            <div className="info-card">
              <div className="date-time-card">
                <div>
                  <span className="info-label">End Date & Time</span>
                  <span className="info-value">{campaignData.end_date}</span>
                </div>
                <span className="time-value">({campaignData.end_time})</span>
              </div>
            </div>
          </div>

          {/* Info Cards Row 2 */}
          <div className="info-cards-row">
            <div className="info-card">
              <span className="info-label">Targeted People</span>
              <span className="info-value">{campaignData.target_people}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Location</span>
              <span className="info-value">{campaignData.target_location}</span>
            </div>
            {/* <div className="info-card-screenshot">
              <div className="screenshot-content">
                <div className="screenshot-icon">
                  {campaignData.screenshot ? (
                    <a
                      href={`${FileUrl}/${campaignData.screenshot}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={`${FileUrl}/${campaignData.screenshot}`}
                        alt="Screenshot"
                      />
                    </a>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        color: "#999",
                      }}
                    >
                      🖼️
                    </div>
                  )}
                </div>
                <span className="screenshot-label">Screenshot</span>
              </div>
            </div> */}
          </div>
        </div>

        {/* Campaign Report Section */}
        <div className="report-section">
          <h3 className="report-title">Campaign Report</h3>

          {/* Report Row 1 */}
          {/* <div className="report-row">
            <div className="report-card report-card-yellow">
              <span className="report-value">{campaignData.report.click}</span>
              <span className="report-label">Click</span>
            </div>
            <div className="report-card report-card-gray">
              <span className="report-value">
                {typeof campaignData.report.impression === "number"
                  ? campaignData.report.impression.toFixed(2)
                  : campaignData.report.impression}
              </span>
              <span className="report-label">Impression</span>
            </div>
            <div className="report-card report-card-green">
              <span className="report-value-green">
                {campaignData.report.ctr}
              </span>
              <span className="report-label">CTR</span>
            </div>
            <div className="report-card report-card-purple">
              <span className="report-value">
                {typeof campaignData.report.avg_cpc === "number"
                  ? campaignData.report.avg_cpc.toFixed(2)
                  : campaignData.report.avg_cpc}
              </span>
              <span className="report-label">Avg. CPC</span>
            </div>
          </div> */}

          {/* Report Row 2 */}
          {/* <div className="report-row">
            <div className="report-card report-card-orange">
              <span className="report-value-orange">
                {typeof campaignData.report.cost === "number"
                  ? campaignData.report.cost.toFixed(2)
                  : campaignData.report.cost}
              </span>
              <span className="report-label">Cost</span>
            </div>
            <div className="report-card report-card-gray">
              <span className="report-value">
                {campaignData.report.avg_target_cpa}
              </span>
              <span className="report-label">Avg. Target CPA</span>
            </div>
            <div className="report-card report-card-green">
              <span className="report-value-green">
                {campaignData.report.avg_target_roas}
              </span>
              <span className="report-label">Avg. Target ROAS</span>
            </div>
            <div className="report-card report-card-red">
              <span className="report-value-red">
                {campaignData.report.conversion}
              </span>
              <span className="report-label">Conversion</span>
            </div>
          </div> */}

          {/* Report Row 3 */}
          {/* <div className="report-row">
            <div className="report-card report-card-orange">
              <span className="report-value-orange">
                {typeof campaignData.report.conversion_value === "number"
                  ? campaignData.report.conversion_value.toFixed(2)
                  : campaignData.report.conversion_value}
              </span>
              <span className="report-label">Conversion Value</span>
            </div>
            <div className="report-card report-card-gray">
              <span className="report-value">
                {campaignData.report.cost_conv}
              </span>
              <span className="report-label">Cost/ Conv.</span>
            </div>
            <div className="report-card report-card-green">
              <span className="report-value-green">
                {campaignData.report.conv_rate}
              </span>
              <span className="report-label">Conv. Rate</span>
            </div>
            <div className="report-card report-card-red">
              <span className="report-value-red">
                {campaignData.report.actual_roas}
              </span>
              <span className="report-label">Actual ROAS</span>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
