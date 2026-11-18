import React, { useState, useEffect } from "react";
import { image2svg } from "../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { Cordinator, getToken, superAccess } from "../../../services/useLocalStorage";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import { TodosRoute } from "../../../config/RouteConfig";
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { checkTodo, getTodosById } from "../../../config/config";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminKey, subadmin,cordinator } from "../../../config/RoleConfig";

//For admin only
const PreviewTodo = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState({});

  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
  });
 

  const handleButtonClick = () => {
    const path = localStorage.getItem("path");
    const view = localStorage.getItem("view");

    if (path && view) {
      localStorage.removeItem("view");
      navigate(path);
    } else {
      navigate(`/${TodosRoute.list}`);
    }
  };

  const goBack = () => {
    navigate(`/${TodosRoute.list}`);
  };

  const validJson = (json_string) => {
    try {
      JSON.parse(json_string);
      return true;
    } catch (err) {
      return false;
    }
  };

  const fetchTodo = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        parseInt(params?.id),
        header,
        getTodosById.method,
        getTodosById.url
      );
      if (!res?.data?.error) {
      
        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length) {
          const data = payload[0];
          console.log("data----->",data)
          console.log("payload==>",payload)
          setTodo({
            id: data?.id,
            title: data?.title,
            description: data?.description ? data?.description.trim() : "",
            team_fullname: data?.team_fullname,
            team_id: data?.team_id,
            card: validJson(data?.card) ? JSON.parse(data?.card) : [],
            execution_date: data?.execution_date
              ? GetDate(data?.execution_date, "DD-MMM-YYYY")
              : "-",
            completed_date: data?.completed_date
              ? GetDate(data?.completed_date, "DD-MMM-YYYY")
              : "-",
            extended_date: data?.execution_date
              ? GetDate(data?.extended_date, "DD-MMM-YYYY")
              : "-",
            remarks: data?.remarks,
            actual_completed_date: data?.actual_completed_date
              ? GetDate(data?.actual_completed_date, "DD-MMM-YYYY")
              : "-",
            reason: data?.reason,
            work_done: data?.work_done,
            work_pending: data?.work_pending,
            is_approved: data?.is_approved,
            mark_as_done: data?.mark_as_done,
          });
         


          const cardData = validJson(data?.card) ? JSON.parse(data?.card) : [];

          var cardNo = 0;

          if (Array.isArray(cardData) && cardData.length) {
            cardNo = cardData[cardData.length - 1]?.card_no;
          }

          reset({
            reason: payload[0]?.reason,
            card_no: cardNo ? cardNo : "",
            remarks: data?.remarks,
            is_approved: data?.is_approved,
          });
        }

        setLoading(false);
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
        navigate(`/${TodosRoute.list}`);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };


  const onRegenerate = async () => {
    SwalAlert({
      confirmButtonText: "Continue",
      title: "Do you wanna regenerate?",
    })
      .then(async (result) => {
        if (result?.isConfirmed) {
          const validate = await trigger();

          if (validate) {
            const values = getValues()[`${formname}`];
            const formData = new FormData();
            console.log(values);
            exit;
            let i = 0;

            const arr = [];
            for (var e of values) {
              let obj = {
                index: i,
                id: parseInt(params?.id),
                mst_file_id: params?.id,
                mst_type_id: e?.mst_type_id,
                show_website: e?.show_website,
                description: e?.description,
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

            await onSubmit(formData)
            // console.log("formData=====>",formData);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await ApiService(
        { ...data, id: parseInt(params?.id) },
        0,
        header,
        checkTodo.method,
        checkTodo.url
      );
      if (!res.data?.error) {
       
        setLoading(false);
        toast.success(res?.data?.message);
        const path = localStorage.getItem("path");
        const view = localStorage.getItem("view");
        if (path && view) {
          localStorage.removeItem("view");
          navigate(path);
        } else {
          navigate(`/${TodosRoute.list}`);
        }
      } else {
        setLoading(false);
        toast.error(res?.data?.message);
        navigate(`/${TodosRoute.list}`);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };
  // console.log("todo====>",todo)
  console.log("reason===>", todo?.reason)
  console.log(" work_done===>", todo?.work_done)
  console.log("work_pending===>", todo?.work_pending)


  useEffect(() => {
    fetchTodo();
  }, []);

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Preview</h1>
          <p className="mb-4">Todo</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-5">
              <div className="card-header bg-transparent border-0 mb-5 p-0">
                <div className="row align-items-center justify-content-between">
                  <div className="col-md-6">
                    <h6 className="title-line text-shadow-yellow mb-0 pb-3">
                      Preview Todo
                    </h6>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  displayLoader()
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                      <div className="col">
                        <label htmlFor="title">Team</label>
                        <p>{todo?.team_fullname}</p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <label htmlFor="title">Title</label>
                        <p>{todo?.title}</p>
                      </div>
                    </div>
                    {todo?.description ? (
                      <div className="row">
                        <div className="col">
                          <label htmlFor="Description">description</label>
                          <p>{todo?.description}</p>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}

                    <div className="row">
                      <div className="col">
                        <label htmlFor="execution_date">Execution date</label>
                        <p>{todo?.execution_date}</p>
                      </div>
                      <div className="col">
                        <label htmlFor="completed_date">Due date</label>
                        <p>{todo?.completed_date}</p>
                      </div>
                      <div className="col">
                        <label htmlFor="extended_date">Extended date</label>
                        <p>{todo?.extended_date}</p>
                      </div>
                    </div>
                    <hr />
                    <div className="row">
                      <div className="col">
                        <label htmlFor="actual_completed_date">
                          Task submitted at
                        </label>
                        <p>{todo?.actual_completed_date}</p>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-4">
                        <div className="form-group">
                          <label htmlFor="reason">Work Done</label>
                          <textarea
                            name="reason"
                            id="reason"
                            cols="30"
                            className="form-control"
                            rows="5"
                            defaultValue={todo?.reason}
                            
                            disabled={
                              superAccess([adminKey, subadmin]) ? false : true
                            }
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <label htmlFor="work_done">What's Next</label>
                          <textarea
                            name="work_done"
                            id="work_done"
                            cols="30"
                            className="form-control"
                            rows="5"
                            defaultValue={todo?.work_done}
                           
                            disabled={
                              superAccess([adminKey, subadmin]) ? false : true
                            }
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="form-group">
                          <label htmlFor="work_pending">
                            Any Pending Work?
                          </label>
                          <textarea
                            name="work_pending"
                            id="work_pending"
                            cols="30"
                            className="form-control"
                            rows="5"
                            defaultValue={todo?.work_pending}
                           
                            disabled={
                              superAccess([adminKey, subadmin]) ? false : true
                            }
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="remarks">Your remarks</label>
                          <textarea
                            name="remarks"
                            id="remarks"
                            className="form-control"
                            placeholder="Description"
                            {...register("remarks")}
                            cols="30"
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    {/* {!Cordinator(cordinator) && (
                   <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="card_no">Card</label>
                          <select
                            name="card_no"
                            id="card_no"
                            {...register("card_no", { required: true })}
                            className="form-control"
                          >
                            <option value={""}>--Select Card--</option>
                            <option value="1">Green</option>
                            <option value="2">Yellow</option>
                            <option value="3">Red</option>
                            <option value="4">Cyan</option>
                          </select>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="is_approved">Status</label>
                          <select
                            name="is_approved"
                            id="is_approved"
                            {...register("is_approved", { required: true })}
                            className="form-control"
                          >
                            <option value="">--Select Status--</option>
                            <option value="0">Pending</option>
                            <option value="1">Approved</option>
                            <option value="2">Reject</option>
                          </select>
                        </div>
                      </div>
                    </div>
                   
   )}  */}
    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="card_no">Card</label>
                          <select
                            name="card_no"
                            id="card_no"
                            {...register("card_no", { required: true })}
                            className="form-control"
                          >
                            <option value={""}>--Select Card--</option>
                            <option value="1">Green</option>
                            <option value="2">Yellow</option>
                            <option value="3">Red</option>
                            <option value="4">Cyan</option>
                          </select>
                        </div>
                      </div>
                      <div className="col">
                        <div className="form-group">
                          <label htmlFor="is_approved">Status</label>
                          <select
                            name="is_approved"
                            id="is_approved"
                            {...register("is_approved", { required: true })}
                            className="form-control"
                          >
                            <option value="">--Select Status--</option>
                            <option value="0">Pending</option>
                            <option value="1">Approved</option>
                            <option value="2">Reject</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="form-group mb-0 col-md-2">
                        <button
                          type="submit"
                          className="btn"
                          // onClick={handleButtonClick}
                        >
                          Submit
                        </button>
                      </div>
                      <div className="form-group mb-0 col-md-2">
                        <button className="btn" onClick={onRegenerate}>
                          Regenerate
                        </button>
                      </div>
                      <div className="form-group mb-0 col-md-4">
                        <button
                          type="button"
                          onClick={handleButtonClick}
                          className="btn"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PreviewTodo;
