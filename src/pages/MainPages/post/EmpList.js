import React, { useEffect, useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { PostRoute } from "../../../config/RouteConfig";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import ApiService from "../../../services/ApiService";
import { fetchpost } from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";
import {
  useSortBy,
  useTable,
  usePagination,
  useGlobalFilter,
} from "react-table";
import { MyLoader } from "../../../UtilsComponent/MyLoader";
import { DeletePost } from "../../../services/EmployeeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
const EmpList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
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
        fetchpost.method,
        fetchpost.url
      );
      if (!res.data.error) {
        setLoading(false);

        const payload = res?.data?.data;
        console.log("payload", payload);

        if (Array.isArray(payload) && payload?.length > 0) {
          const rows = [];
          payload.forEach((element) => {
            rows.push({
              id: element?.id,
              [hname.date]: element?.date,
              [hname.platform_add]: element?.platform_add,
              [hname.status]: element?.status,
              [hname.thumbnail]: element?.thumbnail,
              [hname.type]: element?.type,
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
    fetchData();
  }, []);

  const hname = {
    post: "post",
    date: "Date",
    platform_add: "Campaign Platform",
    type: "Type", // ✅ added
    thumbnail: "Thumbnail",
    status: "Status",
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
    { field: hname.post },
    { field: hname.created },
    { field: hname.email },
    { field: hname.mobile },
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
        Header: "Date",
        accessor: `${hname.date}`,
        Cell: ({ value }) => <span className="text-nowrap">{value}</span>,
      },
      {
        Header: "Campaign Platform",
        accessor: `${hname.platform_add}`,
        Cell: ({ value }) => {
          if (!value) return "—";

          let platforms = [];

          if (Array.isArray(value)) {
            platforms = value
              .flatMap((v) => String(v).split(","))
              .map((v) => v.trim());
          } else if (typeof value === "string") {
            platforms = value.split(",").map((v) => v.trim());
          } else if (typeof value === "number") {
            platforms = [String(value)];
          }
          

          return (
            <div className="flex items-center gap-2">
              {platforms.map((id, index) => {
                switch (id) {
                  case "1":
                    return (
                      <img
                        key={index}
                        src={`${FileUrl}/img/Instagram.svg`}
                        alt="Instagram"
                        title="Instagram"
                        width={10}
                        height={10}
                      />
                    );
                  case "2":
                    return (
                      <img
                        key={index}
                        src={`${FileUrl}/img/linkedin.svg`}
                        alt="LinkedIn"
                        title="LinkedIn"
                        width={10}
                        height={10}
                      />
                    );
                  case "3":
                    return (
                      <img
                        key={index}
                        src={`${FileUrl}/img/facebook.svg`}
                        alt="Facebook"
                        title="Facebook"
                        width={10}
                        height={10}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          );
        },
      },

      {
        Header: "Type",
        accessor: `${hname.type}`,
        Cell: ({ value }) => {
          const types = {
            1: "Image",
            2: "Video",
            3: "Carousel",
          };
          return types[value] || "—";
        },
      },
      {
        Header: "Status",
        accessor: `${hname.status}`,
        Cell: ({ value }) => {
          const statusMap = {
            0: { text: "Pending", color: "#f0ad4e" },
            1: { text: "Approved", color: "#5cb85c" },
            3: { text: "Rejected", color: "#d9534f" },
          };
          const status = statusMap[value] || { text: "Unknown", color: "#777" };

          return (
            <span
              style={{
                backgroundColor: status.color,
                color: "#fff",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "0.85rem",
              }}
            >
              {status.text}
            </span>
          );
        },
      },
      {
        Header: "Thumbnail",
        accessor: `${hname.thumbnail}`,
        Cell: ({ row }) => (
          <div style={{ position: "relative", textAlign: "center" }}>
            {row.values[hname.thumbnail] ? (
              <a
                href={getFileDisplayUrl(row.values[hname.thumbnail], FileUrl)}
                onClick={(e) => {
                  e.preventDefault();
                  openFileInNewTab(row.values[hname.thumbnail], FileUrl);
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="in__svg"
                  src={`${FileUrl}/img/icons/view.svg`}
                  alt="View"
                />
              </a>
            ) : (
              "No Image"
            )}
          </div>
        ),
      },
    ],
    []
  );
  const handleEdit = (id) => {
    navigate(`/${PostRoute.edit}/${id}`);
  };

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
                onClick={() => handleEdit(row.original.id)}
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
                    strokeWidth="1.8"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M11.8887 5.05005C12.3187 7.81005 14.5587 9.92005 17.3387 10.2"
                    stroke="#657488"
                    strokeWidth="1.8"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                  <path
                    d="M3 21.9999H21"
                    stroke="#657488"
                    strokeWidth="1.8"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </a>
              <button
                onClick={() => onRemovePost(row.original.id)}
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
    navigate(`/${PostRoute.add}`);
  };

  const removePost = async (id) => {
    try {
      const res = await DeletePost(id, getToken());
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

  const onRemovePost = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removePost(id);
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
                  <h5 className="text-shadow-yellow px-2 mb-0">Post List</h5>
                  <div className="row align-items-center mt-lg-0 mt-3">
                    <div className="col-lg-8 col-8">
                      <GlobalFilter
                        filter={globalFilter}
                        setFilter={setGlobalFilter}
                      />
                    </div>
                    <div className="col-lg-4 col-4">
                      <button className="form_save_btn" onClick={handleAdd}>
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
