import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { image2svg } from "../../../../UtilsComponent/UtilFunctions";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import ApiService from "../../../../services/ApiService";
import { GetDate } from "../../../../services/DateAndTimeService";
import { getToken } from "../../../../services/useLocalStorage";
import { displayLoader } from "../../../../UtilsComponent/DisplayLoader";
import {
  fetchActiveEmployee,
  deleteTodo,
  getTodos,
} from "../../../../config/config";
import { Link, useNavigate } from "react-router-dom";
import { TodosRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import toast from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {
  datatableHeight,
  paginationRows,
} from "../../../../config/CommonVariables";
import {
  exportToCsv,
  loadingTemplate,
  notFoundTemplate,
  ActionButtonJsx,
  actionButtonObject,
} from "../../../../services/FormCommon";
import {
  useSortBy,
  useTable,
  usePagination,
  useGlobalFilter,
  useRowSelect,
} from "react-table";
import { MyLoader } from "../../../../UtilsComponent/MyLoader";
import { useForm } from "react-hook-form";

//Todo list admin
const ListAdmin = () => {
  const [todos, setTodos] = useState([]);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-Type"]: "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [dropdownData, setDropDownData] = useState({ team_id: "" });
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedStatus, setselectedStatus] = useState("");

  //   useEffect(() => {
  // const userinfo = JSON.parse(localStorage.getItem("userinfo"));
  // const username = userinfo.fullname;
  // console.log("fizxarst==>",username)

  // }, []);

  useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, []);

  const getEmployees = async () => {
    try {
      // const res = await GetEmployees(`${getToken()}`);
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url
      );
      console.log("res-->", res);
      if (!res.data.error) {
        setLoading(false);
        const payload = res.data?.data;
        if (Array.isArray(payload) && payload.length) {
          setEmployees(payload);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const validJson = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return "";
    }
  };
  const { getValues } = useForm({
    mode: "onChange",
  });

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        0,
        header,
        getTodos.method,
        getTodos.url
      );
      if (!res.data?.error) {
        setLoading(false);

        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length) {
          const rows = [];
          // ? GetDate(element?.date,"DD-MM-YYYY") : "-"
          payload.forEach((element) => {
            const cardJson = validJson(element?.card);

            let card = "";

            if (Array.isArray(cardJson) && cardJson.length > 0) {
              card = cardJson[cardJson.length - 1]?.card_type;
            }

            if (element?.mark_as_done == 0) {
              const start_date = element?.execution_date
                ? GetDate(element?.execution_date, "YYYY-MM-DD")
                : "-";

              const end_date = element?.completed_date
                ? GetDate(element?.completed_date, "YYYY-MM-DD")
                : "-";

              rows.push({
                id: element?.id,
                [hname.title]: element?.title,
                [hname.file_name]: element?.file_name ? element?.file_name : "",
                [hname.todo_assign_to]: element?.team_fullname,
                [hname.card]: card.toUpperCase(),
                [hname.execution_date]: element?.execution_date
                  ? GetDate(element?.execution_date, "DD-MMM-YYYY")
                  : "-",
                [hname.due_date]: element?.completed_date
                  ? GetDate(element?.completed_date, "DD-MMM-YYYY")
                  : "-",
                [hname.days_left]: subtractTwoDates(start_date, end_date),
                [hname.actual_completed_date]: element?.actual_completed_date
                  ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY")
                  : "-",
                [hname.status]:
                  element?.is_approved == 0
                    ? "Pending"
                    : element?.is_approved == 1
                    ? "Approved"
                    : element?.is_approved == 2
                    ? "Rejected"
                    : "",
                [hname.work_completed]:
                  element?.mark_as_done == 0 ? "Not done" : "Done",
              });
            } else {
              rows.push({
                id: element?.id,
                [hname.title]: element?.title,
                [hname.file_name]: element?.file_name ? element?.file_name : "",
                [hname.todo_assign_to]: element?.team_fullname,
                [hname.card]: card.toUpperCase(),
                [hname.execution_date]: element?.execution_date
                  ? GetDate(element?.execution_date, "DD-MMM-YYYY")
                  : "-",
                [hname.due_date]: element?.completed_date
                  ? GetDate(element?.completed_date, "DD-MMM-YYYY")
                  : "-",
                [hname.days_left]: "",
                [hname.actual_completed_date]: element?.actual_completed_date
                  ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY")
                  : "-",
                [hname.status]:
                  element?.is_approved == 0
                    ? "Pending"
                    : element?.is_approved == 1
                    ? "Approved"
                    : element?.is_approved == 2
                    ? "Rejected"
                    : "",
                [hname.work_completed]:
                  element?.mark_as_done == 0 ? "Not done" : "Done",
              });
            }
          });

          setTodos(rows);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
    }
  };

  useEffect(() => {
    fetchTodos();
    getEmployees();
    const storedTeam = localStorage.getItem("selectedTeam");
    if (storedTeam) {
      setSelectedTeam(storedTeam);
    }
  }, []);

  const hname = {
    title: "Title",
    file_name: "File name",
    todo_assign_to: "Todo_assign_to",
    card: "Card",
    execution_date: "Execution date",
    due_date: "Due date",
    days_left: "days_left",
    actual_completed_date: "Work completed date",
    status: "Status",
    work_completed: "Work completed",
    action: "action",
  };

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: "Edit",
        Header: "",
        Cell: ({ row }) => (
          <React.Fragment>
            <div className="dropdown">
              <button
                className="btn btn-secondary btn_action_menu"
                type="button"
                data-toggle="dropdown"
                aria-expanded="false"
              >
                <b>
                  <ActionButtonJsx />
                </b>
              </button>
              <div className="dropdown-menu">
                {renderDropdownItems(row.original, row)}

                {/* <Link className="dropdown-item" to={`/${TodosRoute.markTodo}/${row?.values?.id}`} style={{ color: "black" }}>View</Link>
                <Link
                  className="dropdown-item"
                  to={`/${TodosRoute.reviewtodo}/${row?.values?.id}`}
                  style={{ color: "black" }}
                >
                  {"Todo Review"}
                </Link>
                <Link
                  className="dropdown-item"
                  to={`/${TodosRoute.edit}/${row?.values?.id}`}
                  style={{ color: "black" }}
                >
                  {actionButtonObject.edit}
                </Link>
                <a
                  className="dropdown-item"
                  role={"button"}
                  onClick={() => onRemoveTodo(row?.values?.id)}
                >
                  {actionButtonObject.delete}
                </a> */}
              </div>
            </div>
          </React.Fragment>
        ),
      },
    ]);
  };

  const renderDropdownItems = (todo, row) => {
    const userinfo = JSON.parse(localStorage.getItem("userinfo"));
    const username = userinfo.fullname;

    if (todo[hname.todo_assign_to] === username) {
      return (
        <Link
          className="dropdown-item"
          to={`/${TodosRoute.markTodo}/${row?.values?.id}`}
          style={{ color: "black" }}
        >
          View
        </Link>
      );
    } else {
      return (
        <React.Fragment key={todo.id}>
          <Link
            className="dropdown-item"
            to={`/${TodosRoute.reviewtodo}/${row?.values?.id}`}
            style={{ color: "black" }}
          >
            {"Todo Review"}
          </Link>
          <Link
            className="dropdown-item"
            to={`/${TodosRoute.edit}/${row?.values?.id}`}
            style={{ color: "black" }}
          >
            {actionButtonObject.edit}
          </Link>
          <a
            className="dropdown-item"
            role={"button"}
            onClick={() => onRemoveTodo(row?.values?.id)}
          >
            {actionButtonObject.delete}
          </a>
        </React.Fragment>
      );
    }
  };

  const renderDays = (value) => {
    try {
      if (parseInt(value) <= 3) {
        return <span className="badge badge-danger">{value}</span>;
      } else {
        return <span>{value}</span>;
      }
    } catch (err) {
      console.log(err);
      return "";
    }
  };

  const handleChange = (e) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);
  };

  const handleEndChange = (e) => {
    const selectedEndDate = e.target.value;
    setEndDate(selectedEndDate);
  };

  const handleTeamChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedTeam(selectedValue);
    localStorage.setItem("selectedTeam", selectedValue);
    // console.log("Selected Team:", selectedValue);
  };

  const handleStatusChange = (event) => {
    const selected = event.target.value;
    setselectedStatus(selected);
   
    // console.log("Selected Status:", selected);
  };

  const filterByStatus = (todos) => {
    if (selectedStatus !== "") {
      return todos.filter((item) => {
        // console.log("Team ID:", item.Team);
        return item.Status === selectedStatus;
      });
    }
    return todos;
  };

  const filteredData = useMemo(() => {
    let filteredTodos = todos;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTodos = filteredTodos.filter((item) => {
        const executionDate = new Date(item[hname.execution_date]);
        const completedDate = new Date(item[hname.due_date]);
        return executionDate >= start && completedDate <= end;
      });
    }

    filteredTodos = filterByStatus(filteredTodos); // Apply status filtering

    if (selectedTeam !== "") {
      filteredTodos = filteredTodos.filter((item) => {
        console.log("item.Todo_assign_to===>",item.Todo_assign_to)
        return item.Todo_assign_to === selectedTeam;
      });
    }
    // Sort the todos in descending order based on ID
    filteredTodos = filteredTodos.sort((a, b) => b.id - a.id);

    return filteredTodos;

    // return filteredTodos;
    // return filteredTodos.reverse(); // Reverse the order of todos
  }, [startDate, endDate, todos, selectedStatus, selectedTeam]);

  // console.log("filteredData====--->", filteredData);

  const columns = React.useMemo(
    () => [
      {
        Header: "id",
        accessor: "id",
      },
      {
        Header: "Title",
        accessor: `${hname.title}`,
      },
      {
        Header: "File Name",
        accessor: `${hname.file_name}`,
      },
      {
        Header: "Todo assign to",
        accessor: `${hname.todo_assign_to}`,
      },
      {
        Header: "Card",
        accessor: `${hname.card}`,
        // Cell : ({value}) => value=="GREEN" ? <span className='badge badge-success' style={{fontSize:"15px"}}>{value}</span> : value=="CYAN"  ?<span className='badge badge-info' style={{fontSize:"15px"}}>{value}</span> : value=="RED" ? <span className='badge badge-danger' style={{fontSize:"15px"}}>{value}</span> : value=="YELLOW" ? <span className='badge badge-warning' style={{fontSize:"15px"}}>{value}</span> : <></>
        Cell: ({ value }) => {
          switch (value) {
            case "GREEN": {
              return <span className="badge badge-success">{value}</span>;
            }
            case "RED": {
              return <span className="badge badge-danger">{value}</span>;
            }
            case "CYAN": {
              return <span className="badge badge-info">{value}</span>;
            }
            case "YELLOW": {
              return <span className="badge badge-warning">{value}</span>;
            }
            default: {
              return "";
            }
          }
        },
      },
      {
        Header: "Execution Date",
        accessor: `${hname.execution_date}`,
      },
      {
        Header: "Due date",
        accessor: `${hname.due_date}`,
      },
      {
        Header: "Days left",
        accessor: `${hname.days_left}`,
        Cell: ({ value }) => renderDays(value),
      },
      {
        Header: "Work Completed date",
        accessor: `${hname.actual_completed_date}`,
      },
      {
        Header: "Status",
        accessor: `${hname.status}`,
      },
      {
        Header: "Work Completed",
        accessor: `${hname.work_completed}`,
      },
    ],
    []
  );

  const {
    getTableProps: myTableProps,
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
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 100 },
    },
    tableHooks,
    useGlobalFilter,
    useSortBy,
    usePagination
    // useRowSelect, // Add useRowSelect hook
    // hooks => {
    //   hooks.visibleColumns.push(columns => [
    //     // Add a checkbox column
    //     {
    //       id: 'selection',
    //       Header: ({ getToggleAllRowsSelectedProps }) => (
    //         <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
    //       ),
    //       Cell: ({ row }) => (
    //         <div>
    //           <input
    //             type="checkbox"
    //             {...row.getToggleRowSelectedProps()}
    //           />
    //         </div>
    //       ),
    //     },
    //     ...columns,
    //   ]);
    // }
  );

  const setTodoList = (id) => {
    setTodos((prevState) => {
      return prevState.filter((v) => {
        return v?.id != id;
      });
    });
  };

  const removeToDo = async (id) => {
    try {
      const res = await ApiService(
        null,
        parseInt(id),
        header,
        deleteTodo.method,
        deleteTodo.url
      );
      if (!res?.data?.error) {
        setTodoList(id);
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "Something went wrong"
      );
    }
  };

  const onRemoveTodo = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result?.isConfirmed) {
          await removeToDo(id);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const subtractTwoDates = (d1, d2) => {
    try {
      if (d1 && d2) {
        const date1 = new Date(d1);
        const date2 = new Date(d2);

        var diff = date2 - date1;
        var diffInDays = diff / (1000 * 3600 * 24);

        return parseInt(Math.abs(diffInDays));
      } else {
        return "-";
      }
    } catch (err) {
      console.log(err);
      return "-";
    }
  };

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Todos</h1>
          {/*<p className="mb-4">Online Process</p>*/}
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="zed__table card">
              <h5 className="text-shadow-yellow px-2 mb-4">All Todos</h5>
              <div className="row">
                <div className="col-lg-3 col-12">
                  <GlobalFilter
                    filter={globalFilter}
                    setFilter={setGlobalFilter}
                  />
                </div>
                <div className="col-lg-2 col-12">
                  <div className="form-group">
                    <input
                      type="date"
                      name="start_date"
                      id="start_date"
                      onChange={handleChange}
                      value={startDate}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-2 col-12">
                  <div className="form-group">
                    <input
                      type="date"
                      name="end_date"
                      id="end_date"
                      onChange={handleEndChange}
                      value={endDate}
                      className="form-control"
                    />
                  </div>
                </div>
                <div className="col-lg-2">
                  <div className="form-group">
                    {/* <label htmlFor="team_id">Team</label> */}
                    <select
                      name="team_id"
                      id="team_id"
                      className="form-control"
                      // defaultValue={dropdownData?.team_id}
                      value={selectedTeam}
                      onChange={handleTeamChange}
                    >
                      <option value={""}>--Select Team--</option>
                      {employees.map((data, index) => (
                        <option
                          key={index}
                          value={`${data.first_name} ${data.last_name}`}
                          selected={data?.id == getValues(`team_id`)}
                        >
                          {data.first_name} {data.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-lg-3">
                  <div className="form-group">
                    {/* <label htmlFor="is_approved">Status</label> */}
                    <select
                      name="is_approved"
                      id="is_approved"
                      className="form-control"
                      onChange={handleStatusChange}
                    >
                      <option value="">--Select Status--</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Reject">Reject</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-responsive">
                {loading ? (
                  <MyLoader value={false} />
                ) : (
                  <table className="table datatable" {...myTableProps()}>
                    <thead>
                      {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                          {headerGroup.headers.map((column) => (
                            <th
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                            >
                              {column.render("Header")}
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                  : ""}
                              </span>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {/* {rows.map(row => { */}
                      {page.map((row) => {
                        prepareRow(row);
                        return (
                          <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                              return (
                                <td {...cell.getCellProps()}>
                                  {cell.render("Cell")}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <td colSpan={5}></td>
                      <td colSpan={5}>
                        <div className="pagination justify-content-end align-items-center">
                          <button
                            className="pagination_button"
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                          >
                            {"<<"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                          >
                            {"<"}
                          </button>
                          <span>
                            Page{" "}
                            <strong>
                              {pageIndex + 1} of {pageOptions.length}
                            </strong>
                          </span>
                          <button
                            className="pagination_button"
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                          >
                            {">"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                          >
                            {">>"}
                          </button>
                        </div>
                      </td>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListAdmin;

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
  );
};
