import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { AgGridReact } from "ag-grid-react";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { displayLoader } from "../../../UtilsComponent/DisplayLoader";
import {
  paginationRows,
  preview_date_format,
} from "../../../config/CommonVariables";
import {
  exportToCsv,
  loadingTemplate,
  notFoundTemplate,
} from "../../../services/FormCommon";
import { LeaveRoute } from "../../../config/RouteConfig";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import {
  deleteLeaveById,
  getLeaveByTeam,
  getLeaveByTeamIdForTeam,
} from "../../../config/config";
import toast from "react-hot-toast";

//Leaves
const ListofTeam = () => {
  const tableRef = useRef();
  const params = useParams();

  const [leaves, setLeaves] = useState([]);

  const [additionalInfo, setAdditionalInfo] = useState({ team_fullname: "" });

  var header = {
    Authorization: `Bearer ${getToken()}`,
    ["Content-type"]: "application/json",
  };

  const hname = {
    title: "Title",
    from_date: "From Date",
    to_date: "To Date",
    status: "Status",
    created_at: "Applied at",
    action: "action",
  };

  const actionRender = (p) => {
    return (
      <>
        <Link
          to={`/${LeaveRoute.previewLeave}/${p?.value}`}
          style={{ color: "black" }}
        >
          <i class="fa fa-eye" aria-hidden="true"></i>
        </Link>
        &nbsp;
      </>
    );
  };

  const columnDef = [
    { field: hname.title },
    { field: hname.from_date },
    { field: hname.to_date },
    { field: hname.status },
    { field: hname.created_at },
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
    [],
  );

  const getStatus = (num) => {
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

  const getLeaveData = useCallback(async () => {
    try {
      tableRef.current.api?.showLoadingOverlay();
      const res = await ApiService(
        null,
        params?.id,
        header,
        getLeaveByTeam.method,
        getLeaveByTeam.url,
      );

      if (!res?.data?.error) {
        const payload = res?.data?.data;

        setAdditionalInfo((prevState) => ({
          team_fullname: res?.data?.team[0]?.fullname,
        }));

        const rows = [];

        payload.forEach((element, i) => {
          rows.push({
            id: element?.id,
            [hname.title]: element?.title,
            [hname.from_date]: element?.from_date
              ? GetDate(element?.from_date, preview_date_format)
              : "",
            [hname.to_date]: element?.to_date
              ? GetDate(element?.to_date, preview_date_format)
              : "",
            [hname.status]: getStatus(element?.status),
            [hname.created_at]: element?.created_at
              ? GetDate(element?.created_at, preview_date_format)
              : "",
            [hname.action]: element?.id,
          });
        });
        setLeaves(rows);

        if (!payload.length) {
          tableRef.current.api?.showNoRowsOverlay();
        }
      } else {
        tableRef.current.api?.showNoRowsOverlay();
      }
    } catch (err) {
      tableRef.current.api?.hideOverlay();
      console.log(err);
    }
  }, []);

  const removeLeaveData = useCallback(async (id) => {
    try {
      setLeaves((prevState) => {
        return prevState.filter((e) => {
          return e?.id != id;
        });
      });
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

  return (
    <div className="content__wrapper">
      <section className="page-content">
        <div className="page-title mobile-title">
          <h1 className="h4 mb-0">Leaves</h1>
          <p className="mb-4">Leaves</p>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="zed__table card">
              <h5 className="text-shadow-yellow px-2 mb-4">All Leaves</h5>
              <h6>Name : {additionalInfo?.team_fullname}</h6>
              <div className="table-responsive">
                <div className="ag-theme-alpine" style={{ height: "500px" }}>
                  {/* <button className='btn' onClick={()=>exportToCsv(tableRef)}>EXCEL</button> */}
                  <AgGridReact
                    ref={tableRef}
                    pagination={true}
                    paginationPageSize={paginationRows}
                    rowData={leaves}
                    columnDefs={columnDef}
                    defaultColDef={defaultColDef}
                    rowSelection="single"
                    animateRows={true}
                    overlayLoadingTemplate={loadingTemplate()}
                    overlayNoRowsTemplate={notFoundTemplate()}
                    onGridReady={getLeaveData}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListofTeam;
