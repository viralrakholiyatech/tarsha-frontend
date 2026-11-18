import React, { useState } from "react";
import { superAdminApi } from "./superAdminApi";
import Swal from "sweetalert2";

const PERIOD_OPTIONS = [
  { months: 1,  label: "+ 1 Month",  desc: "Monthly extension" },
  { months: 3,  label: "+ 3 Months", desc: "Quarterly renewal" },
  { months: 6,  label: "+ 6 Months", desc: "Half-year extension" },
  { months: 12, label: "+ 12 Months", desc: "1 Year (Annual license)", popular: true },
];

const ExtendSubscriptionModal = ({ company, onClose, onSuccess }) => {
  const [selectedMonths, setSelectedMonths] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!company) return null;

  // Calculate new expiry date based on current expiry or now
  const calculateNewExpiry = (months) => {
    const base = company.expiry_date && new Date(company.expiry_date) > new Date()
      ? new Date(company.expiry_date)
      : new Date();
    const target = new Date(base.getTime());
    target.setMonth(target.getMonth() + months);
    return target;
  };

  const newExpiryDate = calculateNewExpiry(selectedMonths);

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      const formattedDate = newExpiryDate.toISOString().split("T")[0];
      await superAdminApi.updateSubscription(company.id, {
        expiry_date: formattedDate,
        subscription_months: selectedMonths,
      });

      Swal.fire({
        title: "Subscription Extended!",
        text: `${company.name} is now valid until ${newExpiryDate.toLocaleDateString("en-IN")}.`,
        icon: "success",
        confirmButtonColor: "#0F172A",
        timer: 2000,
        showConfirmButton: false,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      Swal.fire({
        title: "Extension Failed",
        text: err.message || "Could not update subscription",
        icon: "error",
        confirmButtonColor: "#0F172A",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#FFFFFF",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          animation: "modalSlideUp 0.18s ease-out",
        }}
      >
        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        {/* ─── Modal Header ─── */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#FFFFFF",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              background: "#EFF6FF",
              color: "#2563EB",
              display: "grid",
              placeItems: "center",
              fontSize: "16px",
            }}>
              🗓️
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>
                Extend Subscription
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
                {company.name} • <span style={{ fontFamily: "monospace", color: "#2563EB" }}>{company.code}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              background: "#F8FAFC",
              color: "#64748B",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.12s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F8FAFC";
              e.currentTarget.style.color = "#64748B";
            }}
          >
            ✕
          </button>
        </div>

        {/* ─── Modal Body ─── */}
        <div style={{ padding: "18px 20px" }}>
          {/* Current Expiry Info Strip */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 12px",
            background: "#F8FAFC",
            borderRadius: "7px",
            border: "1px solid #E2E8F0",
            marginBottom: "16px",
          }}>
            <span style={{ fontSize: "11px", color: "#64748B" }}>
              Current Expiry Date:
            </span>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#0F172A" }}>
              {company.expiry_date ? new Date(company.expiry_date).toLocaleDateString("en-IN") : "Never / Unlimited"}
            </span>
          </div>

          <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#475569", marginBottom: "10px", letterSpacing: "0.04em" }}>
            Select Extension Period
          </div>

          {/* 2x2 Compact Extension Period Options */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginBottom: "16px",
          }}>
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = selectedMonths === opt.months;
              return (
                <div
                  key={opt.months}
                  onClick={() => setSelectedMonths(opt.months)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: isSelected ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                    background: isSelected ? "#F0F7FF" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.12s ease",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: "13px",
                      fontWeight: "800",
                      color: isSelected ? "#1E40AF" : "#0F172A",
                    }}>
                      {opt.label}
                    </span>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: isSelected ? "none" : "1.5px solid #CBD5E1",
                      background: isSelected ? "#2563EB" : "transparent",
                      color: "#FFFFFF",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "10px",
                      fontWeight: "800",
                    }}>
                      {isSelected && "✓"}
                    </div>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#64748B", marginTop: "2px" }}>
                    {opt.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Preview Box */}
          <div style={{
            padding: "12px 14px",
            background: "#F8FAFC",
            borderRadius: "8px",
            border: "1px dashed #CBD5E1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#64748B", fontWeight: "700" }}>
                New License Expiry
              </div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#2563EB", marginTop: "2px" }}>
                {newExpiryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: "700",
              padding: "3px 8px",
              borderRadius: "4px",
              background: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
            }}>
              + {selectedMonths} Months Applied
            </span>
          </div>
        </div>

        {/* ─── Modal Footer ─── */}
        <div style={{
          padding: "14px 20px",
          background: "#F8FAFC",
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
        }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: "600",
              color: "#475569",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            disabled={isSubmitting}
            style={{
              padding: "7px 18px",
              fontSize: "12px",
              fontWeight: "700",
              color: "#FFFFFF",
              background: isSubmitting ? "#64748B" : "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(15, 23, 42, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>{isSubmitting ? "Updating..." : "Confirm Extension"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendSubscriptionModal;
