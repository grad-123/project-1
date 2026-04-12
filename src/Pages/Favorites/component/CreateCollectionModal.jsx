import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // ✅ منع التمرير في الخلفية عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await axios.post("api/v1/Collection/CreateLibrary", {
        name: name.trim(),
        description: description.trim(),
      });
      setName("");
      setDescription("");
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.log(err);
    } finally {
      setIsCreating(false);
    }
  };

  const modalContent = isOpen ? (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999999,
      }}
    >
      <div
        className="create-collection-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "16px",
          width: "450px",
          maxWidth: "90%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          className="modal-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}>
            {t("createCollection.title") || "إنشاء مجموعة جديدة"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--text-secondary)",
              padding: "0.25rem",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div className="modal-body" style={{ padding: "1.5rem" }}>
          <input
            type="text"
            placeholder={t("createCollection.collectionName") || "اسم المجموعة"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--input-bg)",
              color: "var(--text-main)",
              boxSizing: "border-box",
            }}
          />
          <textarea
            placeholder={t("createCollection.descriptionOptional") || "الوصف (اختياري)"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              border: "1px solid var(--card-border)",
              borderRadius: "8px",
              fontSize: "0.9rem",
              background: "var(--input-bg)",
              color: "var(--text-main)",
              boxSizing: "border-box",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>
        <div
          className="modal-footer"
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--card-border)",
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
            }}
          >
            {t("createCollection.cancel") || "إلغاء"}
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "8px",
              cursor: isCreating || !name.trim() ? "not-allowed" : "pointer",
              background: "var(--primary)",
              color: "white",
              opacity: isCreating || !name.trim() ? 0.6 : 1,
            }}
          >
            {isCreating ? t("createCollection.creating") || "جاري الإنشاء..." : t("createCollection.create") || "إنشاء"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // ✅ استخدام React Portal لتصيير المودال في body مباشرة
  return isOpen ? ReactDOM.createPortal(modalContent, document.body) : null;
}

export default CreateCollectionModal;