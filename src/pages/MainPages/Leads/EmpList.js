import React, { useEffect, useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { LeadsRoute } from "../../../config/RouteConfig";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import ApiService from "../../../services/ApiService";
import { fetchleads } from "../../../config/config";
import {
  useSortBy,
  useTable,
  usePagination,
  useGlobalFilter,
} from "react-table";
import { MyLoader } from "../../../UtilsComponent/MyLoader";
import { DeleteLead } from "../../../services/EmployeeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import AddLeads from "./Add";
import EditLeads from "./Edit";
//Customer
const EmpList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editshowModal, setEditShowModal] = useState(false);
  const [Id, setId] = useState(null);


  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleEditShowModal = (id) => {
    setId(id);
    setEditShowModal(true);
  };

  const handleEditCloseModal = () => {
    setEditShowModal(false);
    setId(null);
  };

  const handleDetail = (id) => {
    navigate(`/${LeadsRoute.detail}/${id}`);
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        ["Content-Type"]: "application/json",
      };
      const res = await ApiService(
        null,
        0,
        header,
        fetchleads.method,
        fetchleads.url
      );
      if (!res.data.error) {
        setLoading(false);

        const payload = res?.data?.data;

        if (Array.isArray(payload) && payload?.length > 0) {
          const rows = [];
          payload.forEach((element) => {
            rows.push({
              id: element?.id,
              [hname.name]: element?.name,
              [hname.mobile_no]: element?.mobile_no,
              [hname.email]: element?.email,
              [hname.source]: element?.source,
              [hname.service]: element?.service,
            });
          });

          setData(rows);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);

      console.log(err);
      toast.error(
        err?.response?.data?.message
          ? err?.response?.data?.message
          : "An Error occured"
      );
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const hname = {
    name: "Name",
    mobile_no: "Mobile No",
    email: "Email",
    source: "Lead Source",
    service: "Service",
    action: "action",
  };

  const actionRender = (p) => {
    return <></>;
  };

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      filterParams: {
        debounsMs: 0,
      },
    }),
    []
  );

  const columnDef = [
    { field: hname.name },
    { field: hname.mobile_no },
    { field: hname.email },
    { field: hname.source },
    {
      field: hname.action,
      sortable: false,
      filter: false,
      cellRenderer: memo(actionRender),
    },
  ];

  const columns = React.useMemo(
    () => [
      {
        Header: "Sr. No.",
        accessor: (row, i) => i + 1,
      },
      {
        Header: "Name",
        accessor: `${hname.name}`,
        Cell: ({ row, value }) => ( 
          <div className="text-nowrap text-dark">
            <a
              onClick={() => handleDetail(row.original.id)} 
              style={{
                cursor:"pointer"
              }}
              title="View Details"
            >
              {value}
            </a>
          </div>
        ),
      },
      {
        Header: "Mobile No",
        accessor: `${hname.mobile_no}`,
      },
      {
        Header: "Email",
        accessor: `${hname.email}`,
      },
      {
        Header: "Lead Source",
        accessor: `${hname.source}`,
      },
      {
        Header: "Service",
        accessor: `${hname.service}`,
      },
    ],
    []
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: "Edit",
        Header: "",
        Cell: ({ row }) => {
          return (
            <React.Fragment>
                 <a
              onClick={() => handleEditShowModal(row.original.id)}
              className="cursor-pointer"
              title="Edit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M13.2594 3.5999L5.04936 12.2899C4.73936 12.6199 4.43936 13.2699 4.37936 13.7199L4.00936 16.9599C3.87936 18.1299 4.71936 18.9299 5.87936 18.7299L9.09936 18.1799C9.54936 18.0999 10.1794 17.7699 10.4894 17.4299L18.6994 8.7399C20.1194 7.2399 20.7594 5.5299 18.5494 3.4399C16.3494 1.3699 14.6794 2.0999 13.2594 3.5999Z"
                  stroke="#657488"
                  stroke-width="1.8"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M11.8887 5.05005C12.3187 7.81005 14.5587 9.92005 17.3387 10.2"
                  stroke="#657488"
                  stroke-width="1.8"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
                <path
                  d="M3 21.9999H21"
                  stroke="#657488"
                  stroke-width="1.8"
                  stroke-miterlimit="10"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </a>
              <button
                onClick={() => onRemoveInward(row.original.id)}
                className="delete_icon cursor-pointer last_del_icon border-0"
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.498 4.983c-2.775 -0.275 -5.567 -0.417 -8.35 -0.417q-2.475 0 -4.95 0.25l-1.7 0.167"
                    stroke="#FF5275"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="m7.083 4.142 0.183 -1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517 0.625 1.642 1.392l0.183 1.083"
                    stroke="#FF5275"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="m15.707 7.617 -0.542 8.392c-0.092 1.308 -0.167 2.325 -2.492 2.325h-5.35c-2.325 0 -2.4 -1.017 -2.492 -2.325l-0.542 -8.392"
                    stroke="#FF5275"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M8.607 13.75h2.775"
                    stroke="#FF5275"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M7.913 10.417h4.167"
                    stroke="#FF5275"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </React.Fragment>
          );
        },
      },
    ]);
  };

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
  } = useTable(
    {
      columns,
      data: data,
      initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 100 },
    },
    tableHooks,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleAdd = () => {
    navigate(`/${InwardRoute.add}`);
  };

  const removeInward = async (id) => {
    try {
      const res = await DeleteLead(id, getToken());
      if (!res.data?.error) {
        toast.success(res.data?.message);

        setData((prevState) => {
          return prevState.filter((e) => {
            return e?.id != id;
          });
        });
      } else {
        toast.error(res.data?.message);
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

  const onRemoveInward = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeInward(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  return (
    <>
      <div className="content__wrapper">
        <section className="page-content">
          <div className="row">
            <div className="col-md-12">
              <div className="zed__table card">
                <div className="d-xl-flex align-items-center justify-content-between mb-3">
                  <h5 className="text-shadow-yellow px-2 mb-0">Leads List</h5>
                  <div className="row align-items-center mt-lg-0 mt-3">
                    <div className="col-lg-8 col-8">
                      <GlobalFilter
                        filter={globalFilter}
                        setFilter={setGlobalFilter}
                      />
                    </div>
                    <div className="col-lg-4 col-4">
                      <button className="form_save_btn" onClick={handleShowModal}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  {loading ? (
                    <MyLoader value={false} />
                  ) : (
                    <table className="table datatable" {...getTableProps()}>
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
                        {/* <td colSpan={3}></td> */}
                        <td colSpan={11}>
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
        <AddLeads
          show={showModal}
          handleClose={handleCloseModal}
          onSuccess={fetchLeads}
        />
         <EditLeads
          editshow={editshowModal}
          handleeditClose={handleEditCloseModal}
          LeadId={Id}
          onSuccess={fetchLeads}
        />
      </div>
    </>
  );
};

export default EmpList;

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
