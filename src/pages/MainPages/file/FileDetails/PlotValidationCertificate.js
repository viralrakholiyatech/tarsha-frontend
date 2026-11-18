import React, { useState, useEffect, useCallback } from "react";
import {
  getRole,
  getToken,
  getUserId,
} from "../../../../services/useLocalStorage";
import {
  addDaysFromDays,
  GetDate,
  parseDate,
  todayDate,
} from "../../../../services/DateAndTimeService";
import ApiService from "../../../../services/ApiService";
import {
  file_plot_validation,
  getTypesOfPlotValidation,
  get_file_plot_validation,
  lisoner,
  planner,
  reject_file_plot,
  test_documents,
} from "../../../../config/config";
import useValidator from "../../../../services/Validation";
import { FileUrl } from "../../../../config/file_url";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { adminKey, customerKey, empKey } from "../../../../config/RoleConfig";
import { useNavigate } from "react-router-dom";
import { FilesRoute } from "../../../../config/RouteConfig";
import { useForm, useFieldArray } from "react-hook-form";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import moment from "moment";

//4.PlotValidationCertificate
const PlotValidationCertificate = (props) => {
  var header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const formname = "plotvalidation";
  const {
    register,
    control,
    reset,
    getValues,
    trigger,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: "onChange",
  });

  const { append, remove, fields } = useFieldArray({
    name: formname,
    control,
  });

  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [plotValidationData, setPlotValidationData] = useState([]);
  const [newplotValidationData, setnewPlotValidationData] = useState([]);
  const [assign_to, setAssign_to] = useState("");
  const [lisonerdata, setLisonerdata] = useState([]);
  const [plannerdata, setPlannerdata] = useState([]);
  const [total_length, setTotalLength] = useState(0);
  const [document_file, setDocument_file] = useState("");
  const [formAccessible, setFormAccessible] = useState(true);
  const [allIsSave, setAllIsSave] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const onSubmit = async (data) => {
    console.log(data);
    console.log(getValues()[`${formname}`]);

    const submittedData = getValues()[`${formname}`];

    console.log(submittedData);

    const formData = new FormData();

    let outwardLast = false;

    var data_arr = [];
    for (let e of submittedData) {
      let obj = {};

      if (e?.inward_visibility) {
        obj = {
          mst_file_id: props.id,
          mst_type_id: e.mst_type_id,
          inward_no: e.inward_no,
          inward_date: e.inward_date,
          is_save: 1,
          type: 1,
        };

        //Avoid assign_to if inward is not the accessible
        if (!e.inward_accessible) {
          obj.assign_to = parseInt(e.assign_to);
        } else {
          obj.assign_to = assign_to;
        }

        data_arr.push(obj);
      }

      if (e?.outward_visibility) {
        obj = {
          mst_file_id: props.id,
          mst_type_id: e.mst_type_id,
          outward_no: e.outward_no,
          outward_date: e.outward_date,
          documents: e.documents,
          is_save: 1,
          type: 2,
          document_upload_date: e?.document_upload_date,
        };

        //Avoid assign_to if outward is not the accessible
        if (!e?.outward_accessible && !e?.inward_accessible) {
          obj.assign_to = e["preserved_assign_to"];
          console.log(`If condition---${e.mst_type_id}-${obj.assign_to}`);
        } else if (e?.outward_accessible) {
          obj.assign_to = assign_to;

          if (document_file) {
            formData.append("documents", document_file);
            console.log(formData.get("documents"));
            obj.isDocument = 1;
          }

          outwardLast = e?.outward_accessible;
          console.log(`Else condition---${e.mst_type_id}-${obj.assign_to}`);
        }

        data_arr.push(obj);
      }
    }

    formData.append("team_id", parseInt(assign_to));

    if (data_arr.length == total_length * 2 && outwardLast) {
      formData.append("isLastStage", 1);
    } else {
      formData.append("isLastStage", 0);
    }

    if (getValues("assign_planner")) {
      console.log(getValues("assign_planner"));
      formData.append("assign_planner", getValues("assign_planner"));
    }

    formData.append("plotData", JSON.stringify(data_arr));

    try {
      closeModal();
      setLoading(true);
      const thisHeader = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "multipart/form-data",
      };
      const res = await ApiService(
        formData,
        0,
        thisHeader,
        file_plot_validation.method,
        file_plot_validation.url
      );
      if (!res.data.error) {
        setDocument_file("");
        setAssign_to("");
        toast.success(res.data.message);
        setLoading(false);
        const payload = res?.data?.data;
        if (data_arr.length == total_length * 2 && outwardLast) {
          if (parseInt(payload?.newStageId) !== NaN) {
            props.onUpdateMstStage(parseInt(payload?.newStageId));
            props.onchangeStage(parseInt(payload?.newStageId));
          } else {
            localStorage.getItem("lastPath")
              ? navigate(`/${localStorage.getItem("lastPath")}`)
              : navigate(`/${FilesRoute.listFileOnline}`);
            // props.onUpdateMstStage(5);
            // props.onchangeStage(5);
          }

          if ([empKey].includes(getRole())) {
            if (assign_to != getUserId()) {
              localStorage.getItem("lastPath")
                ? navigate(`/${localStorage.getItem("lastPath")}`)
                : navigate(`/${FilesRoute.listFileOnline}`);
              // navigate(`/${FilesRoute.list}`);
            }
          }
        } else {
          if ([empKey].includes(getRole())) {
            if (assign_to != getUserId()) {
              localStorage.getItem("lastPath")
                ? navigate(`/${localStorage.getItem("lastPath")}`)
                : navigate(`/${FilesRoute.listFileOnline}`);
              // navigate(`/${FilesRoute.list}`);
            } else {
              fetchPlotValidation();
            }
          } else {
            fetchPlotValidation();
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

  const handleInput = (e, index) => {
    setValue(`${formname}[${parseInt(index) + 1}].inward_date`, e.target.value);
  };

  const fetchPlotValidation = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        props.id,
        header,
        get_file_plot_validation.method,
        get_file_plot_validation.url
      );
      if (!res.data.error) {
        setLoading(false);
        const data1 = res.data?.data1;
        const data2 = res.data?.data2;

        if (res.data?.maxvalue > 0) {
          console.log("Got it...");
          setnewPlotValidationData(data2);
        }
        setPlotValidationData(data1);
      } else {
        setLoading(false);
        if (res.data?.dberror) {
          toast.error(res.data?.message);
          setFormAccessible(false);
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const fetchMstTypes = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        0,
        header,
        getTypesOfPlotValidation.method,
        getTypesOfPlotValidation.url
      );
      if (!res.data.error) {
        const data = res.data.data;
        let type_data = data
          .filter((value) => {
            return (
              value.types.split("_")[2] ==
              (props.plotTypes == "1" ? "draft" : "final")
            );
          })
          .map((value, index) => {
            if (!index) {
              return {
                inward_visibility: true,
                outward_visibility: false,
                inward_accessible: true,
                outward_accessible: false,
                document_visibility: false,
                mst_type_id: value.id,
                title: value.type_name,
                inward_no: "",
                inward_date: todayDate(),
                outward_no: "",
                outward_date: todayDate(),
                documents: "",
                document_upload_date: todayDate(),
                assign_to: "",
                inward_assign_name: "",
                outward_assign_name: "",
              };
            } else {
              return {
                inward_visibility: false,
                outward_visibility: false,
                inward_accessible: false,
                outward_accessible: false,
                document_visibility: false,
                mst_type_id: value.id,
                title: value.type_name,
                inward_no: "",
                inward_date: todayDate(),
                outward_no: "",
                outward_date: todayDate(),
                documents: "",
                document_upload_date: todayDate(),
                assign_to: "",
                inward_assign_name: "",
                outward_assign_name: "",
              };
            }
          });
        append(type_data);
        setTypes(type_data);
        setTotalLength(type_data.length);
        setLoading(false);
        fetchPlotValidation();
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  const fetchLisoner = useCallback(async () => {
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
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  }, []);

  const fetchPlanner = useCallback(async () => {
    try {
      const res = await ApiService(
        null,
        0,
        header,
        planner.method,
        planner.url
      );
      if (!res?.data?.error) {
        setPlannerdata(res?.data?.data);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  }, []);

  const rejectButton = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        { mst_file_id: props.id, reason: getValues("reason") },
        0,
        header,
        reject_file_plot.method,
        reject_file_plot.url
      );
      if (!res.data.error) {
        setLoading(false);
        toast.success(res.data.message);
        const team_id = res.data.data?.team_id;
        if (
          parseInt(team_id) === parseInt(getUserId()) ||
          [adminKey].includes(getRole())
        ) {
          closeRejectForm();
          reset({});

          setTypes((prevState) =>
            prevState.map((e, i) => {
              if (i) {
                return {
                  ...e,
                  inward_visibility: false,
                  outward_visibility: false,
                  inward_accessible: false,
                  outward_accessible: false,
                };
              } else {
                return {
                  ...e,
                  inward_visibility: true,
                  outward_visibility: false,
                  inward_accessible: true,
                  outward_accessible: false,
                };
              }
            })
          );

          console.log("types after rejected: " + JSON.stringify(types));
          setIsReset(true);
        } else {
          setLoading(false);
          navigate(`/${FilesRoute.list}`);
        }
      } else {
        closeRejectForm();
        setLoading(false);
        toast.error(res.data.message);
      }
    } catch (err) {
      closeRejectForm();
      setLoading(false);
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

  const resetTheForm = (data) => {
    append(data);
  };

  const closeModal = () => {
    document.getElementById("close").click();
  };

  const closeRejectForm = () => {
    try {
      document.getElementById("close_reject_form").click();
    } catch (err) {
      console.log(err);
    }
  };

  const openModal = async () => {
    const result = await trigger();
    if (result) {
      document.getElementById("openModal").click();
    }
  };

  useEffect(() => {
    fetchMstTypes();
    fetchLisoner();
    fetchPlanner();
  }, []);

  const sanitizeDate = (date) => {
    return date ? GetDate(date, "YYYY-MM-DD") : todayDate();
  };

  useEffect(() => {
    if (plotValidationData.length > 0 && Array.isArray(plotValidationData)) {
      const newArray = [...types];
      var flag = 0;

      var is_save_id = 0;
      var outward_is_save = 0;
      var isSaveArr = [];

      console.log(newplotValidationData);

      const existNewData = newplotValidationData.length;

      plotValidationData.forEach((data1, data1_index) => {
        newArray.forEach((newArrayData, newArray_index) => {
          if (newArrayData.mst_type_id == data1.mst_type_id) {
            if (parseInt(data1.type) === 1) {
              newArrayData.inward_no = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].is_save
                    ? newplotValidationData[data1_index].inward_no
                    : data1.inward_no
                  : data1.inward_no
                : data1.inward_no;
              newArrayData.inward_date = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].is_save
                    ? sanitizeDate(
                        newplotValidationData[data1_index].inward_date
                      )
                    : sanitizeDate(data1.inward_date)
                  : sanitizeDate(data1.inward_date)
                : sanitizeDate(data1.inward_date);

              //if is_save==1 then set readonly mode to inward
              newArrayData.inward_accessible = !existNewData
                ? data1.is_save
                  ? false
                  : true
                : newplotValidationData[data1_index].is_save
                ? false
                : true;
              is_save_id = !existNewData
                ? data1.is_save
                : newplotValidationData[data1_index].is_save;

              newArrayData.assign_to = !existNewData
                ? data1.assign_to
                  ? data1.assign_to
                  : null
                : newplotValidationData[data1_index].assign_to
                ? newplotValidationData[data1_index].assign_to
                : null;
              newArrayData.inward_assign_name = !existNewData
                ? data1?.assign_name
                : newplotValidationData[data1_index]?.assign_name;
            } else if (parseInt(data1.type) === 2) {
              newArrayData.outward_no = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].is_save
                    ? newplotValidationData[data1_index].outward_no
                    : data1.outward_no
                  : data1.outward_no
                : data1.outward_no;
              newArrayData.outward_date = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].is_save
                    ? sanitizeDate(
                        newplotValidationData[data1_index].outward_date
                      )
                    : sanitizeDate(data1.outward_date)
                  : sanitizeDate(data1.outward_date)
                : sanitizeDate(data1.outward_date);

              //if is_save==1 then open outward section
              newArrayData.outward_visibility = is_save_id ? true : false;
              newArrayData.outward_accessible =
                is_save_id &&
                (!existNewData
                  ? !data1.is_save
                  : !newplotValidationData[data1_index].is_save)
                  ? true
                  : false;

              newArrayData.document_visibility = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].documents
                    ? true
                    : data1.documents
                    ? true
                    : false
                  : data1.documents
                  ? true
                  : false
                : data1.documents
                ? true
                : false;
              newArrayData.documents = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].documents
                    ? newplotValidationData[data1_index].documents
                    : data1.documents
                    ? data1.documents
                    : ""
                  : data1.documents
                  ? data1.documents
                  : ""
                : data1.documents
                ? data1.documents
                : "";

              newArrayData.document_upload_date = data1.is_rejected
                ? existNewData
                  ? newplotValidationData[data1_index].is_save
                    ? sanitizeDate(
                        newplotValidationData[data1_index]?.document_upload_date
                      )
                    : sanitizeDate(data1?.document_upload_date)
                  : sanitizeDate(data1?.document_upload_date)
                : sanitizeDate(data1?.document_upload_date);

              newArrayData.outward_assign_name = !existNewData
                ? data1?.assign_name
                : newplotValidationData[data1_index]?.assign_name;

              newArrayData["preserved_assign_to"] = data1.assign_to;

              outward_is_save = !existNewData
                ? data1?.is_save
                : newplotValidationData[data1_index]?.is_save;

              if (parseInt(outward_is_save) === 1) {
                flag = parseInt(newArrayData.mst_type_id) + 1;
              }

              outward_is_save = 0;
              is_save_id = 0;
            }
          }

          //Don't change this condition otherwise next section won't be opened
          if (flag != 0 && flag == newArrayData.mst_type_id) {
            newArrayData.inward_visibility = true;
            newArrayData.inward_accessible = true;
            newArrayData.outward_accessible = true;
            newArrayData.outward_visibility = false;
            flag = 0;
          }
        });

        isSaveArr.push(
          data1.is_rejected
            ? existNewData
              ? newplotValidationData[data1_index].is_save
              : data1.is_save
            : data1.is_save
        );
      });

      setAllIsSave(isSaveArr);
      setTypes(newArray);
      reset({});
      append(newArray);
    }
  }, [plotValidationData]);

  const onFileInput = (e, index) => {
    const file = e.target.files[0];
    console.log("OnFileInput: " + file);
    if (file) {
      setDocument_file(file);
    } else {
      setDocument_file("");
    }
  };

  const isCustomer = () => {
    try {
      return [customerKey].includes(getRole());
    } catch (err) {
      return false;
    }
  };

  const isAdmin = () => {
    try {
      return [adminKey].includes(getRole());
    } catch (err) {
      return false;
    }
  };

  const nextDays = (num = 7) => {
    try {
      return parseDate(addDaysFromDays(todayDate(), num));
    } catch (err) {
      return "";
    }
  };

  useEffect(() => {
    if (isReset) {
      resetTheForm(types);
      setIsReset(false);
    }
  }, [isReset]);

  useEffect(() => {
    const isAllSave = allIsSave.every((e) => parseInt(e) === 1);
    if (total_length && isAllSave && allIsSave.length === total_length * 2) {
      console.log("Length" + allIsSave.length);
      console.log("My-Length" + total_length);
      if (isAdmin()) {
        setFormAccessible(true);
      } else {
        setFormAccessible(false);
      }
    } else {
      if ([customerKey].includes(getRole())) {
        setFormAccessible(false);
      } else if (isAdmin()) {
        setFormAccessible(true);
      } else {
        setFormAccessible(true);
      }
    }
  }, [allIsSave]);

  return (
    <div class="grey-border rounded">
      <div class="card-header bg-white">
        <h5 class="mb-0 font-weight-normal">Plot Validation Certificate</h5>
        {/* <div>{JSON.stringify(getValues())}</div> */}
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-check-inline">
              <label htmlFor="draft" className="form-check-label">
                <input
                  type="radio"
                  name="draft/final"
                  id="draft"
                  className="form-check-input"
                  disabled={true}
                  checked={props.plotTypes == 1 ? true : false}
                />
                Draft
              </label>
            </div>

            <div className="form-check-inline">
              <label htmlFor="final" className="form-check-label">
                <input
                  type="radio"
                  name="draft/final"
                  id="final"
                  className="form-check-input"
                  disabled={true}
                  checked={props.plotTypes == 2 ? true : false}
                />
                Final
              </label>
            </div>

            {fields.map((field, index, fields) => (
              <div>
                {field.inward_visibility && (
                  <div>
                    {index ? <hr></hr> : ""}
                    <h3>{field.title}</h3>
                    <div className="row">
                      <div className="col">
                        <div className="form-group row">
                          <label
                            htmlFor={`${formname}[${index}].inward_no`}
                            class="col-sm-2"
                          >
                            Inward No.
                          </label>
                          <div className="col">
                            <input
                              type="text"
                              defaultValue={field.inward_no}
                              {...register(`${formname}[${index}].inward_no`, {
                                required: "Inward no. is required",
                              })}
                              name={`${formname}[${index}].inward_no`}
                              id={`${formname}[${index}].inward_no`}
                              placeholder="Inward no."
                              // readOnly={isCustomer()?true :!field.inward_accessible}
                              readOnly={
                                isCustomer()
                                  ? true
                                  : isAdmin()
                                  ? false
                                  : !field.inward_accessible
                              }
                              className={formclass(
                                errors[`${formname}`]?.[index]?.inward_no
                              )}
                            />
                            {errors[`${formname}`]?.[index]?.inward_no &&
                              displayError(
                                errors[`${formname}`]?.[index]?.inward_no
                                  .message
                              )}
                          </div>
                          <label
                            htmlFor={`${formname}[${index}].inward_date`}
                            class="col-sm-2"
                          >
                            Inward Date
                          </label>
                          <div className="col">
                            <input
                              type="date"
                              id={`${formname}[${index}].inward_date`}
                              name={`${formname}[${index}].inward_date`}
                              {...register(
                                `${formname}[${index}].inward_date`,
                                {
                                  required: "Inward date. is required",
                                }
                              )}
                              defaultValue={field.inward_date}
                              // readOnly={isCustomer() ? true :!field.inward_accessible}
                              readOnly={
                                isCustomer()
                                  ? true
                                  : isAdmin()
                                  ? false
                                  : !field.inward_accessible
                              }
                              className={formclass(
                                errors[`${formname}`]?.[index]?.inward_date
                              )}
                            />
                            {errors[`${formname}`]?.[index]?.inward_date &&
                              displayError(
                                errors[`${formname}`]?.[index]?.inward_date
                                  .message
                              )}
                          </div>
                        </div>

                        {field?.inward_assign_name ? (
                          <>
                            Assigned to: <u>{field?.inward_assign_name}</u>
                          </>
                        ) : (
                          ""
                        )}

                        {field.outward_visibility && (
                          <>
                            <div className="form-group row">
                              <label
                                htmlFor={`${formname}[${index}].outward_no`}
                                class="col-sm-2"
                              >
                                Outward No.
                              </label>
                              <div className="col">
                                <input
                                  type="text"
                                  id={`${formname}[${index}].outward_no`}
                                  name={`${formname}[${index}].outward_no`}
                                  defaultValue={field.outward_no}
                                  placeholder="Outward no."
                                  {...register(
                                    `${formname}[${index}].outward_no`,
                                    {
                                      required: "Outward no. is required",
                                    }
                                  )}
                                  // readOnly={isCustomer()?true :!field.outward_accessible}
                                  readOnly={
                                    isCustomer()
                                      ? true
                                      : isAdmin()
                                      ? false
                                      : !field.outward_accessible
                                  }
                                  className={formclass(
                                    errors[`${formname}`]?.[index]?.outward_no
                                  )}
                                />
                                {errors[`${formname}`]?.[index]?.outward_no &&
                                  displayError(
                                    errors[`${formname}`]?.[index]?.outward_no
                                      .message
                                  )}
                              </div>
                              <label
                                htmlFor={`${formname}[${index}].outward_date`}
                                class="col-sm-2"
                              >
                                Outward Date
                              </label>
                              <div className="col">
                                <input
                                  type="date"
                                  id={`${formname}[${index}].outward_date`}
                                  name={`${formname}[${index}].outward_date`}
                                  {...register(
                                    `${formname}[${index}].outward_date`,
                                    {
                                      required: "Outward date. is required",
                                    }
                                  )}
                                  onChange={(e) => handleInput(e, index)}
                                  defaultValue={field.outward_date}
                                  // readOnly={isCustomer()?true :!field.outward_accessible}
                                  readOnly={
                                    isCustomer()
                                      ? true
                                      : isAdmin()
                                      ? false
                                      : !field.outward_accessible
                                  }
                                  className={formclass(
                                    errors[`${formname}`]?.[index]?.outward_date
                                  )}
                                />
                                {errors[`${formname}`]?.[index]?.outward_date &&
                                  displayError(
                                    errors[`${formname}`]?.[index]?.outward_date
                                      .message
                                  )}
                              </div>
                            </div>

                            {fields.length - 2 === index ? (
                              <div className="row">
                                <div className="col">
                                  <div className="form-group">
                                    <div className="col">
                                      <label htmlFor="assign_planner">
                                        Planner
                                      </label>
                                      <select
                                        name="assign_planner"
                                        id="assign_planner"
                                        className="form-control"
                                        {...register("assign_planner")}
                                        // disabled={isCustomer()? true :!field?.outward_accessible}
                                        disabled={
                                          isCustomer()
                                            ? true
                                            : isAdmin()
                                            ? false
                                            : !field?.outward_accessible
                                        }
                                      >
                                        <option value="">--Select--</option>
                                        {plannerdata.map((data) => (
                                          <option key={data.id} value={data.id}>
                                            {data.first_name} {data.last_name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}

                            <div className="row">
                              <label htmlFor="document_upload_date">
                                Document upload date
                              </label>
                              <div className="col">
                                <input
                                  type="date"
                                  name="document_upload_date"
                                  id="document_upload_date"
                                  {...register(
                                    `${formname}[${index}].document_upload_date`,
                                    {
                                      required: "Date is required",
                                      validate: (value) => {
                                        if (
                                          moment(value).isSame(todayDate()) ||
                                          moment(value).isBetween(
                                            todayDate(),
                                            nextDays()
                                          ) ||
                                          moment(value).isSame(nextDays())
                                        ) {
                                          return true;
                                        } else {
                                          return "Invalid";
                                        }
                                      },
                                    }
                                  )}
                                  min={todayDate()}
                                  max={nextDays()}
                                  // readOnly={isCustomer()?true :!field.outward_accessible}
                                  readOnly={
                                    isCustomer()
                                      ? true
                                      : isAdmin()
                                      ? false
                                      : !field.outward_accessible
                                  }
                                  className={formclass(
                                    errors[`${formname}`]?.[index]
                                      ?.document_upload_date
                                  )}
                                />
                                {errors[`${formname}`]?.[index]
                                  ?.document_upload_date &&
                                  displayError(
                                    errors[`${formname}`]?.[index]
                                      ?.document_upload_date.message
                                  )}
                              </div>
                              <div className="col">
                                {field.outward_accessible && !isCustomer() && (
                                  <>
                                    <input
                                      type="file"
                                      id={`${formname}[${index}].document_file`}
                                      name={`${formname}[${index}].document_file`}
                                      {...register(
                                        `${formname}[${index}].document_file`
                                      )}
                                      className={formclass(
                                        errors[`${formname}`]?.[index]
                                          ?.document_file
                                      )}
                                      onChange={(e) => onFileInput(e, index)}
                                    />
                                    {errors[`${formname}`]?.[index]
                                      ?.document_file &&
                                      displayError(
                                        errors[`${formname}`]?.[index]
                                          ?.document_file.message
                                      )}{" "}
                                  </>
                                )}
                                {field.document_visibility && (
                                  <a
                                    href={`${FileUrl}/${field.documents}`}
                                    role={"button"}
                                    target="_blank"
                                    className="btn"
                                  >
                                    View File
                                  </a>
                                )}
                              </div>
                              <div className="col">
                                {/* {formAccessible && <button type="button" onClick={()=>onReject()} class="btn">Reject</button>} */}
                                {formAccessible && (
                                  <button
                                    type="button"
                                    id="openRejectForm"
                                    data-toggle="modal"
                                    data-target="#rejectForm"
                                    class="btn"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            </div>

                            {field?.outward_assign_name ? (
                              <>
                                Assigned to: <u>{field?.outward_assign_name}</u>
                              </>
                            ) : (
                              ""
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {formAccessible && (
              <>
                <div className="row">
                  <div className="col">
                    <button
                      type="button"
                      onClick={() => openModal()}
                      className="btn"
                    >
                      Save & Continue
                    </button>
                    <button
                      type="button"
                      id="openModal"
                      data-toggle="modal"
                      data-target="#myModal"
                      className="btn"
                      hidden
                    >
                      Save & Continue
                    </button>
                  </div>
                </div>

                <div class="modal fade" id="myModal">
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h4 class="modal-title">Assign to</h4>
                        <button
                          type="button"
                          id="close"
                          class="close"
                          data-dismiss="modal"
                        >
                          X
                        </button>
                      </div>
                      <div class="modal-body">
                        <div className="form-group">
                          <label htmlFor="hod_liasoner_id">HOD(liasoner)</label>
                          <select
                            name="hod_liasoner_id"
                            id="hod_liasoner_id"
                            className="form-control"
                            value={assign_to}
                            onChange={(e) => setAssign_to(e.target.value)}
                            required
                          >
                            <option value="">--Select--</option>
                            {lisonerdata.map((data) => (
                              <option value={data.id}>
                                {data.first_name} {data.last_name}
                              </option>
                            ))}
                          </select>
                          {/* {validator.message("Liasoner",assign_to, "required", { className: "text-danger" })} */}
                        </div>
                      </div>
                      <div class="modal-footer">
                        <button type="submit" class="btn">
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
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

export default PlotValidationCertificate;
