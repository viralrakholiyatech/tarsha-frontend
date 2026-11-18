import React,{useCallback, useEffect, useState} from 'react';
import { EmpRoute, LeaveRoute } from '../../../config/RouteConfig';
import { getToken } from '../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import ApiService from '../../../services/ApiService';
import {useForm} from 'react-hook-form';
import { formclass,displayError, checkFile } from '../../../services/ValidationService';
import { GetDate, todayDate } from '../../../services/DateAndTimeService';
import {useNavigate,Link, useParams} from 'react-router-dom';
import { actionForLeave, getLeaveById } from '../../../config/config';

//Leaves
const Preview = () => {

  const navigate = useNavigate();
  const params = useParams();

  const {register,formState:{errors},getValues,setValue,setError,clearErrors,handleSubmit,reset} = useForm({
        mode:"onChange"
    });

    const [loading,setLoading] = useState(false);


    var header = {Authorization:`Bearer ${getToken()}`,['Content-type']:'application/json'};

    const onSubmit = async (data) =>{
       try
       {
            const leaveData = {...data,id:params?.id};
            setLoading(true);
            const res = await ApiService(leaveData,0,header,actionForLeave.method,actionForLeave.url);

            if(!res?.data?.error)
            {
                setLoading(false);
                toast.success(res?.data?.message);
                navigate(`/${EmpRoute.list}`);
            }
            else
            {
                setLoading(false);
                toast.error(res?.data?.message);
            }

        }
        catch(err)
        {
            toast.error("Something went wrong....");
            setLoading(false);
            console.log(err);
       }
    }  

    const fetchData =async ()=>{

        try
        {
            setLoading(true);

            const res = await ApiService(null,params?.id,header,getLeaveById.method,getLeaveById.url);

            if(!res?.data?.error)
            {
                setLoading(false);
                const payload = res?.data?.data;

                reset({title:payload[0]?.title,description:payload[0]?.description,
                    from_date:payload[0]?.from_date ? GetDate(payload[0]?.from_date,"YYYY-MM-DD") : todayDate(),
                    to_date:payload[0]?.to_date ? GetDate(payload[0]?.to_date,"YYYY-MM-DD") : todayDate(),
                    remarks:payload[0]?.remarks,
                    status : payload[0]?.status
                })
            }
            else
            {
                toast.error(res?.data?.message);
                setLoading(false);
            }

        }
        catch(err)
        {
            setLoading(false);
            console.log(err);
        }

        // reset({title:"I wanna leave",description:"See I wanna go outside and have some fun",from_date:todayDate(),to_date:todayDate()})
    };

        
    useEffect(()=>{
        fetchData();
    },[]);
    

    const goBack = () =>{
        navigate(`/${EmpRoute.list}`);
    }

  return (
    <div class="content__wrapper">
            <section class="page-content">
                <div class="page-title mobile-title">
                    <h1 class="h4 mb-0">Preview</h1>
                    <p class="mb-4">Leaves</p>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="card p-5">
                            <div class="card-header bg-transparent border-0 mb-5 p-0">
                                <div class="row align-items-center justify-content-between">
                                    <div class="col-md-12">
                                        <h6 class="title-line text-shadow-yellow mb-0 pb-3">Preview Leave</h6>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body p-0">
                             {!loading ? 
                                <form onSubmit={handleSubmit(onSubmit)}>
                                     <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="title">Title</label>
                                                <input 
                                                    type="text" 
                                                    name="title" 
                                                    id="title"
                                                    {...register("title")} 
                                                    className={formclass(errors?.title)}
                                                    disabled={true}
                                                />
                                                {displayError(errors?.title?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="description">Description</label>
                                                <textarea 
                                                    name="description" 
                                                    id="description"
                                                    {...register("description")} 
                                                    className={formclass(errors?.description)}
                                                    disabled={true}
                                                >
                                                </textarea>
                                                {displayError(errors?.description?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="from_date">From</label>
                                                <input 
                                                    type="date" 
                                                    name="from_date" 
                                                    id="from_date"
                                                    {...register("from_date")} 
                                                    className={formclass(errors?.from_date)}
                                                    defaultValue={todayDate()}
                                                    disabled={true}
                                                />
                                                {displayError(errors?.from_date?.message)}
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="to_date">To</label>
                                                <input 
                                                    type="date" 
                                                    name="to_date" 
                                                    id="to_date"
                                                    {...register("to_date")} 
                                                    className={formclass(errors?.to_date)}
                                                    defaultValue={todayDate()}
                                                    disabled={true}
                                                />
                                                {displayError(errors?.to_date?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="reason">Reason</label>
                                                <textarea 
                                                    name="reason" 
                                                    id="reason"
                                                    {...register("reason",{required:"Required"})} 
                                                    className={formclass(errors?.reason)}
                                                    disabled={false}
                                                >
                                                </textarea>
                                                {displayError(errors?.reason?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-group">
                                                <label htmlFor="status">What do you wanna do?</label>
                                                <select name='status' id='status' defaultValue={""} {...register("status",{required:"Required"})} className={formclass(errors?.status)}>
                                                    <option value={""}>Select Your option</option>
                                                    <option value={"1"}>Pending</option>
                                                    <option value={"2"}>Accepted</option>
                                                    <option value={"3"}>Rejected</option>
                                                </select>
                                                {displayError(errors?.status?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="form-group mb-0 col-md-4">
                                            <button  className="btn btn-lg">Save</button>
                                        </div>
                                        <div className="form-group mb-0 col-md-4">
                                            <button type="button" onClick={goBack} className="btn btn-lg">Back</button>
                                        </div>
                                    </div>
                                </form>
                                :<Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
  )
}

export default Preview