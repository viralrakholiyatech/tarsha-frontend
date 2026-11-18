import React, { useCallback, useEffect, useState } from "react";
import {
  document_upload,
  get_documentUpload,
  get_document_upload,
  remove_documentUpload,
  remove_document_upload,
  save_documentUpload,
  skip_documentUpload,
  getOwnerPortal,
} from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import {
  getToken,
  isCust,
  isAdmin,
  getRole,
  isEmp,
  superAccess,
} from "../../../../services/useLocalStorage";
import { GetDate } from "../../../../services/DateAndTimeService";
import {
  closeButtonSvg,
  dustbinButton,
  eyeButtonSvg,
  FileUrl,
} from "../../../../config/file_url";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { adminKey, empKey, HoD } from "../../../../config/RoleConfig";
import { useForm, useFieldArray } from "react-hook-form";
import { AuthHeader } from "../../../../services/FormCommon";
import axios from "axios";
import { useParams } from "react-router-dom";
import { urlPatterns2 } from "../../../../services/Pattern";
import { ReactSVG } from "react-svg";

const formname = "userform";
//7.DocumentUpload
const DocumentUpload = (props) => {
  const params = useParams();

  const [is_save, setIsSave] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState("");
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
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

  const [isFormDisabled, setFormDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSave = async (is_save = 0) => {
    try {
      const validate = await trigger();

      if (validate) {
        const data = getValues()[`${formname}`];
        console.log("data-->", data);

        const formData = new FormData();
        const arr = [];

        let i = 0;

        let duplicate = 0;

        for (let e of data) {
          if (e?.file_doc) {
            const file = e?.file_doc[0] ? e?.file_doc[0] : "";
            if (file) {
              formData.append(`${i}_file_doc`, file);
            }
          }

          if (
            e.document_name.toUpperCase().trim() ==
            "Google Image Link".toUpperCase()
          ) {
            duplicate++;
          }

          delete e?.file_doc;

          let obj = {
            ...e,
            index: i,
          };

          arr.push(obj);
          i++;
        }

        formData.append("data", JSON.stringify(arr));
        formData.append("is_save", is_save);

        if (duplicate >= 2) {
          toast.error("Duplication of Google Image Link is not allowed");
        } else {
          await onSubmit(formData);
        }
      }
    } catch (err) {
      toast.eror("Something went wrong");
      console.log(err);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      formData.append("remark_by_emp", getValues("remark_by_emp"));
      formData.append("remark_by_hod", getValues("remark_by_hod"));
      formData.append("approved_by_hod", selectedOptions);
      formData.append("date", startdate);
      formData.append("card", card);

      console.log("FormData:", formData);

      const res = await axios({
        method: save_documentUpload.method,
        url: save_documentUpload.url,
        headers: AuthHeader(),
        data: formData,
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);

        if (res?.data?.data?.skip == 1) {
          props.onUpdateMstStage(8);
          props.onchangeStage(8);
        } else {
          reset({});
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
  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  // const fetchData = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios({
  //       method: get_documentUpload.method,
  //       url: `${get_documentUpload.url}/${params?.id}`,
  //       headers: AuthHeader()
  //     });

  //     if (!res?.data?.error) {
  //       setLoading(false);
  //       const payload = res?.data?.data;
  //       console.log(payload);

  //       setFormDisabled(payload.some((p) => p?.is_save == 1) ? 1 : 0);

  //       if (Array.isArray(payload)) {
  //         append(payload);
  //       }

  //     }
  //     else {
  //       toast.error(res?.data?.message);
  //     }

  //   }
  //   catch (err) {
  //     setLoading(false);
  //     toast.error("Something went wrong");
  //     console.log(err);
  //   }
  // }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: get_documentUpload.method,
        url: `${get_documentUpload.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        const payload = res?.data?.data;
        console.log(payload);
        setSelectedOptions(payload[0].approved_by_hod);
        setCard(payload[0].card)
        setEndDate(GetDate(payload[0].created_at, "YYYY-MM-DD"));
        setFormDisabled(payload.some((p) => p?.is_save == 1) ? 1 : 0);
    
        if (payload.length > 0) {
          setValue("remark_by_emp", payload[0]?.remark_by_emp);
          setValue("remark_by_hod", payload[0]?.remark_by_hod);
        }

        if (Array.isArray(payload)) {
          setValue(formname, payload); // Set the form data directly

          // Remove any extra rows
          const currentRows = fields.length;
          const newRows = payload.length;
          if (newRows < currentRows) {
            for (let i = currentRows - 1; i >= newRows; i--) {
              remove(i);
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
  }, [fields, remove, setValue]);

  const addForm = () => {
    append({
      id: null,
      mst_document_id: null,
      mst_file_id: params?.id,
      document_name: "",
      show_website: 0,
      document_path: "",
      is_save: 0,
      input: true,
      remark_by_emp: "",
      remark_by_hod: "",
      approved_by_hod: selectedOptions,
    });
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
        getOwnerPortal.method,
        getOwnerPortal.url
      );
      console.log("startDate==res==>", res);
      if (!res.data.error) {
        setLoading(false);

        setStartDate(GetDate(res.data.data.created_at, "YYYY-MM-DD"));
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

  useEffect(() => {
    if (!loading) {
    }
  }, [isFormDisabled, loading]);

  const setIsActive = (e, index) => {
    console.log(e.target.checked);
    if (e.target.checked) {
      setValue(`${formname}[${index}].show_website`, parseInt(1));
    } else {
      setValue(`${formname}[${index}].show_website`, parseInt(0));
    }
  };
  console.log("selectopyio-->", selectedOptions);
  // const onSkip = async () => {
  //   SwalAlert({ confirmButtonText: "Skip", title: "Are you sure?" }).then(async (result) => {
  //     if (result?.isConfirmed) {
  //       reset({});
  //       await skipTheStage();
  //     }
  //   }).catch((err) => {
  //     console.log(err);
  //   });
  // }

  const onDelete = (id, index) => {
    SwalAlert({ confirmButtonText: "Remove", title: "Are you sure?" })
      .then(async (result) => {
        if (result?.isConfirmed) {
          await deleteDoc(id, index);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const deleteDoc = async (id, index) => {
    try {
      setLoading(true);

      const res = await axios({
        method: remove_documentUpload.method,
        url: `${remove_documentUpload.url}/${id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);
        remove(index);
        toast.success(res?.data?.message);
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

  const skipTheStage = async () => {
    try {
      setLoading(true);
      const res = await axios({
        method: skip_documentUpload.method,
        url: `${skip_documentUpload.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);

        toast.success(res?.data?.message);
        if (res?.data?.data?.skip == 1) {
          props.onUpdateMstStage(8);
          props.onchangeStage(8);
        } else {
          props.onchangeStage(8);
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

  return (
    <div class="grey-border rounded">
 <div className="card-header bg-white">
          <div className=" d-flex align-items-center justify-content-between">
        <h5 class="mb-0 font-weight-normal">Document Upload (pdf)</h5>
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

      {/* <div>{JSON.stringify(documentData)}</div> */}
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ? (
          <form>
            <fieldset id="fieldset">
              <table className="table">
                <thead>
                  <tr>
                    <th>Show on website</th>
                    <th>Document Name</th>
                    <th>Uploaded File</th>
                    <th></th>
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
                          {...register(`${formname}[${index}].show_website`, {
                            required: false,
                          })}
                          defaultChecked={
                            value?.show_website == 1 ? true : false
                          }
                          disabled={superAccess() ? false : isFormDisabled}
                          defaultValue={1}
                          onChange={(e) => setIsActive(e, index)}
                        />
                      </td>
                      <td>
                        {getValues(`${formname}[${index}].input`) == true ? (
                          <>
                            <input
                              type="text"
                              className={formclass(
                                errors.userform?.[index]?.document_name
                              )}
                              name={`${formname}[${index}].document_name`}
                              id={`${formname}[${index}].document_name`}
                              {...register(
                                `${formname}[${index}].document_name`,
                                { required: true }
                              )}
                              disabled={superAccess() ? false : isFormDisabled}
                            />
                            {displayError(
                              errors.userform?.[index]?.document_name?.message
                            )}
                          </>
                        ) : (
                          value?.document_name
                        )}
                      </td>
                      <td>
                        {getValues(
                          `${formname}[${index}].document_name`
                        )?.trim() != "Google Image Link" ? (
                          <input
                            type="file"
                            name={`${formname}[${index}].file_doc`}
                            id={`${formname}[${index}].file_doc`}
                            {...register(`${formname}[${index}].file_doc`)}
                            disabled={superAccess() ? false : isFormDisabled}
                          />
                        ) : (
                          <React.Fragment>
                            <input
                              type="url"
                              name={`${formname}[${index}].document_url`}
                              id={`${formname}[${index}].document_url`}
                              className={formclass(
                                errors.userform?.[index]?.document_url
                              )}
                              {...register(
                                `${formname}[${index}].document_url`,
                                {
                                  required: false,
                                  pattern: {
                                    value: urlPatterns2,
                                    message: "Invalid URL",
                                  },
                                }
                              )}
                              defaultValue={value?.document_path}
                              disabled={superAccess() ? false : isFormDisabled}
                            />
                            {displayError(
                              errors.userform?.[index]?.document_url?.message
                            )}
                          </React.Fragment>
                        )}
                      </td>
                      <td>
                        {getValues(`${formname}[${index}].document_path`) &&
                        value?.document_name != "Google Image Link" ? (
                          <a
                            href={`${FileUrl}/${value?.document_path}`}
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
                      <td>
                        {getValues(`${formname}[${index}].input`) == true &&
                        getValues(`${formname}[${index}].id`) != null ? (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(
                                getValues(`${formname}[${index}].id`),
                                index
                              )
                            }
                            disabled={superAccess() ? false : isFormDisabled}
                            className="bg-transparent border-0"
                          >
                            <ReactSVG
                              src={`${dustbinButton}`}
                              wrapper="span"
                              beforeInjection={(svg) => {
                                svg.setAttribute("style", "width: 20px");
                              }}
                            />
                          </button>
                        ) : getValues(
                            `${formname}[${index}].mst_document_id`
                          ) == null &&
                          getValues(
                            `${formname}[${index}].document_name`
                          )?.trim() != "Google Image Link" ? (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="bg-transparent border-0"
                          >
                            <ReactSVG
                              src={`${closeButtonSvg}`}
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
                  <button className="btn" type="button" onClick={addForm}>
                    Add
                  </button>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => onSave(0)}
                  >
                    Save
                  </button>
                  {/* {(!isFormDisabled) ?
                    <button className='btn' type="button" onClick={() => onSkip()}>Skip</button>
                    : ""} */}
                  {!isFormDisabled ? (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => onSave(1)}
                    >
                      Save & Next
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              ) : [empKey].includes(getRole()) && !isFormDisabled ? (
                <div className="row" style={{ justifyContent: "space-around" }}>
                  <button className="btn" type="button" onClick={addForm}>
                    Add
                  </button>

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onSave(0)}
                  >
                    Save
                  </button>

                  {/* <button className='btn' type="button" onClick={() => onSkip()}>Skip</button> */}

                  <button
                    className="btn"
                    type="button"
                    onClick={() => onSave(1)}
                  >
                    Save & Next
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

export default DocumentUpload;
