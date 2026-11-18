import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react'

import { GetFile,DeleteFile } from '../../../services/FileService';
import {useNavigate,useLocation} from 'react-router-dom';
import { getRole, getToken, getUserId, isEmp, superAccess } from '../../../services/useLocalStorage';
import {Link} from 'react-router-dom';
import { GetDate, GetDays,GetDateAndTime, GetTime, todayDate } from '../../../services/DateAndTimeService';
import { FileUrl } from '../../../config/file_url';
import toast from 'react-hot-toast';
import date from 'date-and-time';
import { FilesRoute } from '../../../config/RouteConfig';
import { adminKey, customerKey, empKey,subadmin } from '../../../config/RoleConfig';
import { SwalAlert } from '../../../UtilsComponent/SwalDialog';
import ApiService from '../../../services/ApiService';
import { fetchFileOfReject, fetchFileOfRejectForTeam } from '../../../config/config';
import { image2svg } from '../../../UtilsComponent/UtilFunctions';
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { datatableHeight, paginationRows, restrictTo } from '../../../config/CommonVariables';
import axios from "axios";

import {ActionButtonJsx,actionButtonObject, AuthHeader, exportToCsv, loadingTemplate, notFoundTemplate } from '../../../services/FormCommon';
import { useSortBy, useTable, usePagination, useGlobalFilter } from 'react-table';
import { MyLoader } from '../../../UtilsComponent/MyLoader';
import { AiOutlineWallet } from 'react-icons/ai';

//File Reject
const ListReject = () => {


    const [file, setFile] = useState([]);

    const [loading,setLoading] = useState(false);



    const hname = {
        sr_no: "Sr no",
        office_file_no: "Office file no",
        file_name: "File name",
        tp_stage: "TP stage",
        no_of_days: "No of days",
        team: "Team",
        code:"Code",
        client: "Client",
        status: "Status",
        action: "Action"
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
                            {superAccess() ?
                <>
                    {/* <Link className='dropdown-item' to={`/${FilesRoute.fileDetail}/${row?.values?.id}`} >{actionButtonObject.file_details}</Link> */}
                    <Link className='dropdown-item' to={`/${FilesRoute.edit}/${row?.values?.id}`}  >{actionButtonObject.edit}</Link>
                    <a className='dropdown-item' role='button' onClick={() => onRemoveFile(row?.values?.id)} >{actionButtonObject.delete}</a>
                    {/* <Link className='dropdown-item' to={`/${FilesRoute.listFileExpense}/${row?.values?.id}`} >{actionButtonObject.file_expense}</Link> */}
                    <Link className='dropdown-item' to={`/${FilesRoute.file_todos}/${row?.values?.id}`} >{actionButtonObject.file_todo}</Link>
                </>
            :
            isEmp()?
                    <>
                    <Link className='dropdown-item' to={`/${FilesRoute.fileDetail}/${row?.values?.id}`} >{actionButtonObject.file_details}</Link>
                    <Link className='dropdown-item' to={`/${FilesRoute.edit}/${row?.values?.id}`}  >{actionButtonObject.edit}</Link>
                    <a className='dropdown-item' role='button' onClick={() => onRemoveFile(row?.values?.id)} >{actionButtonObject.delete}</a>
                    
                </>
            :""
            }
            {superAccess([subadmin]) ?
                <>
                    <Link className='dropdown-item' to={`/${FilesRoute.fileDetail}/${row?.values?.id}`} >{actionButtonObject.file_details}</Link>
                    <Link className='dropdown-item' to={`/${FilesRoute.file_todos}/${row?.values?.id}`} >{actionButtonObject.file_todo}</Link>
                </>
            :""
             }
                            </div>
                        </div>
                    </React.Fragment>
                )
            }

        ])
    }

    const columns = React.useMemo(
        () => [
            {
                Header: 'id',
                accessor: 'id',
            },
            {
                Header: 'Sr no',
                accessor: `${hname.sr_no}`
            },
            {
                Header: 'Office File No',
                accessor: `${hname.office_file_no}`
            },
            {
                Header: 'File name',
                accessor: `${hname.file_name}`
            },
            {
                Header: 'TP stage',
                accessor: `${hname.tp_stage}`
            },
            {
                Header: 'No of days',
                accessor: `${hname.no_of_days}`
            },
            {
                Header: 'Team',
                accessor: `${hname.team}`
            },
            {
                Header: 'Code',
                accessor: `${hname.code}`
            },
            {
                Header: 'Client',
                accessor: `${hname.client}`
            },
            {
                Header: 'Status',
                accessor: `${hname.status}`
            },
            {
                Header: '',
                accessor: 'expense',
                Cell: ({ value, row }) => (
                    !isEmp(empKey) && (
                  <Link to={`/${FilesRoute.listFileExpense}/${row?.values?.id}`}>
                    <AiOutlineWallet style={{ marginRight: '5px' }} />
                     {value}
               </Link>
                    )
                ),
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
    } = useTable({ columns, data: file, initialState: { hiddenColumns: superAccess() ? ["id"] : ["id","Client"], pageIndex: 0, pageSize: 100 } }, tableHooks, useGlobalFilter, useSortBy, usePagination);

    

    

    const fetchFiles = async () => {
        try{
            setLoading(true);

            let apiObj = {
                method :
                //  !restrictTo.filesOf.rejectFiles ?
                  fetchFileOfReject.method ,
                //   : (superAccess([adminKey,subadmin]) ? fetchFileOfReject.method:fetchFileOfRejectForTeam.method),
                url : 
                // !restrictTo.filesOf.rejectFiles ?
                 fetchFileOfReject.url 
                //  : (superAccess([adminKey,subadmin]) ? fetchFileOfReject.url:fetchFileOfRejectForTeam.url)
            };


            const res = await axios({method:apiObj.method,url:apiObj.url,headers:AuthHeader()});

            if(!res?.data?.error){
                setLoading(false);

                const payload = res?.data?.data;
                
                if (Array.isArray(payload) && payload.length>0) {

                    const rows = [];

                    payload.forEach((element,index)=>
                    {
                        console.log(element?.office_file_no);
                        rows.push({
                            id:element?.id,
                            [hname.sr_no]:`${index+1}`,
                            [hname.office_file_no] : element?.office_file_no,
                            [hname.file_name]:element?.file_name ?  (<Link to={`/${FilesRoute.fileDetail}/${element?.id}`}>{element?.file_name} </Link>) : "",
                            [hname.code]:element?.code_title ? element?.code_title : "",
                            [hname.tp_stage]:parseInt(element?.tps_stage) === 1 ? "Draft" : (parseInt(element?.tps_stage) === 2 ? "Final" : ""),
                            [hname.no_of_days]:subtractTwoDates(GetDate(element?.created_at, "YYYY-MM-DD"), todayDate()),
                            [hname.team]:element?.team ? element?.team : "",
                            [hname.client]:element?.cust_name ? element?.cust_name : "",
                            [hname.status]:element?.stage_title,
                            [hname.action]:element
                        })
                    })

                    console.log(rows);

                    setFile(rows);

                }
                else {
                setLoading(false);
                    
                    
                }

                
            }else{
                setLoading(false);
                
                
                toast.error(res?.data?.message ? res?.data?.message : "Not found");
            }
        }catch(err){
            
            setLoading(false);

            console.log(err);
            toast.error(err?.response?.data?.message ? err?.response?.data?.message : "Something went wrong");
        }
    };

   
    const removeFile = async (id) => {

        try {
            setLoading(true);
           
            const res = await DeleteFile(id, getToken());
            if (!res.data?.error) {
                // setFile(file.filter((e) => {
                //     return e.id != id;
                // }));

                setLoading(false);


                setFile((prevState)=>{
                    return prevState.filter((e,i)=>{
                        return e?.id!=id;
                    })
                })
                
                toast.success(res.data.message);
                
            }
            else {
                setLoading(false);
                
                toast.error(res.data?.message);
            }
        } catch (err) {

            setLoading(false);

            console.log(err);
            
            toast.error(err.response.data?.message);
        }

    }

    const onRemoveFile = (id) => {
        SwalAlert({}).then(async (result) => {
            if (result.isConfirmed) {
                await removeFile(id);
            }
        }).catch((err) => {
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

    useEffect(()=>{
        fetchFiles();
        localStorage.setItem("lastPath",FilesRoute.listFileReject);
    },[]);


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
                            <h5 className="text-shadow-yellow px-2 mb-4">All Files (Reject)</h5>
                            <div className="row">
                                    <div className="col-lg-3 col-12">
                                        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
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

                                        <td colSpan={superAccess() ?  10 : 9}>

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
        
     
    </>
  )
}

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

export default ListReject