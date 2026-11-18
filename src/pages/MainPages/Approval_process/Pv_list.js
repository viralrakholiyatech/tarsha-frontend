import React, { useEffect, useState, useCallback, useMemo } from "react";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { deletedocument, getPvFile } from "../../../config/config";
import toast from "react-hot-toast";
import { ApprovalRoute,FilesRoute } from "../../../config/RouteConfig";
import { ActionButtonJsx } from "../../../services/FormCommon";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { Accordion, Tab, Nav } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { actionButtonObject } from "../../../services/FormCommon";

//Todo list admin
const PvList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("tp");

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        0,
        header,
        getPvFile.method,
        getPvFile.url
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

  useEffect(() => {
    fetchdata();
  }, []);

  const handleTabChange = (event) => {
    const selected = event;
    setActiveTab(selected);
  };

  const filterByTab = (data) => {
    if (activeTab === "tp") {
      return data.filter((item) => item.land_type === "tp");
    } else if (activeTab === "non_tp") {
      return data.filter((item) => item.land_type === "non_tp");
    } else if (activeTab === "gamtal") {
      return data.filter((item) => item.land_type === "gamtal");
    } else {
      return data;
    }
  };

  const filterData = (data) => {
    let filterData = data;

    return filterData.sort((a, b) => b.id - a.id);
  };

  const filteredData = useMemo(
    () => filterData(filterByTab(data)),
    [data, activeTab]
  );

  //   useEffect(() => {
  //   }, [filteredData]);

  const removepv = async (id) => {
    try {
      const res = await ApiService(
        null,
        parseInt(id),
        header,
        deletedocument.method,
        deletedocument.url
      );
      if (!res?.data?.error) {
        // setData(id);
        toast.success(res?.data?.message);
        window.location.reload();
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };

  const onRemovePv = (id) => {
    console.log("id-->",id)
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removepv(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const tplength = useMemo(
    () => filterData(data).filter((data) => data.land_type === "tp").length,
    [data]
  );
  const nontplength = useMemo(
    () => filterData(data).filter((data) => data.land_type === "non_tp").length,
    [data]
  );
  const gamtallength = useMemo(
    () => filterData(data).filter((data) => data.land_type === "gamtal").length,
    [data]
  );

  const handleAccordionClick = (id) => {
    console.log("id-->", id);
    navigate(`/${ApprovalRoute.pv_add}/${id}`);
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">P.V.</h1>
        </div>
        <div className="todos_section">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-5">
              <div className="title_heading">
                <h4 className="mb-0">P.V.</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <Tab.Container activeKey={activeTab} onSelect={handleTabChange}>
            <Nav variant="pills" className="main_nav_link row">
              <Nav.Item className="tab_box col tp">
                <Nav.Link eventKey="tp">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="project_status">TP</span>
                    </div>
                    <div>
                      <span className="project_counter">{tplength}</span>
                    </div>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tab_box col non_tp">
                <Nav.Link eventKey="non_tp">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="project_status"> NON TP</span>
                    </div>

                    <div>
                      <span className="project_counter"> {nontplength}</span>
                    </div>
                  </div>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="tab_box col gamtal">
                <Nav.Link eventKey="gamtal">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <span className="project_status"> GAMTAL</span>
                    </div>
                    <div>
                      <span className="project_counter"> {gamtallength}</span>
                    </div>
                  </div>
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Tab.Content></Tab.Content>
          </Tab.Container>
          <div className="row main_status_body">
            <div className="col-md-12">
              <div className="zed__table">
                <div className="row heading_row mt-3">
                  <div className="col-lg-4">
                    <div className="d-flex justify-content-start">
                      <p className="pr-3">SR.NO.</p>
                      <p className="pl-5">CASE NO.</p>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="d-flex justify-content-around">
                      <p>CLIENT</p>
                      <p>VILLAGE</p>
                      <p>TP SCHEME</p>
                      <p>FILE STAGE</p>
                      <p>TEAM</p>
                    </div>
                  </div>
                </div>

                {filteredData.map((data, groupIndex) => (
                  <>
                    <div className="d-flex justify-content-between"></div>
                    <Accordion
                      key={groupIndex}
                      className="table-responsive mb-4"
                    >
                      <Accordion.Item key={groupIndex}>
                        <Accordion.Header>
                          <div className="row w-100 align-items-center">
                            <div className="col-lg-4">
                              <div className="d-flex align-items-center">
                                <div className="mx-4 normal_text">
                                  {groupIndex + 1}
                                </div>
                                <div
                                  className="mx-4 normal_text"
                                  onClick={() => handleAccordionClick(data.id)}
                                >
                                  {data.case_id}
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-8">
                              <div className="d-flex align-items-center">
                                <div className="mx-4 normal_text">
                                  {data.first_name} {data.last_name}
                                </div>
                                <div className="mx-4">
                                  <p className="due_date_text normal_text">
                                    {data.name}
                                  </p>
                                </div>
                                <div className="row align-items-center w-100 justify-content-around">
                                  <div className="col-lg-3">
                                    <div className="mx-0">
                                      <p>{data.tpscheme}</p>
                                    </div>
                                  </div>

                                  <div className="col-lg-1">
                                    <React.Fragment>
                                      <div className="dropdown text-right  edit_dropdown">
                                        <button
                                          className="btn btn_action_menu"
                                          type="button"
                                          data-toggle="dropdown"
                                          aria-expanded="false"
                                        >
                                          <b>
                                            <ActionButtonJsx />
                                          </b>
                                        </button>
                                        <div className="dropdown-menu">
                                          <Link
                                            className="dropdown-item"
                                            to={`/${FilesRoute.edit}/${data.ID}`}
                                          >
                                            {actionButtonObject.edit}
                                          </Link>
                                          <a
                                            className="dropdown-item"
                                            role={"button"}
                                            onClick={() =>
                                              onRemovePv(data.id)
                                            }
                                          >
                                            delete
                                          </a>
                                        </div>
                                      </div>
                                    </React.Fragment>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="row">
                            <div className="col-lg-12">
                              <div className="row">
                                <div className="col-lg-12">
                                  <div className="d-flex justify-content-between">
                                    <div>O.P. NO:- {data.op_no}</div>
                                    <div>F.P. NO:- {data.fp_no}</div>
                                    <div>SUBPLOT NO:- {data.subplot_no}</div>
                                    <div>R.S. NO:- {data.rs_no}</div>
                                    <div>B. NO:- {data.b_no}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PvList;
