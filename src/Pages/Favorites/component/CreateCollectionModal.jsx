import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./CreateCollectionModal.css";

function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("createCollection.title") || "إنشاء مجموعة جديدة"}</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <input
            type="text"
            placeholder={t("createCollection.collectionName") || "اسم المجموعة"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder={t("createCollection.descriptionOptional") || "الوصف (اختياري)"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            {t("createCollection.cancel") || "إلغاء"}
          </button>
          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
          >
            {isCreating 
              ? t("createCollection.creating") || "جاري الإنشاء..." 
              : t("createCollection.create") || "إنشاء"}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

export default CreateCollectionModal;