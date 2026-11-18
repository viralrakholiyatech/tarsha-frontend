import React, { useEffect,useState,useCallback,useMemo,memo,useRef } from 'react'
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import axios from "axios";
import { useNavigate, useLocation,useParams } from 'react-router-dom';
import { getRole, getToken, getUserId, isEmp, superAccess } from '../../../services/useLocalStorage';
import { Link } from 'react-router-dom';
import { GetDate, GetDays, GetDateAndTime, GetTime, todayDate } from '../../../services/DateAndTimeService';
import toast from 'react-hot-toast';
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { deleteTodo, getTodosByFileId } from '../../../config/config';
import { datatableHeight, paginationRows, restrictTo } from '../../../config/CommonVariables';
import { TodosRoute } from '../../../config/RouteConfig';
import { AuthHeader, loadingTemplate, notFoundTemplate,ActionButtonJsx,actionButtonObject } from '../../../services/FormCommon';
import { useSortBy, useTable, usePagination, useGlobalFilter } from 'react-table';


const ListTodoOfFile = () => {

    const params = useParams();
    const [todos,setTodos] = useState([]);
    const [isDeleted,setIsDeleted] = useState(false);
    const [filename,setFilename] = useState("");

    const tableRef = useRef(null);

    const hname = {
        title: "Title",
        file_name: "File name",
        todo_assign_to: "Todo assign to",
        card:"Card",
        execution_date: "Execution date",
        due_date: "Due date",
        actual_completed_date: "Work completed date",
        status: "Status",
        work_completed: "Work completed",
        action: "action"
    };

    const tableHooks = (hooks) => {
        hooks.visibleColumns.push((columns) => [
            ...columns,
            {
                id: "Edit",
                Header: '',
                Cell: ({ row }) => (
                    <React.Fragment>
                        <div className="dropdown">
                            <button className="btn btn-secondary btn_action_menu" type="button" data-toggle="dropdown" aria-expanded="false">
                                <b><ActionButtonJsx /></b>
                            </button>
                            <div className="dropdown-menu">
                                 <Link className="dropdown-item"  to={`/${TodosRoute.reviewtodo}/${row?.values?.id}`}>View</Link>
                                <Link className="dropdown-item" to={`/${TodosRoute.edit}/${row?.values?.id}`} >{actionButtonObject.edit}</Link>
                                <a className="dropdown-item" role={"button"} onClick={()=>onRemoveTodo(row?.values?.id)}>{actionButtonObject.delete}</a>
                            </div>
                        </div>
                    </React.Fragment>
                )
            }

        ])
    }

    const cellRenderer = (value) =>{

        switch(value)
        {
            case "GREEN":{
                return <><span className='badge badge-success' style={{fontSize:"15px"}}>{value}</span></>
            }
            case "RED":{
                return <><span className='badge badge-danger' style={{fontSize:"15px"}}>{value}</span></>
            }
            case "CYAN":{
                return <><span className='badge badge-info' style={{fontSize:"15px"}}>{value}</span></>
            }
            case "YELLOW":{
                return <><span className='badge badge-warning' style={{fontSize:"15px"}}>{value}</span></>
            }
            default:{
                return <></>
            }
        }
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'id',
                accessor: 'id',
            },
            {
                Header: 'Title',
                accessor: `${hname.title}`
            },
            // {
            //     Header: 'File Name',
            //     accessor: `${hname.file_name}`
            // },
            {
                Header: 'Todo assign to',
                accessor: `${hname.todo_assign_to}`
            },
            {
                Header: 'Card',
                accessor:  `${hname.card}`,
                Cell : ({value}) => cellRenderer(value)
            },
            {
                Header: 'Execution Date',
                accessor: `${hname.execution_date}`
            },
            {
                Header: 'Due date',
                accessor: `${hname.due_date}`
            },
            {
                Header: 'Work Completed date',
                accessor: `${hname.actual_completed_date}`
            },
            {
                Header: 'Status',
                accessor: `${hname.status}`
            },
            {
                Header: 'Work Completed',
                accessor: `${hname.work_completed}`
            },
        ],
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        canPreviousPage,
        page,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        setGlobalFilter,
        state: { pageIndex, pageSize, globalFilter },
    } = useTable({ columns, data: todos, initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 100 } }, tableHooks, useGlobalFilter, useSortBy, usePagination);

    

    const validJson = (jsonString) =>{
        try{
            return JSON.parse(jsonString);
        }   
        catch(err){
            return "";
        }
    }

   


   


    const fetchTodos = async () =>{
        try
        {
            

            const res = await axios({
                method : `${getTodosByFileId.method}`,
                url : `${getTodosByFileId.url}/${params?.id}`,
                headers:AuthHeader()
            })

            if(!res.data?.error)
            {
                
                const payload = res?.data?.data;
                if(Array.isArray(payload) && payload.length)
                {

                    const rows = [];

                    setFilename(payload[0]?.file_name)
                   
                    payload.forEach(element=>{

                        const cardJson = validJson(element?.card);

                        let card = "";

                        if(Array.isArray(cardJson) && cardJson.length>0){
                            card = cardJson[cardJson.length-1]?.card_type
                        }

                        rows.push({
                            id:element?.id,
                            [hname.title]:element?.title ,
                            // [hname.file_name]:element?.file_name ? element?.file_name : "",
                            [hname.todo_assign_to]:element?.team_fullname,
                            [hname.card]:card.toUpperCase(),
                            [hname.execution_date]:element?.execution_date ? GetDate(element?.execution_date,"DD-MMM-YYYY") : "-",
                            [hname.due_date]:element?.completed_date ? GetDate(element?.completed_date,"DD-MMM-YYYY") : "-",
                            [hname.actual_completed_date]:element?.actual_completed_date ? GetDate(element?.actual_completed_date,"DD-MMM-YYYY") : "-",
                            [hname.status]:element?.is_approved==0 ? "Pending" : element?.is_approved==1 ? "Approved" : element?.is_approved==2 ? "Rejected" : "",
                            [hname.work_completed]:element?.mark_as_done==0 ? "Not done" : "Done",
                            // [hname.action]:element?.id
                        })
                    })

                    
                    setTodos(rows);


                }
                else
                {
                    
                }
            }
            else
            {
                
            }
        }
        catch(err)
        {
            
            console.log(err);

        }
    }

    const setTodoList = (id) =>{
        setTodos((prevState)=>{
            return prevState.filter((v)=>{
                return v?.id!=id
            })
        });
       
    }

    const removeToDo = async (id) =>{
        try
        {
          


            const res = await axios({
                method : `${deleteTodo.method}`,
                url : `${deleteTodo.url}/${id}`,
                headers:AuthHeader()
            })

            if(!res?.data?.error)
            {
                setTodoList(id);
                toast.success(res?.data?.message);
                
            }
            else
            {
                
                toast.error(res?.data?.message);
            }
        }
        catch(err)
        {
            
            console.log(err);
            toast.error(err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong");
        }
    }

    const onRemoveTodo = (id) =>{
        SwalAlert({}).then(async (result)=>{
            if(result?.isConfirmed){
                await removeToDo(id);
            }
        }).catch((err)=>{
            console.log(err);
        });
    }

    useEffect(()=>{
        fetchTodos();
    },[]);

  return (
    <div className="content__wrapper">
            <section className="page-content">
                <div className="page-title mobile-title">
                    <h1 className="h4 mb-0">File name : {filename}</h1>
                    {/*<p className="mb-4">Online Process</p>*/}
                      
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="zed__table card">
                            <h5 className="text-shadow-yellow px-2 mb-4">File name : {filename}</h5>
                            <div className="row">
                                    <div className="col-lg-3 col-12">
                                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                                    </div>
                                </div>
                            <div className="table-responsive">
                            <table className='table' {...getTableProps()}>
                                        <thead>
                                            {headerGroups.map(headerGroup => (
                                                <tr {...headerGroup.getHeaderGroupProps()}>
                                                    {headerGroup.headers.map(column => (
                                                        <th
                                                            {...column.getHeaderProps(column.getSortByToggleProps())}
                                                        >
                                                            {column.render('Header')}
                                                            <span>
                                                                {column.isSorted
                                                                    ? column.isSortedDesc
                                                                        ? ' 🔽'
                                                                        : ' 🔼'
                                                                    : ''}
                                                            </span>
                                                        </th>
                                                    ))}
                                                </tr>
                                            ))}
                                        </thead>
                                        <tbody {...getTableBodyProps()}>
                                            {/* {rows.map(row => { */}
                                            {page.map(row => {
                                                prepareRow(row)
                                                return (
                                                    <tr {...row.getRowProps()}>
                                                        {row.cells.map(cell => {
                                                            return (
                                                                <td
                                                                    {...cell.getCellProps()}

                                                                >
                                                                    {cell.render('Cell')}
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    <div className="pagination justify-content-end align-items-center">
                                        <button className='pagination_button' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                            {'<<'}
                                        </button>{' '}
                                        <button className='pagination_button' onClick={() => previousPage()} disabled={!canPreviousPage}>
                                            {'<'}
                                        </button>{' '}
                                        <button className='pagination_button' onClick={() => nextPage()} disabled={!canNextPage}>
                                            {'>'}
                                        </button>{' '}
                                        <button className='pagination_button' onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                            {'>>'}
                                        </button>{' '}
                                        <span>
                                            Page{' '}
                                            <strong>
                                                {pageIndex+1} of {pageOptions.length}
                                            </strong>{' '}
                                        </span>

                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
  )
}

export default ListTodoOfFile

const GlobalFilter = ({ filter, setFilter }) => {
    return (
        <span>
            <input
                className="form-control"
                type={"search"}
                style={{ margin: "5px" }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search"
            />
        </span>
    )
}