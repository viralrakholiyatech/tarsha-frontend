import React, { useState, useEffect } from "react";
import ProjectDetails from "./ProjectDetails";
import ProjectSummery from "./ProjectSummery";
import AllPlans from "./AllPlans";
import SiteLocation from "./SiteLocation";
import ProjectPlan from "./ProjectPlan";
import axios from "axios";
import { fetchFileById } from "../../../../config/config";
import { useParams } from "react-router-dom";
import { AuthHeader } from "../../../../services/FormCommon";

//Project Details
const Details = () => {
  const params = useParams();

  const stageList = [
    { id: 1, title: "Project Summery" },
    { id: 2, title: "Site Location" },
    { id: 3, title: "Project Plan" },
    { id: 4, title: "Project Details" },
    { id: 5, title: "All Plans" },
    // { id: 6, title: "Building Center Line" },
    // { id: 7, title: "Building Basement Details" },
    // { id: 8, title: "Building Floor Details" },
  ];

  const [currentState, setCurrentState] = useState(1);
  const [lastStage, setLastStage] = useState(6);

  const [file, setFile] = useState({});

  const fetchFile = async () => {
    try {
      const res = await axios({
        method: fetchFileById.method,
        url: `${fetchFileById.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setFile(res?.data?.data[0]);
      } else {
      }
    } catch (err) {
      console.log(err);
    }
  };

  const UpdateStage = (num) => {
    setLastStage(num);
    renderComponent(num);
  };

  const renderComponent = (num) => {
    console.log(`Clicked on stage ${num}`);
    setCurrentState(num);
    if (num === 1) {
      localStorage.removeItem("ischecked");
      localStorage.removeItem("slabarea");
      localStorage.removeItem("cop");
      localStorage.removeItem("building");
      localStorage.removeItem("residence");
      localStorage.removeItem("commercial");
    }
  };

  useEffect(() => {
    fetchFile();
  }, []);

  return (
    <div class="content__wrapper">
      <div class="page__header pt-3 position-relative">
        <div class="container-fluid">
          <h1>{file?.file_name ? file?.file_name : ""}</h1>
          <h6>
            Office File No.: {file?.office_file_no ? file?.office_file_no : ""}
          </h6>
        </div>
      </div>
      <section class="py-4">
        <div class="container-fluid">
          <div class="card__wrapper">
            <div class="row">
              <div class="col file_details_sidebar">
                <div class="card height-auto">
                  <ul class="file__process-list list-unstyled">
                    <ul class="file__process-list list-unstyled">
                      {stageList.map((s, i) => (
                        <React.Fragment>
                          {s?.id <= lastStage ? (
                            <li
                              onClick={() => renderComponent(s?.id)}
                              className={` ${
                                s?.id == currentState ? "active" : ""
                              }`}
                            >
                              <a href="javascript:void(0)">
                                <span>
                                  {s?.id == currentState ? (
                                    <i className="fas fa-pen"></i>
                                  ) : (
                                    i + 1
                                  )}
                                </span>
                                {s?.title}
                              </a>
                            </li>
                          ) : (
                            <li
                              onClick={null}
                              className={` ${
                                s?.id == currentState ? "active" : ""
                              }`}
                            >
                              <a href="javascript:void(0)">
                                <span>
                                  {s?.id == currentState ? (
                                    <i className="fas fa-pen"></i>
                                  ) : (
                                    i + 1
                                  )}
                                </span>
                                {s?.title}
                              </a>
                            </li>
                          )}
                        </React.Fragment>
                      ))}
                    </ul>
                  </ul>
                </div>
              </div>
              <div class="col">
                {(() => {
                  switch (currentState) {
                    case 1:
                      return <ProjectSummery />;
                    case 2:
                      return <SiteLocation />;
                    case 3:
                      return <ProjectPlan />;
                    case 4:
                      return <ProjectDetails />;
                    case 5:
                      return <AllPlans />;
                    // case 6:
                    //   return <BuildingCenterLine />;

                    // case 7:
                    //   return <BuildingBasementDetails />;
                    // case 8:
                    //   return <BuildingFloorDetail />;

                    default:
                      return <ProjectSummery />;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Details;
