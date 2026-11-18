import React, { useEffect, useState, createContext } from "react";
import FileDetails from "./FileDetails";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import RequiredDocumentList from "./RequiredDocumentList";
import SendMessageToClient from "./SendMessageToClient";
import ApiService from "../../../../services/ApiService";
import {
  fetchFileById,
  rejectQueryFile,
  stagelist,
  stageListByProcess,
} from "../../../../config/config";
import { getToken, isEmp } from "../../../../services/useLocalStorage";
import PlotValidationCertificate from "./PlotValidationCertificate";
import PlotValidationCertificate_new_code from "./PlotValidationCertificate_new_code";
import ENagarPortal from "./ENagarPortal";
import ENagarPortal2 from "./ENagarPortal2";
import OwnerPortal from "./OwnerPortal";
import DocumentUpload from "./DocumentUpload";
import Road_Deposit_Security_Fees from "./Road_Deposit_Security_Fees";
import Assistant_Junior_Engineer from "./Assistant_Junior_Engineer";
import Deputy_engineer from "./Deputy_engineer";
import Loader from "react-js-loader";
import toast from "react-hot-toast";

import Zonal_officer from "./Zonal_officer";

import Deputy_commissioner from "./Deputy_commissioner";

import Commissioner from "./Commissioner";

import All_important_fees from "./All_important_fees";

import FS_IC_Amineties_fees from "./FS_IC_Amineties_fees";

import Work_fee from "./Work_fee";

import Approved_plan from "./Approved_plan";

import File_approved_reject from "./File_approved_reject";
import { empKey } from "../../../../config/RoleConfig";
import { superAccess } from "../../../../services/useLocalStorage";

const Details = (props) => {
  const FileDataContext = createContext();

  const params = useParams();
  const location = useLocation();
  const FileReletedData = location.state?.data;

  var header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const expandButtonStyle = {
    color: "black",
    border: "2px solid black",
    backgroundColor: "white",
    height: "40px",
    width: "40px",
    fontSize: "22px",
  };

  const [fileConfig, setFileConfig] = useState({
    FileReletedData,
    mst_file_id: params.id,
    office_file_no: "MyFile",
  });
  const [stageList, setStageList] = useState([]);
  const [currentState, setCurrentState] = useState(1);
  const [plotValidationTypes, setPlotValidationTypes] = useState(1);
  const [stage, setStage] = useState(1);
  const [file, setFile] = useState({});
  const[card,setCard]= useState('')

  const fetchStageList = async () => {
    try {
      // const res = await ApiService(null,0,header,stagelist.method,stagelist.url);
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        stageListByProcess.method,
        stageListByProcess.url
      );
      if (!res.data.error) {
        setStageList(res.data.data);
      }
    } catch (err) {
      alert(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

 



  const renderComponent = (id) => {
    // if(id===currentState){
    //   return false;
    // }

    setCurrentState(id);
    setStageList(
      stageList.map((e) =>
        e.id === id ? { ...e, active: true } : { ...e, active: false }
      )
    );
  };

  const changePlotValidationTypes = (value) => {
    setPlotValidationTypes(value);
  };

  const updateMstStage = (newStage) => {
    try {
      if (typeof newStage != "undefined" && typeof newStage === "number") {
        setStage(parseInt(newStage));
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occured while updating the stage");
    }
  };

  const fetchStageNumber = async (callback) => {
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-type"]: "application/json",
      };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        fetchFileById.method,
        fetchFileById.url
      );
      if (!res.data.error) {
        const data = res.data?.data[0];
        setFile(data);
        return data?.mst_stage_id ? callback(data?.mst_stage_id) : callback(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      return callback(0);
    }
  };

  const rejectFileQuery = async (mst_file_id, type_number) => {
    const obj = {
      mst_file_id: parseInt(mst_file_id),
      type_number: parseInt(type_number),
    };

    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };
      const res = await ApiService(
        obj,
        0,
        header,
        rejectQueryFile?.method,
        rejectQueryFile?.url
      );

      if (!res?.data?.error) {
        toast.success(res?.data?.message);

        const payload = res?.data?.data;

        if (parseInt(payload?.stage_id)) {
          renderComponent(parseInt(payload?.stage_id));
          updateMstStage(parseInt(payload?.stage_id));
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };

  useEffect(() => {
    
    fetchStageNumber((result) => {
      if (result) {
       
        setCurrentState(parseInt(result));
        setStage(parseInt(result));
      } else {
        setCurrentState(
          typeof FileReletedData?.mst_stage_id != "undefined" &&
            parseInt(FileReletedData?.mst_stage_id) != "number"
            ? parseInt(FileReletedData?.mst_stage_id)
            : 1
        );
        setStage(
          typeof FileReletedData?.mst_stage_id != "undefined" &&
            parseInt(FileReletedData?.mst_stage_id) != "number"
            ? parseInt(FileReletedData?.mst_stage_id)
            : 1
        );
      }
    });
    fetchStageList();
   
   
  }, []);

  

  return (
    <>
      <div className="content__wrapper">
        <div className="page__header pt-3 position-relative">
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-end">
              <div>
                <h1>{file?.file_name ? file?.file_name : ""}</h1>
                <h6>
                  Office File No.:{" "}
                  {file?.office_file_no ? file?.office_file_no : ""}
                </h6>
              </div>
              <div>
                <div className="text-right">
                  <div className="profile_box"></div>
                </div>
             

              

                {currentState === 4 ? (
                  <p className="do_not_text">
                    If you do not submit by the 8 day, you will get a red card
                  </p>
                ) : currentState === 5 ? (
                  <p className="do_not_text">
                    If you do not submit by the 17 day, you will get a red card
                  </p>
                ) : currentState === 7 ||
                  currentState === 8 ||
                  currentState === 14 ||
                  currentState === 15 ||
                  currentState === 16 ||
                  currentState === 17 ? (
                  <p className="do_not_text">
                    If you do not submit by the 1 day, you will get a red card
                  </p>
                ) : currentState === 9 ||
                  currentState === 10 ||
                  currentState === 11 ||
                  currentState === 12 ||
                  currentState === 13 ? (
                  <p className="do_not_text">
                    If you do not submit by the 6 day, you will get a red card
                  </p>
                ) : (
                  <p className="do_not_text">
                    If you do not submit by the 2 day, you will get a red card
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <section className="py-4">
          <div className="container-fluid">
            <div className="card__wrapper">
              <div className="row flex-lg-nowrap">
                <div className="col file_details_sidebar">
                  {/* <div className="card p-3 grey-border rounded"> */}
                  <div className="card height-auto">
                    {/* <ul className="card__category--list"> */}
                    <ul className="file__process-list list-unstyled">
                      {stageList.map((e, index) => {
                        return e.id <= stage ? (
                          <li
                            onClick={() => renderComponent(e.id)}
                            className={` ${
                              e?.id == currentState ? "active" : ""
                            }`}
                          >
                            <a
                              className={`${
                                e.id == stage ? "text-success" : ""
                              }`}
                              href="javascript:void(0)"
                            >
                              <span>
                                {e?.id == currentState ? (
                                  <i className="fas fa-pen"></i>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              {e.title}
                            </a>
                          </li>
                        ) : (
                          <li
                            onClick={null}
                            className={`${
                              e?.id == currentState ? "active" : ""
                            }`}
                          >
                            <a
                              href="javascript:void(0)"
                              onClick={(e) => e.preventDefault()}
                            >
                              {" "}
                              <span>
                                {e?.id == currentState ? (
                                  <i className="fas fa-pen"></i>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              {e.title}
                            </a>
                          </li>
                        );
                      })}

                      {/* {stageList.map((e, index) => {
                        if (e.id === 16 && isEmp()) {
                          return null;
                        }

                        return e.id <= stage ? (
                          <li
                            onClick={() => renderComponent(e.id)}
                            className={`${
                              e?.id == currentState ? "active" : ""
                            }`}
                          >
                            <a
                              className={`${
                                e.id == stage ? "text-success" : ""
                              }`}
                              href="javascript:void(0)"
                            >
                              <span>
                                {e?.id == currentState ? (
                                  <i className="fas fa-pen"></i>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              {e.title}
                            </a>
                          </li>
                        ) : (
                          <li
                            onClick={null}
                            className={`${
                              e?.id == currentState ? "active" : ""
                            }`}
                          >
                            <a
                              href="javascript:void(0)"
                              onClick={(e) => e.preventDefault()}
                            >
                              {" "}
                              <span>
                                {e?.id == currentState ? (
                                  <i className="fas fa-pen"></i>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              {e.title}
                            </a>
                          </li>
                        );
                      })} */}
                    </ul>
                  </div>
                </div>
                <div className="col overflow_extra">
                  <FileDataContext.Provider value={fileConfig}>
                    {(() => {
                      switch (currentState) {
                        case 1:
                          return (
                            <FileDetails
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              onchangePlotValidationTypes={(value) =>
                                changePlotValidationTypes(value)
                              }
                              id={params.id}
                            />
                          );
                        case 2:
                          return (
                            <RequiredDocumentList
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 3:
                          return (
                            <SendMessageToClient
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 4:
                          return (
                            <PlotValidationCertificate_new_code
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              plotTypes={plotValidationTypes}
                              id={params.id}
                            />
                          );
                        case 5:
                          return (
                            <ENagarPortal2
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 6:
                          return (
                            <OwnerPortal
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 7:
                          return (
                            <DocumentUpload
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 8:
                          return (
                            <Road_Deposit_Security_Fees
                              status_file_name={file?.status_file_name}
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 9:
                          return (
                            <Assistant_Junior_Engineer
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 10:
                          return (
                            <Deputy_engineer
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 11:
                          return (
                            <Zonal_officer
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 12:
                          return (
                            <Deputy_commissioner
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 13:
                          return (
                            <Commissioner
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 14:
                          return (
                            <All_important_fees
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 15:
                          return (
                            <FS_IC_Amineties_fees
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        // case 16:return(<Work_fee onRejectFileQuery={(mst_file_id,type_number)=>rejectFileQuery(mst_file_id,type_number)} onchangeStage={(id)=>renderComponent(id)} onUpdateMstStage={(newStage)=>updateMstStage(newStage)}  id={params.id}/>):null
                        case 16:
                          // if (isEmp()) {
                          //   return null;
                          // } else {
                          return (
                            <Work_fee
                              onRejectFileQuery={rejectFileQuery}
                              onchangeStage={renderComponent}
                              onUpdateMstStage={updateMstStage}
                              id={params.id}
                            />
                          );
                        // }

                        case 17:
                          return (
                            <Approved_plan
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        case 18:
                          return (
                            <File_approved_reject
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                        // default:return (<ENagarPortal2 onchangeStage={(id)=>renderComponent(id)} onUpdateMstStage={(newStage)=>updateMstStage(newStage)}  id={params.id}/>)
                        default:
                          return (
                            <FileDetails
                              onRejectFileQuery={(mst_file_id, type_number) =>
                                rejectFileQuery(mst_file_id, type_number)
                              }
                              onchangeStage={(id) => renderComponent(id)}
                              onUpdateMstStage={(newStage) =>
                                updateMstStage(newStage)
                              }
                              id={params.id}
                            />
                          );
                      }
                    })()}
                  </FileDataContext.Provider>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Details;
