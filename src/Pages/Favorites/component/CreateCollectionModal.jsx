import React, { useState } from "react";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";

function CreateCollectionModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await axios.post("/api/v1/collection/Create", {
        name: name.trim(),
        description: description.trim()
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("createCollection.title")}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder={t("createCollection.collectionName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder={t("createCollection.descriptionOptional")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            {t("createCollection.cancel")}
          </button>
          <button className="create-btn" onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? t("createCollection.creating") : t("createCollection.create")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCollectionModal;