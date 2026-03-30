import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import "./Favorites.css";
import FavoriteFileCard from "../Browse/component/FavoriteFileCard";
import { useTranslation } from "react-i18next";
import CollectionSidebar from "./component/CollectionSidebar";
import AddToCollectionModal from "./component/AddToCollectionModal";
import CollectionFilesView from "./component/CollectionFilesView";
import { FaSearch } from "react-icons/fa";

function Favorites() {
  const { t } = useTranslation();
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  
  // New state for collection view
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // File types for tabs with translations
  const fileTypes = [
    { id: "all", name: t("fileTypes.all"), icon: "📂" },
    { id: 0, name: t("fileTypes.videos"), icon: "🎥" },
    { id: 1, name: t("fileTypes.slides"), icon: "📄" },
    { id: 2, name: t("fileTypes.summaries"), icon: "📝" },
    { id: 3, name: t("fileTypes.exams"), icon: "📝" },
    { id: 4, name: t("fileTypes.assignments"), icon: "📌" },
    { id: 5, name: t("fileTypes.books"), icon: "📚" },
    { id: 6, name: t("fileTypes.other"), icon: "📁" },
  ];

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await axios.get("/Favorite/GetList");
      if (res.data && res.data.data) {
        const filesWithId = res.data.data.map(file => ({
          ...file,
          eduFileId: file.eduFileId || file.id,
          id: file.id || file.eduFileId,
          fileType: file.fileType !== undefined ? Number(file.fileType) : file.type,
          uploadedAt: file.uploadedAt || file.createdAt || file.upload_date,
          downloadCount: file.downloadCount || file.download_count || 0
        }));
        setFiles(filesWithId);
        setFilteredFiles(filesWithId);
      }
    } catch (err) {
      console.log("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await axios.get("api/v1/Collection/GetLibraryCollections");
      if (res.data && res.data.data) {
        setCollections(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching collections:", err);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
    fetchCollections();
  }, [fetchFavorites, fetchCollections]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters whenever filter criteria change (only for favorites view)
  useEffect(() => {
    if (selectedCollection) return; // Don't filter when viewing collection
    
    let result = [...files];
    
    // Filter by search term
    if (debouncedSearch) {
      result = result.filter(file => 
        file.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        file.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        file.courseName?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    
    // Filter by file type tab
    if (activeTab !== "all") {
      result = result.filter(file => Number(file.fileType) === Number(activeTab));
    }
    
    setFilteredFiles(result);
  }, [files, debouncedSearch, activeTab, selectedCollection]);

  const toggleFavorite = async (fileId) => {
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFiles(prev => prev.filter(f => (f.eduFileId || f.id) !== fileId));
      if (isSelectMode) {
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
      }
      showMessage(t("favorites.removedFromFavorites"), "success");
    } catch (err) {
      console.log("Error removing favorite:", err);
      showMessage(t("favorites.errorRemovingFromFavorites"), "error");
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleClearSelection = () => setSelectedFiles([]);

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("success");
    }, 3000);
  };

  const handleAddToCollection = async (collectionId) => {
    if (selectedFiles.length === 0) {
      showMessage(t("favorites.noFilesSelected"), "error");
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;
      let duplicateCount = 0;
      const addedFiles = [];
      const duplicateFiles = [];
      
      // Get existing files in collection from localStorage
      const storageKey = `collection_files_${collectionId}`;
      const existingFiles = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const existingIds = new Set(existingFiles.map(f => f.id || f.eduFileId));
      const existingTitles = new Set(existingFiles.map(f => f.title?.toLowerCase()));
      
      for (const fileId of selectedFiles) {
        const fileDetails = files.find(f => (f.eduFileId || f.id) === fileId);
        
        // Check if file already exists
        const isDuplicate = existingIds.has(fileId) || 
                            (fileDetails && existingTitles.has(fileDetails.title?.toLowerCase()));
        
        if (isDuplicate) {
          duplicateCount++;
          if (fileDetails) {
            duplicateFiles.push(fileDetails.title);
          }
          continue;
        }
        
        try {
          const data = {
            collectionId: Number(collectionId),
            edufileId: Number(fileId)
          };
          
          await axios.post("/api/v1/collection/AddFile", data);
          
          if (fileDetails) {
            addedFiles.push(fileDetails);
          }
          successCount++;
          
        } catch (err) {
          if (err.response?.data?.message?.includes("already")) {
            duplicateCount++;
          } else {
            failCount++;
          }
        }
      }
      
      // Show duplicate message if any
      if (duplicateCount > 0) {
        const duplicateNames = duplicateFiles.slice(0, 3).join(', ');
        const message = duplicateCount === 1 
          ? `⚠️ ${t("favorites.fileAlreadyInCollection") || "File already exists in this collection"}: ${duplicateNames}`
          : `⚠️ ${duplicateCount} ${t("favorites.filesAlreadyInCollection") || "files already exist in this collection"}`;
        showMessage(message, "warning");
      }
      
      if (successCount > 0) {
        const collectionName = collections.find(c => c.id === collectionId)?.name;
        showMessage(t("favorites.addedToCollection", { count: successCount, name: collectionName }), "success");
        
        if (addedFiles.length > 0) {
          // Save files to localStorage
          const updated = [...existingFiles, ...addedFiles];
          localStorage.setItem(storageKey, JSON.stringify(updated));

          // Dispatch event to show files immediately
          const event = new CustomEvent('filesAddedToCollection', {
            detail: {
              collectionId: collectionId,
              files: addedFiles
            }
          });
          window.dispatchEvent(event);
        }
        
        await fetchCollections();
      }
      
      if (failCount > 0) {
        showMessage(t("favorites.failedToAdd", { count: failCount }), "error");
      }
      
      setShowAddModal(false);
      setSelectedFiles([]);
      setIsSelectMode(false);
      
    } catch (err) {
      showMessage(t("favorites.errorAddingToCollection"), "error");
    }
  };

  const handleSingleFileAdd = (fileId) => {
    setSelectedFiles([fileId]);
    setShowAddModal(true);
  };

  const handleSelectCollection = (collection) => {
    console.log("Collection selected:", collection);
    setSelectedCollection(collection);
  };

  const handleBackToFavorites = () => {
    setSelectedCollection(null);
    setSearchTerm("");
    setActiveTab("all");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "1.2rem",
        color: "var(--text-secondary)"
      }}>
        {t("favorites.loading")}
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <CollectionSidebar 
        collections={collections}
        onCollectionUpdate={fetchCollections}
        onSelectCollection={handleSelectCollection}
        selectedCollectionId={selectedCollection?.id}
      />
      
      <div className="favorites-main">
        {selectedCollection ? (
          <CollectionFilesView
            collection={selectedCollection}
            onBack={handleBackToFavorites}
            onCollectionUpdate={fetchCollections}
            serverUrl={serverUrl}
            showMessage={showMessage}
          />
        ) : (
          <>
            <div className="favorites-header">
              <h1>
                {t("favorites.title.first")}
                <span className="blue">{t("favorites.title.second")}</span>
              </h1>
              <p>{t("favorites.subtitle")}</p>
            </div>

            {/* Search Bar */}
            <div className="search-wrapper">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder={t("browse.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm("")}>
                  ✕
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="tabs-container">
              {fileTypes.map(type => (
                <button
                  key={type.id}
                  className={`tab-btn ${activeTab === type.id ? "active" : ""}`}
                  onClick={() => setActiveTab(type.id)}
                >
                  {type.icon} {type.name}
                  <span className="tab-count">
                    {files.filter(f => type.id === "all" || Number(f.fileType) === Number(type.id)).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="favorites-toolbar">
              <div className="toolbar-left">
                <span className="files-count">{filteredFiles.length} {t("favorites.filesSaved")}</span>
                {isSelectMode && (
                  <span className="selected-count">{selectedFiles.length} {t("favorites.selected")}</span>
                )}
              </div>
              <div className="toolbar-right">
                {isSelectMode ? (
                  <>
                    <button className="clear-btn" onClick={handleClearSelection}>
                      {t("favorites.clear")}
                    </button>
                    <button 
                      className="add-to-collection-btn"
                      onClick={() => setShowAddModal(true)}
                      disabled={selectedFiles.length === 0}
                    >
                      + {t("favorites.addToCollection")}
                    </button>
                    <button className="cancel-select-btn" onClick={() => {
                      setIsSelectMode(false);
                      setSelectedFiles([]);
                    }}>
                      {t("favorites.cancel")}
                    </button>
                  </>
                ) : (
                  <button 
                    className="select-multiple-btn"
                    onClick={() => setIsSelectMode(true)}
                  >
                    {t("favorites.selectMultiple")}
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className="message-success" style={{
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                textAlign: "center",
                backgroundColor: messageType === "success" ? "#d4edda" : messageType === "warning" ? "#fff3cd" : "#f8d7da",
                color: messageType === "success" ? "#155724" : messageType === "warning" ? "#856404" : "#721c24",
                border: messageType === "warning" ? "1px solid #ffeeba" : "none"
              }}>
                {message}
              </div>
            )}

            <div className="files-grid">
              {filteredFiles.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "3rem",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid var(--card-border)"
                }}>
                  <p style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "1rem" }}>
                    {t("favorites.noFilesFound")}
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {searchTerm
                      ? t("favorites.tryChangingSearch")
                      : t("favorites.addFilesFromBrowse")}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const fileId = file.eduFileId || file.id;
                  return (
                    <div key={fileId} className="file-card-wrapper">
                      {isSelectMode && (
                        <input
                          type="checkbox"
                          className="file-select-checkbox"
                          checked={selectedFiles.includes(fileId)}
                          onChange={() => handleSelectFile(fileId)}
                        />
                      )}
                      <FavoriteFileCard
                        file={file}
                        isFavorite={true}
                        toggleFavorite={toggleFavorite}
                        serverUrl={serverUrl}
                        setMessage={showMessage}
                        showAddButton={!isSelectMode}
                        onAddToCollection={() => handleSingleFileAdd(fileId)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <AddToCollectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        collections={collections}
        onAdd={handleAddToCollection}
        onCreateCollection={fetchCollections}
      />
    </div>
  );
}

export default Favorites;