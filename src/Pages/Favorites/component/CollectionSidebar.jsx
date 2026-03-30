import React, { useState } from "react";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import CreateCollectionModal from "./CreateCollectionModal";
import "./CollectionSidebar.css";

function CollectionSidebar({ collections = [], onCollectionUpdate, onSelectCollection, selectedCollectionId }) {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleSelectCollection = (collection) => {
    if (!collection || !collection.id) return;
    if (onSelectCollection) {
      onSelectCollection(collection);
    }
  };

  const handleDeleteCollection = async (id, e) => {
    e.stopPropagation();
    if (window.confirm(t("collection.deleteConfirm"))) {
      try {
        await axios.delete(`/api/v1/collection/Delete/${id}`);
        if (onCollectionUpdate) onCollectionUpdate();
        if (selectedCollectionId === id && onSelectCollection) {
          onSelectCollection(null);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleRenameStart = (collection, e) => {
    e.stopPropagation();
    setEditingCollection(collection);
    setNewName(collection.name);
    setNewDescription(collection.description || "");
  };

  const handleRenameSave = async () => {
    if (!newName.trim()) return;
    try {
      await axios.put("/api/v1/collection/Update", {
        id: editingCollection.id,
        name: newName,
        description: newDescription
      });
      setEditingCollection(null);
      if (onCollectionUpdate) onCollectionUpdate();
    } catch (err) {
      console.log(err);
    }
  };

  const safeCollections = Array.isArray(collections) ? collections : [];

  return (
    <div className="collection-sidebar">
      <div className="sidebar-header">
        <h3>{t("collection.myCollections")}</h3>
        <button className="create-collection-btn" onClick={() => setShowCreateModal(true)}>
          {t("collection.createNew")}
        </button>
      </div>

      <div className="collections-list">
        {safeCollections.length === 0 ? (
          <div style={{ padding: "1rem", textAlign: "center", color: "#999" }}>
            {t("collection.noCollections")}
          </div>
        ) : (
          safeCollections.map(collection => (
            <div
              key={collection.id}
              className={`collection-item ${selectedCollectionId === collection.id ? "active" : ""}`}
              onClick={() => handleSelectCollection(collection)}
            >
              <div className="collection-info">
                <h4>{collection.name}</h4>
                <p>{collection.description || t("collection.noDescription")}</p>
                <span className="collection-meta">
                  {collection.filesCount || 0} {t("collection.files")}
                </span>
              </div>
              <div className="collection-actions">
                <button className="rename-btn" onClick={(e) => handleRenameStart(collection, e)}>✏️</button>
                <button className="delete-btn" onClick={(e) => handleDeleteCollection(collection.id, e)}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingCollection && (
        <div className="edit-modal-overlay" onClick={() => setEditingCollection(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("collection.editCollection")}</h3>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder={t("collection.collectionName")} 
            />
            <textarea 
              value={newDescription} 
              onChange={(e) => setNewDescription(e.target.value)} 
              placeholder={t("collection.description")} 
              rows="3" 
            />
            <div className="modal-buttons">
              <button onClick={() => setEditingCollection(null)}>{t("collection.cancel")}</button>
              <button onClick={handleRenameSave}>{t("collection.save")}</button>
            </div>
          </div>
        </div>
      )}

      <CreateCollectionModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={onCollectionUpdate} 
      />
    </div>
  );
}

export default CollectionSidebar;