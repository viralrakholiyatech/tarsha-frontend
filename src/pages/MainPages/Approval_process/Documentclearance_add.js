
import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  addoredit, getAlldocument, documentclearancebyId, updateDocument,
  deletefiles, deleteCollection, fetchActiveEmployee, documentcbyID, alldocumentdataId,
} from "../../../config/config";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../services/DateAndTimeService";
import DocumentCollectionModal from "../../../components/DocumentCollectionModal";
import { FileUrl } from "../../../config/file_url";
import { ApprovalRoute } from "../../../config/RouteConfig";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { openFileInNewTab, uploadFileToS3 } from "../../../services/S3Service";


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
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes daFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .da-fade { animation:daFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes daSpin { to{transform:rotate(360deg)} }
  .da-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:daSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .da-stage-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .da-stage-tabs::-webkit-scrollbar { display:none; }
  .da-stage-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .da-stage-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .da-stage-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Sub tabs ── */
  .da-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .da-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .da-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .da-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Accordion ── */
  .da-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .da-acc-header:hover { background:${THEME.brandLight}; }
  .da-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  /* ── Progress bar ── */
  .da-progress-track { width:80px;height:5px;border-radius:10px;background:#EDE5D5;overflow:hidden;display:inline-block;vertical-align:middle; }
  .da-progress-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.4s ease; }

  /* ── Doc row ── */
  .da-doc-row { display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px dashed ${THEME.border};transition:background 0.12s; }
  .da-doc-row:last-child { border-bottom:none; }
  .da-doc-row:hover { background:${THEME.rowHover}; }

  /* ── Checkbox ── */
  .da-checkbox { width:16px;height:16px;accent-color:${THEME.brand};cursor:pointer; }

  /* ── Icon buttons ── */
  .da-icon-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;margin-left:4px;text-decoration:none;flex-shrink:0; }
  .da-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .da-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;margin-left:4px;flex-shrink:0; }
  .da-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .da-del-btn:hover svg { stroke:#fff; }

  /* ── Buttons ── */
  .da-btn-primary { padding:8px 18px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .da-btn-primary:hover { background:${THEME.brandDark}; }
  .da-btn-outline { padding:7px 14px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:${THEME.brand};font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .da-btn-outline:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }

  /* ── Avatar ── */
  .da-avatar { width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .da-avatar-stack { display:flex;align-items:center; }
  .da-avatar-stack .da-avatar { margin-left:-8px; }
  .da-avatar-stack .da-avatar:first-child { margin-left:0; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const STAGE_TABS = [
  { key:"all_files",      label:"All Files"      },
  { key:"dc",             label:"D.C."           },
  { key:"pv",             label:"P.V."           },
  { key:"fire_noc",       label:"Fire NOC"       },
  { key:"e_nagar_portal", label:"E-Nagar Portal" },
  { key:"b_permission",   label:"B. Permission"  },
  { key:"site_visit",     label:"Site Visit"      },
];

const DOC_TYPES = [
  { key:"owner",   label:"Owner"   },
  { key:"office",  label:"Office"  },
  { key:"smc",     label:"SMC"     },
  { key:"license", label:"License" },
];

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function AvatarStack({ src }) {
  if (!src || src.length === 0) return null;
  return (
    <div className="da-avatar-stack">
      {src.split(",").map((p,i) => (
        <img key={i} className="da-avatar" src={`${FileUrl}/${p}`} alt="User"
          onError={(e)=>{e.target.onerror=null;e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";}} />
      ))}
    </div>
  );
}

function InfoTile({ label, value, children }) {
  return (
    <div style={{
      background: THEME.brandLight, border: `1px solid #D4C4A0`,
      borderRadius: 10, padding: "8px 12px",
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: THEME.brandMid,
        textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <div style={{ marginTop: 3, fontSize: 12, fontWeight: 600, color: THEME.brandDark }}>
        {children || value || <span style={{ color: THEME.textLight }}>N/A</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  COLLECTION ACCORDION  (checkbox list)
// ─────────────────────────────────────────────
const CollectionAccordion = memo(({ typeKey, label, items, selectedItems, onCheck, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const checked = selectedItems[typeKey]?.length || 0;
  return (
    <div style={{ border:`1px solid ${THEME.border}`,borderRadius:12,marginBottom:10,overflow:"hidden" }}>
      <div className={`da-acc-header${open?" open":""}`} onClick={()=>setOpen(v=>!v)}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <svg style={{ transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0)",flexShrink:0 }}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span style={{ fontSize:13,fontWeight:700,color:THEME.text }}>{label}</span>
          {checked > 0 && (
            <span style={{ padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:THEME.brandLight,color:THEME.brandDark,border:`1px solid #D4C4A0` }}>
              {checked} selected
            </span>
          )}
        </div>
        <span style={{ fontSize:11,color:THEME.textMuted }}>{items.length} docs</span>
      </div>

      {open && (
        <div style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
            {items.map((item,idx) => (
              <div key={item.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px dashed ${THEME.border}` }}>
                <input type="checkbox" id={`${typeKey}-${idx}`} className="da-checkbox"
                  checked={selectedItems[typeKey]?.includes(item.id) || false}
                  onChange={()=>onCheck(typeKey, item.id)} />
                <label htmlFor={`${typeKey}-${idx}`} style={{ fontSize:13,color:THEME.text,cursor:"pointer",flex:1 }}>
                  {item.doc_name}
                </label>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",justifyContent:"flex-end" }}>
            <button className="da-btn-primary" onClick={()=>onSubmit(typeKey)}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────
//  SCRUTINY ACCORDION  (doc rows with upload/view/delete)
// ─────────────────────────────────────────────
const ScrutinyAccordion = memo(({ typeKey, label, items, files, onFileChange, onUpload, onRemoveFile, onRemoveCollection, onAddDoc }) => {
  const [open, setOpen] = useState(false);
  const total     = items.length;
  const completed = items.filter(i=>i.photo).length;
  const pct       = total > 0 ? Math.round((completed/total)*100) : 0;

  return (
    <div style={{ border:`1px solid ${THEME.border}`,borderRadius:12,marginBottom:10,overflow:"hidden" }}>
      <div className={`da-acc-header${open?" open":""}`} onClick={()=>setOpen(v=>!v)}>
        <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,flexWrap:"wrap" }}>
          <svg style={{ transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0)",flexShrink:0 }}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span style={{ fontSize:13,fontWeight:700,color:THEME.text }}>{label}</span>
          <span style={{ fontSize:11,color:THEME.textMuted }}>Required: {total}</span>
          <span style={{ fontSize:11,color:"#389E0D",fontWeight:600 }}>Completed: {completed}</span>
          {total > 0 && (
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <div className="da-progress-track">
                <div className="da-progress-fill" style={{ width:`${pct}%` }} />
              </div>
              <span style={{ fontSize:11,fontWeight:700,color:THEME.brand }}>{pct}%</span>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div>
          {/* Column headers */}
          <div style={{ display:"flex",justifyContent:"space-between",padding:"8px 16px",background:THEME.bg,borderBottom:`1px solid ${THEME.border}` }}>
            <span style={{ fontSize:10,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>Document</span>
            <span style={{ fontSize:10,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>Action</span>
          </div>

          {items.slice().reverse().map((item,idx) => (
            <div key={item.id} className="da-doc-row">
              <label style={{ fontSize:13,color:THEME.text,cursor:"default",flex:1 }}>{item.doc_name}</label>
              <div style={{ display:"flex",alignItems:"center",gap:2,flexShrink:0 }}>
                {files[item.id] && (
                  <span style={{ fontSize:10,color:THEME.brand,fontWeight:700,marginRight:4 }}>
                    📎 {files[item.id].name?.slice?.(0, 15)}
                  </span>
                )}
                {/* Upload */}
                <label htmlFor={`upload-${item.id}`} className="da-icon-btn" title="Upload file" style={{ cursor:"pointer" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                  </svg>
                </label>
                <input type="file" id={`upload-${item.id}`} style={{ display:"none" }}
                  onChange={(e)=>onFileChange(e, item.id)} />
                {/* View file */}
                {item.photo && (
                  <button type="button" onClick={()=>openFileInNewTab(item.photo, FileUrl)} className="da-icon-btn" title="View file">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                )}
                {/* Delete file */}
                {item.photo && (
                  <button className="da-del-btn" title="Delete file" onClick={()=>onRemoveFile(item.id)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                )}
                {/* Delete collection */}
                <button className="da-del-btn" title="Remove document" onClick={()=>onRemoveCollection(item.id)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderTop:`1px solid ${THEME.border}`,background:"#FDFAF5",flexWrap:"wrap",gap:8 }}>
            <button className="da-btn-outline" onClick={()=>onAddDoc(typeKey)}>+ Add Doc</button>
            <button className="da-btn-primary" onClick={onUpload}>⬆ Upload All</button>
          </div>
        </div>
      )}
    </div>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const DocumentAdd = () => {
  const Id       = useParams();
  const id       = Id.id;
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [data,          setData]          = useState([]);
  const [hod,           setHod]           = useState("");
  const [scrutinyData,  setScrutinyData]  = useState([]);
  const [caseId,        setCaseId]        = useState("");
  const [startDate,     setstartDate]     = useState("");
  const [endDate,       setendDate]       = useState("");
  const [files,         setFiles]         = useState({});
  const [showModal,     setShowModal]     = useState(false);
  const [documentType,  setDocumentType]  = useState("");
  const [loading,       setLoading]       = useState(false);
  const [subactiveTab,  setSubActiveTab]  = useState("dc");
  const [activeTab,     setActiveTab]     = useState("document_collection");
  const [teamId,        setTeamId]        = useState("");
  const [selectedItems, setSelectedItems] = useState({ owner:[], office:[], smc:[], license:[] });
  const [filedata, setFiledata] = useState(null);

  // ── Fetchers ──────────────────────────────
  const fetchdata = useCallback(async () => {
    try {
      const res = await ApiService(null, 0, header, getAlldocument.method, getAlldocument.url);
      if (!res.data.error) setData(res.data.data);
    } catch(e){console.error(e);}
  }, []);

  const fetchDocumentdata = useCallback(async () => {
    try {
      const res = await ApiService(null, id, header, documentclearancebyId.method, documentclearancebyId.url);
      if (!res.data.error) {
        const payload = res.data.data;
        setScrutinyData(payload);
        const sel = { owner:[], office:[], smc:[], license:[] };
        payload.forEach((item)=>{ sel[item.type]?.push(item.doc_id); });
        setSelectedItems(sel);
      }
    } catch(e){console.error(e);}
  }, [id]);

  const fetchDocumentClearancedata = useCallback(async () => {
    try {
      const res = await ApiService(null, id, header, documentcbyID.method, documentcbyID.url);
      if (!res.data.error) {
        const D = res.data.data?.find((item)=>item.title==="D.C.");
        if (D) {
          setTeamId(D.assign_picture||""); setHod(D.hod_pictures||""); setCaseId(D.case_id||"");
          setstartDate(GetDate(D.assign_on,"YYYY-MM-DD"));
          setendDate(GetDate(D.completed_by,"YYYY-MM-DD"));
        }
      }
    } catch(e){console.error(e);}
  }, [id]);

  const fetchFileDataById = useCallback(async () => {
  try {
    const res = await axios.get(`${getfileDatabyId.url}/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.data.error) setFiledata(res.data.data[0]);
  } catch (e) { console.error(e); }
}, [id]);

  useEffect(() => {
    fetchdata();
    fetchDocumentdata();
    fetchDocumentClearancedata();
     fetchFileDataById();       
  }, []);

  // ── Stage tab navigation ──────────────────
  const handleStageNav = (key) => {
    const routes = {
      "all_files":      ()=>navigate(`/${ApprovalRoute.approval_list}`),
      "dc":             ()=>navigate(`/${ApprovalRoute.document_add}/${id}`),
      "pv":             ()=>navigate(`/${ApprovalRoute.pv_add}/${id}`),
      "fire_noc":       ()=>navigate(`/${ApprovalRoute.fire_noc_add}/${id}`),
      "e_nagar_portal": ()=>navigate(`/${ApprovalRoute.e_nagar_portal_add}/${id}`),
      "b_permission":   ()=>navigate(`/${ApprovalRoute.buildingpermissionadd}/${id}`),
      "site_visit":     ()=>navigate(`/${ApprovalRoute.sitevisit}/${id}`),
    };
    routes[key]?.();
  };

  // ── Checkbox ─────────────────────────────
  const handleCheckboxChange = (type, itemId) => {
    setSelectedItems((prev) => {
      const curr = prev[type]||[];
      return { ...prev, [type]: curr.includes(itemId) ? curr.filter(x=>x!==itemId) : [...curr,itemId] };
    });
  };

  // ── Submit collection ─────────────────────
  const handleSubmit = async (type) => {
    const selectedData = selectedItems[type];
    if (!selectedData?.length) { toast.error("No data selected"); return; }
    try {
      const res = await ApiService({ type, selectedData, id, teamId }, 0, header, addoredit.method, addoredit.url);
      if (!res.data?.error) {
        toast.success(res.data?.message || "Saved successfully");
        setSelectedItems((prev) => ({ ...prev, [type]: [] }));
        fetchDocumentdata();
      } else {
        toast.error(res.data?.message || "Error saving documents");
      }
    } catch(e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to save documents");
    }
  };

  // ── File upload ───────────────────────────
  const handleFileChange = (e, docId) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(f => ({ ...f, [docId]: e.target.files[0] }));
    }
  };

  const handleUpload = async () => {
    if (!files || !Object.keys(files).length) { toast.error("No files selected"); return; }
    const toastId = toast.loading("Uploading files to AWS S3...");
    try {
      const docIds = [];
      const fileUrls = [];
      for (const [docId, file] of Object.entries(files)) {
        if (file instanceof File) {
          const { fileUrl } = await uploadFileToS3(file, null, "approval/document_clearance");
          docIds.push(docId);
          fileUrls.push(fileUrl);
        }
      }

      await ApiService(
        { docIds, fileUrls, ID: id },
        0,
        { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        updateDocument.method,
        updateDocument.url
      );
      toast.success("Files uploaded successfully to AWS S3!", { id: toastId });
      setFiles({});
      fetchDocumentdata();
    } catch(e) {
      console.error(e);
      toast.error("Failed to upload files", { id: toastId });
    }
  };

  // ── Delete handlers ───────────────────────
  const onRemoveCollection = (itemId) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await ApiService(null, itemId, header, deleteCollection.method, deleteCollection.url);
        if (!res.data.error) { toast.success(res.data.message); fetchDocumentdata(); }
        else toast.error(res.data.message);
      } catch(e){toast.error("Something went wrong");}
    });
  };

  const onRemovefiles = (itemId) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await ApiService(null, itemId, header, deletefiles.method, deletefiles.url);
        if (!res.data.error) { toast.success(res.data.message); fetchDocumentdata(); }
        else toast.error(res.data.message);
      } catch(e){toast.error("Something went wrong");}
    });
  };

  // ── Data slices by type ───────────────────
  const byType = (arr, type) => arr.filter(i=>i.type===type);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh",background:THEME.bg,fontFamily:"'DM Sans',sans-serif",padding:"28px 24px" }}>
<div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14,
  padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>

  {/* Case ID row */}
  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
    flexWrap:"wrap", gap:12, marginBottom:14 }}>
    <div>
      <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:700, color:THEME.textMuted,
        textTransform:"uppercase", letterSpacing:"0.07em" }}>TP Case No</p>
      <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:THEME.text,
        fontFamily:"'Sora',sans-serif" }}>{caseId || "—"}</h1>
    </div>
  </div>

  {/* File data tiles */}
  {filedata && (
    <div style={{ display:"grid",
      gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10, marginBottom:16 }}>
      <InfoTile label="Company" value={filedata.company_name} />
      <InfoTile label="Project Type" value={filedata.project_type} />
      <InfoTile label="Category" value={filedata.category_type} />
      <InfoTile label="Address" value={filedata.address} />
      <InfoTile label="Location">
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Link to={`https://www.google.com/maps?q=${filedata.lat},${filedata.long}`} target="_blank">
            <FaMapMarkerAlt style={{ color:"#F44336", fontSize:15 }} />
          </Link>
          <Link to={filedata.google_location || "#"} target="_blank">
            <FaMapLocationDot style={{ color:"#28a745", fontSize:15 }} />
          </Link>
        </div>
      </InfoTile>
      {(filedata.fp_no || filedata.ward_no || filedata.tpscheme ||
        filedata.cs_no || filedata.b_no || filedata.op_no || filedata.rs_no) && (
        <InfoTile label="Land Details">
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {[
              { label:"FP No",    value: filedata.fp_no     },
              { label:"Ward No",  value: filedata.ward_no   },
              { label:"TP Scheme",value: filedata.tpscheme  },
              { label:"CS No",    value: filedata.cs_no     },
              { label:"B No",     value: filedata.b_no      },
              { label:"OP No",    value: filedata.op_no     },
              { label:"RS No",    value: filedata.rs_no     },
            ].filter(r => r.value?.trim()).map(r => (
              <div key={r.label} style={{ display:"flex", gap:5, fontSize:11 }}>
                <span style={{ color:THEME.brandMid, fontWeight:700, minWidth:60 }}>{r.label}:</span>
                <span style={{ color:THEME.brandDark, fontWeight:600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </InfoTile>
      )}
    </div>
  )}


          <ul className="da-stage-tabs">
            {STAGE_TABS.map((t)=>(
              <li key={t.key}>
                <button className={`da-stage-tab${subactiveTab===t.key?" active":""}`}
                  onClick={()=>{ setSubActiveTab(t.key); handleStageNav(t.key); }}>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Team / date strip ── */}
        <div style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderRadius:14,padding:"14px 20px",marginBottom:14,boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:16,justifyContent:"space-between" }}>
            <div style={{ display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
              {hod && (
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ position:"relative" }}>
                    <AvatarStack src={hod} />
                    <span style={{ position:"absolute",bottom:-4,right:-4,padding:"1px 5px",borderRadius:20,fontSize:8,fontWeight:800,background:THEME.brand,color:"#fff" }}>LEAD</span>
                  </div>
                </div>
              )}
              {teamId && (
                <div>
                  <p style={{ margin:"0 0 4px",fontSize:9,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>Team</p>
                  <AvatarStack src={teamId} />
                </div>
              )}
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
              {[{label:"Start",value:startDate},{label:"End",value:endDate}].map((d)=>(
                <div key={d.label} style={{ background:THEME.bg,border:`1px solid ${THEME.border}`,borderRadius:10,padding:"8px 14px" }}>
                  <p style={{ margin:"0 0 2px",fontSize:10,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>{d.label}</p>
                  <input type="date" value={d.value||""} disabled style={{ border:"none",background:"transparent",fontSize:13,fontWeight:600,color:THEME.text,outline:"none",padding:0 }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content card ── */}
        <div style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
          {/* Sub-tab header */}
          <div style={{ padding:"14px 20px",borderBottom:`1px solid ${THEME.border}`,background:"#FDFAF5",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
            <h2 style={{ margin:0,fontSize:14,fontWeight:800,color:THEME.text,fontFamily:"'Sora',sans-serif" }}>Document Clearance</h2>
            <div className="da-sub-tabs">
              {[{key:"document_collection",label:"Document Collection"},{key:"document_scrutiny",label:"Document Scrutiny"}].map((t)=>(
                <button key={t.key} className={`da-sub-tab${activeTab===t.key?" active":""}`}
                  onClick={()=>setActiveTab(t.key)}>{t.label}</button>
              ))}
            </div>
          </div>

          <div style={{ padding:20 }} className="da-fade">

            {/* ── Document Collection ── */}
            {activeTab==="document_collection" && DOC_TYPES.map((t)=>(
              <CollectionAccordion key={t.key}
                typeKey={t.key}
                label={t.label}
                items={byType(data, t.key)}
                selectedItems={selectedItems}
                onCheck={handleCheckboxChange}
                onSubmit={handleSubmit}
              />
            ))}

            {/* ── Document Scrutiny ── */}
            {activeTab==="document_scrutiny" && DOC_TYPES.map((t)=>(
              <ScrutinyAccordion key={t.key}
                typeKey={t.key}
                label={t.label}
                items={byType(scrutinyData, t.key)}
                files={files}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onRemoveFile={onRemovefiles}
                onRemoveCollection={onRemoveCollection}
                onAddDoc={(type)=>{ setDocumentType(type); setShowModal(true); }}
              />
            ))}
          </div>
        </div>
      </div>

      <DocumentCollectionModal
        show={showModal}
        handleClose={()=>setShowModal(false)}
        documentType={documentType}
        paramsId={id}
        teamId={teamId}
        onSuccess={fetchDocumentdata}
      />
    </>
  );
};

export default DocumentAdd;