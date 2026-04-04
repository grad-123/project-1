import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./Favorites.css";
import FavoriteFileCard from "../Browse/component/FavoriteFileCard";
import { useTranslation } from "react-i18next";
import CollectionSidebar from "./component/CollectionSidebar";
import AddToCollectionModal from "./component/AddToCollectionModal";
import CollectionFilesView from "./component/CollectionFilesView";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [collections, setCollections] = useState([]);
  const [favoriteCollections, setFavoriteCollections] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarActiveTab, setSidebarActiveTab] = useState("my");
  
  // ✅ Ref للتمرير التلقائي عند اختيار مجموعة
  const collectionFilesRef = useRef(null);

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

  // ✅ دالة للتمرير التلقائي إلى عرض ملفات المجموعة
  const scrollToCollectionFiles = () => {
    setTimeout(() => {
      if (collectionFilesRef.current) {
        collectionFilesRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 150);
  };

  // ✅ دالة للتنقل إلى صفحة البروفايل عند النقر على اسم المستخدم (معدلة إلى PublicProfile)
  const handleUserClick = (userId) => {
    console.log("🔵 handleUserClick called with userId:", userId);
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("الرجاء تسجيل الدخول أولاً", "warning");
      return;
    }
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      console.log("⚠️ No valid userId provided");
      showMessage("لا يمكن عرض الملف الشخصي", "warning");
    }
  };

  // ✅ Fetch Favorites
  const fetchFavorites = useCallback(async () => {
    try {
      const res = await axios.get("/Favorite/GetList");
      if (res.data && res.data.data) {
        let filesData = res.data.data.map((file) => ({
          ...file,
          eduFileId: file.eduFileId || file.id,
          id: file.id || file.eduFileId,
          fileType: file.fileType !== undefined ? Number(file.fileType) : file.type,
          uploadedAt: file.uploadedAt || file.createdAt || file.upload_date,
          downloadCount: file.downloadCount || file.download_count || 0,
          uploadedByUserId: file.uploadedByUserId,
          uploadedByUserName: file.uploadedByUserName,
          courseName: file.courseName,
          categoryName: file.categoryName,
          photoUrl: file.photoUrl,
        }));

        setFiles(filesData);
        setFilteredFiles(filesData);
      }
    } catch (err) {
      console.log("Error fetching favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.refreshFavorites = () => {
      fetchFavorites();
    };
    return () => {
      delete window.refreshFavorites;
    };
  }, [fetchFavorites]);

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

  const fetchFavoriteCollections = useCallback(async () => {
    try {
      const res = await axios.get("/Favorite/GetCollections");
      console.log("Raw favorite collections response:", res.data);

      let validFavorites = [];

      if (res.data && res.data.succeeded && res.data.data && Array.isArray(res.data.data)) {
        for (const item of res.data.data) {
          try {
            const checkRes = await axios.get(`/api/v1/Collection/GetById/${item.collectionId}`);
            if (checkRes.data && checkRes.data.succeeded && checkRes.data.data) {
              validFavorites.push({
                id: item.collectionId,
                collectionId: item.collectionId,
                name: item.name,
                description: item.description || "",
                filesCount: checkRes.data.data.files?.length || 0,
                files: checkRes.data.data.files || [],
                uploaderId: checkRes.data.data.uploaderId,
                uploaderName: checkRes.data.data.uploaderName,
                courseName: checkRes.data.data.courseName,
                addedAt: item.addedAt,
                isFavorite: true,
              });
            } else {
              console.log(`⚠️ Collection ${item.collectionId} (${item.name}) is invalid`);
              validFavorites.push({
                id: item.collectionId,
                collectionId: item.collectionId,
                name: item.name,
                description: item.description || "",
                filesCount: 0,
                files: [],
                uploaderId: item.uploaderId,
                uploaderName: item.uploaderName,
                addedAt: item.addedAt,
                isFavorite: true,
                isInvalid: true,
              });
            }
          } catch (err) {
            console.log(`⚠️ Error fetching collection ${item.collectionId}:`, err.message);
            validFavorites.push({
              id: item.collectionId,
              collectionId: item.collectionId,
              name: item.name,
              description: item.description || "",
              filesCount: 0,
              files: [],
                uploaderId: item.uploaderId,
                uploaderName: item.uploaderName,
              addedAt: item.addedAt,
              isFavorite: true,
              isInvalid: true,
            });
          }
        }
      }

      console.log("✅ Final favorite collections:", validFavorites.length);
      setFavoriteCollections(validFavorites);
    } catch (err) {
      console.log("Error fetching favorite collections:", err);
      setFavoriteCollections([]);
    }
  }, []);

  useEffect(() => {
    window.refreshFavoriteCollections = () => {
      fetchFavoriteCollections();
    };
    return () => {
      delete window.refreshFavoriteCollections;
    };
  }, [fetchFavoriteCollections]);

  useEffect(() => {
    fetchFavorites();
    fetchCollections();
    fetchFavoriteCollections();
  }, [fetchFavorites, fetchCollections, fetchFavoriteCollections]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCollection) return;

    let result = [...files];

    if (debouncedSearch) {
      result = result.filter(
        (file) =>
          file.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          file.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          file.courseName?.toLowerCase().includes(debouncedSearch.toLowerCase()),
      );
    }

    if (activeTab !== "all") {
      result = result.filter((file) => Number(file.fileType) === Number(activeTab));
    }

    setFilteredFiles(result);
  }, [files, debouncedSearch, activeTab, selectedCollection]);

  useEffect(() => {
    const handleFavoriteRemoved = (event) => {
      const { fileId } = event.detail;
      setFiles((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
      setFilteredFiles((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
    };

    const handleFavoriteAdded = (event) => {
      fetchFavorites();
      fetchFavoriteCollections();
    };

    window.addEventListener("favoriteRemoved", handleFavoriteRemoved);
    window.addEventListener("favoriteAdded", handleFavoriteAdded);

    return () => {
      window.removeEventListener("favoriteRemoved", handleFavoriteRemoved);
      window.removeEventListener("favoriteAdded", handleFavoriteAdded);
    };
  }, [fetchFavorites, fetchFavoriteCollections]);

  const removeFileFromMyCollections = async (fileId) => {
    try {
      const myCollections = [...collections];
      let removedCount = 0;
      let updatedCollections = [...collections];

      for (const collection of myCollections) {
        const collectionId = collection.id;
        if (!collectionId) continue;

        try {
          const collectionDetails = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
          const filesInCollection = collectionDetails.data?.data?.files || [];
          const fileExists = filesInCollection.some((f) => (f.eduFileId || f.id) === fileId);

          if (fileExists) {
            await axios.delete("/api/v1/collection/RemoveFile", {
              data: {
                collectionId: collectionId,
                eduFileId: fileId,
              },
            });
            removedCount++;

            const indexInCollections = updatedCollections.findIndex((c) => c.id === collectionId);
            if (indexInCollections !== -1) {
              updatedCollections[indexInCollections] = {
                ...updatedCollections[indexInCollections],
                filesCount: Math.max(0, (updatedCollections[indexInCollections].filesCount || 0) - 1),
              };
            }
          }
        } catch (err) {
          console.log(`Error checking/removing from My Collection ${collectionId}:`, err);
        }
      }

      setCollections(updatedCollections);
      return removedCount;
    } catch (err) {
      console.log("Error removing file from my collections:", err);
      return 0;
    }
  };

  const toggleFavorite = async (fileId) => {
    try {
      const removedFromMyCollections = await removeFileFromMyCollections(fileId);

      await axios.delete(`/Favorite/Delete/${fileId}`);

      setFiles((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
      if (isSelectMode) {
        setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
      }

      if (removedFromMyCollections > 0) {
        showMessage(
          `${t("favorites.removedFromFavorites")} ${t("favorites.removedFromMyCollections", { count: removedFromMyCollections })}`,
          "success",
        );
      } else {
        showMessage(t("favorites.removedFromFavorites"), "success");
      }

      await fetchCollections();
      window.dispatchEvent(new CustomEvent("favoriteRemoved", { detail: { fileId } }));
    } catch (err) {
      console.log("Error removing favorite:", err);
      showMessage(t("favorites.errorRemovingFromFavorites"), "error");
    }
  };

  const handleSelectFile = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId],
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

      let existingFileIds = new Set();
      let existingFileTitles = new Set();

      try {
        const collectionDetails = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
        const existingFilesInCollection = collectionDetails.data?.data?.files || [];
        existingFileIds = new Set(existingFilesInCollection.map((f) => f.eduFileId || f.id));
        existingFileTitles = new Set(existingFilesInCollection.map((f) => f.title?.toLowerCase()));
      } catch (err) {
        console.log("Error fetching collection details:", err);
      }

      for (const fileId of selectedFiles) {
        const fileDetails = files.find((f) => (f.eduFileId || f.id) === fileId);

        const isDuplicate =
          existingFileIds.has(fileId) ||
          (fileDetails && existingFileTitles.has(fileDetails.title?.toLowerCase()));

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
            edufileId: Number(fileId),
          };

          await axios.post("/api/v1/collection/AddFile", data);

          if (fileDetails) {
            addedFiles.push(fileDetails);
          }
          successCount++;

          existingFileIds.add(fileId);
          if (fileDetails?.title) {
            existingFileTitles.add(fileDetails.title.toLowerCase());
          }
        } catch (err) {
          console.log("Error adding file:", err);
          if (err.response?.data?.message?.includes("already") || err.response?.status === 409) {
            duplicateCount++;
            if (fileDetails) {
              duplicateFiles.push(fileDetails.title);
            }
          } else {
            failCount++;
          }
        }
      }

      if (duplicateCount > 0) {
        const duplicateNames = duplicateFiles.slice(0, 3).join(", ");
        const message =
          duplicateCount === 1
            ? `⚠️ ${t("favorites.fileAlreadyInCollection")}: ${duplicateNames}`
            : `⚠️ ${duplicateCount} ${t("favorites.filesAlreadyInCollection")}`;
        showMessage(message, "warning");
      }

      if (successCount > 0) {
        const collectionName = collections.find((c) => c.id === collectionId)?.name;
        showMessage(
          t("favorites.addedToCollection", {
            count: successCount,
            name: collectionName,
          }),
          "success",
        );

        await fetchCollections();
        await fetchFavoriteCollections();

        const event = new CustomEvent("filesAddedToCollection", {
          detail: {
            collectionId: collectionId,
            files: addedFiles,
          },
        });
        window.dispatchEvent(event);
      }

      if (failCount > 0) {
        showMessage(t("favorites.failedToAdd", { count: failCount }), "error");
      }

      setShowAddModal(false);
      setSelectedFiles([]);
      setIsSelectMode(false);
    } catch (err) {
      console.log("Error in add to collection:", err);
      showMessage(t("favorites.errorAddingToCollection"), "error");
    }
  };

  const handleSingleFileAdd = (fileId) => {
    setSelectedFiles([fileId]);
    setShowAddModal(true);
  };

  // ✅ دالة اختيار المجموعة مع التمرير التلقائي للشاشات المتوسطة والصغيرة
  const handleSelectCollection = (collection) => {
    console.log("Collection selected:", collection);
    if (collection && collection.files) {
      console.log("Files in collection:", collection.files.length);
    }
    const isFavorite = collection.isFavorite || sidebarActiveTab === "favorite";
    setSelectedCollection({ ...collection, isFavorite });
    
    // ✅ إضافة التمرير التلقائي للشاشات المتوسطة والصغيرة (≤ 1024px)
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (isMobileOrTablet) {
      scrollToCollectionFiles();
    }
  };

  const handleBackToFavorites = () => {
    setSelectedCollection(null);
    setSearchTerm("");
    setActiveTab("all");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "var(--text-secondary)",
        }}
      >
        {t("favorites.loading")}
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <CollectionSidebar
        collections={collections}
        favoriteCollections={favoriteCollections}
        onCollectionUpdate={() => {
          fetchCollections();
          fetchFavoriteCollections();
        }}
        onFavoriteCollectionsUpdate={fetchFavoriteCollections}
        onSelectCollection={handleSelectCollection}
        selectedCollectionId={selectedCollection?.id}
        activeTab={sidebarActiveTab}
        onTabChange={setSidebarActiveTab}
        showMessage={showMessage}
      />

      <div className="favorites-main">
        {selectedCollection ? (
          <div ref={collectionFilesRef}>
            <CollectionFilesView
              collection={selectedCollection}
              onBack={handleBackToFavorites}
              onCollectionUpdate={() => {
                fetchCollections();
                fetchFavoriteCollections();
              }}
              serverUrl={serverUrl}
              showMessage={showMessage}
              isFavoriteCollection={selectedCollection.isFavorite || false}
            />
          </div>
        ) : (
          <>
            <div className="favorites-header">
              <h1>
                {t("favorites.title.first")}
                <span className="blue">{t("favorites.title.second")}</span>
              </h1>
              <p>{t("favorites.subtitle")}</p>
            </div>

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

            <div className="tabs-container">
              {fileTypes.map((type) => (
                <button
                  key={type.id}
                  className={`tab-btn ${activeTab === type.id ? "active" : ""}`}
                  onClick={() => setActiveTab(type.id)}
                >
                  {type.icon} {type.name}
                  <span className="tab-count">
                    {
                      files.filter(
                        (f) => type.id === "all" || Number(f.fileType) === Number(type.id),
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>

            <div className="favorites-toolbar">
              <div className="toolbar-left">
                <span className="files-count">
                  {filteredFiles.length} {t("favorites.filesSaved")}
                </span>
                {isSelectMode && (
                  <span className="selected-count">
                    {selectedFiles.length} {t("favorites.selected")}
                  </span>
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
                    <button
                      className="cancel-select-btn"
                      onClick={() => {
                        setIsSelectMode(false);
                        setSelectedFiles([]);
                      }}
                    >
                      {t("favorites.cancel")}
                    </button>
                  </>
                ) : (
                  <button className="select-multiple-btn" onClick={() => setIsSelectMode(true)}>
                    {t("favorites.selectMultiple")}
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div
                className="message-success"
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  textAlign: "center",
                  backgroundColor:
                    messageType === "success"
                      ? "#d4edda"
                      : messageType === "warning"
                      ? "#fff3cd"
                      : "#f8d7da",
                  color:
                    messageType === "success"
                      ? "#155724"
                      : messageType === "warning"
                      ? "#856404"
                      : "#721c24",
                  border: messageType === "warning" ? "1px solid #ffeeba" : "none",
                }}
              >
                {message}
              </div>
            )}

            <div className="files-grid">
              {filteredFiles.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    backgroundColor: "var(--bg-card)",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "var(--text-main)",
                      marginBottom: "1rem",
                    }}
                  >
                    {t("favorites.noFilesFound")}
                  </p>
                  <p style={{ color: "var(--text-secondary)" }}>
                    {searchTerm ? t("favorites.tryChangingSearch") : t("favorites.addFilesFromBrowse")}
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
                        onUserClick={handleUserClick}
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