import React, { useState } from "react";
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [copyingId, setCopyingId] = useState(null);

  // دالة مساعدة للحصول على ID المجموعة بشكل موحد
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
          uploaderName: res.data.data.uploaderName || collection.uploaderName,
          source: activeTab,
          isFavorite: activeTab === "favorite",
        };

        console.log("✅ Full collection prepared:", {
          name: fullCollection.name,
          filesCount: fullCollection.files.length,
        });

        if (onSelectCollection) {
          onSelectCollection(fullCollection);
        }
      } else {
        console.log("⚠️ Using existing collection data");
        if (onSelectCollection) {
          onSelectCollection({
            ...collection,
            id: collectionId,
            source: activeTab,
            isFavorite: activeTab === "favorite",
            files: collection.files || [],
            filesCount: collection.filesCount || collection.files?.length || 0,
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
        });
      }
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
        if (showMessage) showMessage(t("collection.deleted"), "success");
      } catch (err) {
        console.log(err);
        if (showMessage) showMessage(t("collection.deleteError"), "error");
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
        if (showMessage) showMessage(t("collection.removeError"), "error");
      }
    }
  };

  // ✅ الدالة المعدلة لنسخ المجموعة - باستخدام API الباك اند فقط
  const handleCopyCollection = async (collectionId, e) => {
    e.stopPropagation();
    setCopyingId(collectionId);

    try {
      console.log("📦 Copying collection via API:", collectionId);

      // ✅ استدعاء API النسخ الموجود في الباك اند
      const response = await axios.post(
        `/api/v1/collection/Copy/${collectionId}`,
      );

      console.log("✅ Copy response:", response.data);

      // ✅ الباك اند يرسل رسالة نجاح فقط (مثل "تمت العملية بنجاح")
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

        // ✅ تحديث القوائم لعرض المجموعة الجديدة
        if (onCollectionUpdate) {
          await onCollectionUpdate();
        }

        if (onFavoriteCollectionsUpdate) {
          await onFavoriteCollectionsUpdate();
        }

        // ✅ تبديل التاب إلى "My Collections" لإظهار المجموعة الجديدة
        if (onTabChange && activeTab !== "my") {
          onTabChange("my");
        }

        // ✅ محاولة جلب المجموعة الجديدة وتحديدها (اختياري)
        setTimeout(async () => {
          try {
            // جلب قائمة المجموعات المحدثة
            const collectionsRes = await axios.get(
              "/api/v1/Collection/GetLibraryCollections",
            );
            if (collectionsRes.data?.data?.length > 0) {
              // البحث عن المجموعة المنسوخة (التي تنتهي بـ "(Copy)")
              const copiedCollection = collectionsRes.data.data.find(
                (c) => c.name?.endsWith("(Copy)") || c.name?.includes("Copy"),
              );

              // إذا وجدناها، نأخذ آخر مجموعة كبديل
              const newCollection =
                copiedCollection ||
                collectionsRes.data.data[collectionsRes.data.data.length - 1];

              if (newCollection && onSelectCollection) {
                // جلب تفاصيل المجموعة الجديدة كاملة
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

      // محاولة استخراج رسالة الخطأ من الـ response
      let errorMsg = t("collection.copyError") || "❌ Error copying collection";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMsg = Object.values(err.response.data.errors).flat()[0];
      } else if (err.message) {
        errorMsg = err.message;
      }

      if (showMessage) showMessage(errorMsg, "error");
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
      if (showMessage) showMessage(t("collection.updateError"), "error");
    }
  };

  const safeCollections = Array.isArray(collections) ? collections : [];

  // تحويل favoriteCollections إلى تنسيق موحد مع id
  const safeFavoriteCollections = Array.isArray(favoriteCollections)
    ? favoriteCollections.map((collection) => ({
        ...collection,
        id: collection.collectionId || collection.id,
        collectionId: collection.collectionId || collection.id,
      }))
    : [];

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
                    <p>
                      {collection.description || t("collection.noDescription")}
                    </p>
                    <span className="collection-meta">
                      {collection.filesCount || 0} {t("collection.files")}
                    </span>
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
                      <p>
                        {collection.description ||
                          t("collection.noDescription")}
                      </p>
                      <span className="collection-meta">
                        {collection.filesCount || 0} {t("collection.files")}
                      </span>
                      {collection.courseName && (
                        <span className="course-name-badge">
                          📚 {collection.courseName}
                        </span>
                      )}
                    </div>
                    <div className="collection-actions">
                      <button
                        className="copy-collection-btn"
                        onClick={(e) => handleCopyCollection(collectionId, e)}
                        disabled={copyingId === collectionId}
                        title={
                          t("collection.copyToMyCollections") ||
                          "Copy to my collections"
                        }
                      >
                        {copyingId === collectionId ? (
                          <span className="copy-spinner">⏳</span>
                        ) : (
                          <span className="copy-text">
                            {t("collection.copy") || "Copy"}
                          </span>
                        )}
                      </button>
                      <button
                        className="remove-favorite-btn"
                        onClick={(e) =>
                          handleRemoveFromFavorites(collectionId, e)
                        }
                        title={
                          t("collection.removeFromFavorites") ||
                          "Remove from favorites"
                        }
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

      {editingCollection && (
        <div
          className="edit-modal-overlay"
          onClick={() => setEditingCollection(null)}
        >
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
              <button onClick={() => setEditingCollection(null)}>
                {t("collection.cancel")}
              </button>
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
