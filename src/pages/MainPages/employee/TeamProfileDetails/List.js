import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import axios from "axios";
import {
  AuthHeader,
  loadingTemplate,
  notFoundTemplate,
  actionButtonObject,
  ActionButtonJsx,
} from "../../../../services/FormCommon";
import toast from "react-hot-toast";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { GetDate, todayDate } from "../../../../services/DateAndTimeService";
import {
  defaultuserpic,
  FileUrl,
  host_name,
} from "../../../../config/file_url";
import { getFileDisplayUrl } from "../../../../services/S3Service";
import { Link, useNavigate } from "react-router-dom";
import {
  datatableHeight,
  paginationRows,
  preview_date_format,
} from "../../../../config/CommonVariables";
import {
  deleteFile,
  deleteLeaveById,
  deleteTodo,
  fetchEmployee,
  fetchEmployeeById,
  getAllFilesByTeamId,
  getLeaveByTeam,
  getTodosByTeamId,
} from "../../../../config/config";
import { useParams } from "react-router-dom";
import { ReactSVG } from "react-svg";
import { getRole, isAdmin } from "../../../../services/useLocalStorage";
import { empKey } from "../../../../config/RoleConfig";
import {
  FilesRoute,
  LeaveRoute,
  TodosRoute,
} from "../../../../config/RouteConfig";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import {
  useSortBy,
  useTable,
  usePagination,
  useGlobalFilter,
  useRowSelect,
} from "react-table";

