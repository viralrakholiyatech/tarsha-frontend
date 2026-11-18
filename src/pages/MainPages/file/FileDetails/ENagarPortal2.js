import React, { useCallback, useEffect, useState } from "react";
import { todayDate, GetDate } from "../../../../services/DateAndTimeService";
import useValidator from "../../../../services/Validation";
import ApiService from "../../../../services/ApiService";
import {
  get_enagar,
  lisoner,
  planner,
  insert_enagar,
  reject_enagar,
  skipEnagarPortal,
  save_enagarPortal,
  save_and_next_enagarPortal,
  skip_enagarPortal,
  get_filePlotValidation,
} from "../../../../config/config";
import {
  getRole,
  getToken,
  getUserId,
  isAdmin,
  superAccess,
} from "../../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  adminKey,
  customerKey,
  HoD,
  empKey,
} from "../../../../config/RoleConfig";
import { FilesRoute } from "../../../../config/RouteConfig";
import { useNavigate, useParams } from "react-router-dom";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { useForm } from "react-hook-form";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import axios from "axios";
import { AuthHeader } from "../../../../services/FormCommon";
import { restrictTo } from "../../../../config/CommonVariables";

const ENagarPortal2 = (props) => {
  const {
    register,
    control,
    reset,
    getValues,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const initialValue = {
    mst_file_id: props.id,
    drawing_assign_date: todayDate(),
    completed_date: todayDate(),
    completed_date2: todayDate(),
    upload_date: todayDate(),
    application_number: "",
    assign_application_number: "",
    pdf_received_date: todayDate(),
    assign_pdf_received_date: "",
    smc_checking_date: todayDate(),
    smc_upload_date: todayDate(),
    assign_smc_checking_date: "",
    approve_date: todayDate(),
    assign_approve_date: "",
    assign_liasoner: "",
    assign_planner: "",
    login: "",
    password: "",
    is_save: 0,
    is_rejected: 0,
    remark_by_hod: "",
    remark_by_emp: "",
  };

  const IntialformAccessibility = {
    type1: {
      is_save: 0,
    },
    type2: {
      is_save: 0,
    },
    type3: {
      is_save: 0,
    },
    type4: {
      is_save: 0,
    },
    type5: {
      is_save: 0,
    },
    type6: {
      is_save: 0,
    },
  };

  const [enagarvalues, setEnagarvalues] = useState(() => initialValue);
  const [enagarvalues2, setEnagarvalues2] = useState(() => initialValue);
  const [validator, showValidationMessage] = useValidator();
  const [lisonerdata, setLisonerdata] = useState([]);
  const [plannerdata, setPlannerdata] = useState([]);
  const [formDisabled, setFormDisabled] = useState(1);
  const [formAccess, setFormAccess] = useState(IntialformAccessibility);
  const [loading, setLoading] = useState(false);
  const [saveAndNext, SetSaveAndNext] = useState(0);
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [lastAssignId, setLastAssignId] = useState();
  const [selectedOptions, setSelectedOptions] = useState("");
  const [card, setCard] = useState("");
  const navigate = useNavigate();
  const params = useParams();

  const sanitizeDate = (date) => {
    return date ? GetDate(date, "YYYY-MM-DD") : todayDate();
  };
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
        get_filePlotValidation.method,
        get_filePlotValidation.url
      );
      console.log("startDate==res==>", res);
      if (!res.data.error) {
        setLoading(false);
       
        setStartDate(GetDate(res.data.data1[0].created_at, "YYYY-MM-DD"));
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const fetchLisoner = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        AuthHeader(),
        lisoner.method,
        lisoner.url
      );
      if (!res?.data?.error) {
        setLisonerdata(res?.data?.data);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const fetchPlanner = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        AuthHeader(),
        planner.method,
        planner.url
      );
      if (!res?.data?.error) {
        setPlannerdata(res.data.data);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
      if (err?.response?.data?.error) {
      }
    }
  };

  const fetchEnagarPortal = useCallback(async () => {
    try {
      setLoading(true);

      const res = await ApiService(
        null,
        props.id,
        AuthHeader(),
        get_enagar.method,
        get_enagar.url
      );

      if (!res.data.error) {
        setLoading(false);
        const data1 = res.data.data1[0];
        const data2 = res.data.data2[0];

        if (res.data.maxvalue > 0) {
          const data2_type_save = JSON.parse(data2.type_save);
          setFormAccess(data2_type_save);
       
          setFormDisabled(data2_type_save?.type6?.is_save == 1 ? 1 : 0);

          reset({
            drawing_assign_date: data2_type_save.type1.is_save
              ? sanitizeDate(data2.drawing_assign_date)
              : sanitizeDate(data1.drawing_assign_date),
            completed_date: data2_type_save.type1.is_save
              ? sanitizeDate(data2.completed_date)
              : sanitizeDate(data1.completed_date),
            assign_planner: data2_type_save.type1.is_save
              ? data2.assign_planner
              : data1.assign_planner,

            completed_date2: data2_type_save.type2.is_save
              ? sanitizeDate(data2.completed_date2)
              : sanitizeDate(data1.completed_date2),
            assign_liasoner: data2_type_save.type2.is_save
              ? data2.assign_liasoner
              : data1.assign_liasoner,

            login: data2_type_save.type3.is_save ? data2.login : data1.login,

            password: data2_type_save.type3.is_save
              ? data2.password
              : data1.password,
            application_number: data2_type_save.type3.is_save
              ? data2.application_number
              : data1.application_number,
            assign_application_number: data2_type_save.type3.is_save
              ? data2.assign_application_number
              : data1.assign_application_number,
            upload_date: data2_type_save.type3.is_save
              ? sanitizeDate(data2.upload_date)
              : sanitizeDate(data1.upload_date),

            pdf_received_date: data2_type_save.type4.is_save
              ? sanitizeDate(data2.pdf_received_date)
              : sanitizeDate(data1.pdf_received_date),
            assign_pdf_received_date: data2_type_save.type4.is_save
              ? data2.assign_pdf_received_date
              : data1.assign_pdf_received_date,

            smc_checking_date: data2_type_save.type5.is_save
              ? sanitizeDate(data2.smc_checking_date)
              : sanitizeDate(data1.smc_checking_date),

            assign_smc_checking_date: data2_type_save.type5.is_save
              ? data2.assign_smc_checking_date
              : data1.assign_smc_checking_date,

            approve_date: data2_type_save.type6.is_save
              ? sanitizeDate(data2.approve_date)
              : sanitizeDate(data1.approve_date),
            smc_upload_date: data2_type_save.type5.is_save
              ? sanitizeDate(data2.smc_upload_date)
              : sanitizeDate(data1.smc_upload_date),
            assign_approve_date: data2_type_save.type6.is_save
              ? data2.assign_approve_date
              : data1.assign_approve_date,

            is_save: data2.is_save ? data2.is_save : 0,
            type_save: data2.type_save ? data2.type_save : formAccess,
            is_rejected: data2.is_rejected,
            remark_by_emp: data2_type_save.type6.remark_by_emp ? data2.remark_by_emp : data1.remark_by_emp,
            remark_by_hod: data2_type_save.type6.remark_by_hod ? data2.remark_by_hod : data1.remark_by_hod,
          });
        } else {
          const jsonData = JSON.parse(data1.type_save);
          setFormAccess(jsonData);
          setFormDisabled(jsonData?.type6?.is_save == 1 ? 1 : 0);
          setCard(data1?.card)
             setSelectedOptions(data1.approved_by_hod === 1 ? "Yes" : "No")
             setEndDate(GetDate(data1.created_at, "YYYY-MM-DD"))
          reset({
            drawing_assign_date: data1.drawing_assign_date
              ? GetDate(data1.drawing_assign_date, "YYYY-MM-DD")
              : todayDate(),
            completed_date: data1.completed_date
              ? GetDate(data1.completed_date, "YYYY-MM-DD")
              : todayDate(),
            completed_date2: data1.completed_date2
              ? GetDate(data1.completed_date2, "YYYY-MM-DD")
              : todayDate(),
            upload_date: data1.upload_date
              ? GetDate(data1.upload_date, "YYYY-MM-DD")
              : todayDate(),
            application_number: data1.application_number,
            assign_application_number: data1.assign_application_number
              ? data1.assign_application_number
              : "",
            pdf_received_date: data1.pdf_received_date
              ? GetDate(data1.pdf_received_date, "YYYY-MM-DD")
              : todayDate(),
            assign_pdf_received_date: data1.assign_pdf_received_date
              ? data1.assign_pdf_received_date
              : "",
            smc_checking_date: data1.smc_checking_date
              ? GetDate(data1.smc_checking_date, "YYYY-MM-DD")
              : todayDate(),
            smc_upload_date: data1.smc_upload_date
              ? GetDate(data1.smc_upload_date, "YYYY-MM-DD")
              : todayDate(),
            assign_smc_checking_date: data1.assign_smc_checking_date
              ? data1.assign_smc_checking_date
              : "",
            approve_date: data1.approve_date
              ? GetDate(data1.approve_date, "YYYY-MM-DD")
              : todayDate(),
            assign_approve_date: data1.assign_approve_date
              ? data1.assign_approve_date
              : "",
            assign_liasoner: data1.assign_liasoner ? data1.assign_liasoner : "",
            assign_planner: data1.assign_planner ? data1.assign_planner : "",
            login: data1.login ? data1.login : "",
            password: data1.password ? data1.password : "",
            is_save: data1.is_save ? data1.is_save : 0,
            remark_by_emp:data1.remark_by_emp,
            remark_by_hod:data1.remark_by_hod,
            type_save: data1.type_save ? data1.type_save : formAccess,
            is_rejected: data1.is_rejected,
          });
        }
      } else {
        setLoading(false);
        setFormDisabled(0);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      setFormDisabled(0);
      console.log(err);
      toast.error(res?.data?.error);
    }
  }, []);

  useEffect(() => {
    fetchLisoner();
    fetchPlanner();
    fetchEnagarPortal();
    fetchStartDate();
  }, []);

  const onSubmit = (data) => {};

  const getDataByTypeSave = async (value) => {
    const data = getValues();

    switch (value) {
      case 1:
        return {
          data: {
            is_save: "type1",
            drawing_assign_date: data?.drawing_assign_date,
            assign_planner: data?.assign_planner,
          },
          validate: ["drawing_assign_date", "assign_planner"],
        };
      case 2:
        return {
          data: {
            is_save: "type2",
            completed_date2: data?.completed_date2,
            assign_liasoner: data?.assign_liasoner,
          },
          validate: ["completed_date2", "assign_liasoner"],
        };
      case 3:
        return {
          data: {
            is_save: "type3",
            login: data?.login,
            password: data?.password,
            application_number: data?.application_number,
            assign_application_number: data?.assign_application_number,
            upload_date: data?.upload_date,
          },
          validate: [
            "login",
            "password",
            "application_number",
            "assign_application_number",
            "upload_date",
          ],
        };
      case 4:
        return {
          data: {
            is_save: "type4",
            pdf_received_date: data?.pdf_received_date,
            assign_pdf_received_date: data?.assign_pdf_received_date,
          },
          validate: ["pdf_received_date", "assign_pdf_received_date"],
        };
      case 5:
        return {
          data: {
            is_save: "type5",
            smc_checking_date: data?.smc_checking_date,
            assign_smc_checking_date: data?.assign_smc_checking_date,
          },
          validate: ["assign_smc_checking_date", "assign_smc_checking_date"],
        };
      case 6:
        return {
          data: {
            is_save: "type6",
            smc_upload_date: data?.smc_upload_date,
            assign_approve_date: data?.assign_approve_date,
            approve_date: data?.approve_date,
            remark_by_hod: data.remark_by_hod,
            remark_by_emp: data.remark_by_emp,
            approved_by_hod: selectedOptions,
           
          },
          validate: ["smc_upload_date", "assign_approve_date", "approve_date","remark_by_emp","remark_by_hod",],
        };
      default:
        return null;
    }
  };

  const onSaveAndNext = useCallback(async () => {
    let key = 0;

    const val = JSON.parse(getValues()["type_save"]);

    if (val?.type1?.is_save == 0) {
      key = 1;
    } else if (val?.type2?.is_save == 0) {
      key = 2;
    } else if (val?.type3?.is_save == 0) {
      key = 3;
    } else if (val?.type4?.is_save == 0) {
      key = 4;
    } else if (val?.type5?.is_save == 0) {
      key = 5;
    } else if (val?.type6?.is_save == 0) {
      key = 6;
    }

    const obj = await getDataByTypeSave(key);

    const validate = await trigger(obj.validate);
    let data = obj.data;
    if (validate) {
      SwalAlert({ title: "Are you sure?", confirmButtonText: "Save & Next" })
        .then(async (result) => {
          if (result.isConfirmed) {
            ContinueAndNext(data);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const ContinueAndNext = async (data) => {
    try {
      setLoading(true);

      const res = await axios({
        method: save_and_next_enagarPortal.method,
        url: save_and_next_enagarPortal.url,
        data: { ...data, mst_file_id: params?.id, date: startdate,approved_by_hod:selectedOptions,card:card },
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        if (res?.data?.data?.skip == 1) {
          if (!restrictTo.enagarPortal) {
            props.onUpdateMstStage(6);
            props.onchangeStage(6);
          } else {
            if (superAccess() || getUserId() == lastAssignId) {
              props.onUpdateMstStage(6);
              props.onchangeStage(6);
            } else {
              localStorage.getItem("lastPath")
                ? navigate(`/${localStorage.getItem("lastPath")}`)
                : navigate(`/${FilesRoute.listFileOnline}`);
            }
          }
        } else {
          if (!restrictTo.enagarPortal) {
            await fetchEnagarPortal();
          } else {
            if (superAccess() || getUserId() == lastAssignId) {
              await fetchEnagarPortal();
            } else {
              localStorage.getItem("lastPath")
                ? navigate(`/${localStorage.getItem("lastPath")}`)
                : navigate(`/${FilesRoute.listFileOnline}`);
            }
          }
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  const onSave = useCallback(async () => {
    try {
      const validate = await trigger();

      if (validate) {
        setLoading(true);

        const data = getValues();

        const res = await axios({
          method: save_enagarPortal.method,
          url: save_enagarPortal.url,
          headers: AuthHeader(),
          data: {
            ...data,
            mst_file_id: params?.id,
            date: startdate,
            approved_by_hod:selectedOptions,
            card:card,
          },
        });

        if (!res?.data?.error) {
          setLoading(false);
          toast.success(res?.data?.message);
        } else {
          setLoading(false);
          toast.error(res?.data?.message);
        }
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  }, [startdate,selectedOptions,card]);

  // const onSkip = () =>{
  //     SwalAlert({title:"Are you sure?",confirmButtonText:"Skip"}).then(async(result)=>{
  //         if(result.isConfirmed){
  //             await skipTheStage();
  //         }
  //     });
  // }

  // const skipTheStage = async () =>{
  //     try
  //     {
  //         setLoading(true);
  //         const res = await axios({
  //             method:skip_enagarPortal.method,
  //             url:`${skip_enagarPortal.url}/${params?.id}`,
  //             headers:AuthHeader()
  //         });

  //         if(!res?.data?.error)
  //         {
  //             setLoading(false);
  //             toast.success(res?.data?.message);

  //             if(res?.data?.data?.nextStage==1){
  //                 props.onUpdateMstStage(6);
  //                 props.onchangeStage(6);
  //             }else{
  //                 await fetchEnagarPortal();
  //             }

  //         }
  //         else
  //         {
  //             setLoading(false);
  //             toast.success(res?.data?.message);
  //         }
  //     }
  //     catch(err)
  //     {
  //         setLoading(false);
  //         toast.error("Something went wrong");
  //         console.log(err);
  //     }
  // };

  const rejectButton = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: reject_enagar.method,
        url: reject_enagar.url,
        headers: AuthHeader(),
        data: { mst_file_id: params?.id, reason: getValues("reason") },
      });

      if (!res?.data?.error) {
        closeRejectForm();
        setLoading(false);
        toast.success(res?.data?.message);
        await fetchEnagarPortal();
        // if([adminKey].includes(getRole())){
        //     await fetchEnagarPortal();
        // }else if([empKey].includes(getRole())){
        //     const team_id = res.data.data?.team_id;
        //     if(parseInt(team_id)===parseInt(getUserId()))
        //     {
        //         await fetchEnagarPortal();
        //     }
        //     else
        //     {
        //         // navigate(`/${FilesRoute.list}`);
        //         localStorage.getItem("lastPath") ? navigate(`/${localStorage.getItem("lastPath")}`) : navigate(`/${FilesRoute.listFileOnline}`);
        //     }
        // }
      } else {
        setLoading(false);
        closeRejectForm();
        toast.error(res.data.message);
      }
    } catch (err) {
      setLoading(false);
      closeRejectForm();
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const onReject = () => {
    SwalAlert({ title: "Do you wanna reject?", confirmButtonText: "Reject!" })
      .then(async (result) => {
        if (result?.isConfirmed) {
          await rejectButton();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const closeRejectForm = () => {
    try {
      document.getElementById("close_reject_form").click();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  return (
    <div className="grey-border rounded">
  <div className="card-header bg-white">
      <div className=" d-flex align-items-center justify-content-between">
        <h5 className="mb-0 font-weight-normal">E Nagar Portal</h5>
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
        <div className="text-right red_green_card mt-3 d-flex justify-content-end">
          {superAccess() ? (
                  <select
                    name="card_no"
                    id="card_no"
                    className="form-control"
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
      </div>
      <div className="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form>
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label htmlFor="drawing_assign_date">
                    Drawing assign date
                  </label>
                  <input
                    type="date"
                    disabled={
                      superAccess()
                        ? false
                        : formDisabled
                        ? true
                        : formAccess?.type1?.is_save
                    }
                    name="drawing_assign_date"
                    id="drawing_assign_date"
                    {...register("drawing_assign_date", {
                      required: "Required",
                    })}
                    className={formclass(errors?.drawing_assign_date)}
                  />
                  {displayError(errors?.drawing_assign_date?.message)}
                </div>
              </div>
              <div className="col" style={{ display: "none" }}>
                <div className="form-group">
                  <label htmlFor="completed_date">Completed date</label>
                  <input
                    type="date"
                    name="completed_date"
                    disabled={
                      superAccess()
                        ? false
                        : formDisabled
                        ? true
                        : formAccess?.type1?.is_save
                    }
                    id="completed_date"
                    {...register("completed_date", { required: false })}
                    className={formclass(errors?.completed_date)}
                    hidden={true}
                  />
                  {displayError(errors?.completed_date?.message)}
                </div>
              </div>
              <div className="col">
                <div className="form-group">
                  <label htmlFor="assign_planner">Assign Predcr Planner</label>
                  <select
                    name="assign_planner"
                    id="assign_planner"
                    onClick={
                      !formAccess?.type1?.is_save
                        ? (e) => {
                            setLastAssignId(e?.target.value);
                          }
                        : null
                    }
                    disabled={
                      superAccess()
                        ? false
                        : formDisabled
                        ? true
                        : formAccess?.type1?.is_save
                    }
                    className={formclass(errors?.assign_planner)}
                    {...register("assign_planner", { required: "Required" })}
                  >
                    <option value="">--Select--</option>
                    {plannerdata.map((data) => (
                      <option
                        key={data.id}
                        selected={
                          data?.id == getValues(`assign_planner`) ? true : false
                        }
                        value={data.id}
                      >
                        {data.first_name} {data.last_name}
                      </option>
                    ))}
                  </select>
                  {displayError(errors?.assign_planner?.message)}
                </div>
              </div>
            </div>

            {formAccess?.type1?.is_save ? (
              <div className="row">
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="completed_date2">Completed date</label>
                    <input
                      type="date"
                      name="completed_date2"
                      id="completed_date2"
                      disabled={
                        superAccess()
                          ? false
                          : formDisabled
                          ? true
                          : formAccess?.type2?.is_save
                      }
                      {...register("completed_date2", { required: "Required" })}
                      className={formclass(errors?.completed_date2)}
                    />
                    {displayError(errors?.completed_date2?.message)}
                  </div>
                </div>
                <div className="col">
                  <div className="form-group">
                    <label htmlFor="assign_liasoner">Assign Lisoner</label>
                    <select
                      name="assign_liasoner"
                      id="assign_liasoner"
                      onClick={
                        !formAccess?.type2?.is_save
                          ? (e) => {
                              setLastAssignId(e?.target.value);
                            }
                          : null
                      }
                      disabled={
                        superAccess()
                          ? false
                          : formDisabled
                          ? true
                          : formAccess?.type2?.is_save
                      }
                      {...register("assign_liasoner", { required: "Required" })}
                      className={formclass(errors?.assign_liasoner)}
                    >
                      <option value="">--Select--</option>
                      {lisonerdata.map((data) => (
                        <option
                          key={data.id}
                          selected={
                            data?.id == getValues(`assign_liasoner`)
                              ? true
                              : false
                          }
                          value={data.id}
                        >
                          {data.first_name} {data.last_name}
                        </option>
                      ))}
                    </select>
                    {displayError(errors?.assign_liasoner?.message)}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {formAccess?.type2?.is_save ? (
              <>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="login">Login ID</label>
                      <input
                        type="text"
                        name="login"
                        id="login"
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type3?.is_save
                        }
                        {...register("login", { required: "Required" })}
                        placeholder="Login ID"
                        className={formclass(errors?.login)}
                      />
                      {displayError(errors?.login?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                        type="text"
                        name="password"
                        id="password"
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type3?.is_save
                        }
                        {...register("password", { required: "Required" })}
                        placeholder="Password"
                        className={formclass(errors?.password)}
                      />
                      {displayError(errors?.password?.message)}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="application_number">
                        Application Number
                      </label>
                      <input
                        type="text"
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type3?.is_save
                        }
                        name="application_number"
                        id="application_number"
                        {...register("application_number", {
                          required: "Required",
                        })}
                        placeholder="Application Number"
                        className={formclass(errors?.application_number)}
                      />
                      {displayError(errors?.application_number?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="assign_application_number">
                        Assi. of Application No.
                      </label>
                      <select
                        onClick={
                          !formAccess?.type3?.is_save
                            ? (e) => {
                                setLastAssignId(e?.target.value);
                              }
                            : null
                        }
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type3?.is_save
                        }
                        className={formclass(errors?.assign_application_number)}
                        name="assign_application_number"
                        {...register("assign_application_number", {
                          required: "Required",
                        })}
                        id="assign_application_number"
                      >
                        <option value="">--Select--</option>
                        {lisonerdata.map((data) => (
                          <option
                            key={data.id}
                            selected={
                              data?.id == getValues(`assign_application_number`)
                                ? true
                                : false
                            }
                            value={data.id}
                          >
                            {data.first_name} {data.last_name}
                          </option>
                        ))}
                      </select>
                      {displayError(errors?.assign_application_number?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="upload_date">Upload Date</label>
                      <input
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type3?.is_save
                        }
                        type="date"
                        name="upload_date"
                        id="upload_date"
                        {...register("upload_date", { required: "Required" })}
                        placeholder="Upload Date"
                        className={formclass(errors?.upload_date)}
                      />
                      {displayError(errors?.upload_date?.message)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              ""
            )}

            {formAccess?.type3?.is_save ? (
              <>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="pdf_received_date">Received Date</label>
                      <input
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type4?.is_save
                        }
                        type="date"
                        name="pdf_received_date"
                        id="pdf_received_date"
                        {...register("pdf_received_date", {
                          required: "Required",
                        })}
                        placeholder="Received Date"
                        className={formclass(errors?.pdf_received_date)}
                      />
                      {displayError(errors?.pdf_received_date?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="assign_pdf_received_date">
                        Assi. of Received Date
                      </label>
                      <select
                        onClick={
                          !formAccess?.type4?.is_save
                            ? (e) => {
                                setLastAssignId(e?.target.value);
                              }
                            : null
                        }
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type4?.is_save
                        }
                        className={formclass(errors?.assign_pdf_received_date)}
                        name="assign_pdf_received_date"
                        {...register("assign_pdf_received_date", {
                          required: "Required",
                        })}
                        id="assign_pdf_received_date"
                      >
                        <option value="">--Select--</option>
                        {lisonerdata.map((data) => (
                          <option
                            key={data.id}
                            selected={
                              data?.id == getValues(`assign_pdf_received_date`)
                                ? true
                                : false
                            }
                            value={data.id}
                          >
                            {data.first_name} {data.last_name}
                          </option>
                        ))}
                      </select>
                      {displayError(errors?.assign_pdf_received_date?.message)}
                    </div>
                  </div>
                  <div className="col-lg"></div>
                </div>
              </>
            ) : (
              ""
            )}

            {formAccess?.type4?.is_save ? (
              <>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="smc_checking_date">
                        SMC Checking Date
                      </label>
                      <input
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type5?.is_save
                        }
                        type="date"
                        name="smc_checking_date"
                        id="smc_checking_date"
                        {...register("smc_checking_date", {
                          required: "Required",
                        })}
                        placeholder="SMC Checking Date"
                        className={formclass(errors?.smc_checking_date)}
                      />
                      {displayError(errors?.smc_checking_date?.message)}
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="assign_smc_checking_date">
                        Assi. of SMC Checking Date
                      </label>
                      <select
                        onClick={
                          !formAccess?.type5?.is_save
                            ? (e) => {
                                setLastAssignId(e?.target.value);
                              }
                            : null
                        }
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type5?.is_save
                        }
                        className={formclass(errors?.assign_smc_checking_date)}
                        name="assign_smc_checking_date"
                        {...register("assign_smc_checking_date", {
                          required: "Required",
                        })}
                        id="assign_smc_checking_date"
                      >
                        <option value="">--Select--</option>
                        {lisonerdata.map((data) => (
                          <option
                            key={data.id}
                            selected={
                              data?.id == getValues(`assign_smc_checking_date`)
                                ? true
                                : false
                            }
                            value={data.id}
                          >
                            {data.first_name} {data.last_name}
                          </option>
                        ))}
                      </select>
                      {displayError(errors?.assign_smc_checking_date?.message)}
                    </div>
                  </div>
                  {/* {(!enagarvalues.is_save && !isCustomer()) ?   */}

                  <div className="col">
                    {!formDisabled ? (
                      <button
                        className="btn"
                        id="openRejectForm"
                        data-toggle="modal"
                        data-target="#rejectForm"
                        type="button"
                      >
                        REJECT
                      </button>
                    ) : (
                      ""
                    )}

                    {/* <button className="btn" onClick={onReject} type="button">REJECT</button> */}
                  </div>

                  {/* :""} */}
                </div>
              </>
            ) : (
              ""
            )}

            {formAccess?.type5?.is_save ? (
              <>
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="smc_upload_date">SMC Upload Date</label>
                      <input
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type6?.is_save
                        }
                        type="date"
                        name="smc_upload_date"
                        id="smc_upload_date"
                        {...register("smc_upload_date", {
                          required: "Required",
                        })}
                        placeholder="SMC Checking Date"
                        className={formclass(errors?.smc_upload_date)}
                      />
                      {displayError(errors?.smc_upload_date?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="approve_date">Approved Date</label>
                      <input
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type6?.is_save
                        }
                        type="date"
                        name="approve_date"
                        id="approve_date"
                        {...register("approve_date", { required: "Required" })}
                        placeholder="Approved Date"
                        className={formclass(errors?.approve_date)}
                      />
                      {displayError(errors?.approve_date?.message)}
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <label htmlFor="assign_approve_date">
                        Assi of Approved Date
                      </label>
                      <select
                        onClick={
                          !formAccess?.type6?.is_save
                            ? (e) => {
                                setLastAssignId(e?.target.value);
                              }
                            : null
                        }
                        disabled={
                          superAccess()
                            ? false
                            : formDisabled
                            ? true
                            : formAccess?.type6?.is_save
                        }
                        className={formclass(errors?.assign_approve_date)}
                        name="assign_approve_date"
                        {...register("assign_approve_date", {
                          required: "Required",
                        })}
                        id="assign_approve_date"
                      >
                        <option value="">--Select--</option>
                        {lisonerdata.map((data) => (
                          <option
                            key={data.id}
                            selected={
                              data?.id == getValues(`assign_approve_date`)
                                ? true
                                : false
                            }
                            value={data.id}
                          >
                            {data.first_name} {data.last_name}
                          </option>
                        ))}
                      </select>
                      {displayError(errors?.assign_approve_date?.message)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              ""
            )}
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

            {superAccess() ? (
              <div className="row" style={{ justifyContent: "space-around" }}>
                <button className="btn" type="button" onClick={onSave}>
                  Save
                </button>

                {!formDisabled ? (
                  <>
                    {/* <button className='btn' onClick={onSkip} type='button'>Skip</button> */}

                    <button
                      className="btn"
                      type="button"
                      onClick={onSaveAndNext}
                    >
                      Save & Next
                    </button>
                  </>
                ) : (
                  ""
                )}
              </div>
            ) : [empKey].includes(getRole()) && !formDisabled ? (
              <div className="row" style={{ justifyContent: "space-around" }}>
                {/* <button className='btn' onClick={onSkip} type='button'>Skip</button> */}
                <button className="btn" type="button" onClick={onSaveAndNext}>
                  Save & Next
                </button>
              </div>
            ) : (
              ""
            )}
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

        <div class="modal fade" id="rejectForm">
          <form>
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h6 class="modal-title">Are you sure?</h6>
                  <button
                    type="button"
                    id="close_reject_form"
                    class="close"
                    data-dismiss="modal"
                  >
                    X
                  </button>
                </div>
                <div class="modal-body">
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="reason">Reason</label>
                        <textarea
                          name="reason"
                          {...register("reason")}
                          id="reason"
                          cols="30"
                          rows="5"
                          className={formclass(errors?.reason)}
                        ></textarea>
                        {displayError(errors?.reason?.message)}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn" onClick={() => onReject()}>
                    Reject
                  </button>
                  <button
                    type="button"
                    id="close_reject_form"
                    class="btn"
                    data-dismiss="modal"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ENagarPortal2;
