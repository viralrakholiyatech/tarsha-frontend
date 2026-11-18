import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import {} from /* all your route/role config imports */ "../config/RouteConfig";
import { adminKey, empKey, subadmin, HoD } from "../config/RoleConfig";
import RequireAuth from "../services/RequireAuth";
import Wrapper from "../components/Wrapper";
import Login from "../pages/Auth/Login";
import NotFound from "../pages/Auth/NotFound";

// ✅ Only eager-load critical above-the-fold pages
import Dashboard from "../pages/Dashboard/Dashboard";

import {
  CustRoute,
  clientRoute,
  dashboard,
  DepositExpenseRoute,
  elements,
  EmpRoute,
  FileExpenseRoute,
  FilesRoute,
  LeaveRoute,
  OfficeExpenseRoute,
  profile_details,
  ProjectRoute,
  ArchitectureRoute,
  SearchRoute,
  TodosRoute,
  SiteRoute,
  ApprovalRoute,
  VillageRoute,
  TpschemeRoute,
  AttendanceRoute,
  MeetingRoute,
  InteriorRoute,
  TentativeRoute,
  InwardRoute,
  OutwardRoute,
  ShiftRoute,
  CampaignRoute,
  PostRoute,
  LeadsRoute,
  LocationRoute,
  PaymentRoute,
  VendorRoute,
  LedgerRoute,
  ReceiptRoute,
  PmsRoute,
  CityRoute,
  WorkflowRoute,
} from "../config/RouteConfig";

// ✅ Lazy load everything else
const SuperAdminLogin = lazy(() => import("../pages/SuperAdmin/SuperAdminLogin"));
const SuperAdminDashboard = lazy(() => import("../pages/SuperAdmin/SuperAdminDashboard"));

const ListFile = lazy(() => import("../pages/MainPages/file/List"));
const EditFile = lazy(() => import("../pages/MainPages/file/Edit"));
const AddFile = lazy(() => import("../pages/MainPages/file/Add"));
const ListFileOnline = lazy(
  () => import("../pages/MainPages/file/ListOnlineProcess"),
);
const ListFileOffline = lazy(
  () => import("../pages/MainPages/file/ListOfflineProcess"),
);
const ListFileApproved = lazy(
  () => import("../pages/MainPages/file/ListApproved"),
);
const ListFileReject = lazy(() => import("../pages/MainPages/file/ListReject"));
const ListFileBuc = lazy(() => import("../pages/MainPages/file/ListBUC"));
const ListTodoOfFile = lazy(
  () => import("../pages/MainPages/file/ListTodoOfFile"),
);
const Details = lazy(
  () => import("../pages/MainPages/file/FileDetails/Details"),
);
const ListExpense = lazy(() => import("../pages/MainPages/file/ListExpense"));
const GenerateFileExpensePdf = lazy(
  () => import("../pages/MainPages/file/GenerateFileExpensePdf"),
);

const ListEmp = lazy(() => import("../pages/MainPages/employee/List"));
const EditEmp = lazy(() => import("../pages/MainPages/employee/Edit"));
const AddEmp = lazy(() => import("../pages/MainPages/employee/Add"));
const TeamExpenseReport = lazy(
  () => import("../pages/MainPages/employee/TeamExpenseReport"),
);
const Profile = lazy(
  () => import("../pages/MainPages/employee/TeamProfileDetails/profile"),
);
const EditProfile = lazy(
  () => import("../pages/MainPages/employee/EditProfile"),
);
const TeamProfile = lazy(
  () => import("../pages/MainPages/employee/TeamProfileDetails/List"),
);
const TeamExportReportPdf = lazy(
  () => import("../pages/MainPages/employee/TeamExportReportPdf"),
);

const HrProfile = lazy(
  () => import("../pages/MainPages/employee/TeamProfileDetails/HrProfile"),
);
const EmpMeetingView = lazy(
  () => import("../pages/MainPages/employee/TeamProfileDetails/EmpMeetingView"),
);

const ListCustomer = lazy(() => import("../pages/MainPages/customer/List"));
const AddCustomer = lazy(() => import("../pages/MainPages/customer/Add"));
const EditCustomer = lazy(() => import("../pages/MainPages/customer/Edit"));

const FileExpense = lazy(() => import("../pages/MainPages/file_expense/List"));
const AddFileExpense = lazy(
  () => import("../pages/MainPages/file_expense/Add"),
);
const EditFileExpense = lazy(
  () => import("../pages/MainPages/file_expense/Edit"),
);
const PreviewFileExpense = lazy(
  () => import("../pages/MainPages/file_expense/PreviewFileExpense"),
);

const OfficeExpense = lazy(
  () => import("../pages/MainPages/office_expense/List"),
);
const AddOfficeExpense = lazy(
  () => import("../pages/MainPages/office_expense/Add"),
);
const EditOfficeExpense = lazy(
  () => import("../pages/MainPages/office_expense/Edit"),
);
const PreviewOfficeExpense = lazy(
  () => import("../pages/MainPages/office_expense/PreviewOfficeExpense"),
);

const DepositList = lazy(
  () => import("../pages/MainPages/deposit_expense/List"),
);
const DepositAdd = lazy(() => import("../pages/MainPages/deposit_expense/Add"));
const DepositEdit = lazy(
  () => import("../pages/MainPages/deposit_expense/Edit"),
);

const ListTodo = lazy(() => import("../pages/MainPages/Todo/ListTodo"));
const EditTodo = lazy(() => import("../pages/MainPages/Todo/EditTodo"));
const AddTodo = lazy(() => import("../pages/MainPages/Todo/AddTodo"));
const PreviewTodo = lazy(() => import("../pages/MainPages/Todo/PreviewTodo"));
const MarkTodoForm = lazy(() => import("../pages/MainPages/Todo/MarkTodoForm"));
const HodPreviewTodo = lazy(
  () => import("../pages/MainPages/Todo/HodPreviewTodo"),
);

const ListLeave = lazy(() => import("../pages/MainPages/Leaves/List"));
const AddLeave = lazy(() => import("../pages/MainPages/Leaves/Add"));
const EditLeave = lazy(() => import("../pages/MainPages/Leaves/Edit"));
const ListofTeamLeave = lazy(
  () => import("../pages/MainPages/Leaves/ListofTeam"),
);
const PreviewLeave = lazy(() => import("../pages/MainPages/Leaves/Preview"));

const ListSite = lazy(() => import("../pages/MainPages/SiteInspection/List"));
const AddSite = lazy(() => import("../pages/MainPages/SiteInspection/Add"));
const EditSite = lazy(() => import("../pages/MainPages/SiteInspection/Edit"));
const Emplist = lazy(() => import("../pages/MainPages/SiteInspection/EmpList"));
const Previewlist = lazy(
  () => import("../pages/MainPages/SiteInspection/Preview"),
);

const VillageList = lazy(() => import("../pages/MainPages/Village/list"));
const CityList = lazy(() => import("../pages/MainPages/city/List"));
const TpschemeList = lazy(() => import("../pages/MainPages/Tpscheme/List"));

const ApprovalList = lazy(
  () => import("../pages/MainPages/Approval_process/ApprovalList"),
);
const ApprovalProcess_list = lazy(
  () => import("../pages/MainPages/Approval_process/ApprovalProcess_list"),
);
const AddApproval = lazy(
  () => import("../pages/MainPages/Approval_process/Add"),
);
const DocumentAdd = lazy(
  () => import("../pages/MainPages/Approval_process/Documentclearance_add"),
);
const PvList = lazy(
  () => import("../pages/MainPages/Approval_process/Pv_list"),
);
const PvAdd = lazy(() => import("../pages/MainPages/Approval_process/Pv_add"));
const Fire_noc_add = lazy(
  () => import("../pages/MainPages/Approval_process/Fire_noc_add"),
);
const E_nagar_portalAdd = lazy(
  () => import("../pages/MainPages/Approval_process/E_nagar_portalAdd"),
);
const BuildingPermission_add = lazy(
  () => import("../pages/MainPages/Approval_process/BuildingPermission_add"),
);
const ApprovalSiteVisit = lazy(
  () => import("../pages/MainPages/Approval_process/SiteVisit"),
);

const AttendanceList = lazy(() => import("../pages/MainPages/Attendance/List"));
const EmpAttendanceList = lazy(
  () => import("../pages/MainPages/Attendance/EmpAttendanceList"),
);
const MapShowComponent = lazy(
  () => import("../pages/MainPages/Attendance/MapShowComponent"),
);
const MintuesMapShow = lazy(
  () => import("../pages/MainPages/Attendance/MintuesMapShow"),
);
const LeaveApprove = lazy(
  () => import("../pages/MainPages/Attendance/LeaveApprove"),
);
const MonthData = lazy(() => import("../pages/MainPages/Attendance/MonthData"));

const MasterOpeartionalList = lazy(
  () => import("../pages/MainPages/Meeting/MasterOperationalList"),
);
const MasterTacticalList = lazy(
  () => import("../pages/MainPages/Meeting/MasterTacticalList"),
);
const MasterStategicList = lazy(
  () => import("../pages/MainPages/Meeting/MasterStrategicList"),
);
const OperationView = lazy(
  () => import("../pages/MainPages/Meeting/OperationView"),
);
const PerformanceList = lazy(
  () => import("../pages/MainPages/Meeting/PerformanceList"),
);
const TacticalPerformanceList = lazy(
  () => import("../pages/MainPages/Meeting/TacticalPerformanceList"),
);
const TacticalView = lazy(
  () => import("../pages/MainPages/Meeting/TacticalView"),
);
const StrategicPerformanceList = lazy(
  () => import("../pages/MainPages/Meeting/StrategicPerformanceList"),
);
const StrategicView = lazy(
  () => import("../pages/MainPages/Meeting/StrategicView"),
);
const TopPerformer = lazy(
  () => import("../pages/MainPages/Meeting/TopPerformer"),
);
const AddTeam = lazy(() => import("../pages/MainPages/Meeting/AddTeam"));

const MasterList = lazy(() => import("../pages/MainPages/interior/MasterList"));
const BasicDetails = lazy(
  () => import("../pages/MainPages/interior/BasicDetails"),
);
const StudyRnd = lazy(() => import("../pages/MainPages/interior/StudyRnd"));
const Quation = lazy(() => import("../pages/MainPages/interior/Quation"));
const EditInterior = lazy(
  () => import("../pages/MainPages/interior/EditInterior"),
);
const Concept = lazy(() => import("../pages/MainPages/interior/Concept"));
const TechnicalDrawing = lazy(
  () => import("../pages/MainPages/interior/TechnicalDrawing"),
);
const Schedule = lazy(() => import("../pages/MainPages/interior/Schedule"));
const RiskMatrix = lazy(() => import("../pages/MainPages/interior/RiskMatrix"));
const Consultants = lazy(
  () => import("../pages/MainPages/interior/Consultant"),
);
const InteriorSiteVisit = lazy(
  () => import("../pages/MainPages/interior/SiteVisit"),
);

const ArchitectureBasicDetail = lazy(
  () => import("../pages/MainPages/Architecture/BasicDetail"),
);
const ArchitectureDrawing = lazy(
  () => import("../pages/MainPages/Architecture/Drawing"),
);
const ArchitectureStudy = lazy(
  () => import("../pages/MainPages/Architecture/Study"),
);
const ArchitectureConsultants = lazy(
  () => import("../pages/MainPages/Architecture/Consultants"),
);
const ArchitectureQuotation = lazy(
  () => import("../pages/MainPages/Architecture/Quotation"),
);
const ArchitectureDocuments = lazy(
  () => import("../pages/MainPages/Architecture/Documents"),
);
const ArchitectureMaterial = lazy(
  () => import("../pages/MainPages/Architecture/Material"),
);
const ArchitectureSchedule = lazy(
  () => import("../pages/MainPages/Architecture/Schedule"),
);
const ArchitectureRiskMatrix = lazy(
  () => import("../pages/MainPages/Architecture/RiskMatrix"),
);
const MstList = lazy(() => import("../pages/MainPages/Architecture/MstList"));
const EditArchitecture = lazy(
  () => import("../pages/MainPages/Architecture/EditArchitecture"),
);
const ArchitectureSiteVisit = lazy(
  () => import("../pages/MainPages/Architecture/SiteVisit"),
);

const TentativeList = lazy(() => import("../pages/MainPages/Tentative/List"));
const EditTentative = lazy(() => import("../pages/MainPages/Tentative/Edit"));
const InwardList = lazy(() => import("../pages/MainPages/Inward/List"));
const AddInward = lazy(() => import("../pages/MainPages/Inward/Add"));
const OutwardList = lazy(() => import("../pages/MainPages/outward/List"));
const AddOutward = lazy(() => import("../pages/MainPages/outward/Add"));
const ShiftList = lazy(() => import("../pages/MainPages/Shift/List"));

const CampaignList = lazy(() => import("../pages/MainPages/Campaign/List"));
const AddCampaign = lazy(() => import("../pages/MainPages/Campaign/Add"));
const CampaignDetail = lazy(() => import("../pages/MainPages/Campaign/Detail"));

const AddPost = lazy(() => import("../pages/MainPages/post/AddPost"));
const PostList = lazy(() => import("../pages/MainPages/post/List"));
const EmpPostList = lazy(() => import("../pages/MainPages/post/EmpList"));
const EditPost = lazy(() => import("../pages/MainPages/post/Edit"));
const DetailPost = lazy(() => import("../pages/MainPages/post/Detail"));

const LeadsList = lazy(() => import("../pages/MainPages/Leads/LeadsList"));
const EmpLeadsList = lazy(() => import("../pages/MainPages/Leads/EmpList"));
const DetailLeads = lazy(() => import("../pages/MainPages/Leads/Detail"));

const PaymentCategoryList = lazy(
  () => import("../pages/MainPages/payments/CatgoryList"),
);
const IncExpReport = lazy(
  () => import("../pages/MainPages/payments/MonthlyReport"),
);
const PaymentAdd = lazy(() => import("../pages/MainPages/payments/Add"));
const PaymentEdit = lazy(() => import("../pages/MainPages/payments/Edit"));

const ReceiptList = lazy(
  () => import("../pages/MainPages/payments/receipts/List"),
);
const ReceiptAdd = lazy(
  () => import("../pages/MainPages/payments/receipts/Add"),
);
const ReceiptEdit = lazy(
  () => import("../pages/MainPages/payments/receipts/Edit"),
);

const PaymentExpenseList = lazy(
  () => import("../pages/MainPages/payments/payment/List"),
);
const PaymentExpenseAdd = lazy(
  () => import("../pages/MainPages/payments/payment/Add"),
);
const PaymentExpenseEdit = lazy(
  () => import("../pages/MainPages/payments/payment/Edit"),
);

