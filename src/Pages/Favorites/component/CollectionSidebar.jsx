import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import CreateCollectionModal from "./CreateCollectionModal";
import "./CollectionSidebar.css";

function CollectionSidebar({
  collections = [],
  favoriteCollections = [],
  onCollectionUpdate,
  onFavoriteCollectionsUpdate,
  onSelectCollection,
  selectedCollectionId,
  activeTab = "my",
  onTabChange,
  showMessage,
  className = "",
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [copyingId, setCopyingId] = useState(null);

  // ✅ هذه الدالة سيتم استخدامها فقط في Favorite Collections (لن تظهر في My Collections)
  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("🔵 CollectionSidebar - Clicked on uploader:", { userId, userName });
    
    const token = localStorage.getItem("token");
    if (!token) {
      if (showMessage) showMessage("الرجاء تسجيل الدخول أولاً", "warning");
      return;
    }
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      console.log("⚠️ No valid userId provided");
      if (showMessage) showMessage("لا يمكن عرض الملف الشخصي", "warning");
    }
  };

  const getCollectionId = (collection) => {
    return collection.collectionId || collection.id;
  };

  const handleSelectCollection = async (collection) => {
    const collectionId = getCollectionId(collection);
    if (!collectionId) return;

    console.log("🔵 Selecting collection:", { collectionId, collection });

    try {
      const res = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
      console.log("🟢 Collection details from API:", res.data);

      if (res.data && res.data.succeeded && res.data.data) {
        const files = res.data.data.files || [];
        console.log("📁 Files in collection:", files.length);

        const fullCollection = {
          ...collection,
          id: collectionId,
          collectionId: collectionId,
          name: res.data.data.name || collection.name,
          description: res.data.data.description || collection.description,
          files: files,
          filesCount: files.length,
          courseName: res.data.data.courseName || collection.courseName,
          uploaderId: res.data.data.uploaderId || collection.uploaderId,
          uploaderName: res.data.data.uploaderName || collection.uploaderName,
          createdAt: res.data.data.createdAt || collection.createdAt,
          source: activeTab,
          isFavorite: activeTab === "favorite",
        };

        if (onSelectCollection) {
          onSelectCollection(fullCollection);
        }
      } else {
        if (onSelectCollection) {
          onSelectCollection({
            ...collection,
            id: collectionId,
            source: activeTab,
            isFavorite: activeTab === "favorite",
            files: collection.files || [],
            filesCount: collection.filesCount || collection.files?.length || 0,
            uploaderId: collection.uploaderId,
            uploaderName: collection.uploaderName,
            createdAt: collection.createdAt,
          });
        }
      }
    } catch (err) {
      console.error("🔴 Error fetching collection details:", err);
      if (onSelectCollection) {
        onSelectCollection({
          ...collection,
          id: collectionId,
          source: activeTab,
          isFavorite: activeTab === "favorite",
          files: collection.files || [],
          filesCount: collection.filesCount || collection.files?.length || 0,
          uploaderId: collection.uploaderId,
          uploaderName: collection.uploaderName,
          createdAt: collection.createdAt,
        });
      }
    }
  };

  const handleDeleteCollection = async (id, e) => {
    e.stopPropagation();
    
    // ✅ تحقق من وجود توكن
    const token = localStorage.getItem("token");
    if (!token) {
      if (showMessage) showMessage("الرجاء تسجيل الدخول أولاً", "warning");
      return;
    }
    
    if (window.confirm(t("collection.deleteConfirm"))) {
      try {
        await axios.delete(`/api/v1/collection/Delete/${id}`);
        if (onCollectionUpdate) onCollectionUpdate();
        if (selectedCollectionId === id && onSelectCollection) {
          onSelectCollection(null);
        }
        if (showMessage) showMessage(t("collection.deleted"), "success");
      } catch (err) {
        console.log("Delete error:", err);
        
        let errorMsg = t("collection.deleteError") || "فشل حذف المجموعة";
        
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.response?.status === 401) {
          errorMsg = "انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى";
        } else if (err.response?.status === 403) {
          errorMsg = "ليس لديك صلاحية حذف هذه المجموعة";
        }
        
        if (showMessage) showMessage(errorMsg, "error");
      }
    }
  };

  const handleRemoveFromFavorites = async (collectionId, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        t("collection.removeFromFavoritesConfirm") ||
          "Remove this collection from favorites?",
      )
    ) {
      try {
        await axios.delete(`/Favorite/RemoveCollection/${collectionId}`);
        if (onFavoriteCollectionsUpdate) onFavoriteCollectionsUpdate();
        if (selectedCollectionId === collectionId && onSelectCollection) {
          onSelectCollection(null);
        }
        if (showMessage)
          showMessage(t("collection.removedFromFavorites"), "success");
      } catch (err) {
        console.log("Error removing from favorites:", err);
        
        let errorMsg = t("collection.removeError") || "فشل إزالة المجموعة من المفضلة";
        
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        
        if (showMessage) showMessage(errorMsg, "error");
      }
    }
  };

  const handleCopyCollection = async (collectionId, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      if (showMessage) showMessage("الرجاء تسجيل الدخول أولاً", "warning");
      return;
    }
    
    setCopyingId(collectionId);

    try {
      console.log("📦 Copying collection via API:", collectionId);
      const response = await axios.post(`/api/v1/collection/Copy/${collectionId}`);

      if (
        response.status === 200 ||
        response.data?.succeeded ||
        response.data?.statusCode === 200
      ) {
        const successMessage =
          response.data?.message ||
          t("collection.copySuccess") ||
          "✨ Collection copied successfully!";
        if (showMessage) showMessage(successMessage, "success");

        if (onCollectionUpdate) {
          await onCollectionUpdate();
        }

        if (onFavoriteCollectionsUpdate) {
          await onFavoriteCollectionsUpdate();
        }

        if (onTabChange && activeTab !== "my") {
          onTabChange("my");
        }

        setTimeout(async () => {
          try {
            const collectionsRes = await axios.get(
              "/api/v1/Collection/GetLibraryCollections",
            );
            if (collectionsRes.data?.data?.length > 0) {
              const copiedCollection = collectionsRes.data.data.find(
                (c) => c.name?.endsWith("(Copy)") || c.name?.includes("Copy"),
              );
              const newCollection =
                copiedCollection ||
                collectionsRes.data.data[collectionsRes.data.data.length - 1];

              if (newCollection && onSelectCollection) {
                const detailsRes = await axios.get(
                  `/api/v1/Collection/GetById/${newCollection.id}`,
                );
                if (detailsRes.data?.data) {
                  const fullCollection = {
                    ...detailsRes.data.data,
                    id: newCollection.id,
                    source: "my",
                    isFavorite: false,
                    files: detailsRes.data.data.files || [],
                  };
                  onSelectCollection(fullCollection);
                }
              }
            }
          } catch (err) {
            console.log("Could not auto-open new collection:", err);
          }
        }, 1000);
      } else {
        throw new Error("Copy failed");
      }
    } catch (err) {
      console.error("🔴 Copy error:", err);
      console.error("🔴 Response data:", err.response?.data);
      console.error("🔴 Response status:", err.response?.status);
      
      let errorMessage = "❌ لا يمكنك نسخ مجموعتك الخاصة!";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (errorMessage === "You cannot copy your own collection") {
        errorMessage = t("collection.cannotCopyOwn") || "لا يمكنك نسخ مجموعتك الخاصة";
      }
      
      console.log("📢 Final error message to show:", errorMessage);
      
      if (showMessage) {
        showMessage(errorMessage, "error");
      } else {
        alert(errorMessage);
      }
    } finally {
      setCopyingId(null);
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
        description: newDescription,
      });
      setEditingCollection(null);
      if (onCollectionUpdate) onCollectionUpdate();
      if (showMessage) showMessage(t("collection.updated"), "success");
    } catch (err) {
      console.log(err);
      
      let errorMsg = t("collection.updateError") || "فشل تحديث المجموعة";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      if (showMessage) showMessage(errorMsg, "error");
    }
  };

  const safeCollections = Array.isArray(collections) ? collections : [];
  const safeFavoriteCollections = Array.isArray(favoriteCollections)
    ? favoriteCollections.map((collection) => ({
        ...collection,
        id: collection.collectionId || collection.id,
        collectionId: collection.collectionId || collection.id,
      }))
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`collection-sidebar ${className}`}>
      <div className="sidebar-header">
        <h3>{t("collection.collections")}</h3>
        {activeTab === "my" && (
          <button
            className="create-collection-btn"
            onClick={() => setShowCreateModal(true)}
          >
            {t("collection.createNew")}
          </button>
        )}
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === "my" ? "active" : ""}`}
          onClick={() => onTabChange && onTabChange("my")}
        >
          📚 {t("collection.myCollections") || "My Collections"} (
          {safeCollections.length})
        </button>
        <button
          className={`sidebar-tab ${activeTab === "favorite" ? "active" : ""}`}
          onClick={() => onTabChange && onTabChange("favorite")}
        >
          ❤️ {t("collection.favoriteCollections") || "Favorite Collections"} (
          {safeFavoriteCollections.length})
        </button>
      </div>

      <div className="collections-list">
        {activeTab === "my" ? (
          <>
            {safeCollections.length === 0 ? (
              <div className="empty-collections">
                {t("collection.noCollections")}
              </div>
            ) : (
              safeCollections.map((collection) => (
                <div
                  key={collection.id}
                  className={`collection-item ${selectedCollectionId === collection.id ? "active" : ""}`}
                  onClick={() => handleSelectCollection(collection)}
                >
                  <div className="collection-info">
                    <h4>{collection.name}</h4>
                    <p>{collection.description || t("collection.noDescription")}</p>
                    <div className="collection-meta-details">
                      <span className="collection-meta">
                        📄 {collection.filesCount || 0} {t("collection.files")}
                      </span>
                      <span className="collection-date">
                        📅 {formatDate(collection.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="collection-actions">
                    <button
                      className="rename-btn"
                      onClick={(e) => handleRenameStart(collection, e)}
                      title={t("collection.rename")}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteCollection(collection.id, e)}
                      title={t("collection.delete")}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {safeFavoriteCollections.length === 0 ? (
              <div className="empty-collections">
                {t("collection.noFavoriteCollections") ||
                  "No favorite collections yet. Go to a course and favorite a collection!"}
              </div>
            ) : (
              safeFavoriteCollections.map((collection) => {
                const collectionId = collection.collectionId || collection.id;
                return (
                  <div
                    key={collectionId}
                    className={`collection-item favorite-collection-item ${selectedCollectionId === collectionId ? "active" : ""}`}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <div className="collection-info">
                      <h4>{collection.name}</h4>
                      <p>{collection.description || t("collection.noDescription")}</p>
                      <div className="collection-meta-details">
                        <span className="collection-meta">
                          📄 {collection.filesCount || 0} {t("collection.files")}
                        </span>
                        {collection.courseName && (
                          <span className="course-name-badge">
                            📚 {collection.courseName}
                          </span>
                        )}
                        <span 
                          className="uploader-name-clickable"
                          onClick={(e) => handleUploaderClick(collection.uploaderId, collection.uploaderName, e)}
                          title="انقر لعرض الملف الشخصي لصاحب المجموعة"
                          style={{ cursor: 'pointer', color: '#007bff' }}
                        >
                          👤 {collection.uploaderName || t("collection.unknown")}
                        </span>
                        <span className="collection-date">
                          📅 {formatDate(collection.addedAt || collection.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="collection-actions">
                      <button
                        className="copy-collection-btn"
                        onClick={(e) => handleCopyCollection(collectionId, e)}
                        disabled={copyingId === collectionId}
                        title={t("collection.copyToMyCollections") || "Copy to my collections"}
                      >
                        {copyingId === collectionId ? (
                          <span className="copy-spinner">⏳</span>
                        ) : (
                          <span className="copy-text">{t("collection.copy") || "Copy"}</span>
                        )}
                      </button>
                      <button
                        className="remove-favorite-btn"
                        onClick={(e) => handleRemoveFromFavorites(collectionId, e)}
                        title={t("collection.removeFromFavorites") || "Remove from favorites"}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      {/* ✅ مودال التعديل - باستخدام React Portal */}
      {editingCollection && ReactDOM.createPortal(
        <div
          className="edit-modal-overlay"
          onClick={() => setEditingCollection(null)}
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
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "16px",
              padding: "1.5rem",
              width: "400px",
              maxWidth: "90%",
              border: "1px solid var(--card-border)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-main)" }}>
              {t("collection.editCollection") || "تعديل المجموعة"}
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("collection.collectionName") || "اسم المجموعة"}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "var(--input-bg)",
                color: "var(--text-main)",
                boxSizing: "border-box",
              }}
              autoFocus
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={t("collection.description") || "الوصف (اختياري)"}
              rows="3"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
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
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingCollection(null)}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--card-border)";
                  e.currentTarget.style.color = "var(--text-main)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {t("collection.cancel") || "إلغاء"}
              </button>
              <button
                onClick={handleRenameSave}
                style={{
                  padding: "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--primary)",
                  color: "white",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {t("collection.save") || "حفظ"}
              </button>
            </div>
          </div>
        </div>,
        document.body
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