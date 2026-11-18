import React,{useState,useEffect, useCallback} from 'react'
import {useForm,useFieldArray} from 'react-hook-form';
import ApiService from '../../../../services/ApiService';
import { getRole, getToken, isAdmin, isCust, isEmp, superAccess } from '../../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import {useNavigate,NavLink,Link,useParams} from 'react-router-dom';
import axios from "axios";
import { AuthHeader } from '../../../../services/FormCommon';
import { SwalAlert } from '../../../../UtilsComponent/SwalDialog';
import { delete_approvedPlan, get_approvedPlan, save_approvedPlan, skip_approvedPlan } from '../../../../config/config';
import { closeButtonSvg, dustbinButton, eyeButtonSvg, FileUrl } from '../../../../config/file_url';
import { displayError, formclass } from '../../../../services/ValidationService';
import { adminKey, empKey } from '../../../../config/RoleConfig';
import { ReactSVG } from 'react-svg';


const formname = "userform";
const ApprovedPlanPDF = (props) => {

    const navigate = useNavigate();
    const params = useParams();

    const [loading,setLoading] = useState(false);
    const [isSave,setIsSave] = useState(0);
    const [isFormDisabled,setFormDisabled] = useState(0);
    const [filepath,setFilePath] = useState("");

    const { register, reset, trigger, control, formState: { errors }, handleSubmit, getValues, setValue, setError, clearErrors } = useForm({
        mode: "onChange"
     });

    const { append, remove, fields } = useFieldArray({
        name: formname,
        control
    })

  const onSave = useCallback(async (is_save=0) =>{
    const validate = await trigger();
    if(validate){

      const data = getValues()[`${formname}`];
      console.log(data);

      try{

        const formData = new FormData();
          const arr = [];

          let i = 0;

          for(let e of data)
          {
          
            if(e?.file_doc){
              const file = e?.file_doc[0] ? e?.file_doc[0] : "";
              if(file){
                formData.append(`${i}_file_doc`,file);
              } 
            }

            delete e?.file_doc;

            let obj = {
              ...e,
              index:i
            };

            arr.push(obj);
            i++;

          }

          formData.append("data",JSON.stringify(arr));
          formData.append("is_save",is_save);

          if(is_save==1)
          {
              SwalAlert({confirmButtonText:"Save & Continue",title:"Do you want to Save & Continue"}).then(async(result)=>{
                if(result?.isConfirmed){
                  await onSubmit(formData);
                }
              }).catch((err)=>{
                  console.log(err);
              });
          }
          else
          {
            await onSubmit(formData);
          }
         
      }
      catch(err){
          
          toast.error("Something went wrong");
          console.log(err);
      }

    }
  },[]);

  const onDelete = (index) =>{
    SwalAlert({confirmButtonText:"Remove",title:"Are you sure?"}).then(async(result)=>{
      if(result?.isConfirmed){
        await deleteApprovedPlan(index);
      }
    }).catch((err)=>{
        console.log(err);
    });
  }

  const deleteApprovedPlan = async (index) =>{
    try
    {

      const res = await axios({
        method: delete_approvedPlan.method,
        url:`${delete_approvedPlan.url}/${getValues(`${formname}[${index}].id`)}`,
        headers:AuthHeader()
      });

      if(!res?.data?.error){
        remove(index);
        toast.success(res?.data?.message);
      }else{
        toast.error(res?.data?.message);
      }

    }
    catch(err)
    {
      toast.error("Something went wrong");
      console.log(err);
    }
  }

    const onSubmit = async (formData) =>{
        try
        { 
          setLoading(true);
          const res = await axios({
            method:save_approvedPlan.method,
            url : save_approvedPlan.url,
            headers:AuthHeader({['Content-Type']:'multipart/form-data'}),
            data:formData
          });
          
          if(!res?.data?.error){
            setLoading(false);
            toast.success(res?.data?.message);

            if(res?.data?.data?.is_save==1){
              props.onUpdateMstStage(18);
              props.onchangeStage(18);
            }else{
              reset({});
              await fetchData();
            }
  
          }else{
            setLoading(false);
            toast.error(res?.data?.message);
          }
        }

        
        catch(err)
        {
            setLoading(false);
            toast.error("Something went wrong");
            console.log(err);
            
        }
    }

    const fetchData = useCallback(async() =>{
      try
      {

          setLoading(true);

         const res = await axios({
          method:get_approvedPlan.method,
          url:`${get_approvedPlan.url}/${params.id}`,
          headers:AuthHeader()
         })

         if(!res.data?.error){
          setLoading(false);

          const payload = res?.data?.data;
          
          setFormDisabled(payload.some((e)=>e?.is_save==1)? 1 :0);

          if(Array.isArray(payload)){
            const rows = []
            payload.forEach((e,i)=>{
              rows.push({
                id:e?.id,
                mst_file_id : e?.mst_file_id,
                mst_document_id : e?.mst_document_id,
                document_name : e?.document_name,
                show_website : e?.show_website,
                document_path : e?.document_path,
              });
            })
  
            append(rows);
  
          }
         }else{
            setLoading(false);
            toast.error(res.data?.message);
         }
      }
      catch(err)
      {
          setLoading(false);
          toast.error("Something went wrong");
          console.log(err);
      }
    },[])

    const onSkip = async () =>{
      SwalAlert({confirmButtonText:"Skip",title:"Do you wanna Skip the stage (17) Approved Plan"}).then(async(result)=>{
          if(result?.isConfirmed){
            await skipTheStage();
          }
        }).catch((err)=>{
            console.log(err);
        });
    }

    const skipTheStage =async () =>{
        try{
          setLoading(true);

          const res = await axios({
            method:skip_approvedPlan.method,
            url:`${skip_approvedPlan.url}/${params?.id}`,
            headers:AuthHeader()
          });

          if(!res?.data?.error)
          {
            setLoading(false);

            toast.success(res?.data?.message);

            if(res?.data?.data?.skip==1){
              props.onUpdateMstStage(18);
              props.onchangeStage(18);
            } else{
              props.onchangeStage(18);
            }   

          }
          else
          {
            setLoading(false);
            toast.error(res?.data?.message);
          }


        }
        catch(err){
          setLoading(false);
          toast.error("Something went wrong");
          console.log(err);
        }
    }

    const setIsActive = (e,index) =>{
        console.log(e.target.checked);
        if(e.target.checked){
          setValue(`${formname}[${index}].show_website`,parseInt(1));
        }else{
          setValue(`${formname}[${index}].show_website`,parseInt(0));
        }
    }

   const addForm = () =>{
      append({
          id:null,
          mst_document_id:null,
          mst_file_id : params?.id,
          document_name : "",
          show_website : 0,
          document_path : null,
      });
   }

    useEffect(()=>{
      fetchData();
    },[]);


  return (
    <div class="grey-border rounded">
    <div class="card-header bg-white">
      <h5 class="mb-0 font-weight-normal">Approved Plans</h5>
    </div>
      <div class="card-body bg-white rounded-bottom p-3">
      {!loading ? 
            <form className='form_for_phone'>
                <fieldset id="fieldset">
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Show on website</th>
                            <th>Document name</th>
                            <th>Uploaded File</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((value,index)=>(
                            <tr key={index}>
                                <td>
                                  <input 
                                        type="checkbox" 
                                        name={`${formname}[${index}].show_website`}
                                        id={`${formname}[${index}].show_website`}
                                        {...register(`${formname}[${index}].show_website`)}
                                        defaultChecked={value?.show_website==1 ? true : false}
                                        disabled={superAccess() ? false : (isFormDisabled)}
                                        defaultValue={1}
                                        onChange={(e)=>setIsActive(e,index)}
                                    />
                                </td>
                                <td>
                                  {(getValues(`${formname}[${index}].mst_document_id`))!=null ? value?.document_name : 
                                    <>
                                    <input
                                      type="text"
                                      className={formclass(errors.userform?.[index]?.document_name)}
                                      name={`${formname}[${index}].document_name`}
                                      id={`${formname}[${index}].document_name`}
                                      {...register(`${formname}[${index}].document_name`,{required:true})}
                                      disabled={superAccess() ? false : (isFormDisabled)}
                                    />
                                    {displayError(errors.userform?.[index]?.document_name?.message)}
                                    </>
                                  }
                                </td>
                                <td>
                                    <input
                                        type="file"
                                        name={`${formname}[${index}].file_doc`}
                                        id={`${formname}[${index}].file_doc`}
                                        {...register(`${formname}[${index}].file_doc`)}
                                        disabled={superAccess() ? false : (isFormDisabled)}
                                    />
                                </td>
                                <td className='d-flex align-items-center'>
                                  <>
                                      {value.document_path!=null ? 
                                        <a href={`${FileUrl}/${value?.document_path}`} target={"_blank"}>
                                           <ReactSVG
                                                            src={`${eyeButtonSvg}`}
                                                            wrapper="span"
                                                            beforeInjection={(svg) => {
                                                            svg.setAttribute('style', 'width: 20px')
                                                        }}
                                                     />
                                        </a>
                                      :""}

                                      {(getValues(`${formname}[${index}].id`)==null && (getValues(`${formname}[${index}].mst_document_id`)==null))?
                                        <button type='button' className='bg-transparent border-0' onClick={()=>remove(index)} disabled={superAccess() ? false : (isFormDisabled)}>
                                           <ReactSVG
                                                            src={`${closeButtonSvg}`}
                                                            wrapper="span"
                                                            beforeInjection={(svg) => {
                                                            svg.setAttribute('style', 'width: 20px')
                                                        }}
                                                     />
                                        </button>
                                      :
                                      ((getValues(`${formname}[${index}].id`)!=null) && (getValues(`${formname}[${index}].mst_document_id`)==null)) 
                                      ?
                                        <button type='button' className='bg-transparent border-0' onClick={()=>onDelete(index)} disabled={superAccess() ? false : (isFormDisabled)}>
                                          <ReactSVG
                                                            src={`${dustbinButton}`}
                                                            wrapper="span"
                                                            beforeInjection={(svg) => {
                                                            svg.setAttribute('style', 'width: 20px')
                                                        }}
                                                     />
                                        </button>
                                      :""}
                                      
                                  </>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                   
                    
                </table>

                    <div className='row' style={{justifyContent:'space-around'}}>
                      {superAccess() ? 
                        <React.Fragment>
                          <button type="button" className='btn' onClick={addForm}>Add</button>
                          <button  type="button" className='btn' onClick={()=>onSave(0)} {...register("is_save")} value={0}>Save</button>
                          {(!isFormDisabled) ? 
                            <button type="button" className='btn' onClick={onSkip}>Skip</button>
                          :""}
                           {(!isFormDisabled)? 
                          <button type="button" className='btn mt-lg-0 mt-3' onClick={()=>onSave(1)}>Save & next</button>
                           :""}
                        </React.Fragment>

                      :
                      isEmp() && (!isFormDisabled) ? 
                         <React.Fragment>
                            <button type="button" className='btn' onClick={addForm}>Add</button>
                            <button  type="button" className='btn' onClick={()=>onSave(0)} {...register("is_save")} value={0}>Save</button>
                            <button type="button" className='btn' onClick={onSkip}>Skip</button>
                            <button type="button" className='btn mt-lg-0 mt-3' onClick={()=>onSave(1)}>Save & next</button>
                          </React.Fragment>

                      :""}
                    </div>
                
                </fieldset>
            </form>
            :<Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>}
      </div>
    </div>
  )
}

export default ApprovedPlanPDF
