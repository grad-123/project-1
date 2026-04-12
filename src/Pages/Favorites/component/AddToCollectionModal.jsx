import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

function AddToCollectionModal({ isOpen, onClose, collections = [], onAdd, onCreateCollection }) {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  if (!isOpen) return null;

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setIsCreating(true);
    try {
      await axios.post("api/v1/Collection/CreateLibrary", {
        name: newCollectionName,
        description: newCollectionDesc,
      });
      if (onCreateCollection) await onCreateCollection();
      setShowCreateForm(false);
      setNewCollectionName("");
      setNewCollectionDesc("");
    } catch (err) {
      console.log(err);
    } finally {
      setIsCreating(false);
    }
  };

  const safeCollections = Array.isArray(collections) ? collections : [];

  const modalContent = (
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
        className="add-collection-modal"
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
            {t("addToCollection.title") || "إضافة إلى مجموعة"}
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

        {!showCreateForm ? (
          <>
            <div
              className="collections-list-modal"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "0.5rem 0",
              }}
            >
              {safeCollections.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "2rem" }}>
                  {t("addToCollection.noCollections") || "لا توجد مجموعات"}
                </p>
              ) : (
                safeCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="collection-option"
                    onClick={() => onAdd && onAdd(collection.id)}
                    style={{
                      padding: "1rem 1.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderBottom: "1px solid var(--card-border)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div className="collection-info">
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem", color: "var(--text-main)" }}>
                        {collection.name}
                      </h4>
                      <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {collection.description || t("addToCollection.noDescription") || "لا يوجد وصف"}
                      </p>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {collection.filesCount || 0} {t("addToCollection.files") || "ملف"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="create-new-link"
              onClick={() => setShowCreateForm(true)}
              style={{
                margin: "1rem 1.5rem",
                padding: "0.75rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                cursor: "pointer",
                color: "var(--primary)",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {t("addToCollection.createNew") || "+ إنشاء مجموعة جديدة"}
            </button>
          </>
        ) : (
          <div className="create-collection-form" style={{ padding: "1.5rem" }}>
            <input
              type="text"
              placeholder={t("addToCollection.collectionName") || "اسم المجموعة"}
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
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
              placeholder={t("addToCollection.descriptionOptional") || "الوصف (اختياري)"}
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
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
              }}
            />
            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                }}
              >
                {t("addToCollection.cancel") || "إلغاء"}
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={isCreating || !newCollectionName.trim()}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isCreating || !newCollectionName.trim() ? "not-allowed" : "pointer",
                  background: "var(--primary)",
                  color: "white",
                  opacity: isCreating || !newCollectionName.trim() ? 0.6 : 1,
                }}
              >
                {isCreating ? t("addToCollection.creating") || "جاري الإنشاء..." : t("addToCollection.create") || "إنشاء"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default AddToCollectionModal;