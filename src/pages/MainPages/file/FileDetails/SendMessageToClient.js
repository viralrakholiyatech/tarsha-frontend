import React, { useState, useEffect, useCallback } from "react";
import { GetDate, todayDate } from "../../../../services/DateAndTimeService";
import ApiService from "../../../../services/ApiService";
import {
  getRole,
  getToken,
  getUserId,
  superAccess,
} from "../../../../services/useLocalStorage";
import {
  getMessageToClient,
  lisoner,
  messageToClient,
  skip_sendMessageToClient,
  getFileDocumentJson,
} from "../../../../config/config";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  customerKey,
  adminKey,
  HoD,
  empKey,
} from "../../../../config/RoleConfig";
import { useForm } from "react-hook-form";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import axios from "axios";
import { AuthHeader } from "../../../../services/FormCommon";
import { restrictTo } from "../../../../config/CommonVariables";
import { FilesRoute } from "../../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";

const SendMessageToClient = (props) => {
  const [card, setCard] = useState("");
  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    reset,
    trigger,
  } = useForm({
    mode: "onChange",
  });

  const navigate = useNavigate();

  var header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const [assignTo, setAssignTo] = useState();

  const onSubmit = async (data) => {
    console.log(data);

    const formData = {
      ...data,
      mst_file_id: props.id,
      approved_by_hod: selectedOptions,
      date: startdate,
      card: card,
    };

    try {
      setLoading(true);
      const res = await ApiService(
        formData,
        0,
        header,
        messageToClient.method,
        messageToClient.url
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        setLoading(false);
        if (formData.is_save == 1) {
          if (!restrictTo.send_message_to_client) {
            setFormDisabled(formData.is_save);
            props.onUpdateMstStage(4);
            props.onchangeStage(4);
          } else {
            if (superAccess() || getUserId() == assignTo) {
              setFormDisabled(formData.is_save);
              props.onUpdateMstStage(4);
              props.onchangeStage(4);
            } else {
              localStorage.getItem("lastPath")
                ? navigate(`/${localStorage.getItem("lastPath")}`)
                : navigate(`/${FilesRoute.listFileOnline}`);
            }
          }
        }
      } else {
        setLoading(false);
        toast.error(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const initialData = {
    mst_file_id: props.id,
    message: "",
    file_received_date: todayDate(),
    hod_liasoner_id: "",
    is_save: 0,
    mst_stage_id: 3,
  };

  const [messageData, setMessageData] = useState(() => initialData);
  const [lisonerSelected, setLisonerSelected] = useState("");
  const [lisonerdata, setLisonerdata] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState("");
  const [formDisabled, setFormDisabled] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");

  const fetchLisoner = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        header,
        lisoner.method,
        lisoner.url
      );
      if (!res.data.error) {
        setLisonerdata(res.data.data);
        fetchMessage();
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        props.id,
        header,
        getMessageToClient.method,
        getMessageToClient.url
      );
      if (!res.data.error) {
        setLoading(false);
        const thisData = res.data.data;
        console.log("sfdgdgdgdgd", res.data.data);
        setEndDate(res.data.data.created_at.substring(0, 10));
        setFormDisabled(
          typeof thisData.is_save != "undefined" &&
            typeof parseInt(thisData.is_save) == "number"
            ? parseInt(thisData.is_save)
            : 0
        );
        setSelectedOptions(thisData.approved_by_hod === 1 ? "Yes" : "No");
        setCard(thisData.card);
        reset({
          message: thisData.message,
          file_received_date: thisData.file_received_date
            ? GetDate(thisData.file_received_date, "YYYY-MM-DD")
            : todayDate(),
          hod_liasoner_id: thisData.hod_liasoner_id,
          remark_by_emp: thisData.remark_by_emp,
          remark_by_hod: thisData.remark_by_hod,
        });
      } else {
        setLoading(false);
        setFormDisabled(0);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  useEffect(() => {
    fetchLisoner();
    getStartDate();
  }, []);

  useEffect(() => {
    if (!loading) {
      if ([customerKey].includes(getRole())) {
        document.getElementById("fieldset").disabled = true;
      } else {
        /*Temperatory*/
        if (superAccess()) {
          document.getElementById("fieldset").disabled = false;
        } else {
          document.getElementById("fieldset").disabled = formDisabled
            ? true
            : false;
        }
      }
    }
  }, [formDisabled, loading]);

  const onConfirmSaveAndNext = useCallback(async () => {
    const valid = await trigger();
    if (valid) {
      SwalAlert({
        confirmButtonText: "Continue",
        title: "Do you wanna save & continue?",
      })
        .then(async (result) => {
          if (result?.isConfirmed) {
            await onSubmit({ ...getValues(), is_save: 1 });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const getStartDate = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-type"]: "application/json",
      };
      const res = await ApiService(
        null,
        props.id,
        header,
        getFileDocumentJson.method,
        getFileDocumentJson.url
      );
      const jsonString = JSON.stringify(res.data.data);
      const datas = res.data.data;
      console.log("data-->", datas);
      if (typeof jsonString != "undefined") {
        setLoading(false);
        const object = JSON.parse(JSON.parse(jsonString)["file_document_json"]);

        setStartDate(object[0].created_at.substring(0, 10));
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      alert(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  //   const onSkip = () =>{
  //     SwalAlert({confirmButtonText:"Skip",title:"Do you want to skip?"}).then(async(result)=>{
  //         if(result?.isConfirmed){
  //             await skipTheStage();
  //         }
  //     }).catch((err)=>{
  //         console.log(err);
  //     })
  //   }

  //   const skipTheStage = useCallback(async()=>{

  //     try
  //     {
  //         const res = await axios({
  //             method: skip_sendMessageToClient.method,
  //             url:`${skip_sendMessageToClient.url}/${props.id}`,
  //             headers:AuthHeader()
  //         });

  //         if(!res?.data?.error)
  //         {
  //             toast.success(res?.data?.message);

  //             if(res?.data?.data?.skip==1){
  //                 props.onUpdateMstStage(4);
  //                 props.onchangeStage(4);
  //             }else{
  //                 props.onchangeStage(4);
  //             }

  //         }else{
  //             toast.error(res?.data?.message);
  //         }
  //     }
  //     catch(err)
  //     {
  //         console.log(err);
  //         toast.error("Something went wrong");
  //     }

  //   },[]);

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  return (
    <div className="grey-border rounded">
      <div className="card-header bg-white">
        <div className=" d-flex align-items-center justify-content-between">
          <h5 className="mb-0 font-weight-normal">File Details</h5>
          <div className="d-flex align-items-center">
            <div className="form-group mr-3 mb-0">
              <input type="date" className="form-control" value={startdate} />
            </div>
            <div className="form-group mb-0">
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={enddate}
              />
            </div>
          </div>
        </div>
        <div className="text-right red_green_card mt-3 d-flex justify-content-end">
          {superAccess() ? (
            <select
              name="card_no"
              id="card_no"
              className="form-control w-25"
              value={card}
              onChange={(e) => setCard(e.target.value)}
            >
              <option value={""}>--Select Card--</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
            </select>
          ) : (
            <button className="green card_btn">{card}</button>
          )}
        </div>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset id="fieldset">
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="message">Type message</label>
                    <textarea
                      name="message"
                      id="message"
                      cols="30"
                      rows="10"
                      placeholder="Type message"
                      {...register("message", { required: "Required" })}
                      className={formclass(errors?.message)}
                    ></textarea>
                    {displayError(errors?.message?.message)}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="file_received_date">Received date</label>
                    <input
                      type="date"
                      name="file_received_date"
                      id="file_received_date"
                      {...register("file_received_date", {
                        required: "Required",
                      })}
                      defaultValue={todayDate()}
                      className={formclass(errors?.file_received_date)}
                    />
                    {displayError(errors?.file_received_date?.message)}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="hod_liasoner_id">HOD(liasoner)</label>
                    <select
                      name="hod_liasoner_id"
                      id="hod_liasoner_id"
                      {...register("hod_liasoner_id", { required: "Required" })}
                      className={formclass(errors?.hod_liasoner_id)}
                    >
                      <option value="">--Select--</option>
                      {lisonerdata.map((data) => (
                        <option
                          value={data.id}
                          onChange={(e) => {
                            setAssignTo(e?.target?.value);
                          }}
                          selected={
                            data?.id == getValues("hod_liasoner_id")
                              ? true
                              : false
                          }
                        >
                          {data.first_name} {data.last_name}
                        </option>
                      ))}
                    </select>
                    {displayError(errors?.hod_liasoner_id?.message)}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="remark_by_emp">
                      Remark By(Assign to Name)
                    </label>
                    <textarea
                      type="text"
                      name="remark_by_emp"
                      id="remark_by_emp"
                      className="form-control"
                      placeholder="Enter Your Remark"
                      rows={3}
                      {...register("remark_by_emp")}
                      disabled={getRole() === adminKey && HoD !== ""}
                    />
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="remark_by_hod">Remark By(hod)</label>
                    <textarea
                      type="text"
                      name="remark_by_hod"
                      id="remark_by_hod"
                      className="form-control"
                      placeholder="Enter Your Remark"
                      rows={3}
                      {...register("remark_by_hod")}
                      disabled={getRole() === empKey}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="form-group col-md-6">
                  <label>Approved By HOD</label>
                  <input
                    type="radio"
                    value="Yes"
                    checked={selectedOptions === "Yes"}
                    onChange={handleOptionsChanges}
                    disabled={getRole() === empKey}
                  />
                  Yes
                  <input
                    type="radio"
                    value="No"
                    checked={selectedOptions === "No"}
                    onChange={handleOptionsChanges}
                    disabled={getRole() === empKey}
                  />
                  No
                </div>
              </div>

              <div className="row" style={{ justifyContent: "space-around" }}>
                {superAccess() ? (
                  <>
                    <button
                      type="submit"
                      {...register("is_save")}
                      value={0}
                      className="btn"
                    >
                      Save
                    </button>

                    {/* {!formDisabled ? 
                               
                                    <button className='btn' type="button"  onClick={onSkip} >Skip</button>
                                
                                :""} */}
                    {!formDisabled ? (
                      <button
                        type="button"
                        onClick={() => onConfirmSaveAndNext()}
                        value={1}
                        className="btn"
                      >
                        Save & Next
                      </button>
                    ) : (
                      ""
                    )}
                  </>
                ) : !formDisabled && [empKey].includes(getRole()) ? (
                  <>
                    <button
                      className="btn"
                      type="submit"
                      {...register("is_save")}
                      value={0}
                    >
                      Save
                    </button>

                    {/* <button className='btn' type="button"  onClick={onSkip} >Skip</button> */}

                    <button
                      className="btn"
                      type="button"
                      onClick={() => onConfirmSaveAndNext()}
                      value={1}
                    >
                      Save & Next
                    </button>
                  </>
                ) : (
                  ""
                )}
              </div>
            </fieldset>
          </form>
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
  );
};

export default SendMessageToClient;
