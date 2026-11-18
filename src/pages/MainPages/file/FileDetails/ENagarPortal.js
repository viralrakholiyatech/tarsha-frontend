import React, { useEffect, useState } from 'react'
import { todayDate,GetDate } from '../../../../services/DateAndTimeService';
import useValidator from '../../../../services/Validation';
import ApiService from '../../../../services/ApiService';
import { get_enagar,lisoner,planner,insert_enagar, reject_enagar, skipEnagarPortal } from '../../../../config/config';
import { getRole, getToken, getUserId } from '../../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import { adminKey, customerKey, empKey } from '../../../../config/RoleConfig';
import { FilesRoute } from '../../../../config/RouteConfig';
import {useNavigate,useParams} from 'react-router-dom';
import {SwalAlert} from "../../../../UtilsComponent/SwalDialog";
import { useForm } from 'react-hook-form';
import { displayError, formclass } from '../../../../services/ValidationService';
import axios from "axios";
import { AuthHeader } from '../../../../services/FormCommon';

//5.ENagarPortal
const ENagarPortal = (props) => {

    var header = { Authorization: `Bearer ${getToken()}`, ['Content-type']: 'application/json' };

    const { register, control, reset,getValues,trigger,setValue, formState: { errors }} = useForm({
        mode: "onChange",
    });

    const navigate = useNavigate();
    const params = useParams();

    const handleSubmit = async (e) =>{
        e.preventDefault();

        if(!validator.allValid())
        {
            showValidationMessage(true);
            return;
        }

        const formData = new FormData();
        var dataObject = {}

        var assign_to = 0;

        const commonData = {
            mst_file_id:enagarvalues.mst_file_id,
            is_save:formAccess?.type2?.is_save ? 1:0
        }

        var tempTypeSave = {};
        if(!formAccess?.type1?.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues.type_save),type1:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                drawing_assign_date:enagarvalues.drawing_assign_date,
                completed_date:enagarvalues.completed_date,
                should_type1_save:saveAndNext,
                assign_planner:enagarvalues.assign_planner,
                type_save:JSON.stringify(tempTypeSave)
            }

            assign_to = parseInt(enagarvalues.assign_planner);
        }
        else if(!formAccess.type2.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues.type_save),type2:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                completed_date2:enagarvalues.completed_date2,
                should_type2_save:saveAndNext,
                assign_liasoner:enagarvalues.assign_liasoner,
                type_save:JSON.stringify(tempTypeSave)
            }

            assign_to = parseInt(enagarvalues.assign_liasoner);
        }
        else if(!formAccess?.type3?.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues.type_save),type3:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                login:enagarvalues.login,
                password:enagarvalues.password,
                application_number:enagarvalues.application_number,
                should_type3_save:saveAndNext,
                assign_application_number:enagarvalues.assign_application_number,
                upload_date:enagarvalues.upload_date,
                type_save:JSON.stringify(tempTypeSave)
            }

            assign_to = parseInt(enagarvalues.assign_application_number);
        }
        else if(!formAccess?.type4?.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues?.type_save),type4:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                pdf_received_date:enagarvalues.pdf_received_date,
                should_type4_save:saveAndNext,
                assign_pdf_received_date:enagarvalues.assign_pdf_received_date,
                type_save:JSON.stringify(tempTypeSave)
            }

            assign_to = parseInt(enagarvalues.assign_pdf_received_date);
        }
        else if(!formAccess?.type5?.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues?.type_save),type5:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                smc_checking_date:enagarvalues.smc_checking_date,
                should_type5_save:saveAndNext,
                assign_smc_checking_date:enagarvalues.assign_smc_checking_date,
                type_save:JSON.stringify(tempTypeSave)
            }
            assign_to = parseInt(enagarvalues.assign_smc_checking_date);
        }
        else if(!formAccess?.type6?.is_save)
        {
            var tempTypeSave = {...JSON.parse(enagarvalues?.type_save),type6:{is_save:saveAndNext}}; 
            dataObject = {
                ...commonData,
                approve_date:enagarvalues.approve_date,
                smc_upload_date:enagarvalues?.smc_upload_date,
                should_type6_save:saveAndNext,
                assign_approve_date:enagarvalues.assign_approve_date,
                type_save:JSON.stringify(tempTypeSave)
            }
            assign_to = parseInt(enagarvalues.assign_approve_date);
        }

        for(let key of Object.keys(dataObject))
        {
            formData.append(key,dataObject[key]);
        }


        try{
            setLoading(true);
            const res = await ApiService(dataObject,0,header,insert_enagar.method,insert_enagar.url);
           
            if(!res.data.error)
            {
                setLoading(false);
                toast.success(res.data.message);
                if(tempTypeSave?.type6?.is_save)
                {
                    props.onUpdateMstStage(6);
                    props.onchangeStage(6);
                }
                else
                {
                    if([empKey].includes(getRole())){
                        if(parseInt(assign_to)===parseInt(getUserId())){
                            fetchEnagarPortal();
                        }
                        else{
                            localStorage.getItem("lastPath") ? navigate(`/${localStorage.getItem("lastPath")}`) : navigate(`/${FilesRoute.listFileOnline}`);
                            // navigate(`/${FilesRoute.list}`);
                        }
                    }else{
                        fetchEnagarPortal();
                    }
                }
            }
            else
            {
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
        drawing_assign_date : todayDate(),
        completed_date:todayDate(),
        completed_date2:todayDate(),
        upload_date:todayDate(),
        application_number:"",
        assign_application_number:"",
        pdf_received_date:todayDate(),
        assign_pdf_received_date:"",
        smc_checking_date:todayDate(),
        smc_upload_date:todayDate(),
        assign_smc_checking_date:"",
        approve_date:todayDate(),
        assign_approve_date:"",
        assign_liasoner:"",
        assign_planner:"",
        login:"",
        password:"",
        is_save:0,
        is_rejected:0
    }

    const IntialformAccessibility = {
           type1: {
            is_save: 0
          },
          type2: {
            is_save: 0
          },
          type3: {
            is_save: 0
          },
          type4: {
            is_save: 0
          },
          type5: {
            is_save: 0
          },
          type6: {
            is_save: 0
          }
    }

    const [enagarvalues,setEnagarvalues] = useState(()=>initialValue);
    const [enagarvalues2,setEnagarvalues2] = useState(()=>initialValue);
    const [validator,showValidationMessage] = useValidator();
    const [lisonerdata, setLisonerdata] = useState([]);
    const [plannerdata, setPlannerdata] = useState([]);
    const [formDisabled,setFormDisabled] = useState(1);
    const [formAccess,setFormAccess] = useState(()=>IntialformAccessibility);
    const [loading,setLoading] = useState(false);
    const [saveAndNext,SetSaveAndNext] = useState(0);

    const handleInput = (e) => {
        const {name,value} = e.target;
        showValidationMessage(true);
        setEnagarvalues((prevState)=>(
            {...prevState,[name]:value}
        ))
    }

    const sanitizeDate = (date) =>{
        return date ? GetDate(date,"YYYY-MM-DD") : todayDate()
    }

    const fetchEnagarPortal = async () =>{
        try{
            setLoading(true);
            const res = await ApiService(null,props.id,header,get_enagar.method,get_enagar.url);
            if(!res.data.error)
            {
                setLoading(false);
                const data1 = res.data.data1[0];
                const data2 = res.data.data2[0];

                if(res.data.maxvalue>0)
                {
                    const data2_type_save = JSON.parse(data2.type_save);
                    setFormAccess(data2_type_save);
                    setEnagarvalues((prevState)=>{
                        // setFormDisabled((typeof data.is_save!="undefined" && typeof parseInt(data.is_save)=="number") ? parseInt(data.is_save) : 0)
                        return {...prevState,
                            drawing_assign_date : data2_type_save.type1.is_save ? sanitizeDate(data2.drawing_assign_date) : sanitizeDate(data1.drawing_assign_date),
                            completed_date:data2_type_save.type1.is_save ? sanitizeDate(data2.completed_date) : sanitizeDate(data1.completed_date),
                            assign_planner:data2_type_save.type1.is_save ? data2.assign_planner : data1.assign_planner,
                            
                            completed_date2:data2_type_save.type2.is_save ? sanitizeDate(data2.completed_date2) : sanitizeDate(data1.completed_date2),
                            assign_liasoner:data2_type_save.type2.is_save ? data2.assign_liasoner : data1.assign_liasoner,
                            
                            login:data2_type_save.type3.is_save?data2.login:data1.login,
                            password:data2_type_save.type3.is_save?data2.password:data1.password,
                            application_number:data2_type_save.type3.is_save?data2.application_number:data1.application_number,
                            assign_application_number:data2_type_save.type3.is_save?data2.assign_application_number:data1.assign_application_number,
                            upload_date: data2_type_save.type3.is_save?sanitizeDate(data2.upload_date) : sanitizeDate(data1.upload_date),
                            
                            pdf_received_date:data2_type_save.type4.is_save?sanitizeDate(data2.pdf_received_date) : sanitizeDate(data1.pdf_received_date),
                            assign_pdf_received_date:data2_type_save.type4.is_save? data2.assign_pdf_received_date : data1.assign_pdf_received_date,
                            
                            smc_checking_date:data2_type_save.type5.is_save?sanitizeDate(data2.smc_checking_date) : sanitizeDate(data1.smc_checking_date),
                           
                            assign_smc_checking_date:data2_type_save.type5.is_save?data2.assign_smc_checking_date : data1.assign_smc_checking_date,
                            
                            approve_date:data2_type_save.type6.is_save?sanitizeDate(data2.approve_date) : sanitizeDate(data1.approve_date),
                            smc_upload_date:data2_type_save.type5.is_save?sanitizeDate(data2.smc_upload_date) : sanitizeDate(data1.smc_upload_date),
                            assign_approve_date:data2_type_save.type6.is_save?data2.assign_approve_date : data1.assign_approve_date,
                            
                            is_save:data2.is_save?data2.is_save:0,
                            type_save:data2.type_save?data2.type_save:formAccess,
                            is_rejected:data2.is_rejected
                        };
                    }); 
                }
                else
                {
                    setFormAccess(JSON.parse(data1.type_save));
                    setEnagarvalues((prevState)=>{
                        // setFormDisabled((typeof data.is_save!="undefined" && typeof parseInt(data.is_save)=="number") ? parseInt(data.is_save) : 0)
                        return {...prevState,
                            drawing_assign_date : data1.drawing_assign_date ? GetDate(data1.drawing_assign_date,"YYYY-MM-DD") : todayDate(),
                            completed_date:data1.completed_date ? GetDate(data1.completed_date,"YYYY-MM-DD") : todayDate(),
                            completed_date2:data1.completed_date2 ? GetDate(data1.completed_date2,"YYYY-MM-DD") : todayDate(),
                            upload_date:data1.upload_date ? GetDate(data1.upload_date,"YYYY-MM-DD") : todayDate(),
                            application_number:data1.application_number,
                            assign_application_number:data1.assign_application_number ?  data1.assign_application_number : "",
                            pdf_received_date:data1.pdf_received_date ? GetDate(data1.pdf_received_date,"YYYY-MM-DD") : todayDate(),
                            assign_pdf_received_date:data1.assign_pdf_received_date ? data1.assign_pdf_received_date : "",
                            smc_checking_date:data1.smc_checking_date ? GetDate(data1.smc_checking_date,"YYYY-MM-DD") : todayDate(),
                            smc_upload_date:data1.smc_upload_date ? GetDate(data1.smc_upload_date,"YYYY-MM-DD") : todayDate(),
                            assign_smc_checking_date:data1.assign_smc_checking_date ? data1.assign_smc_checking_date :"",
                            approve_date:data1.approve_date ? GetDate(data1.approve_date,"YYYY-MM-DD") : todayDate(),
                            assign_approve_date:data1.assign_approve_date ? data1.assign_approve_date:"",
                            assign_liasoner:data1.assign_liasoner?data1.assign_liasoner:"",
                            assign_planner:data1.assign_planner?data1.assign_planner:"",
                            login:data1.login?data1.login:"",
                            password:data1.password?data1.password:"",
                            is_save:data1.is_save?data1.is_save:0,
                            type_save:data1.type_save?data1.type_save:formAccess,
                            is_rejected:data1.is_rejected
                        };
                    }); 
                }
            }
            else
            {
                setLoading(false);
                setFormDisabled(0);
            }
        }catch(err){
            console.log(err);
            toast.error(err.response.data.message);
            if(err.response.data.error){}
        }
    }

    const fetchLisoner = async () => {
        try {
            const res = await ApiService(null, 0, header, lisoner.method, lisoner.url);
            if (!res.data.error) {
                setLisonerdata(res.data.data);
            }
        } catch (err) {
            toast.error(err.response.data.message);
            if (err.response.data.error) {}
        }
    }

    const fetchPlanner = async () => {
        try {
            const res = await ApiService(null, 0, header, planner.method, planner.url);
            if (!res.data.error) {
                setPlannerdata(res.data.data);
            }
        } catch (err) {
            toast.error(err.response.data.message);
            if (err.response.data.error) {}
        }
    }

    useEffect(()=>{
        fetchLisoner();
        fetchPlanner();
        fetchEnagarPortal();
    },[]);

    

    const rejectButton = async () =>{

        try{
            const res = await ApiService({mst_file_id: props.id,reason:getValues("reason")}, 0, header, reject_enagar.method, reject_enagar.url);
            if (!res.data.error) {
                closeRejectForm();
                toast.success(res.data.message);
                if([adminKey].includes(getRole())){
                    fetchEnagarPortal();
                }else if([empKey].includes(getRole())){
                    const team_id = res.data.data?.team_id;
                    if(parseInt(team_id)===parseInt(getUserId()))
                    {
                        fetchEnagarPortal();
                    }
                    else
                    {
                        // navigate(`/${FilesRoute.list}`);
                        localStorage.getItem("lastPath") ? navigate(`/${localStorage.getItem("lastPath")}`) : navigate(`/${FilesRoute.listFileOnline}`);
                    }
                }
            }else{
                closeRejectForm();
                toast.error(res.data.message);
            }
        }catch(err){
            closeRejectForm();
            toast.error(err.response.data.message);
            if (err.response.data.error) {}
        }
    }

    const onReject = () =>{
        SwalAlert({title:"Do you wanna reject?",confirmButtonText:"Reject!"})
        .then(async (result)=>{
            if(result?.isConfirmed){
                await rejectButton();
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    const closeRejectForm = () =>{
        try
        {
          document.getElementById("close_reject_form").click();
        }
        catch(err)
        {
          console.log(err);
        }
      };
    
    const isCustomer = () =>{
        try{
            return [customerKey].includes(getRole());
        }catch(err){
            return false;
        }
    }
    
    const skipTheStage = async() =>{
        try
        {
            setLoading(true);
            const res = await axios({
                method:skipEnagarPortal.method,
                url:`${skipEnagarPortal.url}/${params.id}`,
                headers:AuthHeader()
            })

            if(!res?.data?.error){
                setLoading(false);
                toast.success(res?.data?.message);
                if(res?.data?.data?.nextStage==1){
                    props.onUpdateMstStage(6);
                    props.onchangeStage(6);
                }else{
                    fetchEnagarPortal();
                }
                
            }else{
                setLoading(false);
                toast.error(res?.data?.message);
            }
        }
        catch(err)
        {
            setLoading(false);
            console.log(err);
            toast.error("Something went wrong");
        }
    }

    const onSkip = () =>{
        SwalAlert({title:"Do you wanna reject?",confirmButtonText:"Reject!"}).then(async(result)=>{
            if(result.isConfirmed){
                await skipTheStage();
            }
        }).catch((err)=>{
            console.log(err);
        });
    }


  return (
    <div className="grey-border rounded">
          <div className="card-header bg-white">
            <h5 className="mb-0 font-weight-normal">E Nagar Poral</h5>
          </div>
          <div className="card-body bg-white rounded-bottom p-3">
              {!loading ? 
            <form onSubmit={handleSubmit}>
               
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="drawing_assign_date">Drawing assign date</label>
                                <input type="date" name="drawing_assign_date" id="drawing_assign_date"  onChange={handleInput} value={enagarvalues.drawing_assign_date} className="form-control" disabled={isCustomer() ? true : formAccess?.type1?.is_save}/>
                            </div>
                        </div>
                        <div className="col" style={{display:"none"}}>
                            <div className="form-group" >
                                <label htmlFor="completed_date">Completed date</label>
                                <input type="date" name="completed_date" id="completed_date"  onChange={handleInput} value={enagarvalues.completed_date} className="form-control" disabled={isCustomer() ? true : formAccess?.type1?.is_save} hidden={true}/>
                                
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_planner">Assign Predcr Planner</label>
                                <select name="assign_planner" id="assign_planner" onChange={handleInput} value={enagarvalues.assign_planner} className='form-control' disabled={isCustomer() ? true : formAccess?.type1?.is_save}>
                                    <option value="">--Select--</option>
                                    {plannerdata.map((data) => (
                                        <option  key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Planner",enagarvalues.assign_planner,"required",{className:"text-danger"})}
                            </div>
                        </div>
                    </div>

                    {formAccess?.type1?.is_save ? 

                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="completed_date2">Completed date</label>
                                <input type="date" name="completed_date2" id="completed_date2"  onChange={handleInput} value={enagarvalues.completed_date2} className="form-control" disabled={isCustomer() ? true : formAccess.type2.is_save}/>
                            </div>
                        </div>    
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_liasoner">Assign Lisoner</label>
                                <select name="assign_liasoner" id="assign_liasoner" onChange={handleInput} value={enagarvalues.assign_liasoner} className='form-control' disabled={isCustomer() ? true : formAccess.type2.is_save}>
                                    <option value="">--Select--</option>
                                    {lisonerdata.map((data) => (
                                        <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Lisoner",enagarvalues.assign_liasoner,"required",{className:"text-danger"})}
                            </div>
                        </div>
                    </div>

                    :null}


                    {formAccess?.type2?.is_save ? 
                    <>
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="login">Login ID</label>
                                <input type="text" name="login" id="login" placeholder='Login ID' onChange={handleInput} value={enagarvalues.login} className="form-control" disabled={isCustomer() ? true :formAccess.type3.is_save}/>
                                {validator.message("Login ID",enagarvalues.login,"required",{className:"text-danger"})}
                            </div>
                         </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="text" name="password" id="password" placeholder='Password' value={enagarvalues.password} onChange={handleInput} className="form-control" disabled={isCustomer() ? true : formAccess.type3.is_save}/>
                                {validator.message("Password",enagarvalues.password,"required",{className:"text-danger"})}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="application_number">Application Number</label>
                                <input type="text" name="application_number" id="application_number" onChange={handleInput} value={enagarvalues.application_number} placeholder='Application Number' className="form-control" disabled={isCustomer() ? true : formAccess.type3.is_save} />
                                {validator.message("Application No.",enagarvalues.application_number,"required",{className:"text-danger"})}
                            </div>
                         </div>
                         <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_application_number">Assign of Application Number</label>
                                <select className='form-control' name="assign_application_number" id="assign_application_number" onChange={handleInput} value={enagarvalues.assign_application_number} disabled={isCustomer() ? true : formAccess.type3.is_save}>
                                    <option value="">--Select--</option>
                                    {lisonerdata.map((data) => (
                                        <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Assign of Application Number",enagarvalues.assign_application_number,"required",{className:"text-danger"})}
                            </div>
                         </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="upload_date">Upload Date</label>
                                <input type="date" name="upload_date" id="upload_date" value={enagarvalues.upload_date} onChange={handleInput} placeholder='Upload Date' className="form-control" disabled={isCustomer() ? true : formAccess?.type3?.is_save}/>
                            </div>
                        </div>
                    </div>
                    </>
                    :null}

                    {formAccess?.type3?.is_save ? 
                    <>      
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="pdf_received_date">Received Date</label>
                                <input type="date" name="pdf_received_date" id="pdf_received_date" value={enagarvalues.pdf_received_date} onChange={handleInput} placeholder='Received Date' className="form-control" disabled={isCustomer() ? true :formAccess?.type4?.is_save}/>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_pdf_received_date">Assign of Received Date</label>
                                <select className='form-control' name="assign_pdf_received_date" id="assign_pdf_received_date" onChange={handleInput} value={enagarvalues.assign_pdf_received_date} disabled={isCustomer() ? true :formAccess?.type4?.is_save}>
                                    <option value="">--Select--</option>
                                    {lisonerdata.map((data) => (
                                        <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Assign of Received Date",enagarvalues.assign_pdf_received_date,"required",{className:"text-danger"})}
                            </div>
                        </div>
                        <div className="col"></div>
                    </div>
                    </>
                    :null}

                    {formAccess?.type4?.is_save ? 
                    <>
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="smc_checking_date">SMC Checking Date</label>
                                <input type="date" name="smc_checking_date" id="smc_checking_date" value={enagarvalues.smc_checking_date} onChange={handleInput} placeholder='SMC Checking Date' className="form-control" disabled={isCustomer() ? true :formAccess?.type5?.is_save}/>

                            </div>
                        </div>
                        
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_smc_checking_date">Assign of SMC Checking Date</label>
                                <select className='form-control' name="assign_smc_checking_date" id="assign_smc_checking_date" onChange={handleInput} value={enagarvalues.assign_smc_checking_date} disabled={isCustomer() ? true :formAccess?.type5?.is_save}>
                                    <option value="">--Select--</option>
                                    {lisonerdata.map((data) => (
                                        <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Assign of SMC Checking Date",enagarvalues.assign_smc_checking_date,"required",{className:"text-danger"})}
                            </div>
                        </div>
                        {(!enagarvalues.is_save && !isCustomer()) ?  
                            <div className="col">
                                <button className="btn" id="openRejectForm" data-toggle="modal" data-target="#rejectForm" type="button">REJECT</button>
                                {/* <button className="btn" onClick={onReject} type="button">REJECT</button> */}
                            </div>
                        :""}
                        
                    </div>
                    </>
                    :null}

                    {formAccess?.type5?.is_save ? 
                    <>
                   
                    <div className="row">
                        <div className="col">
                                <div className="form-group">
                                    <label htmlFor="smc_upload_date">SMC Upload Date</label>
                                    <input type="date" name="smc_upload_date" id="smc_upload_date" value={enagarvalues.smc_upload_date} onChange={handleInput} placeholder='SMC Checking Date' className="form-control" disabled={isCustomer() ? true :formAccess?.type5?.is_save}/>
                                </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="approve_date">Approved Date</label>
                                <input type="date" name="approve_date" id="approve_date" value={enagarvalues.approve_date}  onChange={handleInput} placeholder='Approved Date' className="form-control" disabled={isCustomer() ? true : formAccess?.type6?.is_save}/>
                            </div>
                        </div>
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="assign_approve_date">Assign of Approved Date</label>
                                <select className='form-control' name="assign_approve_date" id="assign_approve_date" onChange={handleInput} value={enagarvalues.assign_approve_date} disabled={isCustomer() ? true : formAccess?.type6?.is_save}>
                                    <option value="">--Select--</option>
                                    {lisonerdata.map((data) => (
                                        <option key={data.id} value={data.id}>{data.first_name} {data.last_name}</option>
                                    ))}
                                </select>
                                {validator.message("Assign of Approved Date",enagarvalues.assign_approve_date,"required",{className:"text-danger"})}
                            </div>
                        </div>
                    </div>
                    </>
                    :null}
                    

                    {(!formAccess?.type6?.is_save && !isCustomer())  &&  
                    <div className="row">
                        
                            <button className="btn" onClick={()=>SetSaveAndNext(0)}>Save</button>
                       
                        
                            <button className='btn' type='button' onClick={()=>onSkip()}>Skip</button>
                       
                        
                            <button className='btn' onClick={()=>SetSaveAndNext(1)}>Save & Next</button>
                       
                    </div>
                    }
                    
            </form>
         :<Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>}


            <div class="modal fade" id="rejectForm">
               <form>
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h6 class="modal-title">Are you sure?</h6>
                        <button type="button" id="close_reject_form" class="close" data-dismiss="modal">X</button>
                      </div>
                      <div class="modal-body">
                          <div className="row">
                            <div className="col">
                              <div className="form-group">
                                <label htmlFor="reason">Reason</label>
                                <textarea name="reason" {...register("reason")} id="reason" cols="30" rows="5" className={formclass(errors?.reason)}></textarea>
                                {displayError(errors?.reason?.message)}

                              </div>
                            </div>
                          </div>
                      </div>
                      <div class="modal-footer">
                        <button type="button" class="btn" onClick={()=>onReject()}>Reject</button>
                        <button type="button" id="close_reject_form" class="btn" data-dismiss="modal">Cancel</button>
                      </div>
                    </div>
                  </div>
               </form>
              </div>

          </div>                                                    
    </div>
  )
}

export default ENagarPortal