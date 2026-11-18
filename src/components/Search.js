import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react'
import { useParams } from 'react-router'
import { getRole, getToken } from '../services/useLocalStorage';
import toast from 'react-hot-toast';
import Loader from 'react-js-loader';
import ApiService from '../services/ApiService';
import { searchapi } from '../config/config';
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { datatableHeight,paginationRows } from '../config/CommonVariables';
import { displayLoader } from '../UtilsComponent/DisplayLoader';
import { exportToCsv } from '../services/FormCommon';
import { adminKey,customerKey,empKey } from '../config/RoleConfig';
import { Link } from 'react-router-dom';
import { CustRoute, EmpRoute, FileExpenseRoute, FilesRoute, OfficeExpenseRoute, TodosRoute,SiteRoute } from '../config/RouteConfig';

const Search = () => {
  const params  = useParams();
  var header = {Authorization:`Bearer ${getToken()}`,['Content-type']:'application/json'};

  const [data,setData] = useState([]);
  const [filedata,setFileData] = useState([]);
  const [employeeData,setEmployeeData] = useState([]);
  const [clientData,setClientData] = useState([]);
  const [expenseData,setExpenseData] = useState([]);
  const [todoData,setTodoData] = useState([]);
  const[siteData,setSiteData]= useState([]);

  const FiletableRef = useRef(null);

  const file_hname = {
    sr_no: "Sr no",
    office_file_no: "Office file no",
    file_name: "File name",
    team: "Team",
    client: "Client",
    status: "Status",
    action: "Action"
};

const FileactionRender = (p) => {
    console.log(p);
    return <>
        
        {[adminKey,empKey].includes(getRole())
        ?
            <>
                <Link to={`/${FilesRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
            </>
        :""}
        
        
    </>
}

const file_columnDef = [
    { field: file_hname.sr_no },
    { field: file_hname.office_file_no},
    { field: file_hname.file_name },
    { field: file_hname.team },
    { field: file_hname.client },
    { field: file_hname.status },
    { field: file_hname.action, sortable: false, filter: false,cellRenderer: memo(FileactionRender) }
];

const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    flex: 1,
    filterParams: {
        debounsMs: 0,
        // buttons:['apply','clear','reset','cancel']
    }
}), []);


const EmptableRef = useRef(null);

const emp_hname = {
    sr_no: "Sr no",
    first_name: "First name",
    last_name: "last_name",
    email: "Email",
    phone: "Phone",
    action: "Action"
};


const EmpactionRender = (p) => {
    console.log(p);
    return <>
        
        {[adminKey].includes(getRole())
        ?
            <>
                <Link to={`/${EmpRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
            </>
        :""}
        
        
    </>
}

const emp_columnDef = [
    { field: emp_hname.sr_no },
    { field: emp_hname.first_name},
    { field: emp_hname.last_name },
    { field: emp_hname.email },
    { field: emp_hname.phone },
    { field: emp_hname.action, sortable: false, filter: false,cellRenderer: memo(EmpactionRender) }
];

const SiteTableRef = useRef(null);

const Sites_hname = {
    sr_no: "Sr no",
    Date:"Date",
    Client: "Client",
    Inspected_By: "Inspected_By",
    Site_Incharge: "Site_Incharge",
    Visit_Category: "Visit_Category",
    Visit_Work : "Visit_work",
    action: "Action"
}

const SitesactionRender = (p)=>{
    console.log(p);
    return <>
        
        {[adminKey].includes(getRole())
        ?
            <>
                <Link to={`/${SiteRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
            </>
        :""}
        
        
    </>
}

const sites_columnDef = [
    { field: Sites_hname.sr_no },
    { field: Sites_hname.Date},
    { field: Sites_hname.Client},
    { field: Sites_hname.Inspected_By},
    { field: Sites_hname.Site_Incharge },
    { field: Sites_hname.Visit_Category },
    { field: Sites_hname.Visit_Work },
    { field: Sites_hname.action, sortable: false, filter: false,cellRenderer: memo(SitesactionRender) }
];




const ClientTableRef = useRef(null);

const client_hname = {
    sr_no: "Sr no",
    first_name: "First name",
    last_name: "last_name",
    email: "Email",
    phone: "Phone",
    action: "Action"
};


const ClientactionRender = (p) => {
    console.log(p);
    return <>
        
        {[adminKey].includes(getRole())
        ?
            <>
                <Link to={`/${CustRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
            </>
        :""}
        
        
    </>
}

const client_columnDef = [
    { field: client_hname.sr_no },
    { field: client_hname.first_name},
    { field: client_hname.last_name },
    { field: client_hname.email },
    { field: client_hname.phone },
    { field: client_hname.action, sortable: false, filter: false,cellRenderer: memo(ClientactionRender) }
];

const ExpenseTableRef = useRef(null);

const expense_hname = {
    sr_no: "Sr no",
    file_name: "File",
    team: "Team",
    action: "Action"
};

const ExpenseactionRender = (p) => {
    console.log(p);
    return <>
        
        {[adminKey].includes(getRole())
        ?
            <>
                {p?.value?.expense_type==2 ? 
                    <Link to={`/${FileExpenseRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
                :
                    (p?.value?.expense_type==3 ?<Link to={`/${OfficeExpenseRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link> :"") 
                }
            </>
        :""}
        
        
    </>
}


const expense_columnDef = [
    { field: expense_hname.sr_no },
    { field: expense_hname.file_name},
    { field: expense_hname.team },
    { field: expense_hname.action, sortable: false, filter: false , cellRenderer: memo(ExpenseactionRender)}
];


const TodoTableRef = useRef(null);

const todo_hname = {
    sr_no: "Sr no",
    title: "Title",
    file_name: "File",
    team:"Team",
    action: "Action"
};


const TodoactionRender = (p) => {
    console.log(p);
    return <>
        
        {[adminKey].includes(getRole())
        ?
            <>
                <Link to={`/${TodosRoute.edit}/${p?.value?.id}`} style={{ color: "black" }} ><i class="fas fa-pencil-alt" aria-hidden="true"></i></Link>
            </>
        :""}
        
        
    </>
}


const todo_columnDef = [
    { field: todo_hname.sr_no },
    { field: todo_hname.title},
    { field: todo_hname.file_name },
    { field: todo_hname.team },
    { field: todo_hname.action, sortable: false, filter: false,cellRenderer: memo(TodoactionRender) }
];


  const fetchData = async () =>{
    try{
        const res = await ApiService({key:`${params?.key}`},0,header,searchapi.method,`${searchapi.url}`);
        console.log(res);
        if(!res?.data?.error){
            const payload = res?.data?.data;
            const file_data = payload?.file_data;
            const employee_data = payload?.employee_data;
            const client_data = payload?.client_data;
            const expense_data = payload?.expense_data;
            const todo_data = payload?.todo_data;
            const site_data = payload?.site_data;

            let rows = [];

            file_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [file_hname.sr_no]:`${index+1}`,
                    [file_hname.office_file_no] : element?.office_file_no,
                    [file_hname.file_name]:element?.file_name ? element?.file_name : "",
                    [file_hname.team]:element?.team ? element?.team : "",
                    [file_hname.client]:element?.client ? element?.client : "",
                    [file_hname.status]:element?.status,
                    [file_hname.action]:element
                })
            });

            setFileData(rows);

            rows = [];


            employee_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [emp_hname.sr_no]:`${index+1}`,
                    [emp_hname.first_name] : element?.first_name ? element?.first_name : "",
                    [emp_hname.last_name]:element?.last_name ? element?.last_name : "",
                    [emp_hname.email]:element?.email ? element?.email : "",
                    [emp_hname.phone]:element?.phone ? element?.phone : "",
                    [emp_hname.action]:element
                })
            });

            setEmployeeData(rows);
            rows = [];

            site_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [Sites_hname.sr_no]:`${index+1}`,
                    [Sites_hname.Date] : element?.Date ? element?.Date : "",
                    [Sites_hname.Client]:element?.Client ? element?.Client : "",
                    [Sites_hname.Inspected_By]:element?.Inspected_By ? element?.Inspected_By : "",
                    [Sites_hname.Site_Incharge]:element?.Site_Incharge ? element?.Site_Incharge : "",
                    [Sites_hname.Visit_Category]:element?.Visit_Category ? element?.Visit_Category : "",
                    [Sites_hname.Visit_Work]:element?.Visit_Work ? element?.Visit_Work : "",
                    [Sites_hname.action]:element
                })
            });

            setSiteData(rows);

            rows = [];

            client_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [client_hname.sr_no]:`${index+1}`,
                    [client_hname.first_name] : element?.first_name ? element?.first_name : "",
                    [client_hname.last_name]:element?.last_name ? element?.last_name : "",
                    [client_hname.email]:element?.email ? element?.email : "",
                    [client_hname.phone]:element?.phone ? element?.phone : "",
                    [client_hname.action]:element
                })
            });

            setClientData(rows);

            rows = [];

            expense_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [expense_hname.sr_no]:`${index+1}`,
                    [expense_hname.file_name] : element?.file_name ? element?.file_name : "",
                    [expense_hname.team]:element?.team ? element?.team : "",
                    [expense_hname.action]:element
                })
            });

            setExpenseData(rows);

            rows = [];

            todo_data.forEach((element,index)=>{
                rows.push({
                    id:element?.id,
                    [todo_hname.sr_no]:`${index+1}`,
                    [todo_hname.title] : element?.title ? element?.title : "",
                    [todo_hname.file_name] : element?.file_name ? element?.file_name : "",
                    [todo_hname.team]:element?.team ? element?.team : "",
                    [todo_hname.action]:element
                })
            });

            setTodoData(rows);

            rows = [];


        }else{

        }
    }catch(err){
        console.log(err);
    }
  }

  
   

  useEffect(()=>{
    console.log(params);
    fetchData();
  },[params]);
  return (
        <div className="content__wrapper">
                <section className="page-content">
                    <div className="page-title mobile-title">
                        <h1 className="h4 mb-0">All Files (Online Process)</h1>
                        {/*<p className="mb-4">Online Process</p>*/}
                    </div>
                    {filedata?.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">All Files</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(FiletableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={FiletableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={filedata}
                                    columnDefs={file_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}

                    {employeeData.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">All Team Members</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(EmptableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={EmptableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={employeeData}
                                    columnDefs={emp_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}

                    {clientData.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">All Clients</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(ClientTableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={ClientTableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={clientData}
                                    columnDefs={client_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}

{siteData.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">All Sites</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(ClientTableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={SiteTableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={siteData}
                                    columnDefs={sites_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}




                {expenseData.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">Expenses</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(ExpenseTableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={ExpenseTableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={expenseData}
                                    columnDefs={expense_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}

            {todoData.length>0 ? 
                    <div className="row">
                        <div className="col-md-12">
                            <div className="zed__table card">
                                <h5 className="text-shadow-yellow px-2 mb-4">Todos</h5>
                                <div className="table-responsive">
                                <div className="ag-theme-alpine" style={{ height: datatableHeight }}>
                                {/* <button className='btn' onClick={()=>exportToCsv(TodoTableRef)}>EXCEL</button> */}
                                <AgGridReact
                                    ref={TodoTableRef}
                                    pagination={true}
                                    paginationPageSize={paginationRows}
                                    loadingCellRenderer={displayLoader()}
                                    rowData={todoData}
                                    columnDefs={todo_columnDef}
                                    defaultColDef={defaultColDef}
                                    rowSelection="single"
                                    animateRows={true}
                                    overlayLoadingTemplate={"Loading"}
                                    overlayNoRowsTemplate={"Not found"}
                                />
                            </div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    :""}
                </section>
            </div>
  )
}

export default Search