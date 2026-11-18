import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import ApiService from '../../../../services/ApiService';
import { getRole, getToken, isAdmin, isCust, isEmp, superAccess } from '../../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import { useNavigate, NavLink, Link, useParams } from 'react-router-dom';
import { displayError, formclass } from '../../../../services/ValidationService';
import { GetDate, todayDate } from '../../../../services/DateAndTimeService';
import {adminKey,HoD,empKey, customerKey } from '../../../../config/RoleConfig';
import { getAssistantJuniorEngineer, getDeputyEngineer, sendAssistantJuniorEngineer, sendDeputyEngineer, skipDeputyEngineer } from '../../../../config/config';
import file_url, { eyeButtonSvg, FileUrl } from '../../../../config/file_url';

import { SwalAlert } from '../../../../UtilsComponent/SwalDialog';
import { AuthHeader } from '../../../../services/FormCommon';
import axios from "axios";
import { ReactSVG } from 'react-svg';

const Deputy_engineer = (props) => {

    const navigate = useNavigate();
    const params = useParams();
    const [startdate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");
    const [selectedOptions, setSelectedOptions] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSave, setIsSave] = useState(0);
    const [isFormDisabled, setFormDisabled] = useState(0);
    const [filepath, setFilePath] = useState("");
    const [card, setCard] = useState("");
    const { formState: { errors }, handleSubmit, register, reset } = useForm({
        mode: "onChange"
    });


    // const rejectFileQuery = () => {
    //     const typeNumber = 2;
    //     if (parseInt(params?.id)) {
    //         SwalAlert({ title: "Do you wanna reject?", confirmButtonText: "Reject!" }).then((result) => {
    //             if (result.isConfirmed) {
    //                 props.onRejectFileQuery(parseInt(params?.id), typeNumber);
    //             }
    //         }).catch((err) => {
    //             console.log(err);
    //         });
    //     }
    // }


    const onSubmit = async (data) => {

        const obj = {
            mst_file_id: parseInt(params.id),
            type_number: 1,
            is_save: isSave,
            remarks: data?.remarks,
            date: data?.date,
            approved_by_hod:selectedOptions,
            remark_by_hod:data?.remark_by_hod,
            remark_by_emp:data?.remark_by_emp,
            date:startdate,
            card:card,
        };

        const file = data?.documents;
        const formData = new FormData();

        for (let key of Object.keys(obj)) {
            formData.append(key, obj[key]);
        }

        if (file) {
            formData.append("documents", file[0]);
        }

        console.log(file[0]);

        try {
            setLoading(true);
            const header = { Authorization: `Bearer ${getToken()}`, ['Content-Type']: 'multipart/form-data' }
            const res = await ApiService(formData, 0, header, sendDeputyEngineer?.method, sendDeputyEngineer?.url);
            if (!res.data?.error) {
                setLoading(false);
                const payload = res.data?.data;
                toast.success(res?.data?.message);

                if (payload?.filename) {
                    setFilePath(payload?.filename);
                }

                if (isSave) {
                    props.onUpdateMstStage(11);
                    props.onchangeStage(11);
                }
            }
            else {
                setLoading(false);
                toast.error(res?.data?.message);
            }
        }
        catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message);
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            const header = { Authorization: `Bearer ${getToken()}`, ['Content-Type']: 'application/json' }
            const res = await ApiService(null, parseInt(params?.id), header, getDeputyEngineer?.method, getDeputyEngineer?.url);
            if (!res?.data?.error) {
                setLoading(false);

                console.log(res?.data);

                const data1 = res?.data?.data1;
                const data2 = res?.data?.data2;
                setSelectedOptions(data1[0].approved_by_hod === 1 ? "Yes" : "No");
                setEndDate(GetDate(data1[0]?.created_at, "YYYY-MM-DD"));
                setCard(data1[0].card)
                if (!res.data?.maxcount) {
                    setFilePath("");
                    reset({ remarks: "", date: todayDate() });
                }
                else {
                    if (Array.isArray(data1) && data1.length) {
                        if (parseInt(data1[0]?.is_save) > 0) {
                            setFormDisabled(1);
                        }

                        if (typeof data1[0]?.documents != "undefined" && data1[0]?.documents?.length > 0) {
                            setFilePath(data1[0]?.documents);
                        } else {
                            setFilePath("");
                        }

                        // reset({ remarks: data1[0]?.remarks, date: GetDate(data1[0]?.date, "YYYY-MM-DD") });

                        reset({ remarks: data1[0]?.remarks, date: data1[0]?.date ?  GetDate(data1[0]?.date, "YYYY-MM-DD"):todayDate(),  remark_by_emp:data1[0].remark_by_emp,
                        remark_by_hod:data1[0].remark_by_hod });

                    }
                    else {
                        setFormDisabled(0);
                        if (typeof data2[0]?.documents != "undefined" && data2[0]?.documents?.length > 0) {
                            setFilePath(data2[0]?.documents);
                        } else {
                            setFilePath("");
                        }
                        // reset({ remarks: data2[0]?.remarks, date: GetDate(data2[0]?.date, "YYYY-MM-DD") });

                        reset({ remarks: data2[0]?.remarks, date: data2[0]?.date ?  GetDate(data2[0]?.date, "YYYY-MM-DD"):todayDate(),  remark_by_emp:data2[0].remark_by_emp,
                        remark_by_hod:data2[0].remark_by_hod, });

                    }
                }


            }
            else {
                setLoading(false);
                reset({ remarks: "", date: todayDate() });
                toast.error(res?.data?.message);
            }
        }
        catch (err) {
            setLoading(false);
            // console.log(err);
            toast.error(err.response?.data?.message);
        }
    }

    useEffect(() => {
        if (!loading) {
            if ([customerKey].includes(getRole())) {
                // document.getElementById("fieldset").disabled = true;
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            // document.getElementById("fieldset").disabled = isFormDisabled ? true : false;
        }
    }, [isFormDisabled]);

    const skipTheStage = async () => {
        try {
            setLoading(true);
            const res = await axios({
                method: skipDeputyEngineer.method,
                url: `${skipDeputyEngineer.url}/${params.id}`,
                headers: AuthHeader()
            });

            if (!res?.data?.error) {
                setLoading(false);

                toast.success(res?.data?.message);

                if (res?.data?.data?.skip == 1) {
                    props.onUpdateMstStage(11);
                    props.onchangeStage(11);
                }
                else {
                    props.onchangeStage(11);
                }


            } else {
                setLoading(false);
                toast.error(res?.data?.message);
            }
        }
        catch (err) {
            setLoading(false);
            console.log(err);
            toast.error("Something went wrong");
        }
    }

    // const onSkip = () => {
    //     SwalAlert({ title: "Do you want to skip?", confirmButtonText: "Skip!" }).then(async (result) => {
    //         if (result.isConfirmed) {
    //             await skipTheStage();
    //         }
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // }


    const handleOptionsChanges = (e) => {
        setSelectedOptions(e.target.value);
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
            getAssistantJuniorEngineer.method,
            getAssistantJuniorEngineer.url
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
      useEffect(()=>{
        fetchStartDate();
      },[]);

    return (
        <div class="grey-border rounded">
        <div className="card-header bg-white">
          <div className=" d-flex align-items-center justify-content-between">
                <h5 class="mb-0 font-weight-normal">Deputy Engineer</h5>
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
                {
                    !loading ?

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <fieldset id="fieldset">
                            <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="date">Query Date</label>
                                            <input
                                                type="date"
                                                name="date"
                                                id="date"
                                                placeholder='Query date'
                                                defaultValue={todayDate()}
                                                {...register("date")}
                                                className={formclass(errors?.date)}
                                                disabled={superAccess() ? false : isFormDisabled || isCust() ? true : false}
                                            />
                                            {displayError(errors?.date?.message)}
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <div className="form-group">
                                            <label htmlFor="remarks">If you have any query? Please enter your query</label>
                                            <textarea
                                                name="remarks"
                                                id="remarks"
                                                cols="30"
                                                rows="10"
                                                {...register("remarks")}
                                                className={formclass(errors?.remarks)}
                                                disabled={superAccess() ? false : isFormDisabled || isCust() ? true : false}
                                            ></textarea>
                                            {displayError(errors?.remarks?.message)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="row pb-4 align-items-center" style={{alignItems:'end'}}>


                                    <div className="col-md-6">
                                        <div className="form-group mb-0">
                                            <label htmlFor="documents">Document</label>
                                            <div className='d-flex'>
                                            <input
                                                type="file"
                                                name="documents"
                                                id="documents"
                                                {...register("documents")}
                                                className={formclass(errors?.documents)}
                                                disabled={superAccess() ? false : isFormDisabled || isCust() ? true : false}
                                            />
                                              {filepath ?
                                            <a href={`${FileUrl}/${filepath}`} target={"_blank"} className="mt-3 ml-3">
                                                <ReactSVG
                                            src={`${eyeButtonSvg}`}
                                            wrapper="span"
                                            beforeInjection={(svg) => {
                                              svg.setAttribute('style', 'width: 40px')
                                            }}
                                          />
                                            </a>
                                            : ""}
                                            </div>
                                            {displayError(errors?.documents?.message)}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
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


                                
                                </div>
                                <div className="row">
              <div className="col-md-6">
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
                                <div className="row" style={{justifyContent:"space-around"}}>

                                    {superAccess()
                                        ?
                                        <>
                                            {/* {!isFormDisabled ?
                                                
                                                    <button className='btn' type="button" onClick={() => rejectFileQuery()}>Reject</button>
                                               
                                                : ""} */}

                                            
                                                <button className='btn' onClick={() => setIsSave(0)}>Save</button>
                                            

                                            

                                            {!isFormDisabled ?
                                        <>
                                                
                                                    {/* <button className='btn'  type='button' onClick={onSkip}>Skip</button> */}
                                                

                                                    <button className='btn' onClick={() => setIsSave(1)}>Save & next</button>
                                               
                                                </>
                                                : ""}
                                        </>




                                        :
                                        (!isFormDisabled && isEmp()) ?

                                            <>
                                                {!isFormDisabled ?
                                                    <>
                                                        
                                                            {/* <button className='btn' type="button" onClick={() => rejectFileQuery()}>Reject</button> */}
                                                       

                                                        
                                                            {/* <button className='btn'  type='button' onClick={onSkip}>Skip</button> */}
                                                       
                                                        
                                                            <button className='btn' onClick={() => setIsSave(0)}>Save</button>
                                                       
                                                        
                                                        
                                                            <button className='btn' onClick={() => setIsSave(1)}>Save & next</button>
                                                        
                                                    </>
                                                    : ""
                                                }


                                            </>

                                            : ""}


                                  
                                </div>
                            </fieldset>
                        </form>
                        : <Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50} />}
            </div>

        </div>
    )
}

export default Deputy_engineer