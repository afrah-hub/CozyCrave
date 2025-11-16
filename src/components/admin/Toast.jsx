import React, { useEffect } from "react";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div
      className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}
      role="status"
      aria-live="polite"
      aria-atomic="true" >
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification"> × </button>
    </div>
  );
}

export default Toast;
