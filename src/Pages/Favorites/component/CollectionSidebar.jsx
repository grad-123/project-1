import React, { useState, useEffect } from "react";
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
  className = ""
}) {


  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [copyingId, setCopyingId] = useState(null);

  // ✅ دالة مساعدة للحصول على ID المجموعة بشكل موحد
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
      // ✅ تأكد من تحويل الملفات بشكل صحيح
      const files = res.data.data.files || [];
      console.log("📁 Files in collection:", files.length);
      
      const fullCollection = {
        ...collection,
        id: collectionId,
        collectionId: collectionId,
        name: res.data.data.name || collection.name,
        description: res.data.data.description || collection.description,
        files: files, // ✅ تمرير الملفات مباشرة
        filesCount: files.length,
        courseName: res.data.data.courseName || collection.courseName,
        uploaderName: res.data.data.uploaderName || collection.uploaderName,
        source: activeTab,
        isFavorite: activeTab === "favorite"
      };
      
      console.log("✅ Full collection prepared:", { 
        name: fullCollection.name, 
        filesCount: fullCollection.files.length 
      });
      
      if (onSelectCollection) {
        onSelectCollection(fullCollection);
      }
    } else {
      console.log("⚠️ Using existing collection data");
      if (onSelectCollection) {
        // ✅ إذا فشل API، استخدم البيانات الموجودة مع محاولة جلب الملفات
        onSelectCollection({ 
          ...collection, 
          id: collectionId,
          source: activeTab, 
          isFavorite: activeTab === "favorite",
          files: collection.files || [], // ✅ استخدم الملفات إذا كانت موجودة
          filesCount: collection.filesCount || collection.files?.length || 0
        });
      }
    }
  } catch (err) {
    console.error("🔴 Error fetching collection details:", err);
    // ✅ حتى لو فشل، حاول عرض المجموعة بالبيانات الموجودة
    if (onSelectCollection) {
      onSelectCollection({ 
        ...collection, 
        id: collectionId,
        source: activeTab, 
        isFavorite: activeTab === "favorite",
        files: collection.files || [],
        filesCount: collection.filesCount || collection.files?.length || 0
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
    if (window.confirm(t("collection.removeFromFavoritesConfirm") || "Remove this collection from favorites?")) {
      try {
        await axios.delete(`/Favorite/RemoveCollection/${collectionId}`);
        if (onFavoriteCollectionsUpdate) onFavoriteCollectionsUpdate();
        if (selectedCollectionId === collectionId && onSelectCollection) {
          onSelectCollection(null);
        }
        if (showMessage) showMessage(t("collection.removedFromFavorites"), "success");
      } catch (err) {
        console.log("Error removing from favorites:", err);
        if (showMessage) showMessage(t("collection.removeError"), "error");
      }
    }
  };

  const copyCollectionAlternative = async (collectionId, collectionName, collectionDesc, existingFiles = []) => {
  try {
    console.log("📦 Copying collection with files from prop:", existingFiles.length);
    
    // ✅ استخدم الملفات الموجودة في الـ prop إذا كانت موجودة
    let originalFiles = existingFiles;
    
    // إذا لم تكن هناك ملفات في الـ prop، حاول جلبها من API
    if (!originalFiles || originalFiles.length === 0) {
      console.log("🔄 No files in prop, trying to fetch from API...");
      try {
        const getResponse = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
        if (getResponse.data && getResponse.data.data) {
          originalFiles = getResponse.data.data.files || [];
        }
      } catch (err) {
        console.log("⚠️ Could not fetch from API:", err.message);
      }
    }
    
    console.log("📁 Files to copy:", originalFiles.length);
    
    // إنشاء مجموعة جديدة
    const newName = `${collectionName} (Copy)`;
    console.log("Creating new collection:", newName);
    
    const createResponse = await axios.post("/api/v1/Collection/CreateLibrary", {
      name: newName,
      description: collectionDesc || `Copied from ${collectionName}`
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // جلب المجموعات للعثور على ID الجديد
    const collectionsRes = await axios.get("/api/v1/Collection/GetLibraryCollections");
    
    let newCollectionId = null;
    if (collectionsRes.data && collectionsRes.data.data) {
      const newCollection = collectionsRes.data.data.find(c => c.name === newName);
      if (newCollection) {
        newCollectionId = newCollection.id;
      } else {
        const lastCollection = collectionsRes.data.data[collectionsRes.data.data.length - 1];
        if (lastCollection) {
          newCollectionId = lastCollection.id;
        }
      }
    }
    
    if (!newCollectionId) {
      throw new Error("Could not get new collection ID");
    }
    
    // إضافة الملفات
    let addedCount = 0;
    for (const file of originalFiles) {
      const fileId = file.eduFileId || file.id;
      if (!fileId) continue;
      
      try {
        await axios.post("/api/v1/collection/AddFile", {
          collectionId: Number(newCollectionId),
          edufileId: Number(fileId)
        });
        addedCount++;
      } catch (err) {
        console.log("Error adding file:", fileId);
      }
    }
    
    const message = addedCount > 0 
      ? `✅ Collection copied! Added ${addedCount} files to "${newName}"`
      : `⚠️ Collection "${newName}" created but no files were added`;
    
    if (showMessage) showMessage(message, addedCount > 0 ? "success" : "warning");
    
    return { success: true, newCollectionId, addedCount };
    
  } catch (err) {
    console.error("Alternative copy failed:", err);
    throw err;
  }
};

 const handleCopyCollection = async (collectionId, e) => {
  e.stopPropagation();
  setCopyingId(collectionId);
  
  const collectionToCopy = safeFavoriteCollections.find(c => (c.collectionId || c.id) === collectionId);
  const collectionName = collectionToCopy?.name || "Collection";
  const collectionDesc = collectionToCopy?.description || "";
  const existingFiles = collectionToCopy?.files || [];
  
  console.log("📦 Copying collection with files:", existingFiles.length);
  
  try {
    // ✅ الخطوة 1: محاولة جعل جميع الملفات مفضلة (إذا كانت غير مفضلة، سيتم إضافتها)
    console.log("🔄 Step 1: Making all files in collection favorites...");
    let favoritedCount = 0;
    
    for (const file of existingFiles) {
      const fileId = file.eduFileId || file.id;
      if (!fileId) continue;
      
      try {
        // محاولة إضافة الملف إلى المفضلة (إذا كان موجوداً بالفعل، سيرجع خطأ 409 أو رسالة)
        await axios.post(`/Favorite/Add/${fileId}`);
        favoritedCount++;
        console.log(`✅ Added file ${fileId} to favorites`);
      } catch (err) {
        // إذا كان الملف مفضلاً بالفعل، تجاهل الخطأ
        if (err.response?.status === 409 || err.response?.data?.message?.includes("already")) {
          console.log(`ℹ️ File ${fileId} is already favorite`);
        } else {
          console.log(`⚠️ Could not favorite file ${fileId}:`, err.message);
        }
      }
    }
    
    if (favoritedCount > 0) {
      console.log(`✅ Added ${favoritedCount} new files to favorites`);
      // إرسال حدث لتحديث صفحة Favorites
      window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: { count: favoritedCount } }));
      // تحديث القائمة المحلية
      if (window.refreshFavorites) {
        window.refreshFavorites();
      }
    }
    
    // ✅ الخطوة 2: نسخ المجموعة
    console.log("🔄 Step 2: Copying collection...");
    const result = await copyCollectionAlternative(collectionId, collectionName, collectionDesc, existingFiles);
    
    if (result.success) {
      const message = favoritedCount > 0 
        ? `✨ Collection copied! ${favoritedCount} file${favoritedCount > 1 ? 's were' : ' was'} added to favorites first.`
        : "✨ Collection copied to My Collections successfully!";
      if (showMessage) showMessage(message, "success");
      
      if (onCollectionUpdate) await onCollectionUpdate();
      if (onFavoriteCollectionsUpdate) await onFavoriteCollectionsUpdate();
      
      if (result.newCollectionId && onSelectCollection) {
        try {
          const newCollectionRes = await axios.get(`/api/v1/Collection/GetById/${result.newCollectionId}`);
          if (newCollectionRes.data && newCollectionRes.data.data) {
            const fullCollection = {
              id: result.newCollectionId,
              name: newCollectionRes.data.data.name,
              description: newCollectionRes.data.data.description,
              files: newCollectionRes.data.data.files || [],
              filesCount: newCollectionRes.data.data.files?.length || 0,
              source: "my",
              isFavorite: false
            };
            onSelectCollection(fullCollection);
          }
        } catch (err) {
          console.log("Error opening new collection:", err);
        }
      }
    }
    
  } catch (err) {
    console.log("Error in copy process:", err);
    if (showMessage) showMessage("❌ Error copying collection", "error");
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
        description: newDescription
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
  
  // ✅ تحويل favoriteCollections إلى تنسيق موحد مع id
  const safeFavoriteCollections = Array.isArray(favoriteCollections) 
    ? favoriteCollections.map(collection => ({
        ...collection,
        id: collection.collectionId || collection.id,  // ✅ تأكد من وجود id
        collectionId: collection.collectionId || collection.id
      }))
    : [];
  return (
    <div className={`collection-sidebar ${className}`}>
      <div className="sidebar-header">
        <h3>{t("collection.collections")}</h3>
        {activeTab === "my" && (
          <button className="create-collection-btn" onClick={() => setShowCreateModal(true)}>
            {t("collection.createNew")}
          </button>
        )}
      </div>

      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === "my" ? "active" : ""}`}
          onClick={() => onTabChange && onTabChange("my")}
        >
          📚 {t("collection.myCollections") || "My Collections"} ({safeCollections.length})
        </button>
        <button 
          className={`sidebar-tab ${activeTab === "favorite" ? "active" : ""}`}
          onClick={() => onTabChange && onTabChange("favorite")}
        >
          ❤️ {t("collection.favoriteCollections") || "Favorite Collections"} ({safeFavoriteCollections.length})
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
                    <button className="rename-btn" onClick={(e) => handleRenameStart(collection, e)} title={t("collection.rename")}>✏️</button>
                    <button className="delete-btn" onClick={(e) => handleDeleteCollection(collection.id, e)} title={t("collection.delete")}>✕</button>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
            {safeFavoriteCollections.length === 0 ? (
              <div className="empty-collections">
                {t("collection.noFavoriteCollections") || "No favorite collections yet. Go to a course and favorite a collection!"}
              </div>
            ) : (
              safeFavoriteCollections.map(collection => {
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
                      <span className="collection-meta">
                        {collection.filesCount || 0} {t("collection.files")}
                      </span>
                      {collection.courseName && (
                        <span className="course-name-badge">📚 {collection.courseName}</span>
                      )}
                    </div>
                    <div className="collection-actions">
                      <button 
                        className="copy-collection-btn" 
                        onClick={(e) => handleCopyCollection(collectionId, e)}
                        disabled={copyingId === collectionId}
                        title={t("collection.copyToMyCollections") || "Copy to my collections"}
                      >
                        {copyingId === collectionId ? "⏳" : t("collection.copy")}
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