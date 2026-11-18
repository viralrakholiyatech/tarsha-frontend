import React, {useState,useEffect ,useCallback} from 'react'
import { todayDate,GetDate } from '../../../../services/DateAndTimeService';
import useValidator from '../../../../services/Validation';
import ApiService from '../../../../services/ApiService';
import { getRole, getToken, superAccess } from '../../../../services/useLocalStorage';
import { insert_ownerPortal,getOwnerPortal, skipOwnerPortal,get_enagar} from '../../../../config/config';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import { customerKey,adminKey,HoD,empKey } from '../../../../config/RoleConfig';
import {useForm} from 'react-hook-form';
import { displayError, formclass } from '../../../../services/ValidationService';
import { SwalAlert } from '../../../../UtilsComponent/SwalDialog';
import axios from "axios"
import { AuthHeader } from '../../../../services/FormCommon';

const OwnerPortal = (props) => {
    const [selectedOptions, setSelectedOptions] = useState("");
    const [startdate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");
    const [card, setCard] = useState("");
    var header = { Authorization: `Bearer ${getToken()}`, ['Content-type']: 'application/json' };

    const {register,formState:{errors},handleSubmit,getValues,setValue,reset,trigger} = useForm({
        mode:"onChange"
      });

      const onConfirmSaveAndNext = useCallback(async () =>{
        const valid = await trigger();
        if(valid){
          SwalAlert({confirmButtonText:"Continue",title:"Do you wanna save & continue?"}).then(async(result)=>{
            if(result?.isConfirmed){
              await onSubmit({...getValues(),is_save:1});
            }
          }).catch((err)=>{
             console.log(err);
          });
        }
      },[]);  

    const onSubmit = async (data) =>{

       console.log(data);

       const ownerPortalData = {...data,mst_file_id:props.id,approved_by_hod:selectedOptions,date:startdate,card:card};

        try{
            setLoading(true);
            const res = await ApiService(ownerPortalData,0,header,insert_ownerPortal.method,insert_ownerPortal.url);
            if(!res.data.error){
                setLoading(false);
                toast.success(res.data.message);
                if(ownerPortalData.is_save==1){
                    setFormDisabled(ownerPortalData.is_save);
                    props.onUpdateMstStage(7);
                    props.onchangeStage(7);
                }
            }else{
                toast.error(res.data.message);
                setLoading(false);
            }
        }catch(err){
            setLoading(false);
            toast.error(err.response.data.message);
            if(err.response.data.error){}
        }

    }

    const initialValue = {
        mst_file_id:props.id,
        upload_date:todayDate(),
        application_number:"",
        approve_date:todayDate(),
        login:"",
        password:"",
        is_save:0,
        remark_by_hod:'',
        remark_by_emp:"",
        approved_by_hod:selectedOptions,
    }

    const [ownervalues,setOwnerValues] = useState(()=>initialValue);
    const [validator,showValidationMessage] = useValidator();
    const [formDisabled,setFormDisabled] = useState(1);
    const [loading,setLoading] = useState(false);

    const handleInput = (e) => {
        const {name,value} = e.target;
        showValidationMessage(true);
        setOwnerValues((prevState)=>(
            {...prevState,[name]:value}
        ))
    }

    const fetchEnagarPortal = async () =>{
        try{
            setLoading(true);
            const res = await ApiService(null,props.id,header,getOwnerPortal.method,getOwnerPortal.url);
            if(!res.data.error)
            {
                setLoading(false);
                const data = res.data.data;
                setSelectedOptions(data.approved_by_hod === 1 ? "Yes" : "No");
                setEndDate( GetDate(data.created_at,"YYYY-MM-DD"))
                setCard(data.card)
                reset({
                    upload_date:data.upload_date ? GetDate(data.upload_date,"YYYY-MM-DD") : todayDate(),
                    application_number:data.application_number,
                    approve_date:data.upload_date ? GetDate(data.approve_date,"YYYY-MM-DD") : todayDate(),
                    login:data.login,
                    password:data.password,
                    remark_by_hod:data.remark_by_hod,
                    remark_by_emp:data.remark_by_emp

                })

                if(isCustomer()){
                    setFormDisabled(1);
                }else{
                    setFormDisabled((typeof data.is_save!="undefined" && typeof parseInt(data.is_save)=="number") ? parseInt(data.is_save) : 0)
                }
            }
            else
            {
                setLoading(false);
                if(isCustomer()){
                    setFormDisabled(1);
                }else{
                    setFormDisabled(0);
                }
            }
        }catch(err){
            toast.error(err.response.data.message);
            if(err.response.data.error){}
        }
    }
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
            get_enagar.method,
            get_enagar.url
          );
          console.log("startDate==res==>", res);
          if (!res.data.error) {
            setLoading(false);
    
            setStartDate(GetDate(res.data.data1[0].created_at, "YYYY-MM-DD"));
          } else {
            setLoading(false);
          }
        } catch (err) {
          toast.error(err.response.data.message);
          if (err.response.data.error) {
          }
        }
      };



    useEffect(()=>{
        fetchEnagarPortal();
        fetchStartDate();
    },[]);

    const isCustomer = () =>{
        try
        {
            return [customerKey].includes(getRole());
        }
        catch(err){
            return false;
        }
    }

    const skipTheStage =  async () =>{
        try{
            
            const res = await axios({
                method:skipOwnerPortal.method,
                url:`${skipOwnerPortal.url}/${props.id}`,
                headers:AuthHeader()
            });

            if(!res.data?.error){
                toast.success(res?.data?.message);
                if(res?.data?.data?.nextStage==1){
                    props.onUpdateMstStage(7);
                    props.onchangeStage(7);
                }else{
                    props.onchangeStage(7);
                }
            }else{
                toast.error(res?.data?.message);
            }


        }catch(err){
            console.log(err);
            toast.error("Something went wrong");
        }
    }

    // const onSkip = () =>{
    //     SwalAlert({confirmButtonText:"Skip",title:"Do you want to Skip?"}).then(async(result)=>{
    //         if(result.isConfirmed){
    //             await skipTheStage();
    //         }
    //     })
    //     .catch((err)=>{
    //         console.log(err);
    //     })
    // }
    const handleOptionsChanges = (e) => {
        setSelectedOptions(e.target.value);
      };

    useEffect(()=>{
        if(!loading){
            if(superAccess()){
                document.getElementById("fieldset").disabled =  false;
            }else{
                document.getElementById("fieldset").disabled = formDisabled ? true : false;
            }
        }
    },[formDisabled,loading]);


  return (
    <div class="grey-border rounded">
 <div className="card-header bg-white">
          <div className=" d-flex align-items-center justify-content-between">
        <h5 class="mb-0 font-weight-normal">Owner Portal</h5>
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
            {!loading ?
        <form onSubmit={handleSubmit(onSubmit)}>
                <fieldset id="fieldset">   
                   
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="application_number">Application Number</label>
                                <input 
                                    type="text" 
                                    name="application_number" 
                                    id="application_number" 
                                    placeholder='Application Number' 
                                    {...register("application_number",{required:"Required"})}
                                    className={formclass(errors?.application_number)} 
                                />
                                {displayError(errors?.application_number?.message)}
                            </div>
                         </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="upload_date">Upload Date</label>
                                <input 
                                    type="date" 
                                    name="upload_date" 
                                    id="upload_date" 
                                    defaultValue={todayDate()}
                                    placeholder='Upload Date' 
                                    {...register("upload_date",{required:"Required"})}
                                    className={formclass(errors?.upload_date)} 
                                />
                                {displayError(errors?.upload_date?.message)}
                            </div>
                        </div>
                       
                    </div>
                    <div className="row">
                    <div className="col">
                            <div className="form-group">
                                <label htmlFor="approve_date">Approved Date</label>
                                <input 
                                    type="date" 
                                    name="approve_date" 
                                    id="approve_date" 
                                    defaultValue={todayDate()}
                                    placeholder='Approved Date' 
                                    {...register("approve_date",{required:"Required"})}
                                    className={formclass(errors?.approve_date)} 
                                />
                                {displayError(errors?.approve_date?.message)}

                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="login">Login ID</label>
                                <input 
                                    type="text" 
                                    name="login"
                                    id="login" 
                                    placeholder='Login ID' 
                                    {...register("login",{required:"Required"})}
                                    className={formclass(errors?.login)} 
                                />
                                {displayError(errors?.login?.message)}
                            </div>
                         </div>
                       
                    </div>
                    <div className='row'>
                    <div className="col">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="text" 
                                    name="password" 
                                    id="password" 
                                    placeholder='Password' 
                                    {...register("password",{required:"Required"})}
                                    className={formclass(errors?.password)} 
                                />
                                {displayError(errors?.password?.message)}
                            </div>
                        </div>
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
                    </div>
                    <div className='row'>
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

                    </div>
                    
                    <div className="row" style={{justifyContent:'space-around'}}>
                        {superAccess() ? 
                                <>
                                   
                                        <button className='btn' value={0} {...register("is_save")}>Save</button>
                                  

                                    
                                    {!formDisabled ? 
<>

{/* <button className='btn' onClick={onSkip} type="button">Skip</button> */}

                                       
                                            <button className='btn' type='button' value={1} onClick={()=>onConfirmSaveAndNext()}>Submit & Continue</button>
                                        
                                        </>
                                    :""}

                                </>

                        : 
                        !formDisabled && [empKey].includes(getRole()) ?
                             <>
                             
                                 <button className='btn' value={0} {...register("is_save")}>Save</button>
                              

                             
                                        {/* <button className='btn' onClick={onSkip} type="button">Skip</button> */}
                                    

                                
                                    <button className='btn' type='button' value={1} onClick={()=>onConfirmSaveAndNext()}>Submit & Continue</button>
                                
                            </>

                        :""}
                    </div>

                   
                    
                </fieldset>
            </form>
         :<Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>}

        </div>                                                    
    </div>
  )
}

export default OwnerPortal