import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import ApiService from "../../../../services/ApiService";
import {
  getToken,
  isCust,
  getRole,
  superAccess
} from "../../../../services/useLocalStorage";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import { adminKey, HoD, empKey } from "../../../../config/RoleConfig";
import { useNavigate, useParams } from "react-router-dom";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import {
  fetchRoadScrunity,
  saveRoadScrunity,
  get_documentUpload,
} from "../../../../config/config";
import { GetDate, todayDate } from "../../../../services/DateAndTimeService";
import classNames from "classnames";
import { eyeButtonSvg, FileUrl } from "../../../../config/file_url";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { numericPattern } from "../../../../services/Pattern";
import { ReactSVG } from "react-svg";

const Road_Deposit_Security_Fees = (props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [selectedOptions, setSelectedOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Loading...");
  const [userData, setUserData] = useState([]);
  const [listData, setListData] = useState([]);
  const [clickSendMsg, setClickMsg] = useState(false);
  const [clickNext, setClickNext] = useState(false);
  const [isAlreadySaved, setAlreadySave] = useState(false);
  const [remarkByHod, setRemarkByHod] = useState("");
  const [remarkByEmp, setRemarkByEmp] = useState("");
  const [card, setCard] = useState("");
  const [visibleSaveButton, setVisibleSaveButton] = useState(true);
  const defaultIsSave = { save: 0, send_msg: 0, next: 0 };
  const formname = "userform";

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

  const onSubmit = (data) => {
    console.log(data);
  };

  const sanitizeDate = (date1) => {
    try {
      return date1 ? GetDate(date1, "YYYY-MM-DD") : todayDate();
    } catch (err) {
      console.log(err);
      return todayDate();
    }
  };

  const validJson = (jsonString) => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };

      const res = await ApiService(
        null,
        params?.id,
        header,
        fetchRoadScrunity.method,
        fetchRoadScrunity.url
      );
      if (!res?.data?.error) {
        setLoading(false);

        const payload = res?.data;
        console.log("paha==>", payload);

        const finalData = [];

        if (Array.isArray(payload?.data1)) {
          if (payload?.data1.length > 0) {
            reset();
            /*Data of master table*/
            const data1 = payload?.data1;

            /*Data of file_road_scrunity table*/
            const data2 = payload?.data2;
            // console.log(data2);

            for (let d of data1) {
              if (
                props.status_file_name?.toLowerCase() ===
                  "Online".toLowerCase() &&
                d?.type_name == "Road Deposit"
              ) {
                continue;
              } else {
                finalData.push({
                  id: parseInt(d?.id),
                  show_website: 0,
                  is_active: 0,
                  description: d?.type_name,
                  amount: "",
                  approved_by_hod: selectedOptions,
                  remark_by_emp: "", // Bind remark_by_emp
                  remark_by_hod: " ",
                  document_upload_date: todayDate(),
                  documents: "",
                  stringDocuments: "",
                  is_save: defaultIsSave,
                });
              }
            }

            if (Array.isArray(data2) && data2.length > 0) {
              data2.forEach((value, index) => {
                const id = parseInt(value?.mst_type_id);
                finalData.forEach((value2, index2) => {
                  if (value2?.id == id) {
                    value2.show_website = value?.show_website;
                    value2.is_active =
                      value?.is_active == 1 || value?.is_active == 0
                        ? parseInt(value?.is_active)
                        : 0;
                    value2.amount = value?.amount
                      ? parseFloat(value?.amount)
                      : 0;
                    value2.document_upload_date = sanitizeDate(
                      value?.document_upload_date
                    );
                    value2.stringDocuments = value?.documents;
                    value2.is_save = value?.is_save
                      ? validJson(value?.is_save)
                        ? JSON.parse(value?.is_save)
                        : defaultIsSave
                      : defaultIsSave;
                    value2.remark_by_hod = value?.remark_by_hod; // Ensure default value if not provided
                    value2.remark_by_emp = value?.remark_by_emp;
                  }
                });
              });
            }

            console.log("==", finalData);
            append(finalData);
            setListData(finalData);
            setEndDate(GetDate(payload.data2[0].created_at, "YYYY-MM-DD"));
            setSelectedOptions(
              payload.data2[0].approved_by_hod === 1 ? "Yes" : "No"
            );
            setRemarkByHod(payload.data2[0].remark_by_hod || "");
            setRemarkByEmp(payload.data2[0].remark_by_emp || "");
            setCard(payload.data2[0]?.card);

            const isEnableSaveAndNextButton = finalData.some((value) => {
              return value?.is_save?.save == 0;
            });

            const isSaved = finalData.some((value) => {
              return value?.is_save?.next == 1;
            });

            setAlreadySave(isSaved);

            if (!isSaved) {
              if (isEnableSaveAndNextButton) {
                const c = finalData.some((value) => {
                  return value?.is_save?.send_msg == 0 && value?.is_active == 1;
                });

                setClickMsg(c);
                setClickNext(isEnableSaveAndNextButton);
              } else {
                const c = finalData.some((value) => {
                  return value?.is_save?.send_msg == 0 && value?.is_active == 1;
                });

                setClickNext(c);
                setClickMsg(c);
              }

              setVisibleSaveButton(isEnableSaveAndNextButton);
            } else {
              setClickMsg(false);
              setClickNext(false);
            }
          }
        } else {
          setLoading(false);
          toast.error("Unable to set table data");
        }
      } else {
        setLoading(false);
        setText("Refresh the page");
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setText("Internal server error");
      setLoading(false);
      console.log(err);
      // toast.error(res?.data?.error?.message);
    }
  };

  const setIsActive = (e, index) => {
    console.log(e.target.checked);
    setValue(`${formname}[${index}].is_active`, e.target.checked ? 1 : 0);
    if (!e.target.checked) {
      clearErrors(`${formname}[${index}].amount`);
      clearErrors(`${formname}[${index}].documents`);
    }
    console.log();
    const arr = getValues()[`${formname}`];

    const test = getValues()[`${formname}`].some((value) => {
      return !value?.is_save?.send_msg && value?.is_active;
    });

    const nextText = getValues()[`${formname}`].some((value) => {
      return value?.is_active == 1;
    });

    console.log(test);
    //Enable/Disable send message button
    setClickMsg(test);
    setClickNext(nextText);
  };

  const setShowWebsite = (e, index) => {
    setValue(`${formname}[${index}].show_website`, e.target.checked ? 1 : 0);
  };

  const getAllAmounts = (key) => {
    try {
      const arr = [];
      const data = getValues()[`${formname}`];

      for (let i = 0; i < data.length; i++) {
        arr.push(`${formname}[${i}].${key}`);
      }

      return arr;
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  const onSendMessage = async () => {
    try {
      clearErrors(getAllAmounts("documents"));
      if (clickSendMsg) {
        const result = await trigger(getAllAmounts("amount"));
        if (result) {
          SwalAlert({ confirmButtonText: "Send Message" })
            .then(async (result) => {
              if (result?.isConfirmed) {
                const data = getValues()[`${formname}`];
                const formData = new FormData();
                const arr = [];
                for (let d of data) {
                  if (d?.documents) {
                    const file = d?.documents[0] ? d?.documents[0] : "";
                    if (file) {
                      formData.append(`${d?.id}_file`, file);
                    }
                  }

                  const isSave = {
                    ...d?.is_save,
                    save: d?.is_active ? d?.is_active : 0,
                    send_msg: d?.is_active ? d?.is_active : 0,
                  };

                  arr.push({
                    mst_type_id: d?.id,
                    show_website: d?.show_website,
                    amount: d?.amount ? parseFloat(d?.amount) : 0,
                    is_active: d?.is_active,
                    remark_by_hod: d?.remark_by_hod,
                    remark_by_emp: d?.remark_by_emp,
                    approved_by_hod: selectedOptions,
                    document_upload_date: d?.document_upload_date,
                    is_save: JSON.stringify(isSave),
                  });
                }

                console.log(arr);

                formData.append("data", JSON.stringify(arr));
                formData.append("mst_file_id", parseInt(params?.id));

                await saveRoadScrunityFees(formData);
              }
            })
            .catch((err) => {
              console.log(err);
              toast.error("Something went wrong");
            });
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Unable to save the changes");
    }
  };

  const onSaveAndNext = async () => {
    if (clickNext) {
      const errorArr = [
        ...getAllAmounts("amount"),
        ...getAllAmounts("documents"),
      ];
      const result = await trigger(errorArr);
      if (result) {
        SwalAlert({ confirmButtonText: "Save & Next" })
          .then(async (result) => {
            if (result.isConfirmed) {
              const data = getValues()[`${formname}`];
              const formData = new FormData();
              const arr = [];

              for (let d of data) {
                if (d?.documents) {
                  const file = d?.documents[0] ? d?.documents[0] : "";
                  if (file) {
                    formData.append(`${d?.id}_file`, file);
                  }
                }

                const isActiveValue = d?.is_active ? d?.is_active : 0;
                const isSave = {
                  ...d?.is_save,
                  save: isActiveValue,
                  send_msg: isActiveValue,
                  next: isActiveValue,
                };

                arr.push({
                  mst_type_id: d?.id,
                  show_website: d?.show_website,
                  amount: d?.amount ? parseFloat(d?.amount) : 0,
                  is_active: d?.is_active,
                  remark_by_hod: d?.remark_by_hod,
                  remark_by_emp: d?.remark_by_emp,
                  approved_by_hod: selectedOptions,
                  document_upload_date: d?.document_upload_date,
                  is_save: JSON.stringify(isSave),
                });
              }

              formData.append("data", JSON.stringify(arr));
              formData.append("mst_file_id", parseInt(params?.id));
              formData.append("save_and_next", parseInt(1));
              formData.append("remark_by_emp", getValues("remark_by_emp"));
              formData.append("remark_by_hod", getValues("remark_by_hod"));
              formData.append("approved_by_hod", selectedOptions);
              formData.append("date", startdate);

              await saveRoadScrunityFees(formData);
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Unable to save the changes");
          });
      }
    }
  };

  const onSave = async () => {
    try {
      const result = await trigger(getAllAmounts("amount"));

      if (result) {
        const data = getValues()[`${formname}`];
        const formData = new FormData();

        const arr = [];
        for (let d of data) {
          if (d?.documents) {
            const file = d?.documents[0] ? d?.documents[0] : "";
            if (file) {
              formData.append(`${d?.id}_file`, file);
            }
          }
          const isSave = {
            ...d?.is_save,
            save: d?.is_active ? d?.is_active : 0,
          };
          arr.push({
            mst_type_id: d?.id,
            show_website: d?.show_website,
            amount: d?.amount ? parseFloat(d?.amount) : 0,
            is_active: d?.is_active,
            remark_by_hod: d?.remark_by_hod,
            remark_by_emp: d?.remark_by_emp,
            approved_by_hod: selectedOptions,
            date: startdate,
            card: card,
            document_upload_date: d?.document_upload_date,
            is_save: JSON.stringify(isSave),
          });
        }

        console.log(arr);

        formData.append("data", JSON.stringify(arr));
        formData.append("mst_file_id", parseInt(params?.id));
        formData.append("remark_by_emp", getValues("remark_by_emp"));
        formData.append("remark_by_hod", getValues("remark_by_hod"));
        formData.append("approved_by_hod", selectedOptions);
        formData.append("date", startdate);
        formData.append("card", card);
        await saveRoadScrunityFees(formData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveRoadScrunityFees = async (data) => {
    console.log("data-->", data);
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "multipart/form-data",
      };
      const res = await ApiService(
        data,
        0,
        header,
        saveRoadScrunity.method,
        saveRoadScrunity.url
      );
      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);

        const payload = res?.data?.data;
        if (payload?.isNextStage == 1) {
          props.onUpdateMstStage(9);
          props.onchangeStage(9);
        } else {
          await fetchData();
        }
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Internal server error");
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
        get_documentUpload.method,
        get_documentUpload.url
      );
      // console.log("startDate==res==>", res);
      if (!res.data.error) {
        setLoading(false);

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
    console.log(props.status_file_name);
  }, []);

  const handleOptionsChanges = (e) => {
    setSelectedOptions(e.target.value);
  };

  return (
    <>
      <div class="grey-border rounded">
        <div className="card-header bg-white">
          <div className=" d-flex align-items-center justify-content-between">
            <h5 class="mb-0 font-weight-normal">Road Deposit/Security fees</h5>
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
              <table className="table d-flex flex-wrap">
                <thead>
                  <tr>
                    <th>Is Active</th>
                    <th>Show on Website</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>File Upload</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {!loading ? (
                    <>
                      {listData.length > 0 ? (
                        <>
                          {fields.map((value, index) => {
                            return (
                              <React.Fragment>
                                <tr key={index}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      name={`${formname}[${index}].is_active`}
                                      id={`${formname}[${index}].is_active`}
                                      defaultChecked={
                                        value?.is_active == 1 ? true : false
                                      }
                                      disabled={
                                        isAlreadySaved || isCust()
                                          ? true
                                          : value?.is_save?.send_msg == 1
                                          ? true
                                          : false
                                      }
                                      onChange={(e) => setIsActive(e, index)}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="checkbox"
                                      name={`${formname}[${index}].show_website`}
                                      id={`${formname}[${index}].show_website`}
                                      defaultChecked={
                                        value?.show_website == 1 ? true : false
                                      }
                                      disabled={
                                        isAlreadySaved || isCust()
                                          ? true
                                          : value?.is_save?.send_msg == 1
                                          ? true
                                          : false
                                      }
                                      onChange={(e) => setShowWebsite(e, index)}
                                    />
                                  </td>
                                  <td>{value?.description}</td>
                                  <td>
                                    <input
                                      type="text"
                                      id={`${formname}[${index}].amount`}
                                      name={`${formname}[${index}].amount`}
                                      {...register(
                                        `${formname}[${index}].amount`,
                                        {
                                          required:
                                            getValues(
                                              `${formname}[${index}].is_active`
                                            ) == 1
                                              ? true
                                              : false,
                                          validate: (value) =>
                                            numericPattern.test(value)
                                              ? true
                                              : false,
                                          // validate: (value) => value==!"" ? numericPattern.test(value) ? true : false : true
                                        }
                                      )}
                                      min={0}
                                      disabled={
                                        isAlreadySaved || isCust()
                                          ? true
                                          : value?.is_save?.send_msg == 1
                                          ? true
                                          : false
                                      }
                                      placeholder="Amount"
                                      // className={getValues(`${formname}[${index}].is_active`) == 1 ? formclass(errors.userform?.[index]?.amount) : "form-control"}
                                      className={formclass(
                                        errors.userform?.[index]?.amount
                                      )}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="date"
                                      id={`${formname}[${index}].document_upload_date`}
                                      name={`${formname}[${index}].document_upload_date`}
                                      {...register(
                                        `${formname}[${index}].document_upload_date`,
                                        {
                                          required: true,
                                        }
                                      )}
                                      disabled={
                                        isAlreadySaved || isCust()
                                          ? true
                                          : false
                                      }
                                      className={formclass(
                                        errors.userform?.[index]
                                          ?.document_upload_date
                                      )}
                                    />
                                  </td>
                                  <td>
                                    {!isAlreadySaved && !isCust() ? (
                                      <input
                                        type="file"
                                        name={`${formname}[${index}].documents`}
                                        id={`${formname}[${index}].documents`}
                                        style={{ height: "auto" }}
                                        {...register(
                                          `${formname}[${index}].documents`,
                                          {
                                            required:
                                              getValues(
                                                `${formname}[${index}].is_active`
                                              ) == 1 &&
                                              clickNext &&
                                              !value?.stringDocuments
                                                ? true
                                                : false,
                                          }
                                        )}
                                        className={
                                          getValues(
                                            `${formname}[${index}].is_active`
                                          ) == 1 &&
                                          clickNext &&
                                          !value?.stringDocuments
                                            ? formclass(
                                                errors.userform?.[index]
                                                  ?.documents
                                              )
                                            : "form-control"
                                        }
                                      />
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                  <td>
                                    {value?.stringDocuments ? (
                                      <>
                                        <a
                                          href={`${FileUrl}/${value?.stringDocuments}`}
                                          target={"_blank"}
                                        >
                                          <ReactSVG
                                            src={`${eyeButtonSvg}`}
                                            wrapper="span"
                                            beforeInjection={(svg) => {
                                              svg.setAttribute(
                                                "style",
                                                "width: 20px"
                                              );
                                            }}
                                          />
                                        </a>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </>
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center">
                            <b>{text}</b>
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <Loader
                      type="spinner-default"
                      bgColor={"#000000"}
                      title={"Please wait"}
                      color={"#000000"}
                      size={50}
                    />
                  )}
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
                      value={remarkByEmp}
                      {...register("remark_by_emp")}
                      onChange={(e) => setRemarkByEmp(e.target.value)}
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
                      value={remarkByHod}
                      {...register("remark_by_hod")}
                      onChange={(e) => setRemarkByHod(e.target.value)}
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

              {!isAlreadySaved ? (
                <div className="row" style={{ justifyContent: "space-around" }}>
                  {visibleSaveButton ? (
                    <button type="button" className="btn" onClick={onSave}>
                      Save
                    </button>
                  ) : (
                    ""
                  )}

                  {/* <button type="button" className='btn' onClick={onSendMessage} disabled={!clickSendMsg} style={{ cursor: !clickSendMsg ? "not-allowed" : "pointer" }}>Send MSG</button> */}

                  <button
                    type="button"
                    className="btn"
                    onClick={onSaveAndNext}
                    disabled={!clickNext}
                    style={{ cursor: !clickNext ? "not-allowed" : "pointer" }}
                  >
                    Save & next
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
        </div>
      </div>
    </>
  );
};

export default Road_Deposit_Security_Fees;