//Preview List
const List = () => {
  const [loadingTitle, setLoadingTitle] = useState("Loading...");

  const validJson = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return "";
    }
  };

  const params = useParams();
  const navigate = useNavigate();

  const [teamInfo, setTeamInfo] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    profile_pic: "",
    departments: "",
  });

  const [leaveData, setLeaveData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [todos, setTodos] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState([]);

  useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, []);

  const fetchTeamInfo = async () => {
    try {
      const res = await axios({
        method: fetchEmployeeById.method,
        url: `${fetchEmployeeById.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        const emp = res?.data?.data[0];

        const depart_values =
          res.data?.departments?.length > 0 &&
          Array.isArray(res.data?.departments)
            ? (res?.data?.departments).map((e) => e?.name)
            : [];

        setTeamInfo({
          first_name: emp?.first_name,
          last_name: emp?.last_name,
          phone: emp?.phone,
          email: emp?.email,
          profile_pic: emp?.profile_picture
            ? getFileDisplayUrl(emp?.profile_picture, FileUrl)
            : "",
          departments:
            depart_values?.length > 0 ? depart_values.toString() : "",
        });
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  const Leave_hname = {
    title: "Title",
    from_date: "From Date",
    to_date: "To Date",
    status: "Status",
    created_at: "Applied at",
    action: "action",
  };

  const leave_columns = React.useMemo(
    () => [
      {
        Header: "id",
        accessor: "id",
      },
      {
        Header: "From date",
        accessor: `${Leave_hname.from_date}`,
      },
      {
        Header: "To date",
        accessor: `${Leave_hname.to_date}`,
      },
      {
        Header: "Status",
        accessor: `${Leave_hname.status}`,
      },
      {
        Header: "Applied at",
        accessor: `${Leave_hname.created_at}`,
      },
    ],
    []
  );

  const handleButtonClick = () => {
    localStorage.setItem("myKey", "team");
  };

  const handleView = () => {
    localStorage.setItem("view", "view");
  };

  const handleChange = (e) => {
    const selectedStartDate = e.target.value;
    setStartDate(selectedStartDate);
 
  };

  const handleEndChange = (e) => {
    const selectedEndDate = e.target.value;
    setEndDate(selectedEndDate);
   
  };

  const leave_tableHooks = (hooks) => {
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
                <Link
                  className="dropdown-item"
                  to={`/${LeaveRoute.previewLeave}/${row?.values?.id}`}
                >
                  View
                </Link>
              </div>
            </div>
          </React.Fragment>
        ),
      },
    ]);
  };

  const {
    getTableProps: leave_getTableProps,
    getTableBodyProps: leave_getTableBodyProps,
    headerGroups: leave_headerGroups,
    rows: leave_rows,
    prepareRow: leave_prepareRow,
    canPreviousPage: leave_canPreviousPage,
    page: leave_page,
    canNextPage: leave_canNextPage,
    pageOptions: leave_pageOptions,
    pageCount: leave_pageCount,
    gotoPage: leave_gotoPage,
    nextPage: leave_nextPage,
    previousPage: leave_previousPage,
    setPageSize: leave_setPageSize,
    setGlobalFilter: leave_setGlobalFilter,
    state: {
      pageIndex: leave_pageIndex,
      pageSize: leave_pageSize,
      globalFilter: leave_globalFilter,
    },
  } = useTable(
    {
      columns: leave_columns,
      data: leaveData,
      initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 100 },
    },
    leave_tableHooks,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const Leave_tableRef = useRef();
  

  const removeLeaveData = useCallback(async (id) => {
    try {
      const res = await axios({
        method: deleteLeaveById.method,
        url: `${deleteLeaveById.url}/${params.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        toast.success(res?.data?.message);
        setLeaveData((prevState) => {
          return prevState.filter((e) => {
            return e?.id != id;
          });
        });
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const onRemoveLeave = useCallback(async (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeLeaveData(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  }, []);

  const Leave_getStatus = (num) => {
    const value = "";
    switch (num) {
      case 1:
        return "Pending";
      case 2:
        return "Accepted";
      case 3:
        return "Rejected";
      default:
        return "";
    }
  };

  const fetchLeave = async () => {
    try {
      const res = await axios({
        method: getLeaveByTeam.method,
        url: `${getLeaveByTeam.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        const payload = res?.data?.data;

        const rows = [];

        payload.forEach((element, i) => {
          rows.push({
            id: element?.id,
            [Leave_hname.title]: element?.title,
            [Leave_hname.from_date]: element?.from_date
              ? GetDate(element?.from_date, preview_date_format)
              : "",
            [Leave_hname.to_date]: element?.to_date
              ? GetDate(element?.to_date, preview_date_format)
              : "",
            [Leave_hname.status]: Leave_getStatus(element?.status),
            [Leave_hname.created_at]: element?.created_at
              ? GetDate(element?.created_at, preview_date_format)
              : "",
            [Leave_hname.action]: element?.id,
          });
        });

        setLeaveData(rows);

        if (!payload?.length) {
        }
      } else {
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.log(err);
    }
  };

  const Performance_hname = {
    quarter: "Quarter",
    score: "Score",
    performance_review: "Performance Review",
    quterly_targets: "Quterly Targets",
    repetition: "Repetition",
    // action:"action"
  };

  const Performance_tableRef = useRef();

  const Performance_columnDef = [
    { field: Performance_hname.quarter },
    { field: Performance_hname.score },
    { field: Performance_hname.performance_review },
    { field: Performance_hname.quterly_targets },
    { field: Performance_hname.repetition },
    // {field:Performance_hname.action,sortable:false,filter:false,cellRenderer:memo(actionRender)}
  ];

  const Performance_defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      filterParams: {
        debounsMs: 0,
        // buttons:['apply','clear','reset','cancel']
      },
    }),
    []
  );

  const fetchPerformance = () => {
    setPerformanceData([
      {
        id: 1,
        [Performance_hname.quarter]: "July-Sept 2021	",
        [Performance_hname.score]: "25/30",
        [Performance_hname.performance_review]:
          "Impressed with dedication. Took responsibility for a lot of projects.	",
        [Performance_hname.quterly_targets]:
          "For Sep-Nov, start mentoring junior engineers",
        [Performance_hname.repetition]: "2 repetition",
      },
    ]);
  };

  const cellRenderer = (value) => {
    switch (value) {
      case "GREEN": {
        return (
          <>
            <span className="badge badge-success" style={{ fontSize: "15px" }}>
              {value}
            </span>
          </>
        );
      }
      case "RED": {
        return (
          <>
            <span className="badge badge-danger" style={{ fontSize: "15px" }}>
              {value}
            </span>
          </>
        );
      }
      case "CYAN": {
        return (
          <>
            <span className="badge badge-info" style={{ fontSize: "15px" }}>
              {value}
            </span>
          </>
        );
      }
      case "YELLOW": {
        return (
          <>
            <span className="badge badge-warning" style={{ fontSize: "15px" }}>
              {value}
            </span>
          </>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  const Todo_hname = {
    title: "Title",
    file_name: "File name",
    todo_assign_to: "Todo assign to",
    card: "Card",
    execution_date: "Execution date",
    due_date: "Due date",
    days_left: "days_left",
    actual_completed_date: "Work completed date",
    status: "Status",
    work_completed: "Work completed",
    action: "action",
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

  const columns = React.useMemo(
    () => [
      {
        Header: "id",
        accessor: "id",
      },
      {
        Header: "Title",
        accessor: `${Todo_hname.title}`,
      },
      {
        Header: "File name",
        accessor: `${Todo_hname.file_name}`,
      },
      {
        Header: "Card",
        accessor: `${Todo_hname.card}`,
        Cell: ({ value }) => cellRenderer(value),
      },
      {
        Header: "Execution date",
        accessor: `${Todo_hname.execution_date}`,
      },
      {
        Header: "Due date",
        accessor: `${Todo_hname.due_date}`,
      },
      {
        Header: "Days Left",
        accessor: `${Todo_hname.days_left}`,
        Cell: ({ value }) => renderDays(value),
      },
      ,
      {
        Header: "Work Completed date",
        accessor: `${Todo_hname.actual_completed_date}`,
      },
      {
        Header: "Status",
        accessor: `${Todo_hname.status}`,
      },
      {
        Header: "Work Completed",
        accessor: `${Todo_hname.work_completed}`,
      },
    ],
    []
  );

  const todo_tableHooks = (hooks) => {
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
                <Link
                  className="dropdown-item"
                  to={`/${TodosRoute.reviewtodo}/${row?.values?.id}`}
                  onClick={handleView}
                >
                  View
                </Link>
                <Link
                  className="dropdown-item"
                  to={`/${TodosRoute.edit}/${row?.values?.id}`}
                  onClick={handleButtonClick}
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
              </div>
            </div>
          </React.Fragment>
        ),
      },
    ]);
  };

  const filteredData = useMemo(() => {
    let filteredTodos = todos;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTodos = filteredTodos.filter((item) => {
        const executionDate = new Date(item[Todo_hname.execution_date]);
        const completedDate = new Date(item[Todo_hname.due_date]);
        return executionDate >= start && completedDate <= end;
      });
    }

    // Sort the todos in descending order based on ID
    filteredTodos = filteredTodos.sort((a, b) => b.id - a.id);

    return filteredTodos;
  }, [startDate, endDate, todos]);
  

  const {
    getTableProps: todo_getTableProps,
    getTableBodyProps: todo_getTableBodyProps,
    headerGroups: todo_headerGroups,
    rows: todo_rows,
    prepareRow: todo_prepareRow,
    canPreviousPage: todo_canPreviousPage,
    page: todo_page,
    canNextPage: todo_canNextPage,
    pageOptions: todo_pageOptions,
    pageCount: todo_pageCount,
    gotoPage: todo_gotoPage,
    nextPage: todo_nextPage,
    previousPage: todo_previousPage,
    setPageSize: todo_setPageSize,
    setGlobalFilter: todo_setGlobalFilter,
    state: {
      pageIndex: todo_pageIndex,
      pageSize: todo_pageSize,
      globalFilter: todo_globalFilter,
    },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 100 },
    },
    todo_tableHooks,
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
      const res = await axios({
        method: deleteTodo.method,
        url: `${deleteTodo.url}/${id}`,
        headers: AuthHeader(),
      });

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

  const onRemoveTodo = useCallback((id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result?.isConfirmed) {
          await removeToDo(id);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const fetchTodo = async () => {
    try {
      const res = await axios({
        method: getTodosByTeamId.method,
        url: `${getTodosByTeamId.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res.data?.error) {
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
                [Todo_hname.title]: element?.title,
                [Todo_hname.file_name]: element?.file_name
                  ? element?.file_name
                  : "",
                [Todo_hname.todo_assign_to]: element?.team_fullname,
                [Todo_hname.card]: card.toUpperCase(),
                [Todo_hname.execution_date]: element?.execution_date
                  ? GetDate(element?.execution_date, "DD-MMM-YYYY")
                  : "-",
                [Todo_hname.due_date]: element?.completed_date
                  ? GetDate(element?.completed_date, "DD-MMM-YYYY")
                  : "-",
                [Todo_hname.days_left]: subtractTwoDates(start_date, end_date),
                [Todo_hname.actual_completed_date]:
                  element?.actual_completed_date
                    ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY")
                    : "-",
                [Todo_hname.status]: (
                  <Todo_hname.status
                    className={
                      element.is_approved === 0
                        ? "pending"
                        : element.is_approved === 1
                        ? "approved"
                        : element.is_approved === 2
                        ? "rejected"
                        : ""
                    }
                  >
                    {element.is_approved === 0
                      ? "Pending"
                      : element.is_approved === 1
                      ? "Approved"
                      : element.is_approved === 2
                      ? "Rejected"
                      : ""}
                  </Todo_hname.status>
                ),

                [Todo_hname.work_completed]:
                  element?.mark_as_done == 0 ? "Not done" : "Done",
                // [Todo_hname.action]:element?.id
              });
            } else {
              rows.push({
                id: element?.id,
                [Todo_hname.title]: element?.title,
                [Todo_hname.file_name]: element?.file_name
                  ? element?.file_name
                  : "",
                [Todo_hname.todo_assign_to]: element?.team_fullname,
                [Todo_hname.card]: card.toUpperCase(),
                [Todo_hname.execution_date]: element?.execution_date
                  ? GetDate(element?.execution_date, "DD-MMM-YYYY")
                  : "-",
                [Todo_hname.due_date]: element?.completed_date
                  ? GetDate(element?.completed_date, "DD-MMM-YYYY")
                  : "-",
                [Todo_hname.days_left]: "",
                [Todo_hname.actual_completed_date]:
                  element?.actual_completed_date
                    ? GetDate(element?.actual_completed_date, "DD-MMM-YYYY")
                    : "-",
                [Todo_hname.status]:
                  element?.is_approved == 0
                    ? "Pending"
                    : element?.is_approved == 1
                    ? "Approved"
                    : element?.is_approved == 2
                    ? "Rejected"
                    : "",
                [Todo_hname.work_completed]:
                  element?.mark_as_done == 0 ? "Not done" : "Done",
                // [Todo_hname.action]:element?.id
              });
            }
          });

          setTodos(rows);
        } else {
        }
      } else {
      }
    } catch (err) {
      console.log(err);
    }
  };

  const Project_hname = {
    sr_no: "Sr no",
    office_file_no: "Office file no",
    file_name: "Project name",
    tp_stage: "TP stage",
    no_of_days: "No of days",
    team: "Team",
    code: "Code",
    client: "Client",
    status: "Status",
    action: "Action",
  };

  const project_columns = React.useMemo(
    () => [
      {
        Header: "id",
        accessor: "id",
      },
      {
        Header: "Sr no",
        accessor: `${Project_hname.sr_no}`,
      },
      // {
      //     Header: 'Office File No',
      //     accessor: `${Project_hname.office_file_no}`
      // },
      {
        Header: "File name",
        accessor: `${Project_hname.file_name}`,
      },
      // {
      //     Header: 'TP stage',
      //     accessor: `${Project_hname.tp_stage}`
      // },
      // {
      //     Header: 'No of days',
      //     accessor: `${Project_hname.no_of_days}`
      // },
      {
        Header: "Team",
        accessor: `${Project_hname.team}`,
      },
      // {
      //     Header: 'Code',
      //     accessor: `${Project_hname.code}`
      // },
      {
        Header: "Client",
        accessor: `${Project_hname.client}`,
      },
      {
        Header: "Status",
        accessor: `${Project_hname.status}`,
      },
    ],
    []
  );

  const project_tableHooks = (hooks) => {
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
                <Link
                  className="dropdown-item"
                  to={`/${FilesRoute.fileDetail}/${row?.values?.id}`}
                  style={{ color: "black" }}
                >
                  {actionButtonObject.file_details}
                </Link>
                <Link
                  className="dropdown-item"
                  to={`/${FilesRoute.edit}/${row?.values?.id}`}
                  style={{ color: "black" }}
                >
                  {actionButtonObject.edit}
                </Link>
                <a
                  className="dropdown-item"
                  role="button"
                  onClick={() => onRemoveFile(row?.values?.id)}
                >
                  {actionButtonObject.delete}
                </a>
                <Link
                  className="dropdown-item"
                  to={`/${FilesRoute.listFileExpense}/${row?.values?.id}`}
                  style={{ color: "black" }}
                >
                  {actionButtonObject.preview_expense}
                </Link>
              </div>
            </div>
          </React.Fragment>
        ),
      },
    ]);
  };

  const {
    getTableProps: project_getTableProps,
    getTableBodyProps: project_getTableBodyProps,
    headerGroups: project_headerGroups,
    rows: project_rows,
    prepareRow: project_prepareRow,
    canPreviousPage: project_canPreviousPage,
    page: project_page,
    canNextPage: project_canNextPage,
    pageOptions: project_pageOptions,
    pageCount: project_pageCount,
    gotoPage: project_gotoPage,
    nextPage: project_nextPage,
    previousPage: project_previousPage,
    setPageSize: project_setPageSize,
    setGlobalFilter: project_setGlobalFilter,
    state: {
      pageIndex: project_pageIndex,
      pageSize: project_pageSize,
      globalFilter: project_globalFilter,
    },
  } = useTable(
    {
      columns: project_columns,
      data: file,
      initialState: {
        hiddenColumns: ["id"],
        pageIndex: 0,
        pageSize: 100,
        sortBy: [{ id: "sr_no", desc: true }],
      },
    },
    project_tableHooks,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const removeFile = async (id) => {
    try {
      const res = await axios({
        method: deleteFile.method,
        url: `${deleteFile.url}/${id}`,
        headers: AuthHeader(),
      });

      if (!res.data?.error) {
        // setFile(file.filter((e) => {
        //     return e.id != id;
        // }));

        setFile((prevState) => {
          return prevState.filter((e, i) => {
            return e?.id != id;
          });
        });

        toast.success(res.data.message);
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response.data?.message);
    }
  };

  const onRemoveFile = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeFile(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  // Fetch file
  const fetchProject = useCallback(async () => {
    try {
      const res = await axios({
        method: getAllFilesByTeamId.method,
        url: `${getAllFilesByTeamId.url}/${params?.id}`,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        const payload = res?.data?.data;

        if (Array.isArray(payload) && payload.length > 0) {
          const rows = [];

          payload.forEach((element, index) => {
            rows.push({
              id: element?.id,
              [Project_hname.sr_no]: `${index + 1}`,
              // [Project_hname.office_file_no] : element?.office_file_no,
              [Project_hname.file_name]: element?.file_name
                ? element?.file_name
                : "",
              // [Project_hname.tp_stage]:parseInt(element?.tps_stage) === 1 ? "Draft" : (parseInt(element?.tps_stage) === 2 ? "Final" : ""),
              // [Project_hname.no_of_days]:subtractTwoDates(GetDate(element?.created_at, "YYYY-MM-DD"), todayDate()),
              [Project_hname.team]: element?.team ? element?.team : "",
              [Project_hname.client]: element?.cust_name
                ? element?.cust_name
                : "",
              [Project_hname.status]: element?.stage_title,
              [Project_hname.action]: element,
            });
          });

          setFile(rows);
        } else {
        }
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
  }, []);

  useEffect(async () => {
    const FETCH_0 = fetchTeamInfo();
    const FETCH_1 = fetchTodo();
    const FETCH_2 = fetchLeave();
    const FETCH_3 = fetchProject();
    await FETCH_0;
    await FETCH_1;
    await FETCH_2;
    await FETCH_3;
  }, []);

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
          <h1 className="h4 mb-0">Team</h1>
          <p className="mb-4">Profile Details</p>
        </div>
      </section>

      <div className="row">
        <div className="col-lg-9 col-md-8">
          <div className="card height-auto profile_card mr-0">
            <ul className="nav nav-pills mb-2" id="profile-tab" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="pills-task-tab"
                  data-toggle="pill"
                  href="#pills-task"
                  role="tab"
                  aria-controls="pills-task"
                  aria-selected="true"
                >
                  Task
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="pills-attendance-tab"
                  data-toggle="pill"
                  href="#pills-attendance"
                  role="tab"
                  aria-controls="pills-attendance"
                  aria-selected="false"
                >
                  Attendance
                </a>
              </li>

              {/* 
                                <li className="nav-item" role="presentation">
                                    <a className="nav-link" id="pills-performance-tab" data-toggle="pill" href="#pills-performance" role="tab" aria-controls="pills-performance" aria-selected="false">Performance</a>
                                </li> */}

              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="pill-projects-tab"
                  data-toggle="pill"
                  href="#pills-projects"
                  role="tab"
                  aria-controls="pills-projects"
                  aria-selected="false"
                >
                  Projects
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link"
                  id="pill-profile-tab"
                  data-toggle="pill"
                  href="#pills-profile"
                  role="tab"
                  aria-controls="pills-profile"
                  aria-selected="false"
                >
                  Profile
                </a>
              </li>
            </ul>

            <div className="tab-content" id="profile-tabContent">
              <div
                className="tab-pane fade show active"
                id="pills-task"
                role="tabpanel"
                aria-labelledby="pills-task-tab"
              >
                {/* {Task (Todo)} */}
                <div className="row">
                  <div className="col-lg-4 col-12">
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
                  <div className="col-lg-4 col-12">
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
                </div>

                <div className="table-responsive">
                  <table
                    className="table datatable profile_table"
                    {...todo_getTableProps()}
                  >
                    <thead>
                      {todo_headerGroups.map((headerGroup) => (
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
                    <tbody {...todo_getTableBodyProps()}>
                      {/* {rows.map(row => { */}
                      {todo_page.map((row) => {
                        todo_prepareRow(row);
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
                      <td colSpan={10}>
                        <div className="pagination justify-content-end align-items-center">
                          <button
                            className="pagination_button"
                            onClick={() => todo_gotoPage(0)}
                            disabled={!todo_canPreviousPage}
                          >
                            {"<<"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() => todo_previousPage()}
                            disabled={!todo_canPreviousPage}
                          >
                            {"<"}
                          </button>
                          <span>
                            Page{" "}
                            <strong>
                              {todo_pageIndex + 1} of {todo_pageOptions.length}
                            </strong>
                          </span>
                          <button
                            className="pagination_button"
                            onClick={() => todo_nextPage()}
                            disabled={!todo_canNextPage}
                          >
                            {">"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() => todo_gotoPage(todo_pageCount - 1)}
                            disabled={!todo_canNextPage}
                          >
                            {">>"}
                          </button>
                        </div>
                      </td>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-attendance"
                role="tabpanel"
                aria-labelledby="pills-attendance-tab"
              >
                <div className="ag-theme-alpine" style={{ height: "500px" }}>
                  {/*Attendance Leave*/}

                  <div className="table-responsive ">
                    <table
                      className="table datatable profile_table"
                      {...leave_getTableProps()}
                    >
                      <thead>
                        {leave_headerGroups.map((headerGroup) => (
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
                      <tbody {...leave_getTableBodyProps()}>
                        {/* {rows.map(row => { */}
                        {leave_page.map((row) => {
                          leave_prepareRow(row);
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
                        <td colSpan={5}>
                          <div className="pagination justify-content-end align-items-center">
                            <button
                              className="pagination_button"
                              onClick={() => leave_gotoPage(0)}
                              disabled={!leave_canPreviousPage}
                            >
                              {"<<"}
                            </button>
                            <button
                              className="pagination_button"
                              onClick={() => leave_previousPage()}
                              disabled={!leave_canPreviousPage}
                            >
                              {"<"}
                            </button>
                            <span>
                              Page
                              <strong>
                                {leave_pageIndex + 1} of{" "}
                                {leave_pageOptions.length}
                              </strong>
                            </span>
                            <button
                              className="pagination_button"
                              onClick={() => leave_nextPage()}
                              disabled={!leave_canNextPage}
                            >
                              {">"}
                            </button>
                            <button
                              className="pagination_button"
                              onClick={() =>
                                leave_gotoPage(leave_pageCount - 1)
                              }
                              disabled={!leave_canNextPage}
                            >
                              {">>"}
                            </button>
                          </div>
                        </td>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-performance"
                role="tabpanel"
                aria-labelledby="pills-performance-tab"
              >
                <div className="ag-theme-alpine" style={{ height: "500px" }}>
                  {/* <button className='btn' onClick={()=>exportToCsv(tableRef)}>EXCEL</button> */}
                  <AgGridReact
                    ref={Performance_tableRef}
                    pagination={true}
                    paginationPageSize={paginationRows}
                    rowData={performanceData}
                    columnDefs={Performance_columnDef}
                    defaultColDef={Performance_defaultColDef}
                    rowSelection="single"
                    animateRows={true}
                    overlayLoadingTemplate={loadingTemplate()}
                    overlayNoRowsTemplate={notFoundTemplate()}
                    onGridReady={fetchPerformance}
                  />
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-projects"
                role="tabpanel"
                aria-labelledby="pills-projects-tab"
              >
                {/* Project Files*/}

                <div className="table-responsive ">
                  <table
                    className="table datatable profile_table"
                    {...project_getTableProps()}
                  >
                    <thead>
                      {project_headerGroups.map((headerGroup) => (
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
                    <tbody {...project_getTableBodyProps()}>
                      {/* {rows.map(row => { */}
                      {project_page.map((row) => {
                        project_prepareRow(row);
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
                      <td colSpan={6}>
                        <div className="pagination justify-content-end align-items-center">
                          <button
                            className="pagination_button"
                            onClick={() => project_gotoPage(0)}
                            disabled={!project_canPreviousPage}
                          >
                            {"<<"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() => project_previousPage()}
                            disabled={!project_canPreviousPage}
                          >
                            {"<"}
                          </button>
                          <span>
                            Page{" "}
                            <strong>
                              {project_pageIndex + 1} of{" "}
                              {project_pageOptions.length}
                            </strong>
                          </span>
                          <button
                            className="pagination_button"
                            onClick={() => project_nextPage()}
                            disabled={!project_canNextPage}
                          >
                            {">"}
                          </button>
                          <button
                            className="pagination_button"
                            onClick={() =>
                              project_gotoPage(project_pageCount - 1)
                            }
                            disabled={!project_canNextPage}
                          >
                            {">>"}
                          </button>
                        </div>
                      </td>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div
                className="tab-pane fade"
                id="pills-profile"
                role="tabpanel"
                aria-labelledby="pills-profile-tab"
              >
                <table className="table profile_table">
                  <tr>
                    <th>Documents</th>
                    <th>Status</th>
                    <th>Image</th>
                    {/* <th></th> */}
                  </tr>
                  <tr>
                    <td>Profile Image</td>
                    <td>
                      <span className="badge badge-success">Updated</span>
                    </td>
                    <td>
                      <input type="file" name="file" id="file" />
                    </td>
                    {/* <td>View</td> */}
                  </tr>
                  <tr>
                    <td>Aadhar Card</td>
                    <td>
                      <span className="badge badge-danger">Pending</span>
                    </td>
                    <td>
                      <input type="file" name="file" id="file" />
                    </td>
                    {/* <td>View</td> */}
                  </tr>
                  <tr>
                    <td>10/12 certificate</td>
                    <td>
                      <span className="badge badge-danger">Pending</span>
                    </td>
                    <td>
                      <input type="file" name="file" id="file" />
                    </td>
                    {/* <td>View</td> */}
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td colSpan={3}>
                      <textarea
                        className="form-control"
                        name="address"
                        id="address"
                      ></textarea>
                    </td>
                  </tr>
                  <tr>
                    <td>Signature</td>
                    <td colSpan={3}>
                      <input type="file" id="signature" name="signature" />
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-4">
          <div className="profile-box card height-auto">
            <div className="user-profile text-center">
              {teamInfo?.profile_pic ? (
                <img
                  className="rounded-circle"
                  src={`${teamInfo?.profile_pic}`}
                  alt="Hardik Sorathiya"
                />
              ) : (
                <img
                  className="rounded-circle"
                  src={`${FileUrl}/${defaultuserpic}`}
                  alt="Hardik Sorathiya"
                />
              )}
            </div>
            <div className="user-details text-center mt-4">
              <h4>
                {teamInfo?.first_name} {teamInfo?.last_name}
              </h4>
              <p className="mb-0">{teamInfo.departments.toString()}</p>
              <ul className="mt-4 list-unstyled">
                <li>
                  <a
                    className="text-primary small"
                    href={`mailto:${teamInfo?.email}`}
                  >
                    {teamInfo?.email}
                  </a>
                </li>
                <li>
                  <a
                    className="text-primary small"
                    href={`tel:${teamInfo?.phone}`}
                  >
                    {teamInfo?.phone}
                  </a>
                </li>
              </ul>
            </div>
            <div className="user-profile-action mt-5">
              {/* <h6 className="text-shadow-yellow title-line-right font-weight-normal position-relative d-inline-block mb-4">Quick Access</h6> */}
              <ul className="row list-unstyled">
                {/* <li className="col-md-6 text-center">

                                        <a href="projects-assigned.html">

                                            <ReactSVG src={`${host_name}/svgs/paper.svg`}/>

                                            <p className="text-primary mb-0">Projects assigned</p>

                                        </a>

                                    </li>

                                    <li className="col-md-6 text-center">

                                        <a href="personal-document.html">
                                            <ReactSVG src={`${host_name}/svgs/work.svg`}/>
                                            <p className="text-primary mb-0">Personal Document</p>
                                        </a>

                                    </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
