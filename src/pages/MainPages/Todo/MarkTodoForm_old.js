import React,{useState,useEffect} from 'react'
import { image2svg } from '../../../UtilsComponent/UtilFunctions'
import { SwalAlert } from '../../../UtilsComponent/SwalDialog'
import ApiService from '../../../services/ApiService'
import { GetDate } from '../../../services/DateAndTimeService'
import { getToken } from '../../../services/useLocalStorage'
import { displayLoader } from '../../../UtilsComponent/DisplayLoader'
import { TodosRoute } from '../../../config/RouteConfig'
import { Link, useLocation, useNavigate ,Navigate,useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import {useForm} from 'react-hook-form'
import { getTodosById, markAsDoneTodo } from '../../../config/config'


const MarkTodoForm = () => {

    const navigate = useNavigate();  
    const params = useParams();
    const [loading,setLoading] = useState(false);
    const [todo,setTodo] = useState({});
    const header = {Authorization:`Bearer ${getToken()}`,['Content-Type']:'application/json'};
    
    const {register,handleSubmit,formState:{errors},reset} = useForm({
        mode:"onChange"
    });

    const goBack = () =>{
        navigate(`/${TodosRoute.list}`);
    }

    const fetchTodo =async  () =>{
        try
        {
            setLoading(true);
            const res = await ApiService(null,parseInt(params?.id),header,getTodosById.method,getTodosById.url);

            if(!res?.data?.error)
            {
                setLoading(false);
                const payload = res?.data?.data;
                if(Array.isArray(payload) && payload.length)
                {
                    setTodo(payload[0]);
                    reset({reason:payload[0]?.reason});
                    reset({work_done:payload[0]?.work_done});
                    reset({work_pending:payload[0]?.work_pending})
                }
            }
            else
            {
                setLoading(false);
                toast.error(res?.data?.message);
                navigate(`/${TodosRoute.list}`);
            }
        }
        catch(err)
        {
            setLoading(false);
            console.log(err);
            toast.error(err?.response?.data?.message ?err?.response?.data?.message: "Something went wrong");
        }
    }

    const submitTheForm = async (data) =>{
        try
        {
            setLoading(true);
            const res = await ApiService({...data,id:parseInt(params?.id)},0,header,markAsDoneTodo.method,markAsDoneTodo.url);
            if(!res?.data?.error)
            {
                setLoading(false);
                toast.success(res?.data?.message);
                navigate(`/${TodosRoute.list}`);
            }
            else
            {
                setLoading(false);
                toast.error(res?.data?.message);
            }

        }
        catch(err)
        {
            setLoading(false);
            console.log(err);
            toast.error(err?.response?.data?.message ?err?.response?.data?.message: "Something went wrong");
        }
    }

    const onSubmit =async (data) =>{
        SwalAlert({confirmButtonText:"Mark as done"}).then(async (result)=>{
            if(result?.isConfirmed){
                await submitTheForm(data);
            }
        }).catch((err)=>{
            console.log(err);
        });
    }

    useEffect(()=>{
        fetchTodo();
    },[]);

    const validJson = (json_string) =>{
        try{
            JSON.parse(json_string);
            return true;
        }catch(err){
            return false;
        }
    }

    const getLastCard = (jsonData) =>{
        try
        {
         if(validJson(jsonData))
         {
             const data = JSON.parse(jsonData);
             if(Array.isArray(data) && data?.length)
             {
                 return data[data.length-1]?.card_type;
             }
         }
         else
         {
             return "";
         }
        }catch(err)
        {
         console.log(err);
         return "";
        }
     }

  return (
    <div className="content__wrapper">
    

    <section className="page-content">
                <div className="page-title mobile-title">
                    <h1 className="h4 mb-0">Your</h1>
                    <p className="mb-4">Task</p>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="card p-5">
                            <div className="card-header bg-transparent border-0 mb-5 p-0">
                                <div className="row align-items-center justify-content-between">
                                    <div className="col-md-6">
                                        <h6 className="title-line text-shadow-yellow mb-0 pb-3">Your task</h6>
                                    </div>
                                </div>
                            </div>
                             
                            <div className="card-body p-0">
                            {loading ? displayLoader()
                :
                <form onSubmit={handleSubmit(onSubmit)}>

                    {todo?.completed_date ? 
                        <div className="row">
                        <div className="col">
                            <div><b>Due date</b>: {GetDate(todo?.completed_date,"DD-MMM-YYYY")} </div>
                        </div>
                    </div>
                    :""}


                    <div className="row">
                        <div className="col">
                            <div><b>Title</b>: {todo?.title} </div>
                        </div>
                    </div>
                    {todo?.mst_file_id!='0' 
                    ?
                    <div className="row">
                        <div className="col">
                            <div><b>File</b>: {todo?.file_name} </div>
                        </div>
                    </div>
                    :""}

                    {getLastCard(todo?.card) ? 
                        <div className="row">
                        <div className="col">
                            <div><b>Card</b>: {getLastCard(todo?.card)}</div>
                        </div>
                    </div>
                    :""}

                    {todo?.description ? 
                    <div className="row">
                        <div className="col">
                            <label htmlFor="description">description</label>
                            <textarea name="description" id="description" cols="30" rows="5" className="form-control" disabled={true}>{todo?.description}</textarea>
                        </div>
                    </div>
                    :""}

                    
                    
                    {todo?.remarks ? 
                    <div className="row">
                        <div className="col">
                            <div className="form-group">
                                <label htmlFor="remarks">Remarks</label>
                                <textarea name="remarks" className='form-control' id="remarks" cols="30" rows="3" defaultValue={todo?.remarks} disabled={true}></textarea>
                            </div>
                        </div>
                    </div>
                    :""}
                    <div className="row">
                        <div className="col-4">
                            <div className="form-group">
                            <label htmlFor="reason">Work Done</label>
                                <textarea name="reason" id="reason" cols="10" rows="3" {...register("reason")} className="form-control" disabled={todo?.mark_as_done==1}>

                                </textarea>
                            </div>
                        </div>
                    
                        <div className="col-4">
                            <div className="form-group">
                            <label htmlFor="work_done">Whats's Next</label>
                                <textarea name="work_done" id="work_done" cols="10" rows="3" {...register("work_done")} className="form-control" disabled={todo?.mark_as_done==1}>

                                </textarea>
                            </div>
                        </div>
                    
                        <div className="col-4">
                            <div className="form-group">
                            <label htmlFor="work_pending">Any Pending Work?</label>
                                <textarea name="work_pending" id="work_pending" cols="10" rows="3" {...register("work_pending")} className="form-control" disabled={todo?.mark_as_done==1}>

                                </textarea>
                            </div>
                        </div>
                    </div>
                    
                       
                            
                            <div className="row mt-3">
                                {todo?.mark_as_done==0 
                                ?
                                
                                <div className="form-group mb-0 col-md-2">
                                    <button type="submit" className="btn">Submit</button>
                                </div>
                               
                                :""}

                                <div className="form-group mb-0 col-md-4">
                                    <button type="button" onClick={goBack} className="btn">Back</button>
                                </div>     

                            </div>
                       
                   
                </form>
                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
</div>
  )
}

export default MarkTodoForm