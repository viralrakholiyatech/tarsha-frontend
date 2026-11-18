import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react'
import { datatableHeight,paginationRows } from '../../../config/CommonVariables'
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { exportToCsv, loadingTemplate, notFoundTemplate,ActionButtonJsx,actionButtonObject } from '../../../services/FormCommon';
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import ApiService from '../../../services/ApiService';
import { deleteFileExpense, deleteFileExpenseForAdmin, getFileExpenseByFileId ,getFileExpenseByFileIdPdf} from '../../../config/config';
import { GetDate } from '../../../services/DateAndTimeService';
import { FileExpenseRoute, FilesRoute } from '../../../config/RouteConfig';
import { getToken } from '../../../services/useLocalStorage';
import { useSortBy, useTable,usePagination,useGlobalFilter,useRowSelect } from 'react-table';
import { MyLoader } from '../../../UtilsComponent/MyLoader';




const ListExpense = () => {

   const params = useParams();

   const [expenses, setExpenses] = useState([]);
   const [extra_expenses,setExtraExpenses] = useState([]);

   const [additionalInfo,setAdditionalInfo] = useState({file_name:"",total_expense:0})

   const header = {Authorization : `Bearer ${getToken()}`,['Content-Type']:'application/json'};
   const [dateRange,setDateRange] = useState({start_date:"",end_date:""});

   const [loading,setLoading] = useState(false);


   const hname = {
        date: "Date",
        // file: "File",
        amount: "Amount",
        description: "Description",
        team_fullname: "Team",
        status: "Status",
        action: "action"
    };


    const columns = React.useMemo(
        () => [
            {
                Header: 'id',
                accessor: 'id',
            },
            {
                Header: 'Date',
                accessor: `${hname.date}`
            },
           
            {
                Header: 'Amount',
                accessor: `${hname.amount}`
            },
            {
                Header: 'Description',
                accessor: `${hname.description}`
            },
            {
                Header: 'Team',
                accessor: `${hname.team_fullname}`
            },
            {
                Header: 'Status',
                accessor: `${hname.status}`
            },
        ],
        []
    )
      

      const tableHooks = (hooks) =>{
        hooks.visibleColumns.push((columns)=>[
            ...columns,
            {
                id:"Edit",
                Header: '',
                Cell:({row})=>(
                  <React.Fragment>
                    <div className="dropdown">
                    <button className="btn btn-secondary btn_action_menu" id={`${row?.values?.id}_click`} type="button" data-toggle="dropdown" aria-expanded="false">
                        <b><i class="fa fa-bars" aria-hidden="true"></i></b>
                    </button>
                    <div className="dropdown-menu">
                        <Link className='dropdown-item' to={`/${FileExpenseRoute.preview}/${row?.values?.id}`}>{actionButtonObject.preview_expense}</Link>
                        <Link className='dropdown-item' to={`/${FileExpenseRoute.edit}/${row?.values?.id}`}>{actionButtonObject.edit}</Link>
                         <a className='dropdown-item' role={"button"} onClick={()=>onRemoveExpense(row?.values?.id)}>{actionButtonObject.delete}</a>
                    </div>
                    </div>
                    </React.Fragment>
                )
            }

        ])
      }

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
        state: { pageIndex, pageSize,globalFilter },
      } = useTable({ columns, data:expenses ,initialState: {hiddenColumns:["id"], pageIndex: 0 ,pageSize:100}},tableHooks,useGlobalFilter,useSortBy,usePagination,
    //   useRowSelect, // Add useRowSelect hook
    //   hooks => {
    //     hooks.visibleColumns.push(columns => [
    //       // Add a checkbox column
    //       {
    //         id: 'selection',
    //         Header: ({ getToggleAllRowsSelectedProps }) => (
    //           <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
    //         ),
    //         Cell: ({ row }) => (
    //           <div>
    //             <input
    //               type="checkbox"
    //               {...row.getToggleRowSelectedProps()}
    //             />
    //           </div>
    //         ),
    //       },
    //       ...columns,
    //     ]);
    //   }
    );

    



   

  const fetchFileExpenseByFileId = useCallback(async () => {
    try
        {
            setLoading(true);
            const res = await ApiService(null,params?.id,header,getFileExpenseByFileId.method,getFileExpenseByFileId.url);
            if(!res?.data?.error)
            {
            setLoading(false);

                const payload = res?.data?.data;
                
                setAdditionalInfo({
                    total_expense:res?.data?.expense[0]?.total_expense!=null || res?.data?.expense[0]?.total_expense!=undefined ? res?.data?.expense[0]?.total_expense : 0,
                    file_name : res?.data?.expense[0]?.file_name
                })

                if(Array.isArray(payload) && payload.length>0)
                {
                    const rows = [];

                    payload.forEach(element=>{
                        rows.push({
                            id:element?.id,
                            [hname.date]:element?.date ? GetDate(element?.date,"DD-MM-YYYY") : "-",
                            [hname.amount]:element?.amount,
                            [hname.description]:element?.description,
                            [hname.team_fullname]:element?.team_fullname,
                            [hname.status]:element?.is_approved==1?"Approved":(element?.is_approved==0?"Pending":"Rejected"),
                            [hname.action]:element?.id
                        })
                    })

                    setExpenses(rows);
                    setExtraExpenses(rows);
                   
                }
                else
                {
                    setLoading(false);

                }
            }
            else
            {
                setLoading(false);

            }
        }
        catch(err)
        {
            setLoading(false);

            console.log(err);
            toast.error(err?.response?.data?.message ? err?.response?.data?.message :"Something went wrong");
        }
  },[]);

  const removeExpense = async (id) =>{
    try
    {
        setLoading(true);
        
        const res = await ApiService(null,parseInt(id),header,deleteFileExpenseForAdmin.method,deleteFileExpenseForAdmin.url);
        if(!res?.data?.error)
        {
            setLoading(false);

            toast.success(res?.data?.message);
            setList(id);
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
    }
}

    const onRemoveExpense = (id) =>{
        SwalAlert({}).then(async(result)=>{
            if(result?.isConfirmed)
            {
                if(parseInt(id)!=NaN)
                {
                    await removeExpense(id);
                }
            }
        }).catch((err)=>{
            console.log(err);
        })
    }

    const setList = (id) =>{


        setAdditionalInfo((prevState)=>{
            return {...prevState,total_expense:prevState?.total_expense - expenses.filter((e)=>e?.id==id)[0]?.Amount}
        })

        setExpenses((prevState)=>{
            return prevState.filter((v)=>{
                return v?.id!=id;
            })
        });

        setExtraExpenses((prevState)=>{
            return prevState.filter((v)=>{
                return v?.id!=id;
            })
        });

      
    }

   

      const clearFilters = useCallback(() => {
        setDateRange({start_date:"",end_date:""});
        setExpenses((prevState)=>[...extra_expenses])
      }, []);

      const redirectToPdfPage = () =>{
        
        let urlLink = `/${FilesRoute.file_expense_pdf}/${params?.id}`;

        if(dateRange.start_date && dateRange.end_date){

            urlLink = `${urlLink}?start_date=${dateRange.start_date}&&end_date=${dateRange.end_date}`
            window.open(urlLink);

        }else{
            window.open(urlLink);
        }

    }

    const getDataByDateRange = async (start_date,end_date) =>{
        let urlString = `${getFileExpenseByFileIdPdf.url}/${params?.id}`;
        urlString = `${urlString}?start_date=${start_date}&&end_date=${end_date}`;

        setLoading(true);


        const res = await ApiService(null, 0, header, getFileExpenseByFileIdPdf.method, urlString);

        if(!res?.data?.error)
        {
        setLoading(false);

            const payload = res?.data?.data;

            if(Array.isArray(payload) && payload.length>0)
            {
                const rows = [];

                payload.forEach(element=>{
                    rows.push({
                        id:element?.id,
                        [hname.date]:element?.date ? GetDate(element?.date,"DD-MM-YYYY") : "-",
                        [hname.amount]:element?.amount,
                        [hname.description]:element?.description,
                        [hname.team_fullname]:element?.team_fullname,
                        [hname.status]:element?.is_approved==1?"Approved":(element?.is_approved==0?"Pending":"Rejected"),
                        [hname.action]:element?.id
                    })
                })

                setExpenses(rows);
               
            }
            else
            {
                setExpenses([]);
            }
        }
        else
        {
        setLoading(false);

            setExpenses([]);
        }
    }


    useEffect(()=>{
        if(dateRange.start_date && dateRange.end_date)
        {
            getDataByDateRange(dateRange.start_date,dateRange.end_date);
        }
        else
        {
            if(!dateRange.start_date && !dateRange.end_date)
            {
                setExpenses((prevState)=>[...extra_expenses]);
            }
        }
    },[dateRange]);
  

  useEffect(()=>{
    fetchFileExpenseByFileId();
  },[]);

  return (
    <div className="content__wrapper">
    <section className="page-content">
        <div className="page-title mobile-title">
            <h1 className="h4 mb-0">File Expense</h1>
            {/*<p className="mb-4">Online Process</p>*/}
        </div>
        <div className="row">
            <div className="col-md-12">
                <div className="zed__table card">
                    <h5 className="text-shadow-yellow px-2 mb-4">File Expense</h5>
                    <div className="form-row">
                            <div className="col">
                                <div className="form-group">
                                    <input type="date" name="start_date" id="start_date" onChange={(e)=>setDateRange((p)=>({...p,start_date:e.target.value}))} value={dateRange.start_date} className='form-control'/>
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <input type="date" name='end_date' id="end_date" onChange={(e)=>setDateRange((p)=>({...p,end_date:e.target.value}))} value={dateRange.end_date} className='form-control' />
                                </div>
                            </div>
                            <div className="col">
                            <div className="form-group">
                            {expenses.length>0 ? 
                                <button className='btn' onClick={redirectToPdfPage}>TO PDF</button>
                                // <a href={`/${EmpRoute.deposit_expense_report_pdf}/${params?.id}`} role="button" className='btn' target={"_blank"} >To PDF</a>
                                :
                                <button className='btn' disabled>TO PDF</button>
                                // <a href="javascript:void(0)" className='btn' style={{pointerEvents:"none",cursor:"no-drop"}} >To PDF</a>
                                }
                            </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <button className='btn' onClick={clearFilters}>Reset</button>
                                </div>
                            </div>
                            
                           
                        
                    </div>
                    <div className="row">
                        <div className="col-sm-2">
                            <h6>File : {additionalInfo.file_name}</h6>
                        </div>
                        <div className="col-sm-2">
                            <h6>Total Expense : {additionalInfo.total_expense}</h6>
                        </div>
                       

                    </div>
                    <div className="table-responsive">

                    {loading ? <MyLoader value={false}/> : 


                    <table className='table datatable' {...getTableProps()}>
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
       <tfoot>
                                        <td colSpan={6}>
                                        <div className="pagination justify-content-end align-items-center">
                                            <button className='pagination_button' onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                                                {'<<'}
                                            </button>
                                            <button className='pagination_button' onClick={() => previousPage()} disabled={!canPreviousPage}>
                                                {'<'}
                                            </button>
                                            <span>
                                                Page{' '}
                                                <strong>
                                                    {pageIndex+1} of {pageOptions.length}
                                                </strong>
                                            </span>
                                            <button className='pagination_button' onClick={() => nextPage()} disabled={!canNextPage}>
                                                {'>'}
                                            </button>
                                            <button className='pagination_button' onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                                                {'>>'}
                                            </button>
                                        </div>
                                        </td>
                                    </tfoot>
     </table>
}
      
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>
  )
}

export default ListExpense

const GlobalFilter = ({filter,setFilter}) =>{
    return (
        <span>
            <input
                className="form-control"
                type={"search"}
                style={{margin:"5px"}}
                value={filter}
                onChange={(e)=>setFilter(e.target.value)} 
                placeholder="Search"
            />
        </span>
    )
}