import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react'
import { image2svg } from '../../../../UtilsComponent/UtilFunctions'
import { SwalAlert } from '../../../../UtilsComponent/SwalDialog'
import ApiService from '../../../../services/ApiService'
import { GetDate } from '../../../../services/DateAndTimeService'
import { getToken } from '../../../../services/useLocalStorage'
import { displayLoader } from '../../../../UtilsComponent/DisplayLoader'
import { deleteTodo, getTodos, getTodosByTeam } from '../../../../config/config'
import { Link, useNavigate } from "react-router-dom";
import { TodosRoute } from '../../../../config/RouteConfig'
import { FileUrl } from '../../../../config/file_url'
import toast from 'react-hot-toast';
import { AgGridReact } from "ag-grid-react";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { datatableHeight, paginationRows } from '../../../../config/CommonVariables'
import { ActionButtonJsx, exportToCsv, loadingTemplate, notFoundTemplate } from '../../../../services/FormCommon'
import { useSortBy, useTable, usePagination, useGlobalFilter } from 'react-table';
import { MyLoader } from '../../../../UtilsComponent/MyLoader'


//Todo: Team
const ListTeam = () => {


    const [todos, setTodos] = useState([]);
    const [loading,setLoading] = useState(false);
    const header = { Authorization: `Bearer ${getToken()}`, ['Content-Type']: 'application/json' };

    const subtractTwoDates = (d1, d2) => {
        try {
            if (d1 && d2) {
                const date1 = new Date(d1);
                const date2 = new Date(d2);

                var diff = date2 - date1;
                var diffInDays = (diff) / (1000 * 3600 * 24);

                return parseInt(Math.abs(diffInDays))
            }
            else {
                return "-";
            }

        } catch (err) {
            console.log(err);
            return "-";
        }
    }

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const res = await ApiService(null, 0, header, getTodosByTeam.method, getTodosByTeam.url);
            if (!res.data?.error) {
                setLoading(false);

                const payload = res?.data?.data;
                if (Array.isArray(payload) && payload.length) {

                    const rows = [];

                    payload.forEach(element => {

                        let card = "";

                        const cardJson = validJson(element?.card);
                        if (Array.isArray(cardJson) && cardJson.length > 0) {
                            card = cardJson[cardJson.length - 1]?.card_type
                        }

                        console.log(card);

                        if(element?.mark_as_done==0)
                        {
                            const start_date = element?.execution_date ? GetDate(element?.execution_date,"YYYY-MM-DD") : "-";
                            
                            const end_date = element?.completed_date ? GetDate(element?.completed_date,"YYYY-MM-DD") : "-";

                            rows.push({
                                id: element?.id,
                                [hname.title]: element?.title,
                                [hname.due_date]: element?.completed_date ? GetDate(element?.completed_date, "DD-MMM-YYYY") : "-",
                                [hname.card]: card.toUpperCase(),
                                [hname.days_left]:subtractTwoDates(start_date,end_date),
                                [hname.actual_completed_date]: element?.actual_completed_date ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY") : "-",
                                [hname.work_completed]: element?.mark_as_done == 0 ? "Not done" : "Done",
                                [hname.action]: element?.id
                            });
                        }
                        else
                        {
                            rows.push({
                                id: element?.id,
                                [hname.title]: element?.title,
                                [hname.due_date]: element?.completed_date ? GetDate(element?.completed_date, "DD-MMM-YYYY") : "-",
                                [hname.card]: card.toUpperCase(),
                                [hname.days_left]:"",
                                [hname.actual_completed_date]: element?.actual_completed_date ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY") : "-",
                                [hname.work_completed]: element?.mark_as_done == 0 ? "Not done" : "Done",
                                [hname.action]: element?.id
                            });
                        }

                        
                    })
                    setTodos(rows);
                }
                else {
                setLoading(false);
                   
                }
            }
            else {
                setLoading(false);
               
            }
        }
        catch (err) {
            setLoading(false);
           
            console.log(err);
        }
    }

    useEffect(() => {
        fetchTodos();
    }, []);


    const hname = {
        title: "Title",
        due_date: "Due date",
        days_left:"days_left",
        card: "Card",
        actual_completed_date: "Work completed date",
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
                                <Link className="dropdown-item" to={`/${TodosRoute.markTodo}/${row?.values?.id}`} style={{ color: "black" }}>View</Link>
                            </div>
                        </div>
                    </React.Fragment>
                )
            }

        ])
    }

    const renderDays = (value) => 
    {
       try
       {
            if(parseInt(value)<=3)
            {
                return <span  className='badge badge-danger'>{value}</span>;
            }
            else
            {
                return <span>{value}</span>;
            }
       }
       catch(err)
       {
            console.log(err);
            return "";
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
            {
                Header: 'Due date',
                accessor: `${hname.due_date}`
            },
            {
                Header: 'Days left',
                accessor: `${hname.days_left}`,
                Cell : ({value}) => renderDays(value)
            },
            {
                Header: 'Card',
                accessor: `${hname.card}`,
                Cell: ({ value }) => value == "GREEN" ? <span className='badge badge-success' style={{ fontSize: "12px" }}>{value}</span> : value == "CYAN" ? <span className='badge badge-info' style={{ fontSize: "15px" }}>{value}</span> : value == "RED" ? <span className='badge badge-danger' style={{ fontSize: "15px" }}>{value}</span> : value == "YELLOW" ? <span className='badge badge-warning' style={{ fontSize: "15px" }}>{value}</span> : <></>
            },
            {
                Header: 'Work Completed date',
                accessor: `${hname.actual_completed_date}`
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
    } = useTable({ columns, data: todos, initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 10 } }, tableHooks, useGlobalFilter, useSortBy, usePagination);

   



    const cellRenderer = (params) => {

        console.log(params?.value);

        switch (params?.value) {
            case "GREEN": {
                return <><span className='badge badge-success' style={{ fontSize: "15px" }}>{params.value}</span></>
            }
            case "RED": {
                return <><span className='badge badge-danger' style={{ fontSize: "15px" }}>{params.value}</span></>
            }
            case "CYAN": {
                return <><span className='badge badge-info' style={{ fontSize: "15px" }}>{params.value}</span></>
            }
            case "YELLOW": {
                return <><span className='badge badge-warning' style={{ fontSize: "15px" }}>{params.value}</span></>
            }
            default: {
                return <></>
            }
        }
    }

   



    const validJson = (json_string) => {
        try {
            return JSON.parse(json_string);
        } catch (err) {
            return "";
        }
    }


    return (
        <div className="content__wrapper">
            <section className="page-content">
                <div className="page-title mobile-title">
                    <h1 className="h4 mb-0">Todos</h1>
                    {/*<p className="mb-4">Todos</p>*/}
                    <div className="row">
                        <div className="col-lg-3 col-12">
                            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="zed__table card">
                            <h5 className="text-shadow-yellow px-2 mb-4">All Todos</h5>
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
                                                        console.log(cell?.column?.Header);
                                                        return (
                                                            <td
                                                                {...cell.getCellProps()}
                                                                width={cell?.column?.Header=="Title" ? "30%" : ""}
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

export default ListTeam

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