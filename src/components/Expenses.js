import React, { useEffect,useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../services/useLocalStorage';

const Expenses = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const [expenses, setExpenses] = useState([]);

    const fetchProducts = async () => {
        try{
            const res = await GetExpenses(`${getToken()}`);
            if(!res.data.error){
                setExpenses(res.data.data);
            }else{
                alert(res.data.message);
                navigate("/login",{state:{from:location},replace:true});
            }
        }catch(err){
            console.log(err);
            if(err.response.data.error){
                alert(err.response.data.message);
               // navigate("/login",{state:{from:location},replace:true});
            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const removeExpense = async (expense) =>{
        console.log(expense);

        const id = expense.id;

        if(!window.confirm("Are you sure?"))
        {
            return;
        }

        try{
            const res = await DeleteExpense(id,getToken());
            if(!res.data?.error){
                alert(res.data?.message);
                setExpenses(expenses.filter((e)=>{
                    return e.id!=id;
                }));
            }else{
                alert(res.data?.message);
            }
        }catch(err){
            console.log(err);

            if(err.response.request?.status===401){
                alert(err.response.data?.status);
            }
            else if(err.response.data?.error){
                alert(err.response.data?.message);
            }
        }

    }

    return (
        <>
           <div className="content__wrapper">
                <div className="page__header pt-3 position-relative">
                    <div className="container-fluid">
                        <h1>Expenses</h1>
                    </div>
                    <div className="container-fluid">
                        <Link to={"/add-expense"} className="btn btn-sm" role="button">Add</Link>
                    </div>
                </div>
                <section className="py-4">
                    <div class="container-fluid">
                        <div class="card p-4">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead className="grey__head">
                                        <tr>
                                            <th width="13%">First Name</th>
                                            <th width="27%">Last Name</th>
                                            <th width="10%">Email</th>
                                            <th width="20%">Mobile</th>
                                            <th width="20%">Status</th>
                                            <th width="20%">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense.id}>
                                            <td>{expense.id}</td>
                                            <td>{expense.id}</td>
                                            <td>{expense.id}</td>
                                            <td>{expense.id}</td>
                                            <td>{expense.id?"active":"Not active"}</td>
                                            <td> 
                                            
                                                <Link to={`/edit-expense/${expense.id}`} className="btn-waring"><i className="far fa-pencil"></i></Link>&nbsp;
                                                <button type='button' onClick={()=>removeExpense(expense)} className='btn-danger'><i className="far fa-trash"></i></button>  
                                            </td>
                                        
                                        </tr>
                                    ))}
                                    
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>       
                </section>
            </div> 
        </>
      )
}

export default Expenses;