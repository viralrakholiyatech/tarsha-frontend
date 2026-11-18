import React,{useEffect, useState} from 'react';
import { LeaveRoute } from '../../../config/RouteConfig';
import { getToken } from '../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import ApiService from '../../../services/ApiService';
import {useForm} from 'react-hook-form';
import { formclass,displayError, checkFile } from '../../../services/ValidationService';
import {useNavigate,Link} from 'react-router-dom';
import { todayDate } from '../../../services/DateAndTimeService';
import { AddLeave } from '../../../config/config';

//Leaves
const Add = () => {
  const navigate = useNavigate();

  const {register,formState:{errors},getValues,setValue,setError,clearErrors,handleSubmit} = useForm({
    mode:"onChange"
  });

  const [loading,setLoading] = useState(false);

  var header = {Authorization:`Bearer ${getToken()}`,['Content-type']:'application/json'};

  const onSubmit = async (data) =>{
    console.log(data);

    try
    {
        setLoading(true);
        const res = await ApiService(data,0,header,AddLeave.method,AddLeave.url);
        if(!res?.data?.error){
            setLoading(false);
            toast.success(res?.data?.message);
            navigate(`/${LeaveRoute.list}`);
        }else{
            setLoading(false);
            toast.error(res?.data?.message);
        }

    }
    catch(err)
    {
        setLoading(false);
        toast.error("Something went wrong");
    }

  }
 
  const goBack = () =>{
    navigate(`/${LeaveRoute.list}`);
  }

  return (
    <div class="content__wrapper">
            <section class="page-content">
                <div class="page-title mobile-title">
                    <h1 class="h4 mb-0">Add</h1>
                    <p class="mb-4">Leaves</p>
                </div>
                <div class="row">
                    <div class="col-md-12">
                        <div class="card p-5">
                            <div class="card-header bg-transparent border-0 mb-5 p-0">
                                <div class="row align-items-center justify-content-between">
                                    <div class="col-md-12">
                                        <h6 class="title-line text-shadow-yellow mb-0 pb-3">Add Leave</h6>
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
                                                    {...register("title",{required:"Required"})} 
                                                    className={formclass(errors?.title)}
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
                                                    {...register("description",{required:"Required"})} 
                                                    className={formclass(errors?.description)}
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
                                                    {...register("from_date",{required:"Required"})} 
                                                    className={formclass(errors?.from_date)}
                                                    defaultValue={todayDate()}
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
                                                    {...register("to_date",{required:"Required"})} 
                                                    className={formclass(errors?.to_date)}
                                                    defaultValue={todayDate()}
                                                />
                                                {displayError(errors?.to_date?.message)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-3 mt-3">
                                        <button  className="form_save_btn">Request for leave</button>
                                        <button type="button" onClick={goBack} className="form_cancel_btn">Back</button> 
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

export default Add