import Swal from "sweetalert2";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  error:      "#CF1322",
  errorLight: "#FFF1F0",
};

const defaultSwal = {
  title:             "Are you sure?",
  text:              "",
  icon:              "warning",
  showCancelButton:  true,
  confirmButtonText: "Yes, confirm!",
  cancelButtonText:  "Cancel",

  // ── Layout ──
  width:        420,
  padding:      "32px 28px",
  borderRadius: "16px",

  // ── Colors ──
  confirmButtonColor: THEME.brand,
  cancelButtonColor:  "#fff",

  // ── Custom classes (styled via customClass + injected CSS) ──
  customClass: {
    popup:         "si-swal-popup",
    title:         "si-swal-title",
    htmlContainer: "si-swal-text",
    confirmButton: "si-swal-confirm",
    cancelButton:  "si-swal-cancel",
    icon:          "si-swal-icon",
    actions:       "si-swal-actions",
  },

  // Inject brand CSS once into the document
  didOpen: () => injectSwalCSS(),
};

// ─────────────────────────────────────────────
//  💉  CSS injection (runs once)
// ─────────────────────────────────────────────
let cssInjected = false;

const injectSwalCSS = () => {
  if (cssInjected) return;
  cssInjected = true;

  const style = document.createElement("style");
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

    /* Popup card */
    .si-swal-popup {
      font-family: 'DM Sans', sans-serif !important;
      border-radius: 16px !important;
      box-shadow: 0 10px 40px rgba(0,0,0,0.16) !important;
      border: 1px solid #EDE5D5 !important;
    }

    /* Icon */
    .si-swal-icon {
      border-color: ${THEME.brandMid} !important;
      margin-bottom: 8px !important;
    }
    .swal2-warning {
      color: ${THEME.brand} !important;
      border-color: ${THEME.brandMid} !important;
    }

    /* Title */
    .si-swal-title {
      font-family: 'Sora', sans-serif !important;
      font-size: 18px !important;
      font-weight: 800 !important;
      color: #1A1A2E !important;
      padding: 0 !important;
      margin-bottom: 8px !important;
    }

    /* Body text */
    .si-swal-text {
      font-size: 13px !important;
      color: #6B7280 !important;
      line-height: 1.6 !important;
      margin-bottom: 4px !important;
    }

    /* Actions row */
    .si-swal-actions {
      gap: 10px !important;
      margin-top: 24px !important;
      justify-content: stretch !important;
      width: 100% !important;
    }

    /* Confirm button */
    .si-swal-confirm {
      font-family: 'Sora', sans-serif !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      padding: 10px 24px !important;
      border-radius: 10px !important;
      background: ${THEME.brand} !important;
      border: none !important;
      box-shadow: 0 2px 8px ${THEME.brand}44 !important;
      transition: background 0.18s !important;
      flex: 1 !important;
    }
    .si-swal-confirm:hover {
      background: ${THEME.brandDark} !important;
    }
    .si-swal-confirm:focus {
      box-shadow: 0 0 0 3px ${THEME.brand}33 !important;
    }

    /* Cancel button */
    .si-swal-cancel {
      font-family: 'DM Sans', sans-serif !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      padding: 10px 24px !important;
      border-radius: 10px !important;
      background: #fff !important;
      color: #595959 !important;
      border: 1.5px solid #E0D5C5 !important;
      box-shadow: none !important;
      transition: all 0.18s !important;
      flex: 1 !important;
    }
    .si-swal-cancel:hover {
      background: ${THEME.brandLight} !important;
      color: ${THEME.brand} !important;
      border-color: ${THEME.brand} !important;
    }

    /* Delete variant — red confirm */
    .si-swal-confirm.si-delete {
      background: #CF1322 !important;
      box-shadow: 0 2px 8px #CF132244 !important;
    }
    .si-swal-confirm.si-delete:hover {
      background: #A8071A !important;
    }
  `;
  document.head.appendChild(style);
};


// ─────────────────────────────────────────────
//  ✅  HELPER
// ─────────────────────────────────────────────
const checkValidObject = (object) => {
  try {
    return Object.prototype.toString.call(object) === "[object Object]";
  } catch (err) {
    console.error(err);
    return false;
  }
};


// ─────────────────────────────────────────────
//  🚀  MAIN EXPORT
// ─────────────────────────────────────────────
export const SwalAlert = (CustomSwal, defaultObj = defaultSwal) => {
  let obj = defaultObj;

  if (CustomSwal && checkValidObject(CustomSwal)) {
    obj = { ...defaultObj, ...CustomSwal };

    // Merge customClass deeply so caller overrides don't wipe base classes
    obj.customClass = {
      ...defaultObj.customClass,
      ...(CustomSwal.customClass || {}),
    };
  }

  return new Promise((resolve, reject) => {
    Swal.fire(obj)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};


// ─────────────────────────────────────────────
//  🗑️  PRESET — Delete confirmation
// ─────────────────────────────────────────────
export const SwalDelete = (customText = "This action cannot be undone.") =>
  SwalAlert({
    title:             "Delete this record?",
    text:              customText,
    icon:              "warning",
    confirmButtonText: "Yes, delete it",
    customClass: {
      confirmButton: "si-swal-confirm si-delete",
    },
  });