// ─────────────────────────────────────────────
//  OutwardDetails.jsx  —  BuildingPermission > Outward Details
//  Brand design — simple 2-section form
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../../services/DateAndTimeService";
import {
  addupdateOutward, OutwardbyID,
  deletecertBuildingletter, deleteapprovalplan,
} from "../../../../config/config";
import { ApprovalRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import S3FileUpload from "../../../../components/S3FileUpload";
import { openFileInNewTab } from "../../../../services/S3Service";


const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @keyframes owFadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
  .ow-fade { animation:owFadeIn 0.22s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes owSpin { to{transform:rotate(360deg)} }

  .ow-input {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ow-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  .ow-file-zone {
    border:2px dashed #D4C4A0;border-radius:10px;padding:10px 14px;background:#FDFAF5;
    font-size:12px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.18s;
  }
  .ow-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .ow-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  .ow-icon-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:6px; }
  .ow-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .ow-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:6px; }
  .ow-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .ow-del-btn:hover svg { stroke:#fff; }

  .ow-btn-primary { padding:10px 24px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .ow-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .ow-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .ow-btn-outline { padding:10px 24px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .ow-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
`;

function FieldLabel({ children }) {
  return <label style={{ display:"block",marginBottom:5,fontSize:11,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>{children}</label>;
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background:THEME.bg,border:`1px solid ${THEME.border}`,borderRadius:12,padding:"16px 18px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
        <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
        <h3 style={{ margin:0,fontSize:12,fontWeight:700,color:THEME.brand,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Sora',sans-serif" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FileField({ label, name, onChange, existingFile, onDelete }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="ow-file-zone">
        <input type="file" name={name} onChange={onChange} />
        <span>📎 {existingFile ? "Replace file…" : "Click to upload…"}</span>
      </div>
      {existingFile && typeof existingFile === "string" && (
        <div style={{ display:"flex",alignItems:"center",gap:4,marginTop:6 }}>
          <span style={{ fontSize:11,color:THEME.textMuted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>✅ File attached</span>
          <button type="button" onClick={() => openFileInNewTab(existingFile, FileUrl)} className="ow-icon-btn" title="View">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button type="button" className="ow-del-btn" title="Delete" onClick={onDelete}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}


function OutwardDetails() {
  const params   = useParams();
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [dataId,          setDataId]          = useState("");
  const [buildingDate,    setbuildingDate]     = useState("");
  const [approveDate,     setApprovalDate]     = useState("");
  const [buildingLetter,  setBuildingLetter]   = useState("");
  const [approvePlan,     setApprovePlan]      = useState("");
  const [buildingLetterCleared, setBuildingLetterCleared] = useState(false);
  const [approvePlanCleared, setApprovePlanCleared] = useState(false);
  const [loading,         setLoading]          = useState(false);

  const fetchoutwardData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, OutwardbyID.method, OutwardbyID.url);
      if (!res.data.error) {
        const D = res.data.data[0];
        setDataId(D.id);
        setbuildingDate(GetDate(D.building_date,"YYYY-MM-DD"));
        setApprovalDate(GetDate(D.approval_date,"YYYY-MM-DD"));
        setBuildingLetter(D.building_letter || "");
        setApprovePlan(D.approval_plan || "");
        setBuildingLetterCleared(false);
        setApprovePlanCleared(false);
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(() => { fetchoutwardData(); }, []);

  const swalDelete = (id, api, refetch) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, api.method, api.url);
        if (!res.data.error) { toast.success(res.data.message); refetch(); }
        else toast.error(res.data.message);
      } catch(e){toast.error("Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: dataId,
      approval_id: params.id,
      building_date: buildingDate,
      approve_date: approveDate,
      building_letter: buildingLetter || "",
      approve_Plan: approvePlan || "",
      building_letter_cleared: buildingLetterCleared ? "true" : "false",
      approval_plan_cleared: approvePlanCleared ? "true" : "false",
    };
    setLoading(true);
    try {
      const res = await ApiService(payload, 0,
        { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" },
        addupdateOutward.method, addupdateOutward.url
      );
      if (!res.data.error) { toast.success("Outward submitted successfully"); fetchoutwardData(); }
      else toast.error(res.data.message);
    } catch(e){toast.error(e?.response?.data?.message||"Something went wrong");}
    finally{setLoading(false);}
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif" }} className="ow-fade">

        {/* Section title */}
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
          <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
          <h3 style={{ margin:0,fontSize:12,fontWeight:700,color:THEME.brand,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Sora',sans-serif" }}>
            Outward Details
          </h3>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20 }}>

            {/* Building Details */}
            <SectionCard title="Building Details">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div>
                  <FieldLabel>Building Permission Date</FieldLabel>
                  <input type="date" className="ow-input" value={buildingDate}
                    onChange={e=>setbuildingDate(e.target.value)} />
                </div>
                <S3FileUpload
                  label="Building Permission Letter"
                  folder="approval/building/outward"
                  value={buildingLetter}
                  onChange={(url) => {
                    setBuildingLetter(url);
                    setBuildingLetterCleared(false);
                  }}
                  onRemove={() => {
                    if (dataId && buildingLetter) {
                      swalDelete(params.id, deletecertBuildingletter, () => {
                        setBuildingLetter("");
                        setBuildingLetterCleared(true);
                      });
                    } else {
                      setBuildingLetter("");
                      setBuildingLetterCleared(true);
                    }
                  }}
                />
              </div>
            </SectionCard>

            {/* Plan Details */}
            <SectionCard title="Plan Details">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div>
                  <FieldLabel>Approve Plan Date</FieldLabel>
                  <input type="date" className="ow-input" value={approveDate}
                    onChange={e=>setApprovalDate(e.target.value)} />
                </div>
                <S3FileUpload
                  label="Approve Plan"
                  folder="approval/building/outward"
                  value={approvePlan}
                  onChange={(url) => {
                    setApprovePlan(url);
                    setApprovePlanCleared(false);
                  }}
                  onRemove={() => {
                    if (dataId && approvePlan) {
                      swalDelete(params.id, deleteapprovalplan, () => {
                        setApprovePlan("");
                        setApprovePlanCleared(true);
                      });
                    } else {
                      setApprovePlan("");
                      setApprovePlanCleared(true);
                    }
                  }}
                />
              </div>
            </SectionCard>

          </div>

          {/* Actions */}
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10 }}>
            <button type="button" className="ow-btn-outline"
              onClick={()=>navigate(`/${ApprovalRoute.approval_list}`)}>
              Cancel
            </button>
            <button type="submit" className="ow-btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid #ffffff88",borderTopColor:"#fff",display:"inline-block",animation:"owSpin 0.7s linear infinite" }} />
                  Saving…
                </span>
              ) : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default OutwardDetails;