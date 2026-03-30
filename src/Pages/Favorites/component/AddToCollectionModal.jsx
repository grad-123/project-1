import React, { useState } from "react";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./AddToCollectionModal.css";

function AddToCollectionModal({ isOpen, onClose, collections = [], onAdd, onCreateCollection }) {
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    setIsCreating(true);
    try {
      await axios.post("api/v1/Collection/CreateLibrary", {
        name: newCollectionName,
        description: newCollectionDesc
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-collection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t("addToCollection.title")}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!showCreateForm ? (
          <>
            <div className="collections-list-modal">
              {safeCollections.length === 0 ? (
                <p className="no-collections">{t("addToCollection.noCollections")}</p>
              ) : (
                safeCollections.map(collection => (
                  <div
                    key={collection.id}
                    className="collection-option"
                    onClick={() => onAdd && onAdd(collection.id)}
                  >
                    <div className="collection-info">
                      <h4>{collection.name}</h4>
                      <p>{collection.description || t("addToCollection.noDescription")}</p>
                      <span>{collection.filesCount || 0} {t("addToCollection.files")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button className="create-new-link" onClick={() => setShowCreateForm(true)}>
              {t("addToCollection.createNew")}
            </button>
          </>
        ) : (
          <div className="create-collection-form">
            <input
              type="text"
              placeholder={t("addToCollection.collectionName")}
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder={t("addToCollection.descriptionOptional")}
              value={newCollectionDesc}
              onChange={(e) => setNewCollectionDesc(e.target.value)}
              rows="3"
            />
            <div className="form-buttons">
              <button onClick={() => setShowCreateForm(false)}>{t("addToCollection.cancel")}</button>
              <button onClick={handleCreateCollection} disabled={isCreating || !newCollectionName.trim()}>
                {isCreating ? t("addToCollection.creating") : t("addToCollection.create")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddToCollectionModal;