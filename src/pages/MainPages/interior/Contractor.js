import React, { useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";
import { getinteriorContractorbyid, deleteinteriorContractor } from "../../../config/config";
import AddContractorCat from "./Modals/AddContractorCat";
import UpdateContractorCatgoryModal from "./Modals/UpdateContractorCatgoryModal";
import UpdateContractorModal from "./Modals/UpdateContractorModal";
import AddContractorModal from "./Modals/AddContractorModal";


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
  @keyframes ctFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .ct-fade { animation:ctFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ctSpin { to{transform:rotate(360deg)} }
  .ct-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:ctSpin 0.8s linear infinite; }

  .ct-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .ct-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .ct-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .ct-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ct-table tbody tr:hover { background:${THEME.rowHover}; }

  .ct-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .ct-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .ct-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .ct-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }

  .ct-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .ct-acc-header:hover { background:${THEME.brandLight}; }
  .ct-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  .ct-edit-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;margin-right:4px; }
  .ct-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .ct-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .ct-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .ct-del-btn:hover svg { stroke:#fff; }

  .ct-btn-primary { padding:8px 16px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .ct-btn-primary:hover { background:${THEME.brandDark}; }
  .ct-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .ct-btn-sm:hover { background:${THEME.brandDark}; }
`;

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {1:{cls:"approved",label:"Approved"},2:{cls:"rejected",label:"Rejected"},0:{cls:"pending",label:"Pending"}}[status] ?? {cls:"pending",label:"Pending"};
  return <span className={`ct-badge ${cfg.cls}`}><span style={{ width:5,height:5,borderRadius:"50%",background:"currentColor" }} />{cfg.label}</span>;
}

function EditBtn({ onClick }) {
  return (
    <button className="ct-edit-btn" onClick={onClick} title="Edit">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  );
}

function DelBtn({ onClick }) {
  return (
    <button className="ct-del-btn" onClick={onClick} title="Delete">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
//  CONTRACTOR ACCORDION
// ─────────────────────────────────────────────
const ContractorAccordion = memo(({ groupName, data, onEditCat, onEditItem, onDeleteItem, onAdd }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border:`1px solid ${THEME.border}`,borderRadius:12,marginBottom:12,overflow:"hidden" }}>
      <div className={`ct-acc-header${open?" open":""}`} onClick={() => setOpen(v=>!v)}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <svg style={{ transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0)",flexShrink:0 }}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          <span style={{ fontSize:13,fontWeight:700,color:THEME.text }}>{groupName}</span>
          <span style={{ padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:THEME.brandLight,color:THEME.brandDark,border:`1px solid #D4C4A0` }}>
            ₹{data.totalPrice?.toLocaleString?.() ?? data.totalPrice}
          </span>
          <span style={{ padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:"#F0F5FF",color:"#2F54EB",border:"1px solid #ADC6FF" }}>
            {data.items.length} item{data.items.length!==1?"s":""}
          </span>
        </div>
        <button className="ct-edit-btn" style={{ fontSize:10 }}
          onClick={(e)=>{e.stopPropagation();onEditCat(data.items[0]?.mst_id);}}>
          ✏️
        </button>
      </div>

      {open && (
        <div style={{ overflowX:"auto" }}>
          <table className="ct-table">
            <thead>
              <tr>
                <th>#</th><th>Vendor</th><th>Mobile No.</th>
                <th>Amount</th><th>Remark</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length===0 ? (
                <tr><td colSpan={7} style={{ textAlign:"center",color:THEME.textLight,padding:20 }}>No contractors added.</td></tr>
              ) : data.items.map((item,idx)=>(
                <tr key={item.id}>
                  <td style={{ color:THEME.textMuted,fontWeight:700,width:36 }}>{idx+1}</td>
                  <td style={{ fontWeight:600 }}>{item.vendors}</td>
                  <td>{item.mobile_no}</td>
                  <td style={{ fontWeight:700,color:THEME.brandDark }}>₹{item.price}</td>
                  <td style={{ color:THEME.textMuted,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                    {item.remark||"—"}
                  </td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {item.status===0 && (
                      <>
                        <EditBtn onClick={(e)=>{e.stopPropagation();onEditItem(item.acid);}} />
                        <DelBtn onClick={(e)=>{e.stopPropagation();onDeleteItem(item.acid);}} />
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:"10px 16px",display:"flex",justifyContent:"flex-end",borderTop:`1px solid ${THEME.border}` }}>
            <button className="ct-btn-sm" onClick={()=>onAdd(data.items[0]?.mst_id)}>+ Add</button>
          </div>
        </div>
      )}
    </div>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function Contractor() {
  const params = useParams();
  const header = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [catgeoryData,         setCatgeoryData]         = useState({});
  const [loading,              setLoading]              = useState(false);
  const [showModal,            setShowModal]            = useState(false);
  const [showContractModal,    setShowContractcatModal] = useState(false);
  const [showContractorModal,  setShowContractorModal]  = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [catgeoryId,           setCatgeoryId]           = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, getinteriorContractorbyid.method, getinteriorContractorbyid.url);
      if (!res.data.error) {
        const grouped = (res.data.data||[]).reduce((acc, item) => {
          const cat = item.name ?? "uncategorized";
          if (!acc[cat]) acc[cat] = { items:[], totalPrice:0 };
          acc[cat].items.push(item);
          acc[cat].totalPrice += item.price||0;
          return acc;
        }, {});
        setCatgeoryData(grouped);
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  };

  useEffect(() => { fetchData(); }, [params.id]);

  const onRemoveContractor = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, deleteinteriorContractor.method, deleteinteriorContractor.url);
        if (!res.data.error) { toast.success(res.data.message); fetchData(); }
        else toast.error(res.data.message);
      } catch(e){toast.error(e?.response?.data?.message||"Something went wrong");}
      finally{setLoading(false);}
    });
  };

  const categories = Object.entries(catgeoryData).filter(([g,d])=>g.trim()&&d.items.length>0);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif" }}>

        {/* ── Section header ── */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
            <h3 style={{ margin:0,fontSize:13,fontWeight:700,color:THEME.text }}>Contractors</h3>
            <span style={{ padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:THEME.brandLight,color:THEME.brandDark,border:`1px solid #D4C4A0` }}>
              {categories.length} categor{categories.length!==1?"ies":"y"}
            </span>
          </div>
          <button className="ct-btn-primary" onClick={()=>setShowModal(true)}>+ Add Category</button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:12 }}>
            <div className="ct-spinner"/><p style={{ color:THEME.textLight,fontSize:13,margin:0 }}>Loading…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && categories.length===0 && (
          <div style={{ textAlign:"center",padding:"40px 0" }}>
            <div style={{ fontSize:36,marginBottom:8 }}>🏗️</div>
            <p style={{ color:THEME.textLight,fontSize:13,margin:"0 0 12px" }}>No contractor categories yet.</p>
            
          </div>
        )}

        {/* ── Category accordions ── */}
        {!loading && categories.map(([groupName,d])=>(
          <ContractorAccordion key={groupName}
            groupName={groupName}
            data={d}
            onEditCat={(id)=>{setCatgeoryId(id);setShowContractcatModal(true);}}
            onEditItem={(id)=>{setCatgeoryId(id);setShowContractorModal(true);}}
            onDeleteItem={onRemoveContractor}
            onAdd={(id)=>{setCatgeoryId(id);setShowAddContractModal(true);}}
          />
        ))}
      </div>

      {/* ── Modals ── */}
      <AddContractorCat
        show={showModal}
        handleClose={()=>setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <UpdateContractorCatgoryModal
        show={showContractModal}
        handleClose={()=>setShowContractcatModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <UpdateContractorModal
        show={showContractorModal}
        handleClose={()=>setShowContractorModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <AddContractorModal
        show={showAddContractModal}
        handleClose={()=>setShowAddContractModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
    </>
  );
}

export default Contractor;