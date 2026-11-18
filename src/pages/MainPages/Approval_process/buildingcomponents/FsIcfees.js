// ─────────────────────────────────────────────
//  FsIcfees.jsx  —  BuildingPermission > All Fees > F.S./I.C. Fees
//  Brand design — removes FontAwesome + ReactSVG
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import {
  addupdatefsicfees, fetchfsicfeesbyID, fetchicfeesbyid,
  deletefsicFileUpload, deleteIcFileUpload, deleteIcdata, deleteFsIData,
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
  @keyframes fiFadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  .fi-fade { animation:fiFadeIn 0.22s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes fiSpin { to{transform:rotate(360deg)} }
  .fi-spinner { width:18px;height:18px;border-radius:50%;border:2.5px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:fiSpin 0.8s linear infinite; }

  .fi-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .fi-table th { padding:9px 10px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .fi-table td { padding:9px 10px;border-bottom:1px solid ${THEME.border};vertical-align:middle; }
  .fi-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .fi-table tbody tr:hover { background:${THEME.rowHover}; }

  .fi-input, .fi-select {
    width:100%;padding:7px 10px;border-radius:8px;border:1.5px solid #E0D5C5;
    font-size:12px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;min-width:90px;
  }
  .fi-input:focus, .fi-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  .fi-file-zone {
    border:1.5px dashed #D4C4A0;border-radius:8px;padding:7px 10px;background:#FDFAF5;
    font-size:11px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.15s;min-width:110px;
  }
  .fi-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .fi-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  .fi-icon-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:4px; }
  .fi-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .fi-del-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:4px; }
  .fi-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .fi-del-btn:hover svg { stroke:#fff; }

  .fi-btn-primary { padding:9px 22px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .fi-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .fi-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .fi-btn-outline { padding:9px 22px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .fi-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .fi-btn-add { padding:6px 14px;border-radius:8px;border:1.5px solid ${THEME.brand};background:${THEME.brandLight};color:${THEME.brand};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .fi-btn-add:hover { background:${THEME.brand};color:#fff; }

  .fi-divider { border:none;border-top:1px solid ${THEME.border};margin:20px 0; }
`;

const EMI_OPTIONS = ["1","2","4","6","8","12"];

function SectionTitle({ children }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
      <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
      <h3 style={{ margin:0,fontSize:12,fontWeight:700,color:THEME.brand,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Sora',sans-serif" }}>{children}</h3>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label style={{ display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>{children}</label>;
}

// Reusable EMI table
function EmiTable({ rows, onDateChange, onAmountEdit, onReceivedDateChange, onFileChange, onRemoveFile, onRemoveRow, label }) {
  return (
    <div style={{ overflowX:"auto",marginBottom:10 }}>
      <table className="fi-table">
        <thead>
          <tr>
            <th>#</th><th>Date</th><th>Amount (₹)</th>
            <th>Received Date</th><th>File Upload</th><th style={{ width:36 }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.length===0 ? (
            <tr><td colSpan={6} style={{ textAlign:"center",color:THEME.textLight,padding:16,fontSize:12 }}>
              No rows yet. Use the controls above to generate or add rows.
            </td></tr>
          ) : rows.map((row,index)=>(
            <tr key={index}>
              <td style={{ color:THEME.textMuted,fontWeight:700,fontSize:12 }}>{index+1}</td>
              <td>
                <input type="date" className="fi-input"
                  value={row.date?.slice?.(0,10)||row.date||""}
                  onChange={e=>onDateChange(index,e.target.value)} />
              </td>
              <td>
                <input type="text" className="fi-input" placeholder="₹"
                  value={row.amount||""}
                  onChange={e=>onAmountEdit(index,e.target.value)} />
              </td>
              <td>
                <input type="date" className="fi-input"
                  value={row.receivedDate?.slice?.(0,10)||row.receivedDate||""}
                  onChange={e=>onReceivedDateChange(index,e.target.value)} />
              </td>
              <td>
                <div className="fi-file-zone">
                  <input type="file" onChange={e=>onFileChange(index,e.target.files[0])} />
                  <span>📎 {row.filePath?"Replace…":"Upload…"}</span>
                </div>
                {row.filePath && (
                  <div style={{ display:"flex",gap:4,marginTop:4 }}>
                    <span style={{ fontSize:10,color:THEME.textMuted }}>✅ Attached</span>
                    <button
                      type="button"
                      onClick={() => openFileInNewTab(row.filePath, FileUrl)}
                      className="fi-icon-btn"
                      title="View"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button type="button" className="fi-del-btn" title="Delete file"
                      onClick={()=>onRemoveFile(row.id, index)}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                )}
              </td>
              <td>
                <button type="button" className="fi-del-btn" title="Remove row"
                  onClick={()=>onRemoveRow(index,row.id)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function FsIcfees() {
  const params   = useParams();
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [loading,   setLoading]   = useState(false);
  const [rows,      setRows]      = useState([]);
  const [icRows,    setIcRows]    = useState([]);
  const [fsiAmount, setFsiAmount] = useState("");
  const [icAmount,  setIcAmount]  = useState("");
  const [fsi,       setFsi]       = useState("");
  const [ic,        setIc]        = useState("");

  // ── Fetchers ──────────────────────────────
  const fetchallFsiData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchfsicfeesbyID.method, fetchfsicfeesbyID.url);
      if (!res.data.error) {
        const formatted = res.data.data.map(item=>({ ...item, date:item.date?.slice(0,10)||"", receivedDate:item.receivedDate?.slice(0,10)||"" }));
        setRows(formatted);
        setFsi(res.data.data[0]?.total_fsi_emi||"");
        setFsiAmount(res.data.data[0]?.total_fsi_amount||"");
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  const fetchallicData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchicfeesbyid.method, fetchicfeesbyid.url);
      if (!res.data.error) {
        const formatted = res.data.data.map(item=>({ ...item, date:item.date?.slice(0,10)||"", receivedDate:item.receivedDate?.slice(0,10)||"" }));
        setIcRows(formatted);
        setIc(res.data.data[0]?.total_ic_emi||"");
        setIcAmount(res.data.data[0]?.total_ic_amount||"");
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(() => { fetchallFsiData(); fetchallicData(); }, []);

  // ── FSI handlers ──────────────────────────
  const handleDropdownChange = (e) => {
    const val = parseInt(e.target.value,10);
    setFsi(e.target.value);
    if (!val) { setRows([]); return; }
    setRows(Array.from({length:val},()=>({ date:"", amount:fsiAmount?(fsiAmount/val).toFixed(2):"", receivedDate:"", file:null })));
  };

  const handleFsiAmountChange = (e) => {
    const val = parseFloat(e.target.value)||"";
    setFsiAmount(val);
    if (rows.length>0) setRows(prev=>prev.map(r=>({...r,amount:val?(val/rows.length).toFixed(2):""})));
  };

  // ── IC handlers ───────────────────────────
  const handleIcDropdownChange = (e) => {
    const val = parseInt(e.target.value,10);
    setIc(e.target.value);
    if (!val) { setIcRows([]); return; }
    setIcRows(Array.from({length:val},()=>({ date:"", amount:icAmount?(icAmount/val).toFixed(2):"", receivedDate:"", file:null })));
  };

  const handleIcAmountChange = (e) => {
    const val = parseFloat(e.target.value)||"";
    setIcAmount(val);
    if (icRows.length>0) setIcRows(prev=>prev.map(r=>({...r,amount:val?(val/icRows.length).toFixed(2):""})));
  };

  // ── Row updaters ──────────────────────────
  const updateRow = (setter,index,key,val) => setter(prev=>{const upd=[...prev];upd[index]={...upd[index],[key]:val};return upd;});

  const handleFsiFileChange = async (index, file) => {
    if (!file) return;
    const toastId = toast.loading("Uploading fee receipt to S3...");
    try {
      const { fileUrl } = await uploadFileToS3(file, null, "approval/building/fsicfees");
      updateRow(setRows, index, "filePath", fileUrl);
      updateRow(setRows, index, "filePath_cleared", false);
      toast.success("Receipt uploaded to S3!", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload to S3", { id: toastId });
    }
  };

  const handleIcFileChange = async (index, file) => {
    if (!file) return;
    const toastId = toast.loading("Uploading fee receipt to S3...");
    try {
      const { fileUrl } = await uploadFileToS3(file, null, "approval/building/fsicfees");
      updateRow(setIcRows, index, "filePath", fileUrl);
      updateRow(setIcRows, index, "filePath_cleared", false);
      toast.success("Receipt uploaded to S3!", { id: toastId });
    } catch (err) {
      toast.error("Failed to upload to S3", { id: toastId });
    }
  };

  const handleRemoveFsiFile = (id, index) => {
    if (id) {
      swalDelete(id, deletefsicFileUpload, fetchallFsiData);
    } else {
      updateRow(setRows, index, "filePath", null);
      updateRow(setRows, index, "filePath_cleared", true);
    }
  };

  const handleRemoveIcFile = (id, index) => {
    if (id) {
      swalDelete(id, deleteIcFileUpload, fetchallicData);
    } else {
      updateRow(setIcRows, index, "filePath", null);
      updateRow(setIcRows, index, "filePath_cleared", true);
    }
  };

  // ── Delete handlers ───────────────────────
  const swalDelete = async (id, api, refetch) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id) {
          const res = await ApiService(null, id, header, api.method, api.url);
          if (!res.data.error) { toast.success(res.data.message); refetch(); }
          else toast.error(res.data.message);
        }
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const removeRowFromState = (setter, index, id, api, refetch) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id) await ApiService(null, id, header, api.method, api.url);
        setter(prev=>prev.filter((_,i)=>i!==index));
        toast.success("Row removed"); refetch();
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      fsiRows: rows.map((r) => ({
        fsiId: r.id || "",
        date: r.date,
        amount: r.amount,
        receivedDate: r.receivedDate,
        filePath: r.filePath || "",
        filePath_cleared: r.filePath_cleared ? "true" : "false",
      })),
      icRows: icRows.map((r) => ({
        icId: r.id || "",
        date: r.date,
        amount: r.amount,
        receivedDate: r.receivedDate,
        filePath: r.filePath || "",
        filePath_cleared: r.filePath_cleared ? "true" : "false",
      })),
      approval_id: params.id,
      fsiamountemi: fsi,
      icamountemi: ic,
      fsiAmount: fsiAmount,
      icAmount: icAmount,
    };
    try {
      const res = await ApiService(
        payload,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        addupdatefsicfees.method,
        addupdatefsicfees.url,
      );
      if (res.status === 200 && !res.data.error) {
        toast.success("F.S.I.C submitted successfully");
        fetchallFsiData();
        fetchallicData();
      } else toast.error(res.data.message || "Unexpected error");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif" }} className="fi-fade">
        <form onSubmit={handleSubmit} noValidate>

          {/* ── F.S.I Section ── */}
          <SectionTitle>F.S.I Fees (Residential / Commercial Sq.Mt.)</SectionTitle>

          {/* FSI controls */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14 }}>
            <div>
              <FieldLabel>Total F.S.I EMI</FieldLabel>
              <select id="fsi" className="fi-select" value={fsi} onChange={handleDropdownChange}>
                <option value="">— Select —</option>
                {EMI_OPTIONS.map(v=><option key={v} value={v}>{v.padStart(2,"0")}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Total F.S.I Amount (₹)</FieldLabel>
              <input className="fi-input" placeholder="₹ Enter amount" value={fsiAmount} onChange={handleFsiAmountChange} />
            </div>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:10 }}>
            <button type="button" className="fi-btn-add"
              onClick={()=>setRows(p=>[...p,{date:"",amount:"",receivedDate:"",file:null}])}>
              + Add Row
            </button>
          </div>

          <EmiTable
            rows={rows}
            onDateChange={(i,v)=>updateRow(setRows,i,"date",v)}
            onAmountEdit={(i,v)=>updateRow(setRows,i,"amount",v)}
            onReceivedDateChange={(i,v)=>updateRow(setRows,i,"receivedDate",v)}
            onFileChange={handleFsiFileChange}
            onRemoveFile={handleRemoveFsiFile}
            onRemoveRow={(i,id)=>removeRowFromState(setRows,i,id,deleteFsIData,fetchallFsiData)}
          />

          <hr className="fi-divider" />

          {/* ── I.C Section ── */}
          <SectionTitle>I.C Fees (Deposit / Amenities Sq.Mt. as per zone)</SectionTitle>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:14 }}>
            <div>
              <FieldLabel>Total I.C EMI</FieldLabel>
              <select id="ic" className="fi-select" value={ic} onChange={handleIcDropdownChange}>
                <option value="">— Select —</option>
                {EMI_OPTIONS.map(v=><option key={v} value={v}>{v.padStart(2,"0")}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Total I.C Amount (₹)</FieldLabel>
              <input className="fi-input" placeholder="₹ Enter amount" value={icAmount} onChange={handleIcAmountChange} />
            </div>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:10 }}>
            <button type="button" className="fi-btn-add"
              onClick={()=>setIcRows(p=>[...p,{date:"",amount:"",receivedDate:"",filePath:null}])}>
              + Add Row
            </button>
          </div>

          <EmiTable
            rows={icRows}
            onDateChange={(i,v)=>updateRow(setIcRows,i,"date",v)}
            onAmountEdit={(i,v)=>updateRow(setIcRows,i,"amount",v)}
            onReceivedDateChange={(i,v)=>updateRow(setIcRows,i,"receivedDate",v)}
            onFileChange={handleIcFileChange}
            onRemoveFile={handleRemoveIcFile}
            onRemoveRow={(i,id)=>removeRowFromState(setIcRows,i,id,deleteIcdata,fetchallicData)}
          />

          {/* Actions */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:16 }}>
            <button type="button" className="fi-btn-outline"
              onClick={()=>navigate(`/${ApprovalRoute.approval_list}`)}>
              Cancel
            </button>
            <button type="submit" className="fi-btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <span className="fi-spinner" />Saving…
                </span>
              ) : "Submit"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default FsIcfees;