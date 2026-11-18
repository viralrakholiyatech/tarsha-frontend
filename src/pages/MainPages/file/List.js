import React, { useEffect,useState } from 'react'
import { GetFile,DeleteFile } from '../../../services/FileService';
import {useNavigate,useLocation} from 'react-router-dom';
import { getRole, getToken, getUserId } from '../../../services/useLocalStorage';
import {Link} from 'react-router-dom';
import { GetDate, GetDays,GetDateAndTime, GetTime, todayDate } from '../../../services/DateAndTimeService';
import { FileUrl } from '../../../config/file_url';
import toast from 'react-hot-toast';
import date from 'date-and-time';
import { FilesRoute } from '../../../config/RouteConfig';
import { adminKey, customerKey, empKey, subadmin } from '../../../config/RoleConfig';
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import ApiService from '../../../services/ApiService';
import { fetchFile } from '../../../config/config';

//File
const List = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [file, setFile] = useState([]);
    const [loadingTitle,setLoadingTitle] = useState("Loading...");
    const [isDeleted,setIsDeleted] = useState(false);

    const GET_FILE = async () => {
        try
        {

            const header = {Authorization:`Bearer ${getToken()}`};
            const res = await ApiService(null,0,header,fetchFile.method,fetchFile.url);

            if(!res?.data?.error){
                const data = res?.data?.data;
                
                if(!data){
                    setLoadingTitle("Not found");
                }

                if([adminKey].includes(getRole())){
                    setFile(data);
                    if(Array.isArray(data) && !data.length){
                        setLoadingTitle("Not found");
                    }
                }
                else if([empKey].includes(getRole()))
                {
                    const assignedData = data.filter((f,index)=>{
                        if(f.team_id && f.team_id==getUserId()){
                            return f;
                        }
                    });
                    setFile(assignedData);
                    if(Array.isArray(assignedData)) { !assignedData.length ? setLoadingTitle("Not found"):"" }
                }else if([customerKey].includes(getRole())){
                    // cus_id
                    const customerData = data.filter((f,index)=>{
                        return f.cus_id && f.cus_id==getUserId()
                    });
                    setFile(customerData);
                    if(Array.isArray(customerData)) { !customerData.length ? setLoadingTitle("Not found"):"" }
                }
            }else{
                setLoadingTitle("Not found");
                toast.error(res?.data?.message);
               // navigate("/login",{state:{from:location},replace:true});
            }
        }catch(err){
            setLoadingTitle("Not found");
            console.log(err);
            toast.error(err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong");
        }
    };

    useEffect(() => {
        GET_FILE();
    }, []);

    useEffect(()=>{
        if(isDeleted)
        {
            if(Array.isArray(file) && !file.length){
                setLoadingTitle("Not found");
            }
            setIsDeleted(false);
        }
    },[isDeleted]);

    const removeFile = async (thatFile) =>{

        const id = thatFile.id;

        try{
            const res = await DeleteFile(id,getToken());
            if(!res.data?.error){
                setFile(file.filter((e)=>{
                    return e.id!=id;
                }));
                setIsDeleted(true);
                toast.success(res.data.message);
            }
            else
            {
                toast.error(res.data?.message);
            }
        }catch(err){
            console.log(err);
            toast.error(err.response.data?.message);
        }

    }

    const onRemoveFile = (thatFile) =>{
        SwalAlert({}).then(async (result)=>{
            if(result.isConfirmed){
                await removeFile(thatFile);
            }
        }).catch((err)=>{
            console.log(err);
            toast.error("Something went wrong");
        })
    }

    const subtractTwoDates = (d1,d2)=>{
        try
        {
            if(d1 && d2)
            {
                const date1 = new Date(d1);
                const date2 = new Date(d2);

                var diff = date2-date1;
                var diffInDays = (diff) / (1000*3600*24);

                return parseInt(Math.abs(diffInDays))
            }
            else
            {
                return "-";
            }
            
        }catch(err)
        {
            console.log(err);
            return "-";
        }
    }

  return (
    <>
    <div className="content__wrapper">
            <section className="page-content">
                <div className="page-title mobile-title">
                    <h1 className="h4 mb-0">Files</h1>
                    {/*<p className="mb-4">Online Process</p>*/}
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="zed__table card">
                            <h5 className="text-shadow-yellow px-2 mb-4">All Files</h5>
                            <div className="table-responsive">
                                <table className="table table-borderless mb-0">
                                    <thead>
                                        <tr>
                                            <th>S.R. No.</th>
                                            <th>Office File no.</th>
                                            <th>File Name</th>
                                            <th>TP Stage</th>
                                            <th>No of Days</th>
                                            <th>Team</th>
                                            <th>Client Name</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {file.length ? file.map((f,index)=>{
                                        return (
                                        
                                        <tr key={f.id}>
                                            <td>{index+1}</td>
                                            <td>{f.office_file_no}</td>
                                            <td><Link to={`/${FilesRoute.fileDetail}/${f.id}`} state={{data:f}} >{f.file_name}</Link></td>
                                            <td>{parseInt(f.tps_stage)===1 ? "Draft":(parseInt(f.tps_stage)===2 ? "Final" :"")}</td>
                                            <td>{subtractTwoDates(GetDate(f.created_at,"YYYY-MM-DD"),todayDate())}</td>
                                            <td>{f.team ? f.team : ""}</td>
                                            <td>{f.cust_name}</td>
                                            <td>{f.stage_title}</td>
                                            <td> 
                                                <Link to={`/${FilesRoute.fileDetail}/${f.id}`} state={{data:f}} ><img className="in__svg" src={`${FileUrl}/img/icons/eye.svg`} alt="Right arrow"/></Link>
                                                {[adminKey].includes(getRole())? 
                                                <>
                                                    <Link to={`/${FilesRoute.edit}/${f.id}`} ><img className="in__svg" src={`${FileUrl}/img/icons/edit.svg`} alt="Right arrow"/></Link>
                                                    <a role='button' onClick={()=>onRemoveFile(f)} ><img className="in__svg" src={`${FileUrl}/img/icons/delete.svg`} alt="Right arrow"/></a>                                           
                                                 </>
                                                :""}
                                            </td>

                                                                                   
                                        </tr>
                                        
                                       
                                        )}):
                                        <tr>
                                           <td colSpan={6} align={"center"}><b>{loadingTitle}</b></td> 
                                        </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        
      {/*<div className="content__wrapper">
            <div className="page__header pt-3 position-relative">
                <div className="container-fluid">
                    <h1>File</h1>
                </div>
                <div className="container-fluid">
                    {[adminKey].includes(getRole())?
                    <>
                        <Link to={`/${FilesRoute.add}`} className="btn btn-sm" role="button">Add</Link>
                    </>
                    :""}
                </div>
            </div>
            <section className="py-4">
                <div class="container-fluid">
                    <div class="card p-4">
                        <div className="table-responsive">
                            <table className="table">
                                <thead className="grey__head">
                                    <tr>
                                        <th>S.R. No.</th>
                                        <th>Office File no.</th>
                                        <th>File Name</th>
                                        <th>TP Stage</th>
                                        <th>No of Days</th>
                                        <th>Team</th>
                                        <th>Client Name</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {file.length ? file.map((f,index)=>{
                                    return (
                                        <tr key={f.id}>
                                            <td>{index+1}</td>
                                            <td>{f.office_file_no}</td>
                                            <td>{f.file_name}</td>
                                            <td>{parseInt(f.tps_stage)===1 ? "Draft":(parseInt(f.tps_stage)===2 ? "Final" :"")}</td>
                                            <td>{subtractTwoDates(GetDate(f.created_at,"YYYY-MM-DD"),todayDate())}</td>
                                            <td>{f.team ? f.team : ""}</td>
                                            <td>{f.cust_name}</td>
                                            <td>{f.stage_title}</td>
                                            <td> 
                                                <Link to={`/${FilesRoute.fileDetail}/${f.id}`} state={{data:f}} className="text-primary"><i className="far fa-eye"></i></Link>

                                                

                                                {[adminKey].includes(getRole())? 
                                                <>
                                                    <Link to={`/${FilesRoute.edit}/${f.id}`} className="text-warning"><i className="far fa-pencil"></i></Link>
                                                    <a role='button' onClick={()=>onRemoveFile(f)} className='text-danger'><i className="far fa-trash"></i></a>                                           
                                                 </>
                                                :""}
                                            </td>

                                                                                   
                                        </tr>
                                    )
                                })
                                    
                                :
                                    <tr>
                                        <td colSpan={"9"} className="text-center"><b>{loadingTitle}</b></td>
                                    </tr>
                                }
                                  
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>       
            </section>
        </div>  */}
    </>
  )
}

export default List;