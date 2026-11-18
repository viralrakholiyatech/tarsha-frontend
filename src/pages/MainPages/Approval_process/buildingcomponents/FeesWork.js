// ─────────────────────────────────────────────
//  FeesWork.jsx  —  BuildingPermission > All Fees > Work Fees
//  Brand design — removes FontAwesome + ReactSVG
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import { getToken } from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../../services/DateAndTimeService";
import {
  addupdateworkfees, fetchworkfeesbyID, deleteworkFileUpload, deleteworkfees,
} from "../../../../config/config";
import { ApprovalRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import { uploadFileToS3, openFileInNewTab } from "../../../../services/S3Service";


const THEME = {
  brand:"#887549", brandLight:"#F5F0E8", brandMid:"#C4A97D", brandDark:"#5C4E32",
  bg:"#F8F5F0", border:"#EDE5D5", rowAlt:"#FEFCF9", rowHover:"#FDFAF5",
  text:"#1A1A2E", textMuted:"#ADADAD", textLight:"#BDBDBD",
};

const CSS = `
  @keyframes fwFadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  .fw-fade { animation:fwFadeIn 0.22s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes fwSpin { to{transform:rotate(360deg)} }
  .fw-spinner { width:18px;height:18px;border-radius:50%;border:2.5px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:fwSpin 0.8s linear infinite; }

  .fw-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .fw-table th { padding:9px 10px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .fw-table td { padding:9px 10px;border-bottom:1px solid ${THEME.border};vertical-align:middle; }
  .fw-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .fw-table tbody tr:hover { background:${THEME.rowHover}; }

  .fw-input, .fw-select {
    width:100%;padding:7px 10px;border-radius:8px;border:1.5px solid #E0D5C5;
    font-size:12px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;min-width:100px;
  }
  .fw-input:focus, .fw-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .fw-input::placeholder { color:${THEME.textLight}; }

  .fw-file-zone {
    border:1.5px dashed #D4C4A0;border-radius:8px;padding:7px 10px;background:#FDFAF5;
    font-size:11px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.15s;min-width:120px;
  }
  .fw-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .fw-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  .fw-icon-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:4px; }
  .fw-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .fw-del-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:4px; }
  .fw-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .fw-del-btn:hover svg { stroke:#fff; }

  .fw-btn-primary { padding:9px 20px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .fw-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .fw-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .fw-btn-outline { padding:9px 20px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .fw-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .fw-btn-add { padding:6px 14px;border-radius:8px;border:1.5px solid ${THEME.brand};background:${THEME.brandLight};color:${THEME.brand};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .fw-btn-add:hover { background:${THEME.brand};color:#fff; }
`;

const FEE_TYPES = [
  { value:"security_deposit",  label:"Security Deposit"            },
  { value:"road_obstruction",  label:"Road Obstruction Deposit"    },
  { value:"tree_plantation",   label:"Tree Plantation Deposit"     },
  { value:"scrunity_fees",     label:"Scrutiny Fees Differentials" },
  { value:"road_fees",         label:"Road Fees Differentials"     },
  { value:"service_amenities", label:"Service And Amenities Fees"  },
  { value:"other_charges",     label:"Other Charges"               },
];

function FeesWork() {
  const params   = useParams();
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [loading,    setLoading]    = useState(false);
  const [workFields, setWorkFields] = useState([{
    receipt_no:"", fee_type:"", amount:"", date:"", file_upload:null,
  }]);

  const fetchworkFees = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchworkfeesbyID.method, fetchworkfeesbyID.url);
      if (!res.data.error) {
        const Data = res.data.data;
        if (Data?.length) {
          setWorkFields(Data.map(item=>({
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

  useEffect(() => { fetchworkFees(); }, []);

  const handleWorkChange = async (index, e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      const toastId = toast.loading("Uploading fee receipt to S3...");
      try {
        const { fileUrl } = await uploadFileToS3(
          file,
          null,
          "approval/building/workfees",
        );
        setWorkFields((prev) => {
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
    setWorkFields((prev) => {
      const upd = [...prev];
      upd[index] = { ...upd[index], [name]: value };
      return upd;
    });
  };

  const onRemovefileUpload = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, deleteworkFileUpload.method, deleteworkFileUpload.url);
        if (!res.data.error) { toast.success(res.data.message); fetchworkFees(); }
        else toast.error(res.data.message);
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const removeField = (index, id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id) await ApiService(null, id, header, deleteworkfees.method, deleteworkfees.url);
        setWorkFields(prev => prev.filter((_,i)=>i!==index));
        toast.success("Row removed"); fetchworkFees();
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      workFields: workFields.map((field) => ({
        workfeesId: field.Id || "",
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
        addupdateworkfees.method,
        addupdateworkfees.url,
      );
      if (!res.data.error) {
        toast.success("Work Fees submitted successfully");
        fetchworkFees();
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

      <div style={{ fontFamily:"'DM Sans',sans-serif" }} className="fw-fade">

        {/* Section title */}
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
          <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
          <h3 style={{ margin:0,fontSize:12,fontWeight:700,color:THEME.brand,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Sora',sans-serif" }}>Work Fees</h3>
        </div>

        <form onSubmit={handleWorkSubmit} noValidate>
          <div style={{ overflowX:"auto",marginBottom:12 }}>
            <table className="fw-table">
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
                {workFields.map((field,index)=>(
                  <tr key={index}>
                    <td style={{ color:THEME.textMuted,fontWeight:700,fontSize:12 }}>{index+1}</td>
                    <td>
                      <input name="receipt_no" className="fw-input"
                        placeholder="Receipt no." value={field.receipt_no}
                        onChange={e=>handleWorkChange(index,e)} />
                    </td>
                    <td>
                      <select name="fee_type" className="fw-select"
                        value={field.fee_type} onChange={e=>handleWorkChange(index,e)}>
                        <option value="">— Select —</option>
                        {FEE_TYPES.map(ft=>(
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input name="amount" className="fw-input"
                        placeholder="₹ Amount" value={field.amount}
                        onChange={e=>handleWorkChange(index,e)} />
                    </td>
                    <td>
                      <input type="date" name="date" className="fw-input"
                        value={field.date} onChange={e=>handleWorkChange(index,e)} />
                    </td>
                    <td>
                      <div className="fw-file-zone">
                        <input type="file" name="file_upload" onChange={e=>handleWorkChange(index,e)} />
                        <span>📎 {field.file_upload&&typeof field.file_upload==="string"?"Replace…":"Upload…"}</span>
                      </div>
                      {field.file_upload && typeof field.file_upload==="string" && (
                        <div style={{ display:"flex",gap:4,marginTop:4 }}>
                          <span style={{ fontSize:10,color:THEME.textMuted }}>✅ Attached</span>
                          <button
                            type="button"
                            onClick={() =>
                              openFileInNewTab(
                                field.file_upload,
                                FileUrl,
                              )
                            }
                            className="fw-icon-btn"
                            title="View file"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="fw-del-btn"
                            title="Delete file"
                            onClick={() => {
                              if (field.Id) {
                                onRemovefileUpload(field.Id);
                              } else {
                                setWorkFields((prev) => {
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
                    <td>
                      {index!==0 && (
                        <button type="button" className="fw-del-btn" title="Remove row"
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

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:14 }}>
            <button type="button" className="fw-btn-add"
              onClick={()=>setWorkFields(p=>[...p,{receipt_no:"",fee_type:"",amount:"",date:"",file_upload:null}])}>
              + Add Row
            </button>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
            <button type="button" className="fw-btn-outline"
              onClick={()=>navigate(`/${ApprovalRoute.approval_list}`)}>
              Cancel
            </button>
            <button type="submit" className="fw-btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <span className="fw-spinner" />Saving…
                </span>
              ) : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default FeesWork;