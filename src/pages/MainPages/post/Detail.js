import React, { useState, useEffect } from "react";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { fetchpostbyid,StatusPost } from "../../../config/config";
import { PostRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import { useNavigate, useParams } from "react-router-dom";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";

function Detail() {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
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
          fetchpostbyid.method,
          fetchpostbyid.url
        );

        console.log("API Response:", res);

        if (res?.data?.data?.length > 0) {
          const postData = res.data.data[0];
          setData(postData);
        } else {
          toast.error("No post found with this ID.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An unexpected error occurred while fetching data.");
      }
    };

    fetchData();
  }, [params.id]);

  const goBack = () => {
    navigate(`/${PostRoute.list}`);
  };

  const statusOptions = [
    { id: 0, label: "Pending" },
    { id: 1, label: "Approved" },
    { id: 2, label: "Rejected" },
  ];

  const updateStatus = async (newStatus) => {
    try {
      setLoading(true);
  
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
  
      const body = {
        id: params.id,
        status: newStatus
      };
  
      const res = await ApiService(
        body,
        0,
        header,
        StatusPost.method,
        StatusPost.url
      );
  
      if (!res.data.error) {
        toast.success("Status updated successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Detail</h1>
          <p className="mb-4">Post</p>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Detail Post
                    </h6>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {!loading ? (
                  <div className="row">
                    <div className="col-md-6">
                      {data?.name}
                      <span>{data?.type}</span>
                    </div>
                    <div>
                      <select
                        value={data.status}
                        onChange={(e) => {
                          const newStatus = Number(e.target.value);

                          // update UI instantly
                          setData({ ...data, status: newStatus });

                          // call API to save
                          updateStatus(newStatus);
                        }}
                        className="border p-2 rounded"
                      >
                        {statusOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {data?.thumbnail && (
                      <div style={{ marginBottom: 15 }}>
                        <img
                          className="in__svg"
                          src={getFileDisplayUrl(data?.thumbnail, FileUrl)}
                          alt="Thumbnail"
                          onClick={() => openFileInNewTab(data?.thumbnail, FileUrl)}
                          style={{ cursor: "pointer", maxWidth: 200, maxHeight: 150, objectFit: "cover", borderRadius: 8 }}
                        />
                      </div>
                    )}
                    {Array.isArray(data?.images) && data.images.length > 0 && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
                        {data.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={getFileDisplayUrl(img?.post_file, FileUrl)}
                            alt={`Media ${idx + 1}`}
                            onClick={() => openFileInNewTab(img?.post_file, FileUrl)}
                            style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: "1px solid #ddd" }}
                          />
                        ))}
                      </div>
                    )}
                    <div>{data?.caption}</div>
                    <div>{data?.hastag}</div>
                    {Array.isArray(data?.platform_add) &&
                      data.platform_add.length > 0 &&
                      data.platform_add[0].split(",").map((id, index) => {
                        switch (id.trim()) {
                          case "1":
                            return (
                              <img
                                key={index}
                                src={`${FileUrl}/img/Instagram.svg`}
                                alt="Instagram"
                                title="Instagram"
                                width={10}
                                height={10}
                              />
                            );
                          case "2":
                            return (
                              <img
                                key={index}
                                src={`${FileUrl}/img/linkedin.svg`}
                                alt="LinkedIn"
                                title="LinkedIn"
                                width={10}
                                height={10}
                              />
                            );
                          case "3":
                            return (
                              <img
                                key={index}
                                src={`${FileUrl}/img/facebook.svg`}
                                alt="Facebook"
                                title="Facebook"
                                width={10}
                                height={10}
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                  </div>
                ) : (
                  <Loader
                    type="spinner-default"
                    bgColor={"#000000"}
                    title={"Please wait"}
                    color={"#000000"}
                    size={50}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Detail;
