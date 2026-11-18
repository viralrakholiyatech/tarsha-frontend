import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminApi } from "./superAdminApi";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminHeader from "./SuperAdminHeader";
import OverviewTab from "./tabs/OverviewTab";
import CompaniesTab from "./tabs/CompaniesTab";
import SubscriptionsTab from "./tabs/SubscriptionsTab";
import DatabasesTab from "./tabs/DatabasesTab";
import CreateCompanyTab from "./tabs/CreateCompanyTab";
import ExtendSubscriptionModal from "./ExtendSubscriptionModal";
import Swal from "sweetalert2";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState("overview");

  // Core Data State
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    expiredCompanies: 0,
    expiringSoon: 0,
    suspendedCompanies: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected company for module configuration
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // Company targeted for subscription extension modal
  const [extendingCompany, setExtendingCompany] = useState(null);

  // Auth Guard
  useEffect(() => {
    if (!superAdminApi.getToken()) {
      navigate("/super-admin/login");
    }
  }, [navigate]);

  // Data Fetching
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, comps] = await Promise.all([
        superAdminApi.getDashboard(),
        superAdminApi.getCompanies(),
      ]);
      if (dash?.data?.summary) setStats(dash.data.summary);
      if (comps?.data) {
        setCompanies(comps.data);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        superAdminApi.logout();
        navigate("/super-admin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Action: Toggle Company Status (Suspend / Activate)
  const handleToggleStatus = async (c) => {
    const action = c.is_active ? "Suspend" : "Activate";
    const result = await Swal.fire({
      title: `${action} Company Access?`,
      text: `This will ${action.toLowerCase()} platform access for ${c.name}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: c.is_active ? "#EF4444" : "#10B981",
      cancelButtonColor: "#64748B",
      confirmButtonText: `Yes, ${action}`,
    });
    if (result.isConfirmed) {
      await superAdminApi.toggleStatus(c.id);
      fetchData();
    }
  };

  // Action: Open Extend Subscription Modal
  const handleExtend = (c) => {
    setExtendingCompany(c);
  };

  // Action: Configure Modules shortcut
  const handleConfigureModules = (c) => {
    setSelectedCompanyId(c.id);
    setActiveTab("subscriptions");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #F8FAFC !important;
          color: #0F172A;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 13px;
          -webkit-font-smoothing: antialiased;
        }

        .super-admin-shell {
          display: flex;
          min-height: 100vh;
          background: #F8FAFC;
        }

        .super-admin-content-area {
          margin-left: 240px;
          width: calc(100% - 240px);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F8FAFC;
        }

        .super-admin-main-view {
          padding: 20px 28px 48px;
          flex: 1;
          width: 100%;
        }

        /* Responsive Breakpoints */
        @media (min-width: 1024px) {
          .sa-header-sub { display: inline !important; }
        }

        @media (max-width: 1100px) {
          .sa-grid-two { grid-template-columns: 1fr !important; }
          .sa-grid-three { grid-template-columns: 1fr !important; }
          .sa-sub-suite { grid-template-columns: 1fr !important; }
          .sa-modules-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 768px) {
          .super-admin-content-area { margin-left: 0; width: 100%; }
          .super-admin-main-view { padding: 14px 16px 36px; }
          .sa-modules-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="super-admin-shell">
        {/* ─── Fixed Zero-Scroll Sidebar ─── */}
        <SuperAdminSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === "subscriptions") {
              setSelectedCompanyId(null);
            }
            setActiveTab(tab);
          }}
          companiesCount={companies.length}
          onNewCompany={() => setActiveTab("create-company")}
        />

        {/* ─── Main Content View ─── */}
        <div className="super-admin-content-area">
          <SuperAdminHeader
            activeTab={activeTab}
            onNewCompany={() => setActiveTab("create-company")}
          />

          <main className="super-admin-main-view">
            {activeTab === "overview" && (
              <OverviewTab
                stats={stats}
                companies={companies}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "companies" && (
              <CompaniesTab
                companies={companies}
                loading={loading}
                onExtend={handleExtend}
                onToggleStatus={handleToggleStatus}
                onConfigureModules={handleConfigureModules}
                onNewCompany={() => setActiveTab("create-company")}
              />
            )}

            {activeTab === "subscriptions" && (
              <SubscriptionsTab
                companies={companies}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={setSelectedCompanyId}
                onRefresh={fetchData}
                onExtend={handleExtend}
              />
            )}

            {activeTab === "databases" && (
              <DatabasesTab companies={companies} />
            )}

            {/* Dedicated Full Page for Creating Company (No modal popup!) */}
            {activeTab === "create-company" && (
              <CreateCompanyTab
                onBack={() => setActiveTab("companies")}
                onSuccess={() => {
                  fetchData();
                  setActiveTab("companies");
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* ─── Compact Premium Extend Subscription Modal ─── */}
      {extendingCompany && (
        <ExtendSubscriptionModal
          company={extendingCompany}
          onClose={() => setExtendingCompany(null)}
          onSuccess={() => {
            fetchData();
            setExtendingCompany(null);
          }}
        />
      )}
    </>
  );
};

export default SuperAdminDashboard;