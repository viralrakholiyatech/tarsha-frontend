import React, { useEffect, useState, useCallback } from "react";
import { DeleteFile } from "../../../services/FileService";

import {
  getToken,
  isEmp,
  superAccess,
} from "../../../services/useLocalStorage";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { GetDate } from "../../../services/DateAndTimeService";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";

import { FilesRoute } from "../../../config/RouteConfig";
import { subadmin } from "../../../config/RoleConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

import {
  ActionButtonJsx,
  actionButtonObject,
  AuthHeader,
} from "../../../services/FormCommon";

import axios from "axios";
import { fetchFileOfOnline } from "../../../config/config";

const ListOnlineProcess = () => {
  const [file, setFile] = useState([]);

  const [loading, setLoading] = useState(false);

  const hname = {
    sr_no: "Sr no",
    office_file_no: "Office file no",
    file_name: "File name",
    tp_stage: "TP stage",
    no_of_days: "No of days",
    team: "Team",
    code: "Code",
    client: "Client",
    status: "Status",
    project_count: "Site counter",
    cus_id: "Client_id",
    file_name: "File_name",
    action: "Action",
  };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: "Edit",
        Header: "",
        Cell: ({ row }) => (
          <React.Fragment>
            <div className="dropdown">
              <button
                className="btn btn-secondary btn_action_menu"
                type="button"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                <b>
                  <ActionButtonJsx />
                </b>
              </button>
              <div className="dropdown-menu">
                {superAccess() ? (
                  <>
                    {/* <Link className='dropdown-item' to={`/${FilesRoute.fileDetail}/${row?.values?.id}`} >{actionButtonObject.file_details}</Link> */}
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.edit}/${row?.values?.id}`}
                    >
                      {actionButtonObject.edit}
                    </Link>
                    <a
                      className="dropdown-item"
                      role="button"
                      onClick={() => onRemoveFile(row?.values?.id)}
                    >
                      {actionButtonObject.delete}
                    </a>
                    {/* <Link className='dropdown-item' to={`/${FilesRoute.listFileExpense}/${row?.values?.id}`} >{actionButtonObject.file_expense}</Link> */}
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.file_todos}/${row?.values?.id}`}
                    >
                      {actionButtonObject.file_todo}
                    </Link>
                  </>
                ) : isEmp() ? (
                  <>
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.fileDetail}/${row?.values?.id}`}
                    >
                      {actionButtonObject.file_details}
                    </Link>
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.edit}/${row?.values?.id}`}
                    >
                      {actionButtonObject.edit}
                    </Link>
                    <a
                      className="dropdown-item"
                      role="button"
                      onClick={() => onRemoveFile(row?.values?.id)}
                    >
                      {actionButtonObject.delete}
                    </a>
                  </>
                ) : (
                  ""
                )}
                {superAccess([subadmin]) ? (
                  <>
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.fileDetail}/${row?.values?.id}`}
                    >
                      {actionButtonObject.file_details}
                    </Link>
                    <Link
                      className="dropdown-item"
                      to={`/${FilesRoute.file_todos}/${row?.values?.id}`}
                    >
                      {actionButtonObject.file_todo}
                    </Link>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          </React.Fragment>
        ),
      },
    ]);
  };

  const onSiteCounterClick = (cus_id, id) => {
    localStorage.setItem("selectedClient", cus_id);
    localStorage.setItem("selectedFileId", id);
  };

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);

      let apiObj = {
        method: fetchFileOfOnline.method,

        url: fetchFileOfOnline.url,
      };

      const res = await axios({
        method: apiObj.method,
        url: apiObj.url,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
        console.log("payload", payload);
        setFile(payload);
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
  }, []);

  const removeFile = async (id) => {
    try {
      setLoading(true);

      const res = await DeleteFile(id, getToken());
      if (!res.data?.error) {
        setLoading(false);

        setFile((prevState) => {
          return prevState.filter((e, i) => {
            return e?.id != id;
          });
        });

        toast.success(res.data.message);
      } else {
        setLoading(false);

        toast.error(res.data?.message);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
      toast.error(err.response.data?.message);
    }
  };

  const onRemoveFile = (id) => {
    console.log("id==", id);
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeFile(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const subtractTwoDates = (d1, d2) => {
    try {
      if (d1 && d2) {
        const date1 = new Date(d1);
        const date2 = new Date(d2);

        var diff = date2 - date1;
        var diffInDays = diff / (1000 * 3600 * 24);

        return parseInt(Math.abs(diffInDays));
      } else {
        return "-";
      }
    } catch (err) {
      console.log(err);
      return "-";
    }
  };

  useEffect(() => {
    fetchFiles();
    localStorage.setItem("lastPath", FilesRoute.listFileOnline);
  }, []);

  const calculateDuration = (startDate) => {
    const start = new Date(startDate);
    const end = new Date();
    const durationInDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return durationInDays > 0 ? durationInDays : 0;
  };

  return (
    <>
      <div className="content__wrapper">
        <section className="page-content">
          <div className="page-title mobile-title">
            <h1 className="h4 mb-0">Files</h1>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="zed__table card">
                <h5 className="text-shadow-yellow px-2 mb-4">All Projects</h5>
                {file.map((project, index) => (
                  <div className="project_main_box mb-4">
                    <div className="project_header">
                      <div className="row mb-2">
                        <div className="col-lg-5">
                          <p>
                            {" "}
                            <FontAwesomeIcon
                              icon={faFile}
                              className="pr-3"
                            />{" "}
                            <Link
                              className="detail_href"
                              to={`/${FilesRoute.fileDetail}/${project.id}`}
                            >
                              {project.office_no} {project.project_name}/
                              {project.file_name} ({project.cust_name})
                            </Link>
                          </p>
                        </div>

                        <div className="col-lg-7">
                          <p class="text-right">
                            {GetDate(project.dates, "DD-MM-YYYY")}
                            <React.Fragment>
                              <div className="dropdown text-right mb-5 edit_dropdown d-inline">
                                <a
                                  href="javascript:void(0)"
                                  className=" p-0 pl-3 text-white "
                                  type="button"
                                  data-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <b>
                                    <ActionButtonJsx />
                                  </b>
                                </a>
                                <div className="dropdown-menu">
                                  <Link
                                    className="dropdown-item"
                                    to={`/${FilesRoute.edit}/${project?.id}`}
                                  >
                                    edit
                                  </Link>

                                  <a
                                    className="dropdown-item"
                                    role={"button"}
                                    onClick={() => onRemoveFile(project.id)}
                                  >
                                    delete
                                  </a>
                                </div>
                              </div>
                            </React.Fragment>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="project_body">
                      <div className="row">
                        <div className="col-lg-5">
                          <p className="type_text mt-0">
                            <img
                              src={`${FileUrl}/img/icons/pdf.svg`}
                              className="in__svg pr-2"
                              alt="project"
                            />
                            {project.code_title}
                          </p>
                          <p className="type_text">
                            <img
                              src={`${FileUrl}/img/icons/groundlocation.svg`}
                              className="in__svg pr-2"
                              alt="project"
                            />
                            {project.land_detail}
                          </p>
                          <p className="type_text">
                            <img
                              src={`${FileUrl}/img/icons/location.svg`}
                              className="in__svg pr-2"
                              alt="project"
                            />
                            {project.google_location}
                          </p>
                        </div>
                        <div className="col-lg-4">
                          <p className="">
                            <img
                              src={`${FileUrl}/img/icons/tick_file.svg`}
                              className="in__svg pr-2"
                              alt="project"
                            />
                            {project.file_type_name}
                          </p>
                          <p className="">
                            <img
                              src={`${FileUrl}/img/icons/reverse_circle.svg`}
                              className="in__svg pr-2"
                              alt="project"
                            />
                            {project.stage_title}
                          </p>
                          <div className="inner_date_box">
                            <p className="mb-0">
                              <img
                                src={`${FileUrl}/img/icons/timer-clock.svg`}
                                className="in__svg pr-2"
                                alt="project"
                              />
                              {calculateDuration(project.dates)} Days
                            </p>
                          </div>
                        </div>
                        <div className="col-lg-3">
                          <p className="text-right">Online</p>
                          <p className="text-right">Architecture/Interior</p>
                          <div className="hod_box">
                            <div
                              className="hod_img text-right"
                              style={{ zIndex: "2" }}
                            >
                              {" "}
                              <img
                                src={`${FileUrl}/${project.profile_picture}`}
                                alt="HOD"
                              />
                            </div>
                            <div
                              className="hod_img text-right"
                              style={{ zIndex: "1" }}
                            >
                              {" "}
                              <img
                                src={`${FileUrl}/${project.team1_profile_picture}`}
                                alt="HOD"
                              />
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
        </section>
      </div>
    </>
  );
};

export default ListOnlineProcess;

const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span>
      <input
        className="form-control"
        type={"search"}
        style={{ margin: "5px" }}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search"
      />
    </span>
  );
};
