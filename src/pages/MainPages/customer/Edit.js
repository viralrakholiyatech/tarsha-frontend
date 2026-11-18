import React, { useEffect,useState } from 'react'
import {useNavigate,useParams} from 'react-router-dom';
import { getCustomerById, updateCustomer } from '../../../services/CustomerService';
import { getToken } from '../../../services/useLocalStorage';
import useValidator from '../../../services/Validation'
import Loader from 'react-js-loader';
import toast, { Toaster } from 'react-hot-toast'
import { CustRoute } from '../../../config/RouteConfig';
import {useForm} from 'react-hook-form';
import {alphabetSpaceWithDot, mailPattern, phonePattern} from '../../../services/Pattern';
import ApiService from '../../../services/ApiService';
import { formclass,displayError, checkFile } from '../../../services/ValidationService';
import { updateCust } from '../../../config/config';
import { FileUrl } from '../../../config/file_url';
import { previewImage, removeImage } from '../../../services/FormCommon';
import S3FileUpload from '../../../components/S3FileUpload';
import { getFileDisplayUrl } from '../../../services/S3Service';

//Customer
const Edit = () => {

  const navigate = useNavigate();

  const {register,formState:{errors},handleSubmit,getValues,reset} = useForm({
    mode:"onChange"
  });

  const goBack = () =>{
    navigate(`/${CustRoute.list}`);
  } 
  
  const [values, setValues] = useState({
    email: '', first_name: '', last_name: '',phone: ''
  });
  
  const params = useParams();
  const [loading,setLoading] = useState(false);
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [saveOldFile, setSaveOldFile] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  
  const fetchCust = async (id) =>{
    try{
      setLoading(true);
      const res = await getCustomerById(id,getToken());
      if(!res.data.error){
        const cust = res?.data?.data[0];

        if(cust?.profile_picture)
        {
            const displayUrl = getFileDisplayUrl(cust?.profile_picture, FileUrl);
            setIsPreviewed(true);
            setSaveOldFile(displayUrl);
            setProfilePicture(displayUrl);
        }
     
        reset({
          id:cust?.id,
          first_name : cust?.first_name,
          last_name : cust?.last_name,
          phone:cust?.phone,
          email:cust?.email,
          active:cust?.active,
        })

        setLoading(false);
      }else{
        toast.error(res.data.message);
        setLoading(false);
        navigate(`/${CustRoute.list}`);
      }
    }catch(err){
      console.log(err);
      setLoading(false);
      toast.error(err.response.data.message);
      navigate(`/${CustRoute.list}`);
    }
  }
  

  const onSubmit = async (data) =>{
  
    console.log(data);

    const formData = new FormData();

    for (let key of Object.keys(data)) 
    {
        if (key === "file") 
        {
            continue;
        }
        else 
        {
            formData.append(key, data[key]);
        }
    }

    if (profilePicture) {
        formData.append("profile_picture", profilePicture);
    }


    try
    {
      const header = {Authorization : `Bearer ${getToken()}`,['Content-Type']:'multipart/form-data'};
      setLoading(true);
      const res = await ApiService(formData,0,header,updateCust?.method,updateCust?.url);
      if(!res?.data?.error)
      {
        setLoading(false);
        toast.success(res.data?.message); 
        navigate(`/${CustRoute?.list}`);
      }
      else
      {
        setLoading(false);
        toast.error(res.data?.message);  
      }
    }
    catch(err)
    {
        setLoading(false);
        console.log(err);
        toast.error(err?.response?.data?.message);
    }
   
  }

useEffect(()=>{
    fetchCust(params.id);
  },[]);


     /*Displaying old image*/
    const resetOldImage = (imageName) => {
        try {
            if (imageName) {
                document.getElementById("previewImage").src = `${imageName}`;
            }
        } catch (err) {
            console.log(err);
        }
    }
  
  return (
      
      <>
       <div className="content__wrapper">
            <section className="page-content">
                <div className="page-title mobile-title">
                    <h1 className="h4 mb-0">Add</h1>
                    <p className="mb-4">Client Details</p>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card p-5">
                            <div className="card-header bg-transparent border-0 mb-5 p-0">
                                <div className="row align-items-center justify-content-between">
                                    <div className="col-md-6">
                                        <h6 className="title-line text-shadow-yellow mb-0 pb-3">Edit Client Details</h6>
                                    </div>
                                    <div className="col-md-6 text-right status__selection-col">
                                        <div className="status__selection">
                                            <label className="mb-0" for="">Status</label>
                                            <div className="status__selection-wrapper">
                                                <select name="active" id="active" {...register("active")} className="status-select ml-2">
                                                    <option value="1">Active</option>
                                                    <option value="0">In Active</option>
                                                </select>
                                            </div>
                                        </div>                                        
                                    </div>
                                </div>
                            </div>
                             
                            <div className="card-body p-0">
                            {loading ? <Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>
                            :
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="row">
                                        <div className="form-group col-md-6">
                                            <label for="">First Name*</label>
                                            <input 
                                                type="text" 
                                                name="first_name" 
                                                id="first_name" 
                                                {...register("first_name",{
                                                    required:"Required",
                                                    pattern:{
                                                        value:alphabetSpaceWithDot,
                                                        message:"Invalid"
                                                    }
                                                })}
                                                className={formclass(errors?.first_name)}
                                                placeholder='First name'
                                            />
                                            {displayError(errors?.first_name?.message)}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label for="">Last Name*</label>
                                            <input 
                                                type="text" 
                                                name="last_name" 
                                                id="last_name" 
                                                placeholder='Last name'
                                                {...register("last_name",{
                                                    required:"Required",
                                                    pattern:{
                                                        value:alphabetSpaceWithDot,
                                                        message:"Invalid"
                                                    }
                                                })}
                                                className={formclass(errors?.last_name)}
                                            />
                                            {displayError(errors?.last_name?.message)}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label for="">Personal Email Address*</label>
                                            <input 
                                                type="text" 
                                                name="email" 
                                                id="email" 
                                                placeholder='email'
                                                {...register("email",{
                                                    required:"Required",
                                                    pattern:{
                                                        value:mailPattern,
                                                        message:"Invalid email"
                                                    }
                                                })}
                                                className={formclass(errors?.email)}
                                            />
                                            {displayError(errors?.email?.message)}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label for="">Personal Mobile Number*</label>
                                            <input 
                                                type="text" 
                                                name="phone" 
                                                id="phone" 
                                                placeholder='Mobile no.'
                                                {...register("phone",{
                                                    required:"Required",
                                                    pattern:{
                                                        value:phonePattern,
                                                        message:"Only 10 Digits phone no. is required"
                                                    }
                                                })}
                                                className={formclass(errors?.phone)}
                                            />
                                            {displayError(errors?.phone?.message)}
                                        </div>
                                        
                                        <div className="form-group col-md-6">
                                            <label htmlFor="password">Password*</label>
                                            <input 
                                                type="password" 
                                                name="password" 
                                                id="password" 
                                                placeholder='Password'
                                                {...register("password",{})}
                                                className={formclass(errors?.password)}
                                            />
                                            {displayError(errors?.password?.message)}
                                        </div>
                                        <div className="form-group col-md-6">
                                            <label htmlFor="confirm_password">Confirm password*</label>
                                            <input 
                                                type="password" 
                                                name="confirm_password" 
                                                id="confirm_password" 
                                                placeholder='Confirm password'
                                                {...register("confirm_password",{
                                                    validate:value=>value==getValues("password")||"Confirm password doesn't match with password match"
                                                })}
                                                className={formclass(errors?.confirm_password)} 
                                            />
                                            {displayError(errors?.confirm_password?.message)}
                                        </div>
                                        
                                        <div className="form-group col-md-6">
                                            <S3FileUpload
                                                label="Profile Image"
                                                value={profilePicture}
                                                onChange={(url) => setProfilePicture(url)}
                                                onRemove={() => setProfilePicture("")}
                                                accept="image/*"
                                                folder="customers"
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2 mt-3">
                                        <button type="submit" className="form_save_btn">Submit</button>
                                        <button type="submit" onClick={goBack} className="form_cancel_btn">Back</button>
                                    </div>
                                </form>
                                 }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
    {/*<div className="content__wrapper">
        <div className="page__header pt-3 position-relative">
            <div className="container-fluid">
                <h1>Edit Customer</h1>
            </div>
            <div className="container-fluid">
               <button type='button' onClick={goBack} className='btn'>Back</button>
            </div>
        </div>

      

        <section className="py-4">
            <div class="container-fluid">
                <div class="card p-4">
                 
                {loading ? <Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>
                        : 
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="first_name">First name</label>
                                <input 
                                    type="text" 
                                    name="first_name" 
                                    id="first_name" 
                                    {...register("first_name",{
                                        required:"Required",
                                        pattern:{
                                            value:alphabetSpaceWithDot,
                                            message:"Invalid"
                                        }
                                    })}
                                    className={formclass(errors?.first_name)}
                                    placeholder='First name'
                                />
                                {displayError(errors?.first_name?.message)}
                               
                            </div>
                            <div className="col">
                                <label htmlFor="last_name">Last name</label>
                                <input 
                                    type="text" 
                                    name="last_name" 
                                    id="last_name" 
                                    placeholder='Last name'
                                    {...register("last_name",{
                                        required:"Required",
                                        pattern:{
                                            value:alphabetSpaceWithDot,
                                            message:"Invalid"
                                        }
                                    })}
                                    className={formclass(errors?.last_name)}
                                />
                                {displayError(errors?.last_name?.message)}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="text" 
                                    name="email" 
                                    id="email" 
                                    placeholder='email'
                                    {...register("email",{
                                        required:"Required",
                                        pattern:{
                                            value:mailPattern,
                                            message:"Invalid email"
                                        }
                                    })}
                                    className={formclass(errors?.email)}
                                />
                                {displayError(errors?.email?.message)}
                            </div>
                            <div className="col">
                                <label htmlFor="phone">Mobile no.</label>
                                <input 
                                    type="text" 
                                    name="phone" 
                                    id="phone" 
                                    placeholder='Mobile no.'
                                    {...register("phone",{
                                        required:"Required",
                                        pattern:{
                                            value:phonePattern,
                                            message:"Only 10 Digits phone no. is required"
                                        }
                                    })}
                                    className={formclass(errors?.phone)}
                                />
                                {displayError(errors?.phone?.message)}
                            </div>
                        </div>
                       
                        <div className="row mt-3">
                            <div className="col">
                                <input type="submit" value="Submit"  className='btn'/>
                            </div>
                        </div>
                    </form>

                }
                </div>
            </div>
        </section>

    </div>*/}
    </>
  )
}

export default Edit