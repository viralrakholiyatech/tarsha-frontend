import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import ApiService from "../../../../services/ApiService";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { useNavigate, NavLink, Link, useParams } from "react-router-dom";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { GetDate, todayDate } from "../../../../services/DateAndTimeService";
import { customerKey } from "../../../../config/RoleConfig";
import {
  deleteAllImportantFees,
  getAllImportantFees,
  getAssistantJuniorEngineer,
  getDeputyCommissioner,
  getCommissioner,
  getZonalOfficer,
  saveAllImportantFees,
  sendAssistantJuniorEngineer,
  sendDeputyCommissioner,
  sendDeputyEngineer,
  sendZonalOfficer,
  skip_allImportantFees,
} from "../../../../config/config";
import {
  closeButtonSvg,
  dustbinButton,
  eyeButtonSvg,
  FileUrl,
} from "../../../../config/file_url";
import axios from "axios";
import { AuthHeader } from "../../../../services/FormCommon";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { adminKey, HoD, empKey } from "../../../../config/RoleConfig";
import {
  getRole,
  getToken,
  isAdmin,
  isCust,
  superAccess,
  ishod,
  isEmp
} from "../../../../services/useLocalStorage";
import { ReactSVG } from "react-svg";

const formname = "userform";
const All_important_fees = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [selectedOptions, setSelectedOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSave, setIsSave] = useState(0);
  const [isFormDisabled, setFormDisabled] = useState(0);
  const [filepath, setFilePath] = useState("");
  const [data, setData] = useState([]);
  const [card, setCard] = useState("");
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

  const { append, remove, fields } = useFieldArray({
    name: formname,
    control,
  });

  const onSave = async () => {
    try {
      const validate = await trigger();
      if (validate) {
        const values = getValues()[`${formname}`];
        const formData = new FormData();
        const arr = [];

        let i = 0;
        for (var e of values) {
          let obj = {
            index: i,
            id: e?.id,
            mst_file_id: params?.id,
            mst_type_id: e?.mst_type_id,
            approved_by_hod: selectedOptions,
            startdates:startdate,
            remark_by_emp: e?.remark_by_emp, // Bind remark_by_emp
            remark_by_hod: e?.remark_by_hod,
            show_website: e?.show_website,
            description: e?.description,
            amount: e?.amount,
            date: e?.date,
            card:card,
          };

          if (e?.file_doc != undefined) {
            const file = e?.file_doc[0] ? e?.file_doc[0] : "";
            if (file) {
              // obj = {...obj,file_doc:file}
              formData.append(`${i}_file`, file);
            }
          }

          arr.push(obj);

          i++;
        }

        formData.append("data", JSON.stringify(arr));
        formData.append("is_save", 0);

        console.log(arr);

        await onSubmit(formData);
      }
    } catch (err) {
      console.log(err);
      toast.error("Unable to submit the form");
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      data.append("remark_by_emp", getValues("remark_by_emp"));
      data.append("startdates", startdate);
      data.append("remark_by_hod", getValues("remark_by_hod"));
      data.append("approved_by_hod", selectedOptions);
      data.append("card", card);
      const res = await axios({
        method: saveAllImportantFees.method,
        url: saveAllImportantFees.url,
        headers: AuthHeader({ ["Content-Type"]: "multipart/form-data" }),
        data: data,
      });

      if (!res?.data?.error) {
        setLoading(false);
        if (res?.data?.is_save == 1) {
          props.onUpdateMstStage(15);
          props.onchangeStage(15);
        } else {
          reset({});
          await fetchData();
        }

        toast.success(res?.data?.message);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Unable to submit the form");
    }
  };

  const onSaveAndNext = async () => {
    SwalAlert({
      confirmButtonText: "Continue",
      title: "Do you wanna save & continue?",
    })
      .then(async (result) => {
        if (result?.isConfirmed) {
          const validate = await trigger();

          if (validate) {
            const values = getValues()[`${formname}`];
            const formData = new FormData();

            let i = 0;

            const arr = [];
            for (var e of values) {
              let obj = {
                index: i,
                id: e?.id,
                mst_file_id: params?.id,
                mst_type_id: e?.mst_type_id,
                show_website: e?.show_website,
                description: e?.description,
                approved_by_hod: selectedOptions,
                remark_by_emp: e?.remark_by_emp, // Bind remark_by_emp
                remark_by_hod: e?.remark_by_hod,
                startdates:startdate,
                amount: e?.amount,
                date: e?.date,
              };

              if (e?.file_doc != undefined) {
                const file = e?.file_doc[0] ? e?.file_doc[0] : "";
                if (file) {
                  // obj = {...obj,file_doc:file}
                  formData.append(`${i}_file`, file);
                }
              }

              arr.push(obj);
              i++;
            }

            formData.append("data", JSON.stringify(arr));
            formData.append("is_save", 1);

            console.log(arr);

            await onSubmit(formData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };
  // const onSkip = async () =>{
  //     SwalAlert({confirmButtonText:"Skip",title:"Do you wanna Skip the stage (14) All important fees"}).then(async(result)=>{
  //         if(result?.isConfirmed){
  //             await skipTheStage();
  //         }
  //       }).catch((err)=>{
  //           console.log(err);
  //       });
  // }

  // const skipTheStage = async () =>{
  //     try{
  //         setLoading(true);
  //         const res = await axios({
  //             method:skip_allImportantFees.method,
  //             url:`${skip_allImportantFees.url}/${params?.id}`,
  //             headers:AuthHeader()
  //         })

  //         if(!res?.data?.error){
  //             setLoading(false);
  //             toast.success(res?.data?.message);
  //             if(res?.data?.data?.skip==1)
  //             {
  //                 props.onUpdateMstStage(15);
  //                 props.onchangeStage(15);
  //             }
  //             else
  //             {
  //                 props.onchangeStage(15);
  //             }

  //         }
  //         else
  //         {
  //             setLoading(false);
  //             toast.error(res?.data?.message);
  //         }

  //     }
  //     catch(err){
  //         setLoading(false);
  //         console.log(err);
  //         toast.error("Something went wrong");
  //     }
  // }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios({
        method: getAllImportantFees.method,
        url: `${getAllImportantFees.url}/${params.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
        const rows = [];

        const disabled = payload.some((p) => p.is_save == 1);

        console.log(payload);

        console.log(`Form disabled ${disabled}`);
        setSelectedOptions(payload[0].approved_by_hod=== 1 ? "Yes" : "No");
        setEndDate(GetDate(payload[0]?.created_at, "YYYY-MM-DD"));
        setCard(payload[0].card)
        setFormDisabled(disabled);
        if (payload.length > 0) {
          setValue("remark_by_emp", payload[0]?.remark_by_emp);
          setValue("remark_by_hod", payload[0]?.remark_by_hod);
        }

        payload.forEach((e, i) => {
          rows.push({
            id: e?.id,
            mst_type_id: e?.mst_type_id,
            show_website: e?.show_website,
            description: e?.description,
            amount: e?.amount != null ? e?.amount : "",
            date: e?.date ? GetDate(e?.date, "YYYY-MM-DD") : todayDate(),
            file: e?.file ? e?.file : "",
            remark_by_emp: e?.remark_by_emp, // Bind remark_by_emp
            remark_by_hod: e?.remark_by_hod,
          });
        });

        append(rows);
      } else {
        setLoading(false);
        toast.error(res?.data?.error);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
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
        getCommissioner.method,
        getCommissioner.url
      );
 
      if (!res.data.error) {
        setLoading(false);
console.log("rsesrs==>",res)
        setStartDate(GetDate(res.data.data2[0].created_at, "YYYY-MM-DD"));
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

  const setIsActive = (e, index) => {
    console.log(e.target.checked);
    setValue(`${formname}[${index}].show_website`, e.target.checked ? 1 : 0);
    console.log(getValues(`${formname}[${index}].show_website`));
  };

  const setDataValue = (e, index) => {
    setValue(`${formname}[${index}].date`, e.target.value);
  };

  const addForm = () => {
    append({
      id: null,
      mst_type_id: null,
      mst_file_id: params?.id,
      amount: "",
      date: todayDate(),
      show_website: 0,
      file: null,
      remark_by_emp: "",
      remark_by_hod: "",
      approved_by_hod: selectedOptions,
    });
  };

  const onDelete = (index, id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result?.isConfirmed) {
          await deleteRow(index, id);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteRow = async (index, id) => {
    try {
      setLoading(true);
      const res = await axios({
        method: deleteAllImportantFees.method,
        url: `${deleteAllImportantFees.url}/${id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        remove(index);
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

  return (
    <div class="grey-border rounded">
    <div className="card-header bg-white">
      <div className=" d-flex align-items-center justify-content-between">
        <h5 class="mb-0 font-weight-normal">All Important Fees</h5>
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
              <table className="table">
                <thead>
                  <tr>
                    <th>Show on website</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>File Upload</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((value, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          name={`${formname}[${index}].show_website`}
                          id={`${formname}[${index}].show_website`}
                          {...register(`${formname}[${index}].show_website`)}
                          defaultChecked={
                            value?.show_website == 1 ? true : false
                          }
                          // disabled={false}
                          disabled={superAccess() ? false : isFormDisabled}
                          onChange={(e) => setIsActive(e)}
                        />
                      </td>
                      <td>
                        {getValues(`${formname}[${index}].mst_type_id`) ==
                        null ? (
                          <React.Fragment>
                            <input
                              type="text"
                              name={`${formname}[${index}].description`}
                              id={`${formname}[${index}].description`}
                              className={formclass(
                                errors?.userform?.[index]?.description
                              )}
                              {...register(
                                `${formname}[${index}].description`,
                                { required: true }
                              )}
                              disabled={superAccess() ? false : isFormDisabled}
                              defaultValue={
                                value?.description != null
                                  ? value?.description
                                  : ""
                              }
                            />
                            {displayError(
                              errors?.userform?.[index]?.description?.message
                            )}
                          </React.Fragment>
                        ) : (
                          value?.description
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          name={`${formname}[${index}].amount`}
                          id={`${formname}[${index}].amount`}
                          className={formclass(
                            errors?.userform?.[index]?.amount
                          )}
                          {...register(`${formname}[${index}].amount`, {
                            required: true,
                          })}
                          disabled={superAccess() ? false : isFormDisabled}
                          defaultValue={
                            value?.amount != null ? value?.amount : ""
                          }
                          // disabled={false}
                        />
                        {displayError(
                          errors?.userform?.[index]?.amount?.message
                        )}
                      </td>
                      <td>
                        <input
                          type="date"
                          name={`${formname}[${index}].date`}
                          id={`${formname}[${index}].date`}
                          {...register(`${formname}[${index}].date`, {
                            required: true,
                          })}
                          className={formclass(errors?.userform?.[index]?.date)}
                          onChange={(e) => setDataValue(e)}
                          disabled={superAccess() ? false : isFormDisabled}
                          defaultValue={
                            value?.date
                              ? GetDate(value?.date, "YYYY-MM-DD")
                              : todayDate()
                          }
                        />
                        {displayError(errors?.userform?.[index]?.date?.message)}
                      </td>
                      <td>
                        <input
                          type="file"
                          name={`${formname}[${index}].file_doc`}
                          id={`${formname}[${index}].file_doc`}
                          className={formclass(
                            errors?.userform?.[index]?.file_doc
                          )}
                          disabled={superAccess() ? false : isFormDisabled}
                          {...register(`${formname}[${index}].file_doc`, {
                            required: false,
                          })}
                          style={{ height: "auto" }}
                        />
                        {displayError(
                          errors?.userform?.[index]?.file_doc?.message
                        )}
                      </td>

                      <td className="d-flex align-items-center">
                        {getValues(`${formname}[${index}].file`) ? (
                          <>
                            <a
                              href={`${FileUrl}/${value?.file}`}
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
                          </>
                        ) : (
                          ""
                        )}
                        {getValues(`${formname}[${index}].id`) == null ? (
                          <button
                            type="button"
                            className="bg-transparent border-0"
                            onClick={() => remove(index)}
                          >
                            <ReactSVG
                              src={`${closeButtonSvg}`}
                              wrapper="span"
                              beforeInjection={(svg) => {
                                svg.setAttribute("style", "width: 20px");
                              }}
                            />
                          </button>
                        ) : getValues(`${formname}[${index}].mst_type_id`) ==
                          null ? (
                          <button
                            type="button"
                            className="bg-transparent border-0"
                            onClick={() =>
                              onDelete(
                                index,
                                getValues(`${formname}[${index}].id`)
                              )
                            }
                          >
                            <ReactSVG
                              src={`${dustbinButton}`}
                              wrapper="span"
                              beforeInjection={(svg) => {
                                svg.setAttribute("style", "width: 20px");
                              }}
                            />
                          </button>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>{" "}
              
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
                  <button type="button" className="btn" onClick={addForm}>
                    Add
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={onSave}
                    {...register("is_save")}
                    value={0}
                  >
                    Save
                  </button>

                  {/* <button type="button" className='btn' onClick={onSkip}>Skip</button> */}

                  <button type="button" className="btn" onClick={onSaveAndNext}>
                    Save & next
                  </button>
                </div>
              ) : [empKey].includes(getRole()) && !isFormDisabled ? (
                <div>
                  <button type="button" className="btn" onClick={addForm}>
                    Add
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={onSave}
                    {...register("is_save")}
                    value={0}
                  >
                    Save
                  </button>

                  {/* <button type="button" className='btn' onClick={onSkip}>Skip</button> */}

                  <button type="button" className="btn" onClick={onSaveAndNext}>
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

export default All_important_fees;
