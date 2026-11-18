import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://webappapi.zaidexceldesign.com/api";

/**
 * Uploads a file directly to AWS S3 using a pre-signed URL.
 * 
 * @param {File} file - The file object from <input type="file" />
 * @param {Function} [onProgress] - Optional callback function (percentage: number) => void
 * @returns {Promise<{ key: string, fileUrl?: string }>} - The uploaded file key and URL
 */
export const uploadFileToS3 = async (file, onProgress, folder = "uploads") => {
  if (!file) {
    throw new Error("No file selected");
  }

  // 1. Get presigned upload URL from backend
  const { data } = await axios.post(`${API_URL}/s3/upload-url`, {
    fileName: file.name,
    fileType: file.type,
    folder,
  });

  const { uploadUrl, key, fileUrl } = data;

  if (!uploadUrl) {
    throw new Error("Could not obtain presigned upload URL");
  }

  // 2. Upload file directly to S3 via PUT
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return { key, fileUrl };
};

/**
 * Gets a temporary signed URL to view or download a file from S3.
 * 
 * @param {string} key - The S3 object key (e.g. 'uploads/...')
 * @returns {Promise<string>} - The signed viewing URL
 */
export const getS3FileUrl = async (key) => {
  if (!key) return "";
  const { data } = await axios.get(`${API_URL}/s3/file-url`, {
    params: { key },
  });
  return data.url;
};

/**
 * Deletes a file from S3.
 * 
 * @param {string} key - The S3 object key
 */
export const deleteFileFromS3 = async (key) => {
  if (!key) return;
  const { data } = await axios.delete(`${API_URL}/s3/file`, {
    data: { key },
  });
  return data;
};

/**
 * Returns a displayable URL for both S3 full URLs and legacy local paths
 * 
 * @param {string} path - The stored file path or S3 URL
 * @param {string} [baseUrl="https://webappapi.zaidexceldesign.com/public"] - Legacy public files base URL
 * @returns {string} - Full accessible URL
 */
export const getFileDisplayUrl = (path, baseUrl = "https://webappapi.zaidexceldesign.com/public") => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    if (path.includes(".amazonaws.com/")) {
      const key = path.split(".amazonaws.com/")[1];
      return `${API_URL}/s3/view?key=${encodeURIComponent(key)}`;
    }
    return path;
  }

  const isS3Key =
    path.startsWith("interior/") ||
    path.startsWith("architecture/") ||
    path.startsWith("arch/") ||
    path.startsWith("approval/") ||
    path.startsWith("approval_process/") ||
    path.startsWith("pv/") ||
    path.startsWith("fire_noc/") ||
    path.startsWith("firenoc/") ||
    path.startsWith("enagar/") ||
    path.startsWith("e_nagar/") ||
    path.startsWith("building/") ||
    path.startsWith("building_permission/") ||
    path.startsWith("inward/") ||
    path.startsWith("outward/") ||
    path.startsWith("customer/") ||
    path.startsWith("customers/") ||
    path.startsWith("employee/") ||
    path.startsWith("employees/") ||
    path.startsWith("employee_resumes/") ||
    path.startsWith("employee_documents/") ||
    path.startsWith("site_inspection/") ||
    path.startsWith("siteinspection/") ||
    path.startsWith("campaign/") ||
    path.startsWith("post/") ||
    path.startsWith("social_media/") ||
    path.startsWith("receipt/") ||
    path.startsWith("receipts/") ||
    path.startsWith("payment/") ||
    path.startsWith("payments/") ||
    path.startsWith("payment_expense/") ||
    path.startsWith("paymentExpense/") ||
    path.startsWith("expense/") ||
    path.startsWith("expenses/") ||
    path.startsWith("escrow/") ||
    path.startsWith("uploads/");

  if (isS3Key) {
    return `${API_URL}/s3/view?key=${encodeURIComponent(path)}`;
  }

  return `${baseUrl}/${path}`;
};

/**
 * Opens any file (S3 or local) in a new browser tab.
 * For S3 files, it fetches a fresh signed viewing URL from /api/s3/file-url to avoid AccessDenied.
 */
export const openFileInNewTab = async (path, baseUrl = "https://webappapi.zaidexceldesign.com/public") => {
  if (!path) return;

  const isS3 =
    path.includes(".amazonaws.com/") ||
    path.startsWith("interior/") ||
    path.startsWith("architecture/") ||
    path.startsWith("arch/") ||
    path.startsWith("approval/") ||
    path.startsWith("approval_process/") ||
    path.startsWith("pv/") ||
    path.startsWith("fire_noc/") ||
    path.startsWith("firenoc/") ||
    path.startsWith("enagar/") ||
    path.startsWith("e_nagar/") ||
    path.startsWith("building/") ||
    path.startsWith("building_permission/") ||
    path.startsWith("inward/") ||
    path.startsWith("outward/") ||
    path.startsWith("customer/") ||
    path.startsWith("customers/") ||
    path.startsWith("employee/") ||
    path.startsWith("employees/") ||
    path.startsWith("employee_resumes/") ||
    path.startsWith("employee_documents/") ||
    path.startsWith("site_inspection/") ||
    path.startsWith("siteinspection/") ||
    path.startsWith("campaign/") ||
    path.startsWith("post/") ||
    path.startsWith("social_media/") ||
    path.startsWith("receipt/") ||
    path.startsWith("receipts/") ||
    path.startsWith("payment/") ||
    path.startsWith("payments/") ||
    path.startsWith("payment_expense/") ||
    path.startsWith("paymentExpense/") ||
    path.startsWith("expense/") ||
    path.startsWith("expenses/") ||
    path.startsWith("escrow/") ||
    path.startsWith("uploads/");

  if (isS3) {
    const key = path.includes(".amazonaws.com/")
      ? path.split(".amazonaws.com/")[1]
      : path;
    try {
      const signedUrl = await getS3FileUrl(key);
      if (signedUrl) {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
        return;
      }
    } catch (e) {
      console.error("Failed to fetch signed viewing URL:", e);
    }
  }

  // Fallback for regular or legacy files
  window.open(getFileDisplayUrl(path, baseUrl), "_blank", "noopener,noreferrer");
};

