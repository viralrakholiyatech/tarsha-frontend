import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import ApiService from "../../../../services/ApiService";
import {
  getRole,
  getToken,
  isCust,
  superAccess,
  isEmp,
  ishod
} from "../../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { useNavigate, NavLink, Link, useParams } from "react-router-dom";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { GetDate } from "../../../../services/DateAndTimeService";
import {
  getWorkFee,
  get_aminities,
  saveWorkFee,
  skipWorkFee,
} from "../../../../config/config";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { adminKey, HoD, empKey } from "../../../../config/RoleConfig";

const Work_fee = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedOptions, setSelectedOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSave, setIsSave] = useState(0);
  const [configData, setConfigData] = useState({ is_save: 0, is_skip: 0 });
  const [formDisabled, setFormDisabled] = useState(1);
  const [filepath, setFilePath] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [card, setCard] = useState("");
  const {
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    register,
    reset,
    trigger,
  } = useForm({
    mode: "onChange",
  });

  var header = { Authorization: `Bearer ${getToken()}` };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const workFeeData = {
        ...data,
        mst_file_id: parseInt(params?.id),
        approved_by_hod: selectedOptions,
        date: startdate,
        card:card,
      };
      const res = await ApiService(
        workFeeData,
        0,
        header,
        saveWorkFee.method,
        saveWorkFee.url
      );

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        if (workFeeData?.is_save == 1) {
          props.onUpdateMstStage(17);
          props.onchangeStage(17);
        }
      } else {
        toast.error(res?.data?.message);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        params?.id,
        header,
        getWorkFee.method,
        getWorkFee.url
      );
      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
       
    

        setConfigData({
          is_save: payload[0]?.is_save ? payload[0]?.is_save : 0,
          // is_skip:payload[0]?.is_skip ? payload[0]?.is_skip : 0
        });
        setEndDate(GetDate(payload[0]?.created_at, "YYYY-MM-DD"));
        setSelectedOptions(payload[0].approved_by_hod === 1 ? "Yes" : "No");
        setCard(payload[0]?.card)
        setFormDisabled(
          payload[0]?.is_save == 1 || payload[0]?.is_skip == 1 ? 1 : 0
        );

        reset({
          fee_amount: payload[0]?.fee_amount ? payload[0]?.fee_amount : "",
          fee_status: payload[0]?.fee_status
            ? (payload[0]?.fee_status).toString()
            : "",
          remark_by_hod: payload[0].remark_by_hod,
          remark_by_emp: payload[0].remark_by_emp,
        });
      } else {
        setFormDisabled(0);
        setLoading(false);
        // toast.error(res?.data?.error);
        reset({ fee_amount: "", fee_status: "1" });
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  // const onSkipStage = async () =>{
  //   SwalAlert({confirmButtonText:"Skip",title:"Do you wanna skip this stage ([16] Work fee) ?"}).then(async(result)=>{
  //     if(result?.isConfirmed){
  //       await skipStage(parseInt(params?.id));
  //     }
  //   }).catch((err)=>{
  //      console.log(err);
  //   });
  // }

  // const skipStage = async (id) =>{
  //   try
  //   {
  //     setLoading(true);
  //     const res = await ApiService(null,id,header,skipWorkFee.method,skipWorkFee.url);
  //     if(!res?.data?.error){
  //       setLoading(false);
  //       toast.success(res?.data?.message);
  //       props.onUpdateMstStage(17);
  //       props.onchangeStage(17);
  //     }else{
  //       toast.error(res?.data?.message);
  //       setLoading(false);
  //     }
  //   }
  //   catch(err)
  //   {
  //     setLoading(false);
  //     toast.error("Something went wrong");
  //     console.log(err);
  //   }
  // }

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

  var header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const fetchStartDate = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        props.id,
        header,
        get_aminities.method,
        get_aminities.url
      );

      if (!res.data.error) {
        setLoading(false);
        console.log("rsesrs==>", res);
        const emiData = JSON.parse(res.data.data[0].emi_data);
      
        // Set start date from the first object in emi_data array
        if (emiData.length > 0) {
          setStartDate(GetDate(emiData[0].date, "YYYY-MM-DD"));
        } else {
          // Handle case where emi_data array is empty
          console.error("emi_data array is empty");
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      // Handle error
      console.error(err);
      setLoading(false);
      // toast.error(err.response.data.message);
      // if (err.response.data.error) {
      // }
    }
  };

  useEffect(() => {
    fetchData();
    fetchStartDate();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (superAccess()) {
        document.getElementById("fieldset").disabled = false;
      } else {
        document.getElementById("fieldset").disabled = formDisabled
          ? true
          : false;
      }
    }
  }, [loading, formDisabled]);

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };
  return (
    <div class="grey-border rounded">
<div className="card-header bg-white">
      <div className=" d-flex align-items-center justify-content-between">
        <h5 class="mb-0 font-weight-normal">Work fees</h5>
        <div className="d-flex align-items-center">
          <div className="form-group mr-3">
            <input type="date" className="form-control" value={startdate} />
          </div>
          <div className="form-group">
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
                    <label htmlFor="fee_amount">Fee amount</label>
                    <input
                      type="text"
                      name="fee_amount"
                      id="fee_amount"
                      {...register("fee_amount", { required: "Required" })}
                      className={formclass(errors?.fee_amount)}
                    />
                    {displayError(errors?.fee_amount?.message)}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="fee_status">Fee status</label> &nbsp;
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        name="fee_status"
                        id="fee_status1"
                        value="1"
                        className="form-check-input"
                        {...register("fee_status", { required: "Required" })}
                      />
                      <label htmlFor="fee_status1" className="form-check-label">
                        Pending
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        type="radio"
                        name="fee_status"
                        id="fee_status2"
                        value="2"
                        className="form-check-input"
                        {...register("fee_status", { required: "Required" })}
                      />
                      <label htmlFor="fee_status2" className="form-check-label">
                        Paid
                      </label>
                    </div>
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
                      disabled={!isEmp()}
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
                      disabled={!ishod()}
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
                    disabled={!ishod()}
                  />
                  Yes
                  <input
                    type="radio"
                    value="No"
                    checked={selectedOptions === "No"}
                    onChange={handleOptionsChanges}
                    disabled={!ishod()}
                  />
                  No
                </div>
              </div>

              {superAccess() ? (
                <div className="row" style={{ justifyContent: "space-around" }}>
                  <button className="btn" {...register("is_save")} value={0}>
                    Save
                  </button>

                  {!formDisabled ? (
                    <>
                      {/* <button className='btn' type="button" onClick={()=>onSkipStage()}>Skip</button> */}
                      <button
                        className="btn"
                        type="button"
                        onClick={() => onConfirmSaveAndNext()}
                      >
                        Save & next
                      </button>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              ) : [empKey].includes(getRole()) && !formDisabled ? (
                <div className="row" style={{ justifyContent: "space-around" }}>
                  <button className="btn" {...register("is_save")} value={0}>
                    Save
                  </button>
                  {/* <button className='btn' type="button" onClick={()=>onSkipStage()}>Skip</button> */}
                  <button
                    className="btn"
                    type="button"
                    onClick={() => onConfirmSaveAndNext()}
                  >
                    Save & next
                  </button>
                </div>
              ) : (
                ""
              )}
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

export default Work_fee;
