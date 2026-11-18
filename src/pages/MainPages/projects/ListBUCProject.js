import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {
  datatableHeight,
  paginationRows,
} from "../../../config/CommonVariables";
import {
  AuthHeader,
  exportToCsv,
  loadingTemplate,
  notFoundTemplate,
  subtractTwoDates,
} from "../../../services/FormCommon";
import { FilesRoute, ProjectRoute } from "../../../config/RouteConfig";
import toast from "react-hot-toast";
import { isEmp, superAccess } from "../../../services/useLocalStorage";
import {
  deleteFile,
  getApprovedProjectForSuperUser,
  getApprovedProjectForTeam,
  getBUCProjectForSuperUser,
  getBUCProjectForTeam,
} from "../../../config/config";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import axios from "axios";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { Link } from "react-router-dom";

const ListBUCProject = () => {
  const [projectData, setProjectData] = useState([]);

  const tableRef = useRef(null);

  const hname = {
    sr_no: "Sr no",
    office_file_no: "Office file no",
    file_name: "File name",
    tp_stage: "TP stage",
    no_of_days: "No of days",
    team: "Team",
    code: "Code",
    client: "Client",
    status: "Status",
    action: "Action",
  };

  const actionRender = (p) => {
    return (
      <React.Fragment>
        {superAccess() ? (
          <React.Fragment>
            <Link
              to={`/${ProjectRoute.projectDetails}/${p?.value?.id}`}
              style={{ color: "black" }}
            >
              <i class="fa fa-eye" aria-hidden="true"></i>
            </Link>
            &nbsp;
            <Link
              to={`/${FilesRoute.edit}/${p?.value?.id}`}
              style={{ color: "black" }}
            >
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            </Link>
            &nbsp;
            <a role="button" onClick={() => onRemoveProject(p?.value?.id)}>
              <i class="fa fa-trash" aria-hidden="true"></i>
            </a>
            &nbsp;
            <Link
              to={`/${FilesRoute.listFileExpense}/${p?.value?.id}`}
              style={{ color: "black" }}
            >
              <i class="fas fa-wallet"></i>
            </Link>
          </React.Fragment>
        ) : isEmp() ? (
          <React.Fragment>
            <Link
              to={`/${ProjectRoute.projectDetails}/${p?.value?.id}`}
              style={{ color: "black" }}
            >
              <i class="fa fa-eye" aria-hidden="true"></i>
            </Link>
            &nbsp;
            <Link
              to={`/${FilesRoute.edit}/${p?.value?.id}`}
              style={{ color: "black" }}
            >
              <i class="fas fa-pencil-alt" aria-hidden="true"></i>
            </Link>
            &nbsp;
            <a role="button" onClick={() => onRemoveProject(p?.value?.id)}>
              <i class="fa fa-trash" aria-hidden="true"></i>
            </a>
            &nbsp;
          </React.Fragment>
        ) : (
          ""
        )}
      </React.Fragment>
    );
  };

  const columnDef = [
    { field: hname.sr_no },
    { field: hname.office_file_no },
    { field: hname.file_name },
    { field: hname.code },
    { field: hname.tp_stage },
    { field: hname.no_of_days },
    { field: hname.team },
    { field: hname.client },
    { field: hname.status },
    {
      field: hname.action,
      sortable: false,
      filter: false,
      cellRenderer: memo(actionRender),
    },
  ];

  const Other_columnDef = [
    { field: hname.sr_no },
    { field: hname.office_file_no },
    { field: hname.file_name },
    { field: hname.code },
    { field: hname.tp_stage },
    { field: hname.no_of_days },
    { field: hname.team },
    // { field: hname.client },
    { field: hname.status },
    {
      field: hname.action,
      sortable: false,
      filter: false,
      cellRenderer: memo(actionRender),
    },
  ];

  const defaultColDef = useMemo(
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

  const getApiInfo = async () => {
    let obj = {
      method: "",
      url: "",
    };

    // if(superAccess()){
    //     obj = {method:getBUCProjectForSuperUser.method,url:getBUCProjectForSuperUser.url};
    // }else if(isEmp()){
    //     obj = {method:getBUCProjectForTeam.method,url:getBUCProjectForTeam.url};
    // }
    obj = {
      method: getBUCProjectForSuperUser.method,
      url: getBUCProjectForSuperUser.url,
    };
    return obj;
  };

  const onRemoveProject = (id) => {
    SwalAlert({})
      .then(async (result) => {
        if (result.isConfirmed) {
          await removeProject(id);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const removeProject = async (id) => {
    try {
      tableRef.current.api?.showLoadingOverlay();

      const res = await axios({
        method: deleteFile.method,
        url: `${deleteFile.url}`,
        headers: AuthHeader(),
        data: { id: id },
      });

      if (!res.data?.error) {
        tableRef.current.api?.hideOverlay();

        setProjectData(
          projectData.filter((e) => {
            return e.id != id;
          })
        );

        toast.success(res.data?.message);
      } else {
        tableRef.current.api?.hideOverlay();
        toast.error(res.data?.message);
      }
    } catch (err) {
      tableRef.current.api?.hideOverlay();
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  const fetchData = async () => {
    try {
      tableRef.current.api?.showLoadingOverlay();
      const apiInfo = await getApiInfo();
      const res = await axios({
        method: apiInfo.method,
        url: apiInfo.url,
        headers: AuthHeader(),
      });

      if (!res?.data?.error) {
        const payload = res?.data?.data;
        if (Array.isArray(payload) && payload.length > 0) {
          const rows = [];
          payload.forEach(async (element, index) => {
            rows.push({
              id: element?.id,
              [hname.sr_no]: `${index + 1}`,
              [hname.office_file_no]: element?.office_file_no,
              [hname.file_name]: element?.file_name ? element?.file_name : "",
              [hname.code]: element?.code_title ? element?.code_title : "",
              [hname.tp_stage]:
                parseInt(element?.tps_stage) === 1
                  ? "Draft"
                  : parseInt(element?.tps_stage) === 2
                  ? "Final"
                  : "",
              [hname.no_of_days]: subtractTwoDates(
                GetDate(element?.created_at, "YYYY-MM-DD"),
                todayDate()
              ),
              [hname.team]: element?.team ? element?.team : "",
              [hname.client]: element?.cust_name ? element?.cust_name : "",
              [hname.status]: element?.stage_title,
              [hname.action]: element,
            });
          });

          setProjectData(rows);
        } else {
          tableRef.current.api?.showNoRowsOverlay();
        }
      } else {
        tableRef.current.api?.showNoRowsOverlay();
      }
    } catch (err) {
      tableRef.current.api?.showNoRowsOverlay();
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    localStorage.setItem("lastPath", ProjectRoute.listProjectBUC);
  }, []);

  return (
    <React.Fragment>
      <div className="content__wrapper">
        <section className="page-content">
          <div className="page-title mobile-title">
            <h1 className="h4 mb-0">All Projects (BUC)</h1>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="zed__table card">
                <h5 className="text-shadow-yellow px-2 mb-4">
                  All Projects (BUC)
                </h5>
                <div className="table-responsive">
                  <div
                    className="ag-theme-alpine"
                    style={{ height: datatableHeight }}
                  >
                    {/* <button className='btn' onClick={()=>exportToCsv(tableRef)}>EXCEL</button> */}

                    {superAccess() ? (
                      <AgGridReact
                        ref={tableRef}
                        pagination={true}
                        paginationPageSize={paginationRows}
                        rowData={projectData}
                        columnDefs={columnDef}
                        defaultColDef={defaultColDef}
                        rowSelection="single"
                        animateRows={true}
                        overlayLoadingTemplate={loadingTemplate()}
                        overlayNoRowsTemplate={notFoundTemplate()}
                        onGridReady={fetchData}
                      />
                    ) : (
                      <AgGridReact
                        ref={tableRef}
                        pagination={true}
                        paginationPageSize={paginationRows}
                        rowData={projectData}
                        columnDefs={Other_columnDef}
                        defaultColDef={defaultColDef}
                        rowSelection="single"
                        animateRows={true}
                        overlayLoadingTemplate={loadingTemplate()}
                        overlayNoRowsTemplate={notFoundTemplate()}
                        onGridReady={fetchData}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

export default ListBUCProject;
