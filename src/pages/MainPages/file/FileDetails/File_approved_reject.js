import React,{useState,useEffect} from 'react'
import {useForm} from 'react-hook-form';
import ApiService from '../../../../services/ApiService';
import { getRole, getToken, isCust } from '../../../../services/useLocalStorage';
import Loader from 'react-js-loader';
import toast from 'react-hot-toast';
import {useNavigate,NavLink,Link,useParams} from 'react-router-dom';
import { displayError, formclass } from '../../../../services/ValidationService';
import { adminKey, empKey } from '../../../../config/RoleConfig';
import { AuthHeader } from '../../../../services/FormCommon';
import axios from "axios";
import { SwalAlert } from '../../../../UtilsComponent/SwalDialog';
import { save_fileApprovedReject } from '../../../../config/config';

const File_approved_reject = (props) => {

   
    const params = useParams();

    const [loading,setLoading] = useState(false);
    

    const onSubmit = async (status) =>{
        try
        { 
          setLoading(true);
          const data = {
            mst_file_id : params?.id,
            status : status
          }

          const res = await axios({
            method:save_fileApprovedReject.method,
            url:save_fileApprovedReject.url,
            headers:AuthHeader(),
            data:data
          });

          if(!res?.data?.error){
            setLoading(false);
            toast.success(res?.data?.message);

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

    const onStatus = (status="approved") =>{
      SwalAlert({confirmButtonText:"Save",title:"Are you sure?"})
      .then(async (result)=>{
        if(result.isConfirmed){
          await onSubmit(status);
        }
      }).catch((err)=>{
        console.log(err);
      });
    }

    useEffect(()=>{
    
    },[]);


  return (
    <div class="grey-border rounded">
    <div class="card-header bg-white">
    <h5 class="mb-0 font-weight-normal">File Approved Reject</h5>
    </div>
      <div class="card-body bg-white rounded-bottom p-3">
        {!loading ?
          <form>
            <div className='form-group'>
              <label className='form-label' htmlFor='f1'>What do you wanna do?</label>
            </div>
            <div class="form-check form-check-inline">
              <button className='btn' onClick={()=>onStatus("approved")} type="button">Approved</button>
            </div>
            <div class="form-check form-check-inline">
              <button className='btn'  onClick={()=>onStatus("reject")} type="button">Reject</button>
            </div>
          </form>
            :<Loader type="spinner-default" bgColor={"#000000"} title={"Please wait"} color={'#000000'} size={50}/>}

      </div>

    </div>
  )
}

export default File_approved_reject