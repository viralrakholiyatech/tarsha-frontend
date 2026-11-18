import React, { useState, useRef, useEffect } from "react";
import { uploadFileToS3, deleteFileFromS3, getFileDisplayUrl, getS3FileUrl, openFileInNewTab } from "../services/S3Service";
import ProgressBar from "@ramonak/react-progress-bar";
import { Upload, X, FileText, CheckCircle, ExternalLink, Image as ImageIcon } from "lucide-react";
import "./S3FileUpload.css";

/**
 * Reusable S3 File Upload Component
 * 
 * Props:
 * @param {string} label - Input label (e.g. "Profile Picture", "Upload Document")
 * @param {string} value - Current file URL (from database or previous upload)
 * @param {Function} onChange - Callback with new fileUrl: (url: string, key?: string) => void
 * @param {Function} [onRemove] - Callback when file is removed
 * @param {string} [accept="image/*,application/pdf"] - Allowed file types
 * @param {string} [folder="uploads"] - S3 folder path prefix
 * @param {boolean} [required=false] - Whether the field is required
 * @param {string} [error] - Validation error message to display
 * @param {boolean} [disabled=false] - Disabled state
 */
const S3FileUpload = ({
  label,
  value,
  onChange,
  onRemove,
  accept = "image/*,application/pdf",
  folder = "uploads",
  required = false,
  error = "",
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [s3Key, setS3Key] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setPreviewUrl("");
      return;
    }

    const isS3 =
      value.includes(".amazonaws.com/") ||
      value.startsWith("interior/") ||
      value.startsWith("architecture/") ||
      value.startsWith("arch/") ||
      value.startsWith("approval/") ||
      value.startsWith("approval_process/") ||
      value.startsWith("pv/") ||
      value.startsWith("fire_noc/") ||
      value.startsWith("firenoc/") ||
      value.startsWith("enagar/") ||
      value.startsWith("e_nagar/") ||
      value.startsWith("building/") ||
      value.startsWith("building_permission/") ||
      value.startsWith("inward/") ||
      value.startsWith("outward/") ||
      value.startsWith("customer/") ||
      value.startsWith("customers/") ||
      value.startsWith("employee/") ||
      value.startsWith("employees/") ||
      value.startsWith("employee_resumes/") ||
      value.startsWith("employee_documents/") ||
      value.startsWith("site_inspection/") ||
      value.startsWith("siteinspection/") ||
      value.startsWith("campaign/") ||
      value.startsWith("post/") ||
      value.startsWith("social_media/") ||
      value.startsWith("receipt/") ||
      value.startsWith("receipts/") ||
      value.startsWith("payment/") ||
      value.startsWith("payments/") ||
      value.startsWith("payment_expense/") ||
      value.startsWith("paymentExpense/") ||
      value.startsWith("expense/") ||
      value.startsWith("expenses/") ||
      value.startsWith("escrow/") ||
      value.startsWith("uploads/");

    if (isS3) {
      const key = value.includes(".amazonaws.com/")
        ? value.split(".amazonaws.com/")[1]
        : value;
      getS3FileUrl(key)
        .then((url) => {
          if (isMounted && url) setPreviewUrl(url);
        })
        .catch(() => {
          if (isMounted) setPreviewUrl(getFileDisplayUrl(value));
        });
    } else {
      setPreviewUrl(getFileDisplayUrl(value));
    }

    return () => {
      isMounted = false;
    };
  }, [value]);

  const isImage = (url = "") => {
    return /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.startsWith("data:image");
  };

  const isPdf = (url = "") => {
    return /\.pdf($|\?)/i.test(url);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setUploadError("");

    try {
      const { key, fileUrl } = await uploadFileToS3(
        file,
        (percent) => setProgress(percent),
        folder
      );

      setS3Key(key);
      if (onChange) {
        onChange(fileUrl, key);
      }
    } catch (err) {
      console.error("S3 upload failed:", err);
      const msg = err.response?.data?.error || err.message || "Upload failed. Please try again.";
      setUploadError(msg);
    } finally {
      setUploading(false);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (disabled || uploading) return;

    // Optionally attempt to delete from S3 if key is tracked
    if (s3Key) {
      try {
        await deleteFileFromS3(s3Key);
      } catch (err) {
        console.warn("Could not delete file from S3:", err);
      }
    }

    setS3Key("");
    setProgress(0);
    setUploadError("");

    if (onRemove) {
      onRemove();
    }
    if (onChange) {
      onChange("", "");
    }
  };

  return (
    <div className="s3-upload-container">
      {label && (
        <label className="s3-upload-label">
          {label} {required && <span className="s3-required">*</span>}
        </label>
      )}

      {/* When file is uploaded or existing value is passed */}
      {value && !uploading ? (
        <div className="s3-preview-card">
          <div className="s3-preview-media">
            {isImage(value) ? (
              <img
                src={previewUrl || getFileDisplayUrl(value)}
                alt="Preview"
                className="s3-preview-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : isPdf(value) ? (
              <div className="s3-doc-preview">
                <FileText size={32} className="s3-doc-icon" />
                <span className="s3-doc-text">PDF Document</span>
              </div>
            ) : (
              <div className="s3-doc-preview">
                <FileText size={32} className="s3-doc-icon" />
                <span className="s3-doc-text">Attached File</span>
              </div>
            )}
          </div>

          <div className="s3-preview-actions">
            <button
              type="button"
              onClick={() => openFileInNewTab(value)}
              className="s3-action-btn s3-view-btn"
              title="Open in new tab"
            >
              <ExternalLink size={16} />
              <span>View</span>
            </button>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="s3-action-btn s3-remove-btn"
                title="Remove file"
              >
                <X size={16} />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Upload Dropzone / Trigger */
        <div
          className={`s3-dropzone ${disabled ? "s3-disabled" : ""}`}
          onClick={() => {
            if (fileInputRef.current && !disabled && !uploading) {
              fileInputRef.current.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="s3-file-input"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || uploading}
            style={{ display: "none" }}
          />

          {uploading ? (
            <div className="s3-uploading-state">
              <span className="s3-uploading-text">Uploading to S3... {progress}%</span>
              <div className="s3-progress-wrapper">
                <ProgressBar
                  completed={progress}
                  bgColor="#887549"
                  baseBgColor="#ede5d5"
                  height="10px"
                  isLabelVisible={false}
                />
              </div>
            </div>
          ) : (
            <div className="s3-dropzone-content">
              <div className="s3-icon-wrapper">
                <Upload size={24} className="s3-upload-icon" />
              </div>
              <div className="s3-dropzone-text">
                <span className="s3-primary-text">Click to upload</span> or drag and drop
              </div>
              <span className="s3-secondary-text">Images, PDF or Documents</span>
            </div>
          )}
        </div>
      )}

      {/* Error displays */}
      {(uploadError || error) && (
        <span className="s3-error-text">{uploadError || error}</span>
      )}
    </div>
  );
};

export default S3FileUpload;