const IncomeList = lazy(
  () => import("../pages/MainPages/payments/Escrow/income/List"),
);
const IncomeAdd = lazy(
  () => import("../pages/MainPages/payments/Escrow/income/Add"),
);
const IncomeEdit = lazy(
  () => import("../pages/MainPages/payments/Escrow/income/Edit"),
);

const ExpenseList = lazy(
  () => import("../pages/MainPages/payments/Escrow/expense/List"),
);
const ExpenseAdd = lazy(
  () => import("../pages/MainPages/payments/Escrow/expense/Add"),
);
const ExpenseEdit = lazy(
  () => import("../pages/MainPages/payments/Escrow/expense/Edit"),
);

const EscrowIncExpReport = lazy(
  () => import("../pages/MainPages/payments/Escrow/Report"),
);

// ledger
const LedgerGroupList = lazy(
  () => import("../pages/MainPages/payments/ledger/List"),
);

const VendorList = lazy(() => import("../pages/MainPages/vendor/List"));

const Location = lazy(() => import("../pages/MainPages/location/Location"));
const Search = lazy(() => import("../components/Search"));

// pms

const PmsList = lazy(() => import("../pages/MainPages/pms/List"));

// workflow
const Workflow = lazy(() => import("../pages/MainPages/Workflow/Workflow"));

// ✅ Single reusable fallback
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#F8F5F0",
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@500;600&display=swap');

      @keyframes pl-draw {
        0%   { stroke-dashoffset: 320; opacity: 0.3; }
        60%  { stroke-dashoffset: 0;   opacity: 1; }
        100% { stroke-dashoffset: 0;   opacity: 1; }
      }
      @keyframes pl-fill {
        0%, 55% { fill-opacity: 0; }
        100%    { fill-opacity: 1; }
      }
      @keyframes pl-rise {
        0%   { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes pl-bar {
        0%   { width: 0%; }
        20%  { width: 15%; }
        50%  { width: 55%; }
        75%  { width: 78%; }
        90%  { width: 90%; }
        100% { width: 97%; }
      }
      @keyframes pl-pulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.4; }
      }
      @keyframes pl-shimmer {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }

      .pl-logo-path {
        stroke-dasharray: 320;
        stroke-dashoffset: 320;
        fill-opacity: 0;
        animation:
          pl-draw 1.2s cubic-bezier(0.4,0,0.2,1) 0.1s forwards,
          pl-fill 1.4s ease 0.1s forwards;
      }
      .pl-logo-path-2 {
        stroke-dasharray: 320;
        stroke-dashoffset: 320;
        fill-opacity: 0;
        animation:
          pl-draw 1.2s cubic-bezier(0.4,0,0.2,1) 0.3s forwards,
          pl-fill 1.4s ease 0.3s forwards;
      }
      .pl-logo-path-3 {
        stroke-dasharray: 320;
        stroke-dashoffset: 320;
        fill-opacity: 0;
        animation:
          pl-draw 1.2s cubic-bezier(0.4,0,0.2,1) 0.5s forwards,
          pl-fill 1.4s ease 0.5s forwards;
      }
      .pl-title {
        opacity: 0;
        animation: pl-rise 0.6s ease 1s forwards;
      }
      .pl-subtitle {
        opacity: 0;
        animation: pl-rise 0.6s ease 1.15s forwards;
      }
      .pl-bar-track {
        opacity: 0;
        animation: pl-rise 0.4s ease 1.2s forwards;
      }
      .pl-bar-fill {
        animation: pl-bar 3.5s cubic-bezier(0.4,0,0.2,1) 1.3s forwards;
      }
      .pl-dot {
        animation: pl-pulse 1.4s ease-in-out infinite;
      }
      .pl-dot:nth-child(2) { animation-delay: 0.2s; }
      .pl-dot:nth-child(3) { animation-delay: 0.4s; }
      .pl-shimmer {
        animation: pl-shimmer 1.8s ease-in-out infinite;
      }
    `}</style>

    {/* ── Animated architectural logo mark ── */}
    <div style={{ marginBottom: 28 }}>
      <svg
        width="90"
        height="90"
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle
          cx="45"
          cy="45"
          r="42"
          stroke="#EDE5D5"
          strokeWidth="1.5"
          fill="#FEFCF9"
        />

        {/* Building / architectural mark — 3 layered shapes */}

        {/* Base platform */}
        <path
          className="pl-logo-path"
          d="M20 66 H70"
          stroke="#C4A97D"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left column */}
        <path
          className="pl-logo-path"
          d="M28 66 V38 H36 V66"
          stroke="#887549"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="#F5F0E8"
        />

        {/* Right column */}
        <path
          className="pl-logo-path-2"
          d="M54 66 V38 H62 V66"
          stroke="#887549"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="#F5F0E8"
        />

        {/* Central tower */}
        <path
          className="pl-logo-path-2"
          d="M38 66 V30 H52 V66"
          stroke="#5C4E32"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="#EDE5D5"
        />

        {/* Roof / pediment triangle */}
        <path
          className="pl-logo-path-3"
          d="M22 38 L45 20 L68 38 Z"
          stroke="#887549"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="#F5F0E8"
        />

        {/* Door cutout on central tower */}
        <path
          className="pl-logo-path-3"
          d="M42 66 V54 Q42 50 45 50 Q48 50 48 54 V66"
          stroke="#887549"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="#C4A97D"
        />

        {/* Inner accent — window dots */}
        <circle
          className="pl-logo-path-3"
          cx="32"
          cy="50"
          r="2"
          fill="#C4A97D"
          stroke="none"
        />
        <circle
          className="pl-logo-path-3"
          cx="58"
          cy="50"
          r="2"
          fill="#C4A97D"
          stroke="none"
        />
        <circle
          className="pl-logo-path-3"
          cx="32"
          cy="58"
          r="2"
          fill="#C4A97D"
          stroke="none"
        />
        <circle
          className="pl-logo-path-3"
          cx="58"
          cy="58"
          r="2"
          fill="#C4A97D"
          stroke="none"
        />

        {/* Crown accent line */}
        <path
          className="pl-logo-path-3"
          d="M36 38 H54"
          stroke="#C4A97D"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>

    {/* ── Brand name ── */}
    <h1
      className="pl-title"
      style={{
        margin: "0 0 4px",
        fontFamily: "'Sora', sans-serif",
        fontSize: 22,
        fontWeight: 800,
        color: "#1A1A2E",
        letterSpacing: "-0.3px",
      }}
    >
      Zaid Excel<span style={{ color: "#887549" }}>Design</span>
    </h1>

    <p
      className="pl-subtitle"
      style={{
        margin: "0 0 28px",
        fontSize: 11,
        fontWeight: 600,
        color: "#ADADAD",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
      }}
    >
      Architecture & Design
    </p>

    {/* ── Progress bar ── */}
    <div
      className="pl-bar-track"
      style={{
        width: 200,
        height: 3,
        borderRadius: 10,
        background: "#EDE5D5",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        className="pl-bar-fill"
        style={{
          height: "100%",
          width: "0%",
          borderRadius: 10,
          background: "#887549",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* shimmer sweep */}
        <div
          className="pl-shimmer"
          style={{
            position: "absolute",
            inset: 0,
            width: "30%",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          }}
        />
      </div>
    </div>

    {/* ── Loading dots ── */}
    <div
      style={{
        display: "flex",
        gap: 5,
        marginTop: 18,
        alignItems: "center",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="pl-dot"
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: i === 1 ? "#887549" : "#C4A97D",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  </div>
);

const Application = () => {
  process.env.TZ = "Asia/Culcutta";
  return (
    // ✅ Wrap ALL routes in a single Suspense
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* ─── Super Admin Routes ─── */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${dashboard.list}`}
            element={
              <Wrapper headerTitle={"Dashboard"} children={<Dashboard />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.list}`}
            element={<Wrapper children={<ListFile />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.listFileOnline}`}
            element={
              <Wrapper
                headerTitle={"File (Online Process)"}
                children={<ListFileOnline />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.listFileOffline}`}
            element={
              <Wrapper
                headerTitle={"File (Offline Process)"}
                children={<ListFileOffline />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.listFileBuc}`}
            element={
              <Wrapper headerTitle={"File (BUC)"} children={<ListFileBuc />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.file_todos}/:id`}
            element={
              <Wrapper
                headerTitle={"File Todos"}
                children={<ListTodoOfFile />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.listFileApproved}`}
            element={
              <Wrapper
                headerTitle={"File (Approved)"}
                children={<ListFileApproved />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.listFileReject}`}
            element={
              <Wrapper
                headerTitle={"File (Reject)"}
                children={<ListFileReject />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${FilesRoute.listFileExpense}/:id`}
            element={
              <Wrapper
                headerTitle={"File Expense"}
                children={<ListExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${FilesRoute.file_expense_pdf}/:id`}
            element={<GenerateFileExpensePdf />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.add}`}
            element={
              <Wrapper headerTitle={"Add File"} children={<AddFile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Edit File"} children={<EditFile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FilesRoute.fileDetail}/:id`}
            element={
              <Wrapper headerTitle={"File Details"} children={<Details />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${EmpRoute.list}`}
            element={<Wrapper headerTitle={"Teams"} children={<ListEmp />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${EmpRoute.deposit_expense_report}/:id`}
            element={
              <Wrapper
                headerTitle={"Team Expense Report"}
                children={<TeamExpenseReport />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`${EmpRoute.deposit_expense_report_pdf}/:id`}
            element={<TeamExportReportPdf />}
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`${EmpRoute.hrprofile}/:id`}
            element={
              <Wrapper headerTitle={"HR Profile"} children={<HrProfile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`${EmpRoute.team_profile_details}/:id`}
            element={
              <Wrapper headerTitle={"Team Profile"} children={<Profile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${EmpRoute.EditProfile}/:id`}
            element={
              <Wrapper headerTitle={"Profile"} children={<EditProfile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${EmpRoute.teamprofile}/:id`}
            element={
              <Wrapper headerTitle={"Profile"} children={<TeamProfile />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${EmpRoute.add}`}
            element={<Wrapper headerTitle={"Add Team"} children={<AddEmp />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${EmpRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Edit Team"} children={<EditEmp />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${CustRoute.list}`}
            element={
              <Wrapper headerTitle={"Clients"} children={<ListCustomer />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${CustRoute.add}`}
            element={
              <Wrapper headerTitle={"Add Client"} children={<AddCustomer />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${CustRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Client"}
                children={<EditCustomer />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${DepositExpenseRoute.list}`}
            element={
              <Wrapper headerTitle={"Deposit"} children={<DepositList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${DepositExpenseRoute.add}`}
            element={
              <Wrapper headerTitle={"Add Deposit"} children={<DepositAdd />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${DepositExpenseRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Deposit"}
                children={<DepositEdit />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FileExpenseRoute.list}`}
            element={
              <Wrapper
                headerTitle={"File Expenses"}
                children={<FileExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FileExpenseRoute.list}/:id`}
            element={
              <Wrapper
                headerTitle={"File Expenses"}
                children={<FileExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FileExpenseRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit File Expense"}
                children={<EditFileExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FileExpenseRoute.add}`}
            element={
              <Wrapper
                headerTitle={"Add File Expense"}
                children={<AddFileExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${FileExpenseRoute.preview}/:id`}
            element={
              <Wrapper
                headerTitle={"Preview File Expense"}
                children={<PreviewFileExpense />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OfficeExpenseRoute.list}`}
            element={
              <Wrapper
                headerTitle={"Office Expense"}
                children={<OfficeExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OfficeExpenseRoute.add}`}
            element={
              <Wrapper
                headerTitle={"Add Office Expense"}
                children={<AddOfficeExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OfficeExpenseRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Office Expense"}
                children={<EditOfficeExpense />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OfficeExpenseRoute.preview}/:id`}
            element={
              <Wrapper
                headerTitle={"Preview Office Expense"}
                children={<PreviewOfficeExpense />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, subadmin]} />}>
          <Route
            path={`/${TodosRoute.add}`}
            element={
              <Wrapper headerTitle={"Add Todo"} children={<AddTodo />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, subadmin]} />}>
          <Route
            path={`/${TodosRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Edit Todo"} children={<EditTodo />} />
            }
          />
        </Route>
        <Route
          element={<RequireAuth accessible={[adminKey, empKey, subadmin]} />}
        >
          <Route
            path={`/${TodosRoute.list}`}
            element={<Wrapper headerTitle={"Todos"} children={<ListTodo />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, subadmin]} />}>
          <Route
            path={`/${TodosRoute.reviewtodo}/:id`}
            element={
              <Wrapper headerTitle={"Review Todo"} children={<PreviewTodo />} />
            }
          />
          <Route
            path={`/${TodosRoute.hodreviewtodo}/:id`}
            element={
              <Wrapper
                headerTitle={"HOD Review Todo"}
                children={<HodPreviewTodo />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${TodosRoute.markTodo}/:id`}
            element={
              <Wrapper headerTitle={"Mark Todo"} children={<MarkTodoForm />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${SearchRoute.list}/:key`}
            element={
              <Wrapper headerTitle={"Search Result"} children={<Search />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${LeaveRoute.list}`}
            element={
              <Wrapper headerTitle={"Leaves"} children={<ListLeave />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${LeaveRoute.add}`}
            element={
              <Wrapper headerTitle={"Add Leave"} children={<AddLeave />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${LeaveRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Edit Leave"} children={<EditLeave />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${LeaveRoute.listLeaveOfTeam}/:id`}
            element={
              <Wrapper
                headerTitle={"Leaves (Team)"}
                children={<ListofTeamLeave />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${LeaveRoute.previewLeave}/:id`}
            element={
              <Wrapper
                headerTitle={"Team Preview Leave"}
                children={<PreviewLeave />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.basicdetails}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureBasicDetail />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.drawing}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureDrawing />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.study}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureStudy />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.consultants}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureConsultants />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.quotation}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureQuotation />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.documents}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureDocuments />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.material}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureMaterial />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.schedule}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureSchedule />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.riskMatrix}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureRiskMatrix />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.sitevisit}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<ArchitectureSiteVisit />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.list}`}
            element={
              <Wrapper headerTitle={"Architecture"} children={<MstList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ArchitectureRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Architecture"}
                children={<EditArchitecture />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${SiteRoute.list}`}
            element={
              <Wrapper
                headerTitle={"Site-Inspection"}
                children={<ListSite />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${SiteRoute.add}`}
            element={
              <Wrapper headerTitle={"Site-Inspection"} children={<AddSite />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${SiteRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Site-Inspection"}
                children={<EditSite />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${SiteRoute.emplist}`}
            element={
              <Wrapper headerTitle={"Site-Inspection"} children={<Emplist />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${SiteRoute.preview}/:id`}
            element={
              <Wrapper
                headerTitle={"Site-Inspection"}
                children={<Previewlist />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.add}`}
            element={
              <Wrapper
                headerTitle={"Add Approval Process"}
                children={<AddApproval />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${VillageRoute.list}`}
            element={
              <Wrapper headerTitle={"Village"} children={<VillageList />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${CityRoute.list}`}
            element={<Wrapper headerTitle={"City"} children={<CityList />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${TpschemeRoute.list}`}
            element={
              <Wrapper headerTitle={"TP Scheme"} children={<TpschemeList />} />
            }
          />
        </Route>

        {/* ✅ Changed to adminKey + empKey so emp can access Edit */}
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ApprovalRoute.approval_list}`}
            element={
              <Wrapper
                headerTitle={"Approval Process"}
                children={<ApprovalList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.document_add}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval Process"}
                children={<DocumentAdd />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval Process"}
                children={<DocumentAdd />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.pv_list}`}
            element={
              <Wrapper headerTitle={"Approval Process"} children={<PvList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.pv_add}/:id`}
            element={
              <Wrapper headerTitle={"Approval Process"} children={<PvAdd />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.fire_noc_add}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval process"}
                children={<Fire_noc_add />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.e_nagar_portal_add}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval process"}
                children={<E_nagar_portalAdd />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ApprovalRoute.buildingpermissionadd}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval process"}
                children={<BuildingPermission_add />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ApprovalRoute.sitevisit}/:id`}
            element={
              <Wrapper
                headerTitle={"Approval process"}
                children={<ApprovalSiteVisit />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${AttendanceRoute.list}`}
            element={
              <Wrapper
                headerTitle={"Attendance"}
                children={<AttendanceList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${AttendanceRoute.emplist}`}
            element={
              <Wrapper
                headerTitle={"Attendance"}
                children={<EmpAttendanceList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${AttendanceRoute.tracklist}`}
            element={
              <Wrapper
                headerTitle={"Attendance"}
                children={<MapShowComponent />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${AttendanceRoute.minuteslist}/:id`}
            element={
              <Wrapper
                headerTitle={"Attendance"}
                children={<MintuesMapShow />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${AttendanceRoute.leavelist}`}
            element={
              <Wrapper headerTitle={"Leave List"} children={<LeaveApprove />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${AttendanceRoute.monthlist}`}
            element={
              <Wrapper headerTitle={"Month List"} children={<MonthData />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.operational_list}`}
            element={
              <Wrapper
                headerTitle={"Meeting"}
                children={<MasterOpeartionalList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.tacticallist}`}
            element={
              <Wrapper
                headerTitle={"Meeting"}
                children={<MasterTacticalList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.strategiclist}`}
            element={
              <Wrapper
                headerTitle={"Meeting"}
                children={<MasterStategicList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.operationalview}`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<OperationView />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.empmeetingview}`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<EmpMeetingView />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.tacticalview}`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<TacticalView />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.startegicperformancelist}/:id`}
            element={
              <Wrapper
                headerTitle={"Meeting"}
                children={<StrategicPerformanceList />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.strategicview}`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<StrategicView />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.topperformer}`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<TopPerformer />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.addteam}`}
            element={<Wrapper headerTitle={"Meeting"} children={<AddTeam />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.performancelist}/:id`}
            element={
              <Wrapper headerTitle={"Meeting"} children={<PerformanceList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${MeetingRoute.tacticalperformancelist}/:id`}
            element={
              <Wrapper
                headerTitle={"Meeting"}
                children={<TacticalPerformanceList />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.list}`}
            element={
              <Wrapper headerTitle={"Interior"} children={<MasterList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.basicdetails}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<BasicDetails />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.study}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<StudyRnd />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.quotation}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<Quation />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<EditInterior />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.concept}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<Concept />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.technicaldrawing}/:id`}
            element={
              <Wrapper
                headerTitle={"Interior"}
                children={<TechnicalDrawing />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.schedule}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<Schedule />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.riskMatrix}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<RiskMatrix />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.consultants}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<Consultants />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InteriorRoute.sitevisit}/:id`}
            element={
              <Wrapper headerTitle={"Interior"} children={<InteriorSiteVisit />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${TentativeRoute.list}`}
            element={
              <Wrapper headerTitle={"Tentative"} children={<TentativeList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${TentativeRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Tentative"}
                children={<EditTentative />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InwardRoute.list}`}
            element={
              <Wrapper headerTitle={"Inward"} children={<InwardList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${InwardRoute.add}`}
            element={
              <Wrapper headerTitle={"Inward"} children={<AddInward />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OutwardRoute.list}`}
            element={
              <Wrapper headerTitle={"Outward"} children={<OutwardList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${OutwardRoute.add}`}
            element={
              <Wrapper headerTitle={"Outward"} children={<AddOutward />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${ShiftRoute.list}`}
            element={<Wrapper headerTitle={"Shift"} children={<ShiftList />} />}
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PaymentRoute.paymentlist}`}
            element={
              <Wrapper
                headerTitle={"Category"}
                children={<PaymentCategoryList />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${PaymentRoute.reports}`}
            element={
              <Wrapper headerTitle={"Reports"} children={<IncExpReport />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PaymentRoute.add}`}
            element={
              <Wrapper headerTitle={"Payments"} children={<PaymentAdd />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PaymentRoute.edit}/:id`}
            element={
              <Wrapper headerTitle={"Payments"} children={<PaymentEdit />} />
            }
          />
        </Route>

        {/* ledger */}

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${LedgerRoute.list}`}
            element={
              <Wrapper
                headerTitle={"Ledger List"}
                children={<LedgerGroupList />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${VendorRoute.list}`}
            element={
              <Wrapper headerTitle={"Vendor"} children={<VendorList />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${CampaignRoute.list}`}
            element={
              <Wrapper headerTitle={"Campaign"} children={<CampaignList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${CampaignRoute.add}`}
            element={
              <Wrapper headerTitle={"Campaign"} children={<AddCampaign />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${CampaignRoute.detail}/:id`}
            element={
              <Wrapper headerTitle={"Campaign"} children={<CampaignDetail />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PostRoute.add}`}
            element={<Wrapper headerTitle={"Post"} children={<AddPost />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${PostRoute.list}`}
            element={<Wrapper headerTitle={"Post"} children={<PostList />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${PostRoute.emplist}`}
            element={
              <Wrapper headerTitle={"Post"} children={<EmpPostList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PostRoute.edit}/:id`}
            element={<Wrapper headerTitle={"Post"} children={<EditPost />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PostRoute.detail}/:id`}
            element={<Wrapper headerTitle={"Post"} children={<DetailPost />} />}
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${LeadsRoute.list}`}
            element={<Wrapper headerTitle={"Leads"} children={<LeadsList />} />}
          />
        </Route>
        <Route element={<RequireAuth accessible={[empKey]} />}>
          <Route
            path={`/${LeadsRoute.emplist}`}
            element={
              <Wrapper headerTitle={"Leads"} children={<EmpLeadsList />} />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${LeadsRoute.detail}/:id`}
            element={
              <Wrapper headerTitle={"Leads"} children={<DetailLeads />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${LocationRoute.location}`}
            element={
              <Wrapper headerTitle={"Location List"} children={<Location />} />
            }
          />
          <Route
            path={`/${LocationRoute.member}`}
            element={
              <Wrapper
                headerTitle={"Live Overview"}
                children={<Location mode="member" />}
              />
            }
          />
          <Route
            path={`/${LocationRoute.team}`}
            element={
              <Wrapper
                headerTitle={"Member History"}
                children={<Location mode="team" />}
              />
            }
          />
        </Route>
        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${ReceiptRoute.list}`}
            element={
              <Wrapper headerTitle={"Receipts"} children={<ReceiptList />} />
            }
          />
          <Route
            path={`/${ReceiptRoute.add}`}
            element={
              <Wrapper headerTitle={"Add Receipt"} children={<ReceiptAdd />} />
            }
          />
          <Route
            path={`/${ReceiptRoute.edit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Receipt"}
                children={<ReceiptEdit />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${PaymentRoute.expense}`}
            element={
              <Wrapper
                headerTitle={" Payment Expense"}
                children={<PaymentExpenseList />}
              />
            }
          />
          <Route
            path={`/${PaymentRoute.addexpense}`}
            element={
              <Wrapper
                headerTitle={"Add  Payment Expense"}
                children={<PaymentExpenseAdd />}
              />
            }
          />
          <Route
            path={`/${PaymentRoute.editexpense}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Payment Expense"}
                children={<PaymentExpenseEdit />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PaymentRoute.escrowIncome}`}
            element={
              <Wrapper headerTitle={"Income"} children={<IncomeList />} />
            }
          />
          <Route
            path={`/${PaymentRoute.escrowincomeAdd}`}
            element={
              <Wrapper headerTitle={"Add Income"} children={<IncomeAdd />} />
            }
          />
          <Route
            path={`/${PaymentRoute.escrowincomeEdit}/:id`}
            element={
              <Wrapper headerTitle={"Edit Income"} children={<IncomeEdit />} />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey]} />}>
          <Route
            path={`/${PaymentRoute.escrowReports}`}
            element={
              <Wrapper
                headerTitle={"Reports"}
                children={<EscrowIncExpReport />}
              />
            }
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PmsRoute.list}`}
            element={<Wrapper headerTitle={"Vendor"} children={<PmsList />} />}
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, subadmin, HoD]} />}>
          <Route
            path={`/${WorkflowRoute.list}`}
            element={<Wrapper headerTitle={"Workflow"} children={<Workflow />} />}
          />
        </Route>

        <Route element={<RequireAuth accessible={[adminKey, empKey]} />}>
          <Route
            path={`/${PaymentRoute.escrowExpense}`}
            element={
              <Wrapper headerTitle={"Expense"} children={<ExpenseList />} />
            }
          />
          <Route
            path={`/${PaymentRoute.escrowexpenseAdd}`}
            element={
              <Wrapper headerTitle={"Add Expense"} children={<ExpenseAdd />} />
            }
          />
          <Route
            path={`/${PaymentRoute.escrowexpenseEdit}/:id`}
            element={
              <Wrapper
                headerTitle={"Edit Expense"}
                children={<ExpenseEdit />}
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default Application;
