import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import ApiService from "../../../../services/ApiService";
import {
  getRole,
  getToken,
  isAdmin,
  isCust,
  superAccess,
  isEmp,
  ishod
} from "../../../../services/useLocalStorage";
import { adminKey,HoD, empKey } from "../../../../config/RoleConfig";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { useNavigate, NavLink, Link, useParams } from "react-router-dom";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { GetDate, todayDate } from "../../../../services/DateAndTimeService";
import axios from "axios";
import { AuthHeader, isValidJson } from "../../../../services/FormCommon";
import {
  get_aminities,
  save_aminities,
  skip_aminities,
  getAllImportantFees,
} from "../../../../config/config";
import { eyeButtonSvg, FileUrl } from "../../../../config/file_url";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { ReactSVG } from "react-svg";

const form_fsi = "form_fsi";
const FS_IC_Amineties_fees = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [selectedOptions, setSelectedOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSave, setIsSave] = useState(0);
  const [isFormDisabled, setFormDisabled] = useState(0);
  const [filepath, setFilePath] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [fsiRows, setFsiRows] = useState([]);
  const [backupfsiRows, setBackupFsiRows] = useState([]);
  const [card, setCard] = useState("");
  const [icRows, setIcRows] = useState([]);
  const [backupicRows, setBackupIcRows] = useState([]);

  const {
    register,
    reset,
    trigger,
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    mode: "onChange",
  });

  const onSave = async (is_save = 0) => {
    try {
      const validate = await trigger();

      if (validate) {
        const data = getValues();

        const formData = new FormData();

        const piece = {
          mst_file_id: params?.id,
          fsi_amount: data?.fsi_total_amount,
          ic_amount: data?.total_amount,
          fsi_emi: data?.fsi_total_emi,
          ic_emi: data?.total_emi,
          approved_by_hod: selectedOptions,
          remark_by_emp: data?.remark_by_emp, // Bind remark_by_emp
          remark_by_hod: data?.remark_by_hod,
          date:startdate,
          card:card,
        };

        console.log(data);

        console.log("Fsi Json data");

        const fsiJsonData = [];

        const icJsonData = [];

        for (let i = 0; i < fsiRows.length; i++) {
          const index = i + 1;

          let obj = {
            index: index,
            date: data[`${i}_type1_date`],
            amount: data[`${i}_type1_amount`],
            received_date: data[`${i}_type1_received_date`],
            show: data[`${i}_type1_show`],
            document_path: "",
          };

          if (data[`${i}_type1_doc`]) {
            const file = data[`${i}_type1_doc`][0]
              ? data[`${i}_type1_doc`][0]
              : "";
            if (file) {
              formData.append(`${index}_type1_doc`, file);
            }
          }

          fsiJsonData.push(obj);
        }

        for (let i = 0; i < icRows.length; i++) {
          const index = i + 1;
          let obj = {
            index: index,
            date: data[`${i}_type2_date`],
            amount: data[`${i}_type2_amount`],
            received_date: data[`${i}_type2_received_date`],
            show: data[`${i}_type2_show`],
            document_path: "",
          };

          if (data[`${i}_type2_doc`]) {
            const file = data[`${i}_type2_doc`][0]
              ? data[`${i}_type2_doc`][0]
              : "";

            if (file) {
              formData.append(`${index}_type2_doc`, file);
            }
          }

          icJsonData.push(obj);
        }

        console.log(fsiJsonData);
        console.log(icJsonData);

        formData.append("data", JSON.stringify(piece));
        formData.append("fsi_json", JSON.stringify(fsiJsonData));
        formData.append("ic_json", JSON.stringify(icJsonData));
        formData.append("is_save", is_save);
        formData.append("remark_by_emp", getValues("remark_by_emp"));
        formData.append("remark_by_hod", getValues("remark_by_hod"));
        formData.append("approved_by_hod", selectedOptions);
        formData.append("date", startdate);
        formData.append("card", card);

        if (is_save == 1) {
          SwalAlert({
            title: "Do you want to continue?",
            confirmButtonText: "Save & next!",
          })
            .then(async (result) => {
              if (result.isConfirmed) {
                await onSubmit(formData);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          await onSubmit(formData);
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await axios({
        method: save_aminities.method,
        url: save_aminities.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        toast.success(res?.data?.message);

        if (res?.data?.data?.skip == 1) {
          setLoading(false);
          props.onUpdateMstStage(16);
          props.onchangeStage(16);
        } else {
          setFsiRows([]);
          setIcRows([]);
          await fetchData();
        }
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios({
        method: get_aminities.method,
        url: `${get_aminities.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
        console.log("dadata--->",payload)
     
        setSelectedOptions(payload[0].approved_by_hod=== 1 ? "Yes" : "No");
        setEndDate(GetDate(payload[0]?.created_at, "YYYY-MM-DD"));
        setCard(payload[0].card)
        console.log(payload);
        

        if (Array.isArray(payload)) {
          console.log(
            "Form Disabled" + payload.some((p) => p?.is_save == 1) + ""
          );

          const disabled = payload.some((p) => p?.is_save == 1);

          setFormDisabled(disabled ? 1 : 0);

          const data1 = {
            fsi_total_amount:
              payload[0]?.amount != null ? payload[0]?.amount : "",
            fsi_total_emi: payload[0]?.emi != null ? payload[0]?.emi : "",
            is_type: payload[0]?.is_type,
            emi_data: isValidJson(payload[0]?.emi_data),
            remark_by_emp: payload[0]?.remark_by_emp,
            remark_by_hod: payload[0]?.remark_by_hod,
          };
          const data2 = {
            total_ammount: payload[1]?.amount != null ? payload[1]?.amount : "",
            total_emi: payload[1]?.emi != null ? payload[1]?.emi : "",
            is_type: payload[1]?.is_type,
            emi_data: isValidJson(payload[1]?.emi_data),
            remark_by_emp: payload[1]?.remark_by_emp,
            remark_by_hod: payload[1]?.remark_by_hod,
          };
          if (Array.isArray(data1?.emi_data)) {
            setFsiRows(data1?.emi_data);
            setBackupFsiRows(data1?.emi_data);
          }

          if (Array.isArray(data2?.emi_data)) {
            setIcRows(data2?.emi_data);
            setBackupIcRows(data2?.emi_data);
          }

          reset({
            fsi_total_amount: data1?.fsi_total_amount,
            fsi_total_emi: data1?.fsi_total_emi,
            total_amount: data2?.total_ammount,
            total_emi: data2?.total_emi,
            remark_by_emp: data2?.remark_by_emp,
            remark_by_hod: data2?.remark_by_hod,
          });
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
    }
  }, []);

  console.log("enddarara==>",enddate)

  const onGenerateEmiForFsi = async (e) => {
    const value = parseInt(e.target.value);

    console.log(fsiRows?.length);

    console.log(value);

    if (value) {
      if (parseInt(value) > fsiRows?.length) {
        const add = parseInt(value) - parseInt(fsiRows?.length);

        const rows = [];

        for (let i = 0; i < add; i++) {
          rows.push({
            date: null,
            amount: null,
            show: 0,
            received_date: 0,
            document_path: null,
          });
        }
        setFsiRows((prevArray) => [...prevArray, ...rows]);
      } else {
        const sub = parseInt(fsiRows.length) - parseInt(value);
        console.log(sub);

        setFsiRows((prevArray) => prevArray.slice(0, -sub));
      }
    } else {
      setFsiRows([]);
    }
  };

  const onGenerateEmiForIc = async (e) => {
    const value = parseInt(e.target.value);
    console.log(icRows?.length);
    console.log(value);

    if (value) {
      if (parseInt(value) > icRows?.length) {
        const add = parseInt(value) - parseInt(icRows?.length);

        const rows = [];

        for (let i = 0; i < add; i++) {
          rows.push({
            date: null,
            amount: null,
            show: 0,
            received_date: 0,
            document_path: null,
          });
        }
        setIcRows((prevArray) => [...prevArray, ...rows]);
      } else {
        const sub = parseInt(icRows.length) - parseInt(value);
        console.log(sub);
        setIcRows((prevArray) => prevArray.slice(0, -sub));
      }
    } else {
      setIcRows([]);
    }
  };

  const onSkip = () => {
    SwalAlert({ title: "Do you want to skip?", confirmButtonText: "Skip!" })
      .then(async (result) => {
        if (result.isConfirmed) {
          await skipTheStage();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const skipTheStage = async () => {
    try {
      const res = await axios({
        method: skip_aminities.method,
        url: `${skip_aminities.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        toast.success(res?.data?.message);

        if (res?.data?.data?.skip == 1) {
          props.onUpdateMstStage(16);
          props.onchangeStage(16);
        } else {
          props.onchangeStage(16);
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
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
        getAllImportantFees.method,
        getAllImportantFees.url
      );
  
      if (!res.data.error) {
        setLoading(false);
  console.log("rsesrs==>",res)
        setStartDate(GetDate(res.data.data[0].created_at, "YYYY-MM-DD"));
      } else {
        setLoading(false);
      }
    } catch (err) {
      // toast.error(err.response.data.message);
      // if (err.response.data.error) {
      // }
    }
  };
  
    useEffect(() => {
      fetchData();
      fetchStartDate();
    }, []);
  
    const handleOptionsChanges = (e) => {
      setSelectedOptions(e.target.value);
    };

  return (
    <div class="grey-border rounded">
    <div className="card-header bg-white">
      <div className=" d-flex align-items-center justify-content-between">
            <h5 class="mb-0 font-weight-normal">F.S/I.C. - Amineties Fees</h5>
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
              <form>
                <h4>F.S.I ( Residential/Commercial (Sq.mt.))</h4>
    
                <div className="row">
                  <div className="col">
                    <label htmlFor="fsi_total_amount">F.S.I Total amount</label>
                    <input
                      type="text"
                      name="fsi_total_amount"
                      id="fsi_total_amount"
                      placeholder="Total amount"
                      {...register("fsi_total_amount", { required: true })}
                      disabled={superAccess() ? false : isFormDisabled}
                      className={formclass(errors?.fsi_total_amount)}
                    />
                    {displayError(errors?.fsi_total_amount?.message)}
                  </div>
                  <div className="col">
                    <label htmlFor="fsi_total_emi">F.S.I Total Emi</label>
                    <select
                      name="fsi_total_emi"
                      id="fsi_total_emi"
                      {...register("fsi_total_emi", { required: true })}
                      onChange={(e) => onGenerateEmiForFsi(e)}
                      disabled={superAccess() ? false : isFormDisabled}
                      className={formclass(errors?.fsi_total_emi)}
                    >
                      <option value="">--Select--</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="12">12</option>
                    </select>
                    {displayError(errors?.fsi_total_emi?.message)}
                  </div>
                </div>
    
                <div className="row">
                  <div className="col overflow-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Received Date</th>
                          <th>Show</th>
                          <th>Uploaded File</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* {Array.from(Array(fsiTotalRow), (e, i) => (
                                            <tr>
                                                <td>{i + 1}</td>
                                                <td>
                                                    <input type="date" className='form-control' name="" id="" />
                                                </td>
                                                <td>
                                                    <input type="text" className='form-control' name="" id="" placeholder='Amount' />
                                                </td>
                                                <td>
                                                    <input type="date" className='form-control' name="" id="" />
                                                </td>
                                                <td>
                                                    <input type="checkbox" name="" id="" />
                                                </td>
                                                <td>
                                                </td>
                                            </tr>
                                        ))} */}
    
                        {fsiRows.map((e, i) => (
                          <tr>
                            <td>{i + 1}</td>
                            <td>
                              <input
                                type="date"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(errors[`${i}_type1_date`])}
                                {...register(`${i}_type1_date`, { required: true })}
                                name={`${i}_type1_date`}
                                id={`${i}_date`}
                                defaultValue={
                                  e?.date
                                    ? GetDate(e?.date, "YYYY-MM-DD")
                                    : todayDate()
                                }
                              />
                              {displayError(errors[`${i}_type1_date`]?.message)}
                            </td>
                            <td style={{ display: "inline-block", width: "150px" }}>
                              <input
                                type="text"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(errors[`${i}_type1_amount`])}
                                {...register(`${i}_type1_amount`, {
                                  required: true,
                                })}
                                name={`${i}_type1_amount`}
                                id={`${i}_amount`}
                                defaultValue={e?.amount != null ? e?.amount : ""}
                              />
                              {displayError(errors[`${i}_type1_amount`]?.message)}
                            </td>
                            <td>
                              <input
                                type="date"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(
                                  errors[`${i}_type1_received_date`]
                                )}
                                {...register(`${i}_type1_received_date`, {
                                  required: true,
                                })}
                                name={`${i}_type1_received_date`}
                                id={`${i}_received_date`}
                                defaultValue={
                                  e?.received_date
                                    ? GetDate(e?.received_date, "YYYY-MM-DD")
                                    : todayDate()
                                }
                              />
                              {displayError(
                                errors[`${i}_type1_received_date`]?.message
                              )}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                disabled={superAccess() ? false : isFormDisabled}
                                {...register(`${i}_type1_show`, {
                                  required: false,
                                })}
                                name={`${i}_type1_show`}
                                id={`${i}_show`}
                                value={1}
                                defaultChecked={e?.show == 1 ? 1 : 0}
                              />
                              {displayError(errors[`${i}_type1_show`]?.message)}
                            </td>
                            <td>
                              <input
                                type="file"
                                disabled={superAccess() ? false : isFormDisabled}
                                {...register(`${i}_type1_doc`, { required: false })}
                                name={`${i}_type1_doc`}
                                id={`${i}_type1_doc`}
                              />
                              {displayError(errors[`${i}_type1_doc`]?.message)}
                            </td>
                            <td>
                              {e?.document_path ? (
                                <a
                                  href={`${FileUrl}/${e?.document_path}`}
                                  target={"_blank"}
                                >
                                  <ReactSVG
                                    src={`${eyeButtonSvg}`}
                                    wrapper="span"
                                    beforeInjection={(svg) => {
                                      svg.setAttribute("style", "width: 20px");
                                    }}
                                  />
                                </a>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot></tfoot>
                    </table>
                  </div>
                </div>
    
                <hr />
                <h4>I.C. Deposite/Aminitees Fees {"(Sq.mt.(As per Zone)"}</h4>
                <div className="row">
                  <div className="col">
                    <label htmlFor="total_amount">Total amount</label>
                    <input
                      type="text"
                      name="total_amount"
                      id="total_amount"
                      placeholder="Total amount"
                      {...register("total_amount", { required: false })}
                      disabled={superAccess() ? false : isFormDisabled}
                      className={formclass(errors?.total_amount)}
                    />
                    {displayError(errors?.total_amount?.message)}
                  </div>
                  <div className="col">
                    <label htmlFor="total_emi">Total Emi</label>
                    <select
                      name="total_emi"
                      id="total_emi"
                      {...register("total_emi", { required: false })}
                      onChange={(e) => onGenerateEmiForIc(e)}
                      disabled={superAccess() ? false : isFormDisabled}
                      className={formclass(errors?.total_emi)}
                    >
                      <option value="">--Select--</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="12">12</option>
                    </select>
                    {displayError(errors?.total_emi?.message)}
                  </div>
                </div>
    
                <div className="row">
                  <div className="col overflow-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Sr. No.</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Received Date</th>
                          <th>Show</th>
                          <th>Uploaded File</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {icRows.map((e, i) => (
                          <tr>
                            <td>{i + 1}</td>
                            <td>
                              <input
                                type="date"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(errors[`${i}_type2_date`])}
                                {...register(`${i}_type2_date`, { required: true })}
                                name={`${i}_type2_date`}
                                id={`${i}_date`}
                                defaultValue={
                                  e?.date
                                    ? GetDate(e?.date, "YYYY-MM-DD")
                                    : todayDate()
                                }
                              />
                              {displayError(errors[`${i}_type2_date`]?.message)}
                            </td>
                            <td style={{ display: "inline-block", width: "150px" }}>
                              <input
                                type="text"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(errors[`${i}_type2_amount`])}
                                {...register(`${i}_type2_amount`, {
                                  required: true,
                                })}
                                name={`${i}_type2_amount`}
                                id={`${i}_amount`}
                                defaultValue={e?.amount != null ? e?.amount : ""}
                              />
                              {displayError(errors[`${i}_type2_amount`]?.message)}
                            </td>
                            <td>
                              <input
                                type="date"
                                disabled={superAccess() ? false : isFormDisabled}
                                className={formclass(
                                  errors[`${i}_type2_received_date`]
                                )}
                                {...register(`${i}_type2_received_date`, {
                                  required: true,
                                })}
                                name={`${i}_type2_received_date`}
                                id={`${i}_received_date`}
                                defaultValue={
                                  e?.received_date
                                    ? GetDate(e?.received_date, "YYYY-MM-DD")
                                    : todayDate()
                                }
                              />
                              {displayError(
                                errors[`${i}_type2_received_date`]?.message
                              )}
                            </td>
                            <td>
                              <input
                                type="checkbox"
                                disabled={superAccess() ? false : isFormDisabled}
                                {...register(`${i}_type2_show`, {
                                  required: false,
                                })}
                                name={`${i}_type2_show`}
                                id={`${i}_show`}
                                value={1}
                                defaultChecked={e?.show == 1 ? true : false}
                              />
                              {displayError(errors[`${i}_type2_show`]?.message)}
                            </td>
                            <td>
                              <input
                                type="file"
                                //  disabled={superAccess() ? false : isFormDisabled}
                                {...register(`${i}_type2_doc`, { required: false })}
                                name={`${i}_type2_doc`}
                                id={`${i}_type2_doc`}
                              />
                              {displayError(errors[`${i}_type2_doc`]?.message)}
                            </td>
                            <td>
                              {e?.document_path ? (
                                <a
                                  href={`${FileUrl}/${e?.document_path}`}
                                  target={"_blank"}
                                >
                                  <ReactSVG
                                    src={`${eyeButtonSvg}`}
                                    wrapper="span"
                                    beforeInjection={(svg) => {
                                      svg.setAttribute("style", "width: 20px");
                                    }}
                                  />
                                </a>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot></tfoot>
                    </table>
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
                  </div>
                </div>
                <div
                  className="row mt-3"
                  style={{ justifyContent: "space-around" }}
                >
                  <button type="button" onClick={() => onSave(0)} className="btn">
                    Save
                  </button>
                </div>
                {/* {superAccess() ? ( */}
                  <div
                    className="row mt-3"
                    style={{ justifyContent: "space-around" }}
                  >
                    {!isFormDisabled ? (
                      <>
                        {/* <button
                          type="button"
                          onClick={() => onSkip()}
                          className="btn"
                        >
                          Skip
                        </button> */}
                        <button
                          type="button"
                          onClick={() => onSave(1)}
                          className="btn"
                        >
                          Save & Next
                        </button>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                {/* ) : [empKey].includes(getRole()) && !isFormDisabled ? (
                  <div> */}
                    {/* <button type='button' onClick={()=>onSave(0)} className='btn'>Save</button> */}
                    {/* <button type='button' onClick={()=>onSkip()} className='btn'>Skip</button>
                                               <button  type='button'  onClick={()=>onSave(1)} className='btn'>Save & Next</button> */}
                  {/* </div>
                ) : (
                  ""
                )} */}
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
    
    export default FS_IC_Amineties_fees;
    