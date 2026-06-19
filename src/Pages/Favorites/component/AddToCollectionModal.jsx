import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./AddToCollectionModal.css";

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("addToCollection.title") || "إضافة إلى مجموعة"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {!showCreateForm ? (
          <>
            <div className="collections-list-modal">
              {safeCollections.length === 0 ? (
                <p className="no-collections">
                  {t("addToCollection.noCollections") || "لا توجد مجموعات"}
                </p>
              ) : (
                safeCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="collection-option"
                    onClick={() => onAdd && onAdd(collection.id)}
                  >
                    <div className="collection-info">
                      <h4>{collection.name}</h4>
                      <p>{collection.description || t("addToCollection.noDescription") || "لا يوجد وصف"}</p>
                      <span>
                        {collection.filesCount || 0} {t("addToCollection.files") || "ملف"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="create-new-link" onClick={() => setShowCreateForm(true)}>
              {t("addToCollection.createNew") || "+ إنشاء مجموعة جديدة"}
            </button>
          </>
        ) : (
          <div className="create-collection-form">
            <input
              type="text"
              placeholder={t("addToCollection.collectionName") || "اسم المجموعة"}
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder={t("addToCollection.descriptionOptional") || "الوصف (اختياري)"}
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              rows="3"
            />
            <div className="form-buttons">
              <button onClick={() => setShowCreateForm(false)}>
                {t("addToCollection.cancel") || "إلغاء"}
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={isCreating || !newCollectionName.trim()}
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
