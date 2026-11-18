import React, { useState, useEffect, useCallback } from "react";
import {
  getRole,
  getToken,
  getUserId,
  isAdmin,
  isEmp,
  ishod,
  superAccess,
} from "../../../../services/useLocalStorage";
import {
  addDaysFromDays,
  GetDate,
  parseDate,
  todayDate,
} from "../../../../services/DateAndTimeService";
import ApiService from "../../../../services/ApiService";
import { eyeButtonSvg, FileUrl } from "../../../../config/file_url";
import Loader from "react-js-loader";
import toast from "react-hot-toast";
import {
  adminKey,
  HoD,
  customerKey,
  empKey,
} from "../../../../config/RoleConfig";
import { useNavigate, useParams } from "react-router-dom";
import { FilesRoute } from "../../../../config/RouteConfig";
import { useForm, useFieldArray } from "react-hook-form";
import {
  displayError,
  formclass,
} from "../../../../services/ValidationService";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import moment from "moment";
import {
  get_filePlotValidation,
  reject_filePlotValidation,
  save_and_next_filePlotValidation,
  save_filePlotValidation,
  skip_filePlotValidation,
} from "../../../../config/config";
import { AuthHeader } from "../../../../services/FormCommon";
import {
  file_plot_validation,
  getTypesOfPlotValidation,
  get_file_plot_validation,
  lisoner,
  planner,
  getMessageToClient,
  reject_file_plot,
  test_documents,
} from "../../../../config/config";
import axios from "axios";
import { restrictTo } from "../../../../config/CommonVariables";
import classNames from "classnames";
import { ReactSVG } from "react-svg";

//4.PlotValidationCertificate
const PlotValidationCertificate_new_code = (props) => {
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

  const params = useParams();

  const { append, remove, fields } = useFieldArray({
    name: formname,
    control,
  });

  const navigate = useNavigate();

  const [lisonerdata, setLisonerdata] = useState([]);
  const [card, setCard] = useState("");
  const [plannerdata, setPlannerdata] = useState([]);

  const [lastAssignId, setLastAssignId] = useState();
  const [startdate, setStartDate] = useState("");
  const [enddate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Function to handle changes in radio button selections
  const handleOptionsChanges = (e, index) => {
    const { name, value } = e.target;
    setSelectedOptions((prevState) => ({
      ...prevState,
      [index]: value,
    }));
  };

  // const handleOptionsChanges = (e, index) => {
  //   const value = e.target.value;
  //   setSelectedOptions(prevOptions => {
  //     const updatedOptions = [...prevOptions];
  //     updatedOptions[index] = value;
  //     return updatedOptions;
  //   });
  // };

  // const [testData,setTestData] = useState([]);

  const [formDisabled, setFormDisabled] = useState(0);

  const selectValidation = async () => {
    const data = getValues()[formname];

    let obj = {
      keys: [],
      index: 0,
      data: [],
    };

    let onlyValidateToThose = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].inward_is_save == 0) {
        onlyValidateToThose = [
          `${formname}[${i}].inward_no`,
          `${formname}[${i}].inward_date`,
          `${formname}[${i}].inward_assign_to`,
        ];
        obj.index = i;

        obj.data.push({
          id: getValues(`${formname}[${i}].id`),
          inward_no: getValues(`${formname}[${i}].inward_no`),
          inward_date: getValues(`${formname}[${i}].inward_date`),
          inward_assign_to: getValues(`${formname}[${i}].inward_assign_to`),
          remark_by_emp: getValues(`${formname}[${i}].remark_by_emp`),
          remark_by_hod: getValues(`${formname}[${i}].remark_by_hod`),
          approved_by_hod: getValues(`${formname}[${i}].approved_by_hod`),
          outward_no: getValues(`${formname}[${i}].outward_no`),
          outward_date: getValues(`${formname}[${i}].outward_date`),
          outward_assign_to: getValues(`${formname}[${i}].outward_assign_to`),
          document_upload_date: getValues(
            `${formname}[${i}].document_upload_date`
          ),
          file_doc: getValues(`${formname}[${i}].file_doc`),
          inward_is_save: 1,
          outward_is_save: 0,
        });

        break;
      } else if (data[i].outward_is_save == 0) {
        onlyValidateToThose = [
          `${formname}[${i}].outward_no`,
          `${formname}[${i}].outward_date`,
          `${formname}[${i}].outward_assign_to`,
          `${formname}[${i}].document_upload_date`,
          `${formname}[${i}].file_doc`,
        ];
        obj.index = i;

        obj.data.push({
          id: getValues(`${formname}[${i}].id`),
          inward_no: getValues(`${formname}[${i}].inward_no`),
          inward_date: getValues(`${formname}[${i}].inward_date`),
          inward_assign_to: getValues(`${formname}[${i}].inward_assign_to`),
          outward_no: getValues(`${formname}[${i}].outward_no`),
          remark_by_emp: getValues(`${formname}[${i}].remark_by_emp`),
          remark_by_hod: getValues(`${formname}[${i}].remark_by_hod`),
          approved_by_hod: getValues(`${formname}[${i}].approved_by_hod`),
          outward_date: getValues(`${formname}[${i}].outward_date`),
          outward_assign_to: getValues(`${formname}[${i}].outward_assign_to`),
          document_upload_date: getValues(
            `${formname}[${i}].document_upload_date`
          ),
          file_doc: getValues(`${formname}[${i}].file_doc`),
          inward_is_save: 1,
          outward_is_save: 1,
        });

        break;
      }
    }

    obj.keys = onlyValidateToThose;

    return obj;
  };

  const onSave = async (is_save = 0) => {
    try {
      const validate = await trigger();
      if (validate) {
        const data = getValues()[formname];
        console.log("Form Data:", data);

        const formData = new FormData();

        const arr = [];

        const everySave = data.every(
          (d) => d?.inward_is_save == 1 || d?.outward_is_save == 1
        );

        if (everySave) {
          for (let e of data) {
            if (e?.file_doc) {
              const file = e?.file_doc[0] ? e?.file_doc[0] : "";
              if (file) {
                formData.append(`${e?.id}_file_doc`, file);
              }
            }

            delete e.file_doc;

            let obj = {
              id: e?.id,
              inward_no: e?.inward_no,
              outward_no: e?.outward_no,
              inward_date: e?.inward_date,
              outward_date: e?.outward_date,
              remark_by_emp: e?.remark_by_emp,
              approved_by_hod: selectedOptions,
              remark_by_hod: e?.remark_by_hod,
              inward_assign_to: e?.inward_assign_to,
              outward_assign_to: e?.outward_assign_to,
              document_upload_date: e?.document_upload_date,
              inward_is_save: e?.inward_is_save,
              outward_is_save: e?.outward_is_save,
              date: startdate,
              card:card,
            };

            arr.push(obj);
          }
        } else {
          for (let e of data) {
            if (e?.file_doc) {
              const file = e?.file_doc[0] ? e?.file_doc[0] : "";
              if (file) {
                formData.append(`${e?.id}_file_doc`, file);
              }
            }

            delete e.file_doc;

            let obj = {
              id: e?.id,
              inward_no: e?.inward_no,
              outward_no: e?.outward_no,
              inward_date: e?.inward_date,
              outward_date: e?.outward_date,
              inward_assign_to: e?.inward_assign_to,
              remark_by_emp: e?.remark_by_emp,
              remark_by_hod: e?.remark_by_hod,
              approved_by_hod: selectedOptions,
              outward_assign_to: e?.outward_assign_to,
              document_upload_date: e?.document_upload_date,
              inward_is_save: e?.inward_is_save,
              outward_is_save: e?.outward_is_save,
              date: startdate,
              card:card,
            };

            if (obj?.inward_is_save == 0) {
              // obj.inward_is_save = 1;
              arr.push(obj);
              break;
            } else if (obj?.outward_is_save == 0) {
              // obj.outward_is_save = 1;
              arr.push(obj);
              break;
            }
          }
        }

        console.log("Your values");

        console.log("edfc kikr=>", arr);
        console.log("-----------");

        formData.append("data", JSON.stringify(arr));
        formData.append("mst_file_id", params?.id);
        console.log("FormData Content:", formData);
        await onSubmit(formData);
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  const onSaveAndNext = async () => {
    try {
      let validate = false;

      if (superAccess()) {
        validate = await trigger();
        if (validate) {
          SwalAlert({
            confirmButtonText: "Save & Continue",
            title: "Are you sure?",
          })
            .then(async (result) => {
              if (result.isConfirmed) {
                const data = getValues()[formname];
                const formData = new FormData();

                const arr = [];

                for (let e of data) {
                  if (e?.file_doc) {
                    const file = e?.file_doc[0] ? e?.file_doc[0] : "";
                    if (file) {
                      formData.append(`${e?.id}_file_doc`, file);
                    }
                  }

                  delete e?.file_doc;

                  let obj = {
                    id: e?.id,
                    inward_no: e?.inward_no,
                    outward_no: e?.outward_no,
                    inward_date: e?.inward_date,
                    outward_date: e?.outward_date,
                    remark_by_emp: e?.remark_by_emp,
                    remark_by_hod: e?.remark_by_hod,
                    approved_by_hod: selectedOptions,
                    inward_assign_to: e?.inward_assign_to,
                    outward_assign_to: e?.outward_assign_to,
                    document_upload_date: e?.document_upload_date,
                    inward_is_save: e?.inward_is_save,
                    outward_is_save: e?.outward_is_save,
                    date: startdate,
                    card:card,
                  };

                  if (obj.inward_is_save == 0) {
                    obj.inward_is_save = 1;
                    arr.push(obj);
                    console.log("Inward break at id " + obj?.id);
                    break;
                  } else if (obj.outward_is_save == 0) {
                    obj.outward_is_save = 1;
                    arr.push(obj);
                    console.log("Outward break at id " + obj?.id);
                    break;
                  } else {
                    arr.push(obj);
                  }
                }

                console.log(arr);

                formData.append("mst_file_id", params?.id);
                formData.append("data", JSON.stringify(arr));

                await onSubmitAndNext(formData);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } else if (isEmp()) {
        const objValidation = await selectValidation();
        validate = await trigger(objValidation.keys);

        if (validate) {
          SwalAlert({
            confirmButtonText: "Save & Continue",
            title: "Are you sure?",
          })
            .then(async (result) => {
              if (result?.isConfirmed) {
                const data = objValidation.data;

                const formData = new FormData();

                const arr = [];
                for (let e of data) {
                  if (e?.file_doc) {
                    const file = e?.file_doc[0] ? e?.file_doc[0] : "";
                    if (file) {
                      formData.append(`${e?.id}_file_doc`, file);
                      delete e?.file_doc;
                    }
                  }

                  arr.push({
                    id: e?.id,
                    inward_no: e?.inward_no,
                    outward_no: e?.outward_no,
                    inward_date: e?.inward_date,
                    outward_date: e?.outward_date,
                    remark_by_emp: e?.remark_by_emp,
                    remark_by_hod: e?.remark_by_hod,
                    approved_by_hod: selectedOptions,
                    inward_assign_to: e?.inward_assign_to,
                    outward_assign_to: e?.outward_assign_to,
                    document_upload_date: e?.document_upload_date,
                    inward_is_save: e?.inward_is_save,
                    outward_is_save: e?.outward_is_save,
                    date: startdate,
                    card:card,
                  });
                }

                console.log(arr);
                formData.append("mst_file_id", params?.id);
                formData.append("data", JSON.stringify(arr));

                await onSubmitAndNext(formData);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  const onSubmit = async (data) => {
    console.log("data-->", data);
    try {
      setLoading(true);
      const res = await axios({
        method: save_filePlotValidation.method,
        url: save_filePlotValidation.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        if (res?.data?.data?.skip == 1) {
          let stage_no = res?.data?.data?.stage_no;
          props.onUpdateMstStage(parseInt(stage_no));
          props.onchangeStage(parseInt(stage_no));
        } else {
          reset({});
          await fetchPlotValidation();
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const onSubmitAndNext = async (data) => {
    try {
      setLoading(true);
      const res = await axios({
        method: save_and_next_filePlotValidation.method,
        url: save_and_next_filePlotValidation.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        setLoading(false);
        toast.success(res?.data?.message);
        if (res?.data?.data?.skip == 1) {
          if (!restrictTo.plotvalidation) {
            let stage_no = res?.data?.data?.stage_no;
            props.onUpdateMstStage(parseInt(stage_no));
            props.onchangeStage(parseInt(stage_no));
          } else {
            if (superAccess()) {
              let stage_no = res?.data?.data?.stage_no;
              props.onUpdateMstStage(parseInt(stage_no));
              props.onchangeStage(parseInt(stage_no));
            } else if (isEmp()) {
              if (getUserId() == lastAssignId) {
                let stage_no = res?.data?.data?.stage_no;
                props.onUpdateMstStage(parseInt(stage_no));
                props.onchangeStage(parseInt(stage_no));
              } else {
                localStorage.getItem("lastPath")
                  ? navigate(`/${localStorage.getItem("lastPath")}`)
                  : navigate(`/${FilesRoute.listFileOnline}`);
              }
            }
          }
        } else {
          if (!restrictTo.plotvalidation) {
            reset({});
            await fetchPlotValidation();
          } else {
            if (superAccess() || getUserId() == lastAssignId) {
              reset({});
              await fetchPlotValidation();
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
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const handleInput = (e, index) => {
    setValue(`${formname}[${parseInt(index) + 1}].inward_date`, e.target.value);
  };

  const fetchPlotValidation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios({
        method: get_filePlotValidation.method,
        url: `${get_filePlotValidation.url}/${params.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        setLoading(false);

        const data1 = res?.data?.data1;

        const data2 = res?.data?.data2;
        console.log("data1==>", data1);
        setEndDate(data1[0].created_at.substring(0, 10));
        setCard(data1[0]?.card)
        setSelectedOptions(
          data1.map((item) => (item.approved_by_hod === 1 ? "Yes" : "No"))
        );
        if (Array.isArray(data2) && data2?.length > 0) {
          if (Array.isArray(data1) && data1.length > 0) {
            setFormDisabled(
              data1.every(
                (d) => d?.inward_is_save == 1 && d?.outward_is_save == 1
              )
                ? 1
                : 0
            );

            data1.forEach((data1_element, data1_index) => {
              data1_element.inward_no =
                data1_element.inward_is_save == 1
                  ? data1_element.inward_no
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.inward_no
                    ? data1_element.inward_no
                    : data2[data1_index]?.inward_no
                  : data1_element.inward_no;
              data1_element.inward_date =
                data1_element.inward_is_save == 1
                  ? sanitizeDate(data1_element.inward_date)
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.inward_date
                    ? sanitizeDate(data1_element.inward_date)
                    : sanitizeDate(data2[data1_index]?.inward_date)
                  : sanitizeDate(data1_element.inward_date);
              data1_element.inward_assign_to =
                data1_element.inward_is_save == 1
                  ? data1_element.inward_assign_to
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.inward_assign_to
                    ? data1_element.inward_assign_to
                    : data2[data1_index]?.inward_assign_to
                  : data1_element.inward_assign_to;
              data1_element.outward_no =
                data1_element.outward_is_save == 1
                  ? data1_element.outward_no
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.outward_no
                    ? data1_element.outward_no
                    : data2[data1_index]?.outward_no
                  : data1_element.outward_no;
              data1_element.outward_date =
                data1_element.outward_is_save == 1
                  ? sanitizeDate(data1_element.outward_date)
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.outward_date
                    ? sanitizeDate(data1_element.outward_date)
                    : sanitizeDate(data2[data1_index]?.outward_date)
                  : sanitizeDate(data1_element.outward_date);
              data1_element.outward_assign_to =
                data1_element.outward_is_save == 1
                  ? data1_element.outward_assign_to
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.outward_assign_to
                    ? data1_element.outward_assign_to
                    : data2[data1_index]?.outward_assign_to
                  : data1_element.outward_assign_to;
              data1_element.documents =
                data1_element.outward_is_save == 1
                  ? data1_element.documents
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.documents
                    ? data1_element.documents
                    : data2[data1_index]?.documents
                  : data1_element.documents;
              data1_element.document_upload_date =
                data1_element.outward_is_save == 1
                  ? sanitizeDate(data1_element.document_upload_date)
                  : data2[data1_index]?.is_rejected >= 1
                  ? data1_element.document_upload_date
                    ? sanitizeDate(data1_element.document_upload_date)
                    : sanitizeDate(data2[data1_index]?.document_upload_date)
                  : sanitizeDate(data1_element.document_upload_date);
            });

            // setFormDisabled(data1.every((d) => (d?.inward_is_save == 1 && d?.outward_is_save == 1)) ? 1 : 0);

            append(data1);

            // setTestData(data1);
          }
        } else {
          setFormDisabled(
            data1.every(
              (d) => d?.inward_is_save == 1 && d?.outward_is_save == 1
            )
              ? 1
              : 0
          );

          data1.forEach((data1_element, data1_index) => {
            data1_element.inward_date = sanitizeDate(data1_element.inward_date);
            data1_element.outward_date = sanitizeDate(
              data1_element.outward_date
            );
            data1_element.document_upload_date = sanitizeDate(
              data1_element.document_upload_date
            );
          });

          append(data1);
          // setTestData(data1);
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
  }, []);

  const fetchLisoner = useCallback(async () => {
    try {
      const res = await ApiService(
        null,
        0,
        AuthHeader(),
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
        AuthHeader(),
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

  const rejectButton = async () => {};

  const openModal = async () => {};

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

  const onSkip = (id, forWhat) => {
    SwalAlert({ confirmButtonText: "Save & Continue", title: "Are you sure?" })
      .then(async (result) => {
        if (result.isConfirmed) {
          await skipTheStage(id, forWhat);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const skipTheStage = async (id, forWhat) => {
    try {
      const data = {
        id: id,
        for: forWhat,
        mst_file_id: params?.id,
      };
      const res = await axios({
        method: skip_filePlotValidation.method,
        url: skip_filePlotValidation.url,
        headers: AuthHeader(),
        data: data,
      });

      if (!res?.data?.error) {
        toast.success(res?.data?.message);

        if (res?.data?.data?.skip == 1) {
          props.onUpdateMstStage(5);
          props.onchangeStage(5);
        } else {
          reset({});
          await fetchPlotValidation();
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
      if (err.response.data.error) {
      }
    }
  };

  const getSkipValue = async () => {
    const data = getValues()[formname];

    let obj = {
      id: null,
      forWhat: "",
    };

    for (let i = 0; i < data.length; i++) {
      if (data[i].inward_is_save == 0) {
        obj = { id: getValues(`${formname}[${i}].id`), forWhat: "inward" };
        break;
      } else if (data[i].outward_is_save == 0) {
        obj = { id: getValues(`${formname}[${i}].id`), forWhat: "outward" };
        break;
      }
    }

    return obj;
  };

  // const onSkip2 = () => {
  //     SwalAlert({ confirmButtonText: "Skip", title: "Are you sure?" }).then(async (result) => {
  //         if (result.isConfirmed) {
  //             await skipTheStage2();
  //         }
  //     }).catch((err) => {
  //         console.log(err);
  //     })
  // }

  // const skipTheStage2 = async () => {
  //     try {
  //         const skipData = await getSkipValue();
  //         console.log(skipData);
  //         const data = {
  //             id: skipData?.id,
  //             for: skipData?.forWhat,
  //             mst_file_id: params?.id
  //         }
  //         const res = await axios({
  //             method: skip_filePlotValidation.method,
  //             url: skip_filePlotValidation.url,
  //             headers: AuthHeader(),
  //             data: data
  //         });

  //         if (!res?.data?.error) {
  //             toast.success(res?.data?.message);

  //             if (res?.data?.data?.skip == 1) {
  //                 let stage_no = res?.data?.data?.stage_no;
  //                 props.onUpdateMstStage(parseInt(stage_no));
  //                 props.onchangeStage(parseInt(stage_no));
  //             }
  //             else {
  //                 reset({});
  //                 await fetchPlotValidation();
  //             }

  //         }
  //         else {
  //             toast.error(res?.data?.message);
  //         }
  //     }
  //     catch (err) {
  //         toast.error("Something went wrong");
  //         if (err.response.data.error) { }
  //     }
  // }

  const onReject = () => {
    SwalAlert({ confirmButtonText: "Reject", title: "Are you sure?" })
      .then(async (result) => {
        if (result.isConfirmed) {
          await doReject();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const doReject = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: reject_filePlotValidation.method,
        url: `${reject_filePlotValidation.url}`,
        data: { reason: getValues("reason"), mst_file_id: params?.id },
        headers: AuthHeader(),
      });

      if (!res.data?.error) {
        closeRejectForm();
        setLoading(false);
        toast.success(res?.data?.message);
        reset({});
        await fetchPlotValidation();
      } else {
        closeRejectForm();
        setLoading(false);
        toast.error(res?.data?.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
      console.log(err);
    }
  }, []);

  useEffect(async () => {
    const FETCH_1 = fetchLisoner();
    const FETCH_3 = fetchPlotValidation();
    const FETCH_2 = fetchPlanner();

    await FETCH_1;
    await FETCH_3;
    await FETCH_2;
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
        getMessageToClient.method,
        getMessageToClient.url
      );
      console.log("startDate==res==>", res);
      if (!res.data.error) {
        setLoading(false);

        setStartDate(res.data.data.created_at.substring(0, 10));
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error(err.response.data.message);
      if (err.response.data.error) {
      }
    }
  };

  useEffect(() => {
    fetchStartDate();
  }, []);

  const sanitizeDate = (date) => {
    return date != null ? GetDate(date, "YYYY-MM-DD") : todayDate();
  };

  return (
    <div class="grey-border rounded">
      <div className="card-header bg-white">
      <div className=" d-flex align-items-center justify-content-between">
        <h5 class="mb-0 font-weight-normal">Plot Validation Certificate</h5>
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
      <div className="multiple_border">
        <span></span>
        <div className="checkbox_row list_checkbox">
          <div className="checkbox_box">
         
            <input type="checkbox"  />
            <p>CTDO</p>
          </div>
          <div className="checkbox_box">
            <input type="checkbox"  />
            <p>TP</p>
          </div>
          <div className="checkbox_box">
            <input type="checkbox" />
            <p>ZONE</p>
          </div>
          <div className="checkbox_box">
            <input type="checkbox" />
            <p>TP</p>
          </div>
          <div className="checkbox_box">
            <input type="checkbox" />
            <p>CTDO</p>
          </div>
        </div>
      </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {/* {JSON.stringify(testData)} */}
        {!loading ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="d-flex  button_row">
              <div
                className={classNames("btn col", {
                  active: props.plotTypes == 1,
                })}
              >
                Draft
              </div>
              <div
                className={classNames("btn col", {
                  active: props.plotTypes == 2,
                })}
              >
                Final
              </div>
              <div
                className={classNames("btn col", {
                  active: props.plotTypes == 3,
                })}
              >
                Non TP
              </div>
            </div>

            <div>
              {fields.map((field, index, fields) => (
                <React.Fragment>
                  <div className="position-relative">
                    <div className="inner_box_design">
                      {!index ||
                      (index > 0 &&
                        getValues(
                          `${formname}[${index - 1}].outward_is_save`
                        )) ? (
                        <p>{field?.type_name}</p>
                      ) : (
                        ""
                      )}
                      <span className="innerr_box"></span>
                    </div>

                    {!index ||
                    (index > 0 &&
                      getValues(
                        `${formname}[${index - 1}].outward_is_save`
                      )) ? (
                      <>
                        <div className="d-flex align-items-center justify-content-between">
                          <h3 className="mb-0 ">{field?.type_name}</h3>
                        </div>

                        <div className="inward_border_box">
                          <div className="d-flex align-items-center justify-content-between">
                            <h4 className="mb-0">Inward Details</h4>
                            <div className="pr-4  pt-0">
                              <label
                                htmlFor={`${formname}[${index}].inward_date`}
                              >
                                Inward Data
                              </label>
                              <input
                                type="date"
                                name={`${formname}[${index}].inward_date`}
                                id={`${formname}[${index}].inward_date`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]?.inward_date
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].inward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                {...register(
                                  `${formname}[${index}].inward_date`,
                                  { required: true }
                                )}
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]?.inward_date
                                  ?.message
                              )}
                            </div>
                          </div>
                          <div className="row pt-3">
                            <div className="col">
                              <label
                                htmlFor={`${formname}[${index}].inward_no`}
                              >
                                Inward No
                              </label>
                              <input
                                type="text"
                                name={`${formname}[${index}].inward_no`}
                                id={`${formname}[${index}].inward_no`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]?.inward_no
                                )}
                                {...register(
                                  `${formname}[${index}].inward_no`,
                                  { required: true }
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].inward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                placeholder="Inward No."
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]?.inward_no
                                  ?.message
                              )}
                            </div>

                            <div className="col">
                              <label
                                htmlFor={`${formname}[${index}].inward_assign_to`}
                              >
                                Assign To
                              </label>

                              <select
                                name={`${formname}[${index}].inward_assign_to`}
                                id={`${formname}[${index}].inward_assign_to`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]
                                    ?.inward_assign_to
                                )}
                                {...register(
                                  `${formname}[${index}].inward_assign_to`,
                                  { required: true }
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].inward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                onChange={
                                  getValues(
                                    `${formname}[${index}].inward_is_save`
                                  ) == 0
                                    ? (e) => {
                                        setLastAssignId(e?.target?.value);
                                      }
                                    : null
                                }
                              >
                                <option value="">--Select--</option>

                                {lisonerdata.map((data) => (
                                  <option
                                    value={data.id}
                                    selected={
                                      data?.id ==
                                      getValues(
                                        `${formname}[${index}].inward_assign_to`
                                      )
                                    }
                                  >
                                    {data.first_name} {data.last_name}
                                  </option>
                                ))}
                              </select>

                              {displayError(
                                errors[`${formname}`]?.[index]?.inward_date
                                  ?.message
                              )}
                            </div>
                            {/* <div className='col'>
                                        {getValues(`${formname}[${index}].inward_is_save`)==0 ? 
                                            <button type="button" onClick={()=>onSkip(getValues(`${formname}[${index}].id`),"inward")}><i class="fas fa-forward"></i></button>
                                        :""}
                                    </div> */}
                          </div>
                        </div>
                      </>
                    ) : (
                      ""
                    )}

                    {getValues(`${formname}[${index}].inward_is_save`) == 1 ? (
                      <>
                        <div className="inward_border_box mt-4">
                          <h4 className="mb-0">Inward Details</h4>
                          <div className="row pt-3">
                            <div className="col">
                              <label
                                htmlFor={`${formname}[${index}].outward_no`}
                              >
                                Outward No
                              </label>
                              <input
                                type="text"
                                name={`${formname}[${index}].outward_no`}
                                id={`${formname}[${index}].outward_no`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]?.outward_no
                                )}
                                {...register(
                                  `${formname}[${index}].outward_no`,
                                  { required: true }
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].outward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                placeholder="Outward No."
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]?.outward_no
                                  ?.message
                              )}
                            </div>
                            <div className="col">
                              <label
                                htmlFor={`${formname}[${index}].outward_date`}
                              >
                                Outward Data
                              </label>
                              <input
                                type="date"
                                name={`${formname}[${index}].outward_date`}
                                id={`${formname}[${index}].outward_date`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]?.outward_date
                                )}
                                onChange={(e) => handleInput(e, index)}
                                {...register(
                                  `${formname}[${index}].outward_date`,
                                  { required: true }
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].outward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]?.outward_date
                                  ?.message
                              )}
                            </div>
                            <div className="col">
                              <label
                                htmlFor={`${formname}[${index}].outward_assign_to`}
                              >
                                Assign To
                              </label>
                              <select
                                name={`${formname}[${index}].outward_assign_to`}
                                id={`${formname}[${index}].outward_assign_to`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]
                                    ?.outward_assign_to
                                )}
                                {...register(
                                  `${formname}[${index}].outward_assign_to`,
                                  { required: true }
                                )}
                                // defaultValue={lionserValues.length> 0 ? lionserValues[index]?.outward_assign_to : ""}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].outward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                onChange={
                                  getValues(
                                    `${formname}[${index}].outward_is_save`
                                  ) == 0
                                    ? (e) => {
                                        setLastAssignId(e?.target?.value);
                                      }
                                    : null
                                }
                              >
                                <option value="">--Select--</option>

                                {lisonerdata.map((data) => (
                                  <option
                                    value={data.id}
                                    selected={
                                      data?.id ==
                                      getValues(
                                        `${formname}[${index}].outward_assign_to`
                                      )
                                        ? true
                                        : false
                                    }
                                  >
                                    {data.first_name} {data.last_name}
                                  </option>
                                ))}
                              </select>
                              {displayError(
                                errors[`${formname}`]?.[index]
                                  ?.outward_assign_to?.message
                              )}
                            </div>
                            {/* <div className='col'>
                                        {getValues(`${formname}[${index}].outward_is_save`)==0 ? 
                                            <button type="button" onClick={()=>onSkip(getValues(`${formname}[${index}].id`),"outward")}><i class="fas fa-forward"></i></button>
                                        :""}
                                    </div> */}
                          </div>
                        </div>
                        <div className="inward_border_box mt-4">
                          <div className="row pt-3">
                            <div className="col-md-6">
                              <label
                                htmlFor={`${formname}[${index}].document_upload_date`}
                              >
                                Upload Date
                              </label>
                              <input
                                type="date"
                                id={`${formname}[${index}].document_upload_date`}
                                name={`${formname}[${index}].document_upload_date`}
                                className={formclass(
                                  errors[`${formname}`]?.[index]
                                    ?.document_upload_date
                                )}
                                {...register(
                                  `${formname}[${index}].document_upload_date`,
                                  { required: true }
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].outward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]
                                  ?.document_upload_date?.message
                              )}
                            </div>
                            <div className="col position-relative col-md-6">
                              <label htmlFor={`${formname}[${index}].file_doc`}>
                                File
                              </label>
                              <input
                                type="file"
                                name={`${formname}[${index}].file_doc`}
                                id={`${formname}[${index}].file_doc`}
                                {...register(`${formname}[${index}].file_doc`, {
                                  required: false,
                                })}
                                className={formclass(
                                  errors[`${formname}`]?.[index]?.file_doc
                                )}
                                disabled={
                                  superAccess()
                                    ? false
                                    : getValues(
                                        `${formname}[${index}].outward_is_save`
                                      ) == 1
                                    ? true
                                    : false
                                }
                                style={{ height: "auto" }}
                              />
                              {displayError(
                                errors[`${formname}`]?.[index]?.file_doc
                                  ?.message
                              )}
                              {field?.documents ? (
                                <a
                                  href={`${FileUrl}/${field?.documents}`}
                                  style={{
                                    position: "absolute",
                                    right: "-8px",
                                    top: "50%",
                                  }}
                                  target={"_blank"}
                                >
                                  <ReactSVG
                                    src={`${eyeButtonSvg}`}
                                    wrapper="span"
                                    beforeInjection={(svg) => {
                                      // svg.classList.add('svg-class-name')
                                      svg.setAttribute("style", "width: 20px");
                                    }}
                                  />
                                </a>
                              ) : (
                                ""
                              )}
                            </div>

                            <div className="col-md-6">
                              <label
                                htmlFor={`${formname}[${index}].remark_by_emp`}
                              >
                                Remark By(Assign To Name)
                              </label>
                              <textarea
                                id={`${formname}[${index}].remark_by_emp`}
                                name={`${formname}[${index}].remark_by_emp`}
                                className="form-control"
                                {...register(
                                  `${formname}[${index}].remark_by_emp`
                                )}
                                disabled={!isEmp()}
                              />
                            </div>
                            <div className="col-md-6">
                              <label
                                htmlFor={`${formname}[${index}].remark_by_hod`}
                              >
                                Remark By HOD
                              </label>
                              <textarea
                                id={`${formname}[${index}].remark_by_hod`}
                                name={`${formname}[${index}].remark_by_hod`}
                                className="form-control"
                                {...register(
                                  `${formname}[${index}].remark_by_hod`
                                )}
                                disabled={!ishod()}
                              />
                            </div>

                            <div className="col-md-6">
                              <label>Approved By HOD</label>
                              <div>
                                <input
                                  type="radio"
                                  id={`approval${index}`}
                                  name={`approval[${index}]`}
                                  value="Yes"
                                  checked={selectedOptions[index] === "Yes"}
                                  onChange={(e) =>
                                    handleOptionsChanges(e, index)
                                  }
                                  disabled={!ishod()}
                                />
                                <label htmlFor={`approval${index}`}>Yes</label>
                              </div>
                              <div>
                                <input
                                  type="radio"
                                  id={`approval${index}`}
                                  name={`approval[${index}]`}
                                  value="No"
                                  checked={selectedOptions[index] === "No"}
                                  onChange={(e) =>
                                    handleOptionsChanges(e, index)
                                  }
                                  disabled={!ishod()}
                                />
                                <label htmlFor={`approval${index}`}>No</label>
                              </div>
                            </div>

                            <div className="col">
                              {getValues(
                                `${formname}[${index}].outward_is_save`
                              ) == 0 ? (
                                <button
                                  type="button"
                                  id="openRejectForm"
                                  data-toggle="modal"
                                  data-target="#rejectForm"
                                  class="btn mt-3"
                                >
                                  Reject
                                </button>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                  <span className="extra_border"></span>
                </React.Fragment>
              ))}
            </div>
            <br />
            <button type="button" onClick={() => onSave(0)} className="btn">
              Save
            </button>
            {superAccess() ? (
              <div className="row" style={{ justifyContent: "space-around" }}>
                <button type="button" onClick={() => onSave(0)} className="btn">
                  Save
                </button>

                {!formDisabled ? (
                  <>
                    {/* <button type='button' onClick={onSkip2} className='btn'>Skip</button> */}

                    <button
                      type="button"
                      onClick={onSaveAndNext}
                      className="btn"
                    >
                      Save and Next
                    </button>
                  </>
                ) : (
                  ""
                )}
              </div>
            ) : [empKey].includes(getRole()) && !formDisabled ? (
              <div className="row" style={{ justifyContent: "space-around" }}>
                <button type="button" onClick={onSaveAndNext} className="btn">
                  Save and Next
                </button>

                {/* <button type='button' onClick={onSkip2} className='btn'>Skip</button> */}
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

        {!formDisabled ? (
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
                            {...register("reason", { required: false })}
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
                    <button
                      type="button"
                      class="btn"
                      onClick={() => onReject()}
                    >
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
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PlotValidationCertificate_new_code;
