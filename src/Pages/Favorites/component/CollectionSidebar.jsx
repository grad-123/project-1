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
  className = "" // ✅ إضافة className
}) {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [copyingId, setCopyingId] = useState(null);

  const handleSelectCollection = async (collection) => {
    if (!collection || !collection.id) return;
    
    try {
      const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
      console.log("Collection details from API:", res.data);
      
      if (res.data && res.data.succeeded && res.data.data) {
        const fullCollection = {
          ...collection,
          id: collection.id,
          name: res.data.data.name || collection.name,
          description: res.data.data.description || collection.description,
          files: res.data.data.files || [],
          filesCount: res.data.data.files?.length || 0,
          courseName: res.data.data.courseName || collection.courseName,
          uploaderName: res.data.data.uploaderName || collection.uploaderName,
          source: activeTab,
          isFavorite: activeTab === "favorite"
        };
        
        console.log("Full collection with files:", fullCollection.files.length, "files");
        
        if (onSelectCollection) {
          onSelectCollection(fullCollection);
        }
      } else {
        console.log("Using existing collection data");
        if (onSelectCollection) {
          onSelectCollection({ 
            ...collection, 
            source: activeTab, 
            isFavorite: activeTab === "favorite",
            files: [],
            filesCount: collection.filesCount || 0
          });
        }
      }
    } catch (err) {
      console.error("Error fetching collection details:", err);
      if (onSelectCollection) {
        onSelectCollection({ 
          ...collection, 
          source: activeTab, 
          isFavorite: activeTab === "favorite",
          files: [],
          filesCount: collection.filesCount || 0
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

  // الحل البديل: نسخ المجموعة عن طريق جلب الملفات وإنشاء مجموعة جديدة
  const copyCollectionAlternative = async (collectionId, collectionName, collectionDesc) => {
    try {
      console.log("Fetching original collection details...");
      const getResponse = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
      if (!getResponse.data || !getResponse.data.data) {
        throw new Error("Could not fetch collection files");
      }
      
      const originalCollection = getResponse.data.data;
      const originalFiles = originalCollection.files || [];
      console.log("Original files to copy:", originalFiles.length);
      
      // 2. إنشاء مجموعة جديدة
      const newName = `${collectionName} (Copy)`;
      console.log("Creating new collection with name:", newName);
      
      const createResponse = await axios.post("/api/v1/Collection/CreateLibrary", {
        name: newName,
        description: collectionDesc || `Copied from ${collectionName}`
      });
      
      console.log("Create collection response:", createResponse.data);
      
      // انتظر قليلاً للتأكد من إنشاء المجموعة في قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // جلب قائمة المجموعات المحدثة للعثور على المجموعة الجديدة
      const collectionsRes = await axios.get("/api/v1/Collection/GetLibraryCollections");
      console.log("All collections after creation:", collectionsRes.data);
      
      let newCollectionId = null;
      
      if (collectionsRes.data && collectionsRes.data.data) {
        // البحث عن المجموعة الجديدة بالاسم
        const newCollection = collectionsRes.data.data.find(c => c.name === newName);
        if (newCollection) {
          newCollectionId = newCollection.id;
          console.log("Found new collection with ID:", newCollectionId);
        } else {
          // إذا لم نجدها بالاسم، خذ آخر مجموعة
          const lastCollection = collectionsRes.data.data[collectionsRes.data.data.length - 1];
          if (lastCollection) {
            newCollectionId = lastCollection.id;
            console.log("Using last collection ID:", newCollectionId);
          }
        }
      }
      
      if (!newCollectionId) {
        throw new Error("Could not get new collection ID");
      }
      
      console.log("New collection created with ID:", newCollectionId);
      
      // 3. إضافة الملفات إلى المجموعة الجديدة
      let addedCount = 0;
      for (const file of originalFiles) {
        const fileId = file.eduFileId || file.id;
        console.log("Attempting to add file:", fileId, "Title:", file.title);
        
        if (!fileId) {
          console.log("File has no ID, skipping:", file);
          continue;
        }
        
        try {
          await axios.post("/api/v1/collection/AddFile", {
            collectionId: Number(newCollectionId),
            edufileId: Number(fileId)
          });
          addedCount++;
          console.log("File added successfully");
          
        } catch (err) {
          console.log("Error adding file:", fileId, err.response?.data);
        }
      }
      
      console.log(`Added ${addedCount} of ${originalFiles.length} files to new collection`);
      
      if (addedCount === 0 && originalFiles.length > 0) {
        throw new Error("No files could be added to the new collection");
      }
      
      if (showMessage) {
        showMessage(`✅ Collection copied successfully! Added ${addedCount} files to "${newName}"`, "success");
      }
      
      return { success: true, newCollectionId };
      
    } catch (err) {
      console.error("Alternative copy failed:", err);
      throw err;
    }
  };

  // دالة النسخ المعدلة - مع تحديث القوائم فوراً
  const handleCopyCollection = async (collectionId, e) => {
    e.stopPropagation();
    setCopyingId(collectionId);
    
    console.log("Starting copy process for collection:", collectionId);
    
    const collectionToCopy = safeFavoriteCollections.find(c => (c.collectionId || c.id) === collectionId);
    const collectionName = collectionToCopy?.name || "Collection";
    const collectionDesc = collectionToCopy?.description || "";
    
    try {
      let copySuccess = false;
      let newCollectionId = null;
      
      // المحاولة الأولى: استخدام API النسخ الأصلي
      try {
        console.log("Trying original copy API...");
        const copyResponse = await axios.post(`/api/v1/Collection/Copy/${collectionId}`);
        console.log("Copy API response:", copyResponse.data);
        
        if (copyResponse.data && copyResponse.data.succeeded) {
          copySuccess = true;
          newCollectionId = copyResponse.data.data?.id;
          if (showMessage) showMessage(t("collection.copiedSuccessfully"), "success");
        } else {
          throw new Error("Original copy API failed");
        }
      } catch (originalErr) {
        console.log("Original copy API failed, trying alternative method...");
        
        // المحاولة الثانية: استخدام الطريقة البديلة
        try {
          const result = await copyCollectionAlternative(collectionId, collectionName, collectionDesc);
          copySuccess = result.success;
          newCollectionId = result.newCollectionId;
        } catch (altErr) {
          console.log("Alternative method also failed:", altErr);
          throw new Error("Both copy methods failed");
        }
      }
      
      if (copySuccess) {
        if (showMessage) {
          showMessage(t("collection.copiedSuccessfullyToMyCollections") || "✨ Collection copied to My Collections successfully!", "success");
        }
        
        // ✅ تحديث قائمة My Collections فوراً
        if (onCollectionUpdate) {
          await onCollectionUpdate();
          console.log("✅ My Collections updated");
        }
        
        // ✅ تحديث قائمة Favorite Collections أيضاً
        if (onFavoriteCollectionsUpdate) {
          await onFavoriteCollectionsUpdate();
          console.log("✅ Favorite Collections updated");
        }
        
        // ✅ فتح المجموعة الجديدة مباشرة
        if (newCollectionId && onSelectCollection) {
          try {
            const newCollectionRes = await axios.get(`/api/v1/Collection/GetById/${newCollectionId}`);
            if (newCollectionRes.data && newCollectionRes.data.data) {
              const fullCollection = {
                id: newCollectionId,
                name: newCollectionRes.data.data.name,
                description: newCollectionRes.data.data.description,
                files: newCollectionRes.data.data.files || [],
                filesCount: newCollectionRes.data.data.files?.length || 0,
                source: "my",
                isFavorite: false
              };
              onSelectCollection(fullCollection);
              console.log("✅ New collection opened");
            }
          } catch (err) {
            console.log("Error opening new collection:", err);
          }
        }
      }
      
    } catch (err) {
      console.log("Error in copy process:", err);
      
      let errorMessage = t("collection.copyError") || "❌ Error copying collection";
      
      if (err.response?.data?.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.message) {
        errorMessage += ": " + err.message;
      }
      
      if (showMessage) showMessage(errorMessage, "error");
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
  const safeFavoriteCollections = Array.isArray(favoriteCollections) ? favoriteCollections : [];

  return (
    <div className={`collection-sidebar ${className}`}> {/* ✅ إضافة className هنا */}
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