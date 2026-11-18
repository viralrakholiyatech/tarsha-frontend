// ─────────────────────────────────────────────
//  AllFees.jsx  —  BuildingPermission > All Fees
//  Brand design — removes Bootstrap Tab/Nav
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import { getToken } from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../../services/DateAndTimeService";
import FsIcfees from "./FsIcfees";
import FeesWork from "./FeesWork";
import {
  addupdateAllfees, fetchallfeesbyID, deleteFileUpload, deleteAllfees,
} from "../../../../config/config";
import { ApprovalRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import { uploadFileToS3, openFileInNewTab } from "../../../../services/S3Service";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  rowAlt:     "#FEFCF9",
  rowHover:   "#FDFAF5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @keyframes afFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .af-fade { animation:afFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes afSpin { to{transform:rotate(360deg)} }
  .af-spinner { width:20px;height:20px;border-radius:50%;border:2.5px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:afSpin 0.8s linear infinite; }

  .af-sub-tabs { display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px; }
  .af-sub-tab { padding:7px 16px;border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .af-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .af-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Table ── */
  .af-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .af-table th { padding:9px 10px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .af-table td { padding:9px 10px;border-bottom:1px solid ${THEME.border};vertical-align:middle; }
  .af-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .af-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Inline inputs ── */
  .af-input, .af-select {
    width:100%;padding:7px 10px;border-radius:8px;border:1.5px solid #E0D5C5;
    font-size:12px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
    min-width:100px;
  }
  .af-input:focus, .af-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  /* ── File zone ── */
  .af-file-zone {
    border:1.5px dashed #D4C4A0;border-radius:8px;padding:7px 10px;background:#FDFAF5;
    font-size:11px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.15s;
    min-width:120px;
  }
  .af-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .af-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  /* ── Icon/delete buttons ── */
  .af-icon-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:4px; }
  .af-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .af-del-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:4px; }
  .af-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .af-del-btn:hover svg { stroke:#fff; }

  /* ── Buttons ── */
  .af-btn-primary { padding:9px 20px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .af-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .af-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .af-btn-outline { padding:9px 20px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .af-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .af-btn-add { padding:6px 14px;border-radius:8px;border:1.5px solid ${THEME.brand};background:${THEME.brandLight};color:${THEME.brand};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .af-btn-add:hover { background:${THEME.brand};color:#fff; }
`;

const FEE_TYPES = [
  { value:"security_deposit",  label:"Security Deposit"               },
  { value:"road_obstruction",  label:"Road Obstruction Deposit"       },
  { value:"tree_plantation",   label:"Tree Plantation Deposit"        },
  { value:"scrunity_fees",     label:"Scrutiny Fees Differentials"    },
  { value:"road_fees",         label:"Road Fees Differentials"        },
  { value:"service_amenities", label:"Service And Amenities Fees"     },
  { value:"other_charges",     label:"Other Charges"                  },
];

const INNER_TABS = [
  { key:"all",  label:"All Important Fees" },
  { key:"fs",   label:"F.S./I.C. Fees"    },
  { key:"work", label:"Work Fees"          },
];


function AllFees() {
  const params   = useParams();
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [activeTab,     setActiveTab]     = useState("all");
  const [loading,       setLoading]       = useState(false);
  const [dynamicFields, setDynamicFields] = useState([{
    receipt_no:"", fee_type:"", amount:"", date:"", file_upload:null,
  }]);

  const fetchallfeesData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchallfeesbyID.method, fetchallfeesbyID.url);
      if (!res.data.error) {
        const Data = res.data.data;
        if (Data?.length) {
          setDynamicFields(Data.map(item=>({
            Id: item.id,
            receipt_no: item.receipt_no||"",
            fee_type:   item.fee_type||"",
            amount:     item.amount||"",
            date:       GetDate(item.date,"YYYY-MM-DD")||"",
            file_upload:item.file_upload||null,
          })));
        }
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(() => { fetchallfeesData(); }, []);

  const handleDynamicChange = async (index, e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      const toastId = toast.loading("Uploading fee receipt to S3...");
      try {
        const { fileUrl } = await uploadFileToS3(
          file,
          null,
          "approval/building/allfees",
        );
        setDynamicFields((prev) => {
          const upd = [...prev];
          upd[index] = {
            ...upd[index],
            [name]: fileUrl,
            file_upload_cleared: false,
          };
          return upd;
        });
        toast.success("Receipt uploaded to S3!", { id: toastId });
      } catch (err) {
        toast.error("Failed to upload to S3", { id: toastId });
      }
      return;
    }
    setDynamicFields((prev) => {
      const upd = [...prev];
      upd[index] = { ...upd[index], [name]: value };
      return upd;
    });
  };

  const removeField = (index, id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id) await ApiService(null, id, header, deleteAllfees.method, deleteAllfees.url);
        setDynamicFields(prev => prev.filter((_,i)=>i!==index));
        toast.success("Row removed"); fetchallfeesData();
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const onRemovefileUpload = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id) {
          const res = await ApiService(null, id, header, deleteFileUpload.method, deleteFileUpload.url);
          if (!res.data.error) { toast.success(res.data.message); fetchallfeesData(); }
          else toast.error(res.data.message);
        }
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      dynamicFields: dynamicFields.map((field) => ({
        AllfeesId: field.Id || "",
        approval_id: params.id,
        receipt_no: field.receipt_no,
        fee_type: field.fee_type,
        amount: field.amount,
        date: field.date,
        file_upload: field.file_upload || "",
        file_upload_cleared: field.file_upload_cleared ? "true" : "false",
      })),
    };
    setLoading(true);
    try {
      const res = await ApiService(
        payload,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        addupdateAllfees.method,
        addupdateAllfees.url,
      );
      if (!res.data.error) {
        toast.success("All fees submitted successfully");
        fetchallfeesData();
      } else toast.error(res.data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
        {/* Sub-tabs */}
        <div className="af-sub-tabs">
          {INNER_TABS.map((t)=>(
            <button key={t.key} type="button"
              className={`af-sub-tab${activeTab===t.key?" active":""}`}
              onClick={()=>setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── All Important Fees ── */}
        {activeTab==="all" && (
          <div className="af-fade">
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ overflowX:"auto",marginBottom:12 }}>
                <table className="af-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Receipt No.</th>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>File Upload</th>
                      <th style={{ width:36 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicFields.map((field,index)=>(
                      <tr key={index}>
                        <td style={{ color:THEME.textMuted,fontWeight:700,fontSize:12 }}>{index+1}</td>
                        {/* Receipt No */}
                        <td>
                          <input name="receipt_no" className="af-input"
                            placeholder="Receipt no." value={field.receipt_no}
                            onChange={e=>handleDynamicChange(index,e)} />
                        </td>
                        {/* Fee Type */}
                        <td>
                          <select name="fee_type" className="af-select"
                            value={field.fee_type} onChange={e=>handleDynamicChange(index,e)}>
                            <option value="">— Select —</option>
                            {FEE_TYPES.map(ft=>(
                              <option key={ft.value} value={ft.value}>{ft.label}</option>
                            ))}
                          </select>
                        </td>
                        {/* Amount */}
                        <td>
                          <input name="amount" className="af-input"
                            placeholder="₹ Amount" value={field.amount}
                            onChange={e=>handleDynamicChange(index,e)} />
                        </td>
                        {/* Date */}
                        <td>
                          <input type="date" name="date" className="af-input"
                            value={field.date} onChange={e=>handleDynamicChange(index,e)} />
                        </td>
                        {/* File */}
                        <td>
                          <div className="af-file-zone">
                            <input type="file" name="file_upload" onChange={e=>handleDynamicChange(index,e)} />
                            <span>📎 {field.file_upload && typeof field.file_upload==="string" ? "Replace…" : "Upload…"}</span>
                          </div>
                          {field.file_upload && typeof field.file_upload==="string" && (
                            <div style={{ display:"flex",gap:4,marginTop:4 }}>
                              <button
                                type="button"
                                onClick={() =>
                                  openFileInNewTab(
                                    field.file_upload,
                                    FileUrl,
                                  )
                                }
                                className="af-icon-btn"
                                title="View file"
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="af-del-btn"
                                title="Delete file"
                                onClick={() => {
                                  if (field.Id) {
                                    onRemovefileUpload(field.Id);
                                  } else {
                                    setDynamicFields((prev) => {
                                      const upd = [...prev];
                                      upd[index] = {
                                        ...upd[index],
                                        file_upload: null,
                                        file_upload_cleared: true,
                                      };
                                      return upd;
                                    });
                                  }
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </td>
                        {/* Remove row */}
                        <td>
                          {index!==0 && (
                            <button type="button" className="af-del-btn" title="Remove row"
                              onClick={()=>removeField(index,field.Id)}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Row */}
              <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:16 }}>
                <button type="button" className="af-btn-add"
                  onClick={()=>setDynamicFields(p=>[...p,{receipt_no:"",fee_type:"",amount:"",date:"",file_upload:null}])}>
                  + Add Row
                </button>
              </div>

              {/* Actions */}
              <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
                <button type="button" className="af-btn-outline"
                  onClick={()=>navigate(`/${ApprovalRoute.approval_list}`)}>
                  Cancel
                </button>
                <button type="submit" className="af-btn-primary" disabled={loading}>
                  {loading ? (
                    <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span className="af-spinner" />Saving…
                    </span>
                  ) : "Submit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── F.S./I.C. Fees ── */}
        {activeTab==="fs" && (
          <div className="af-fade"><FsIcfees /></div>
        )}

        {/* ── Work Fees ── */}
        {activeTab==="work" && (
          <div className="af-fade"><FeesWork /></div>
        )}
      </div>
    </>
  );
}

export default AllFees;