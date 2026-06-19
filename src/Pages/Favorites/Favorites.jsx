import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../api/axiosInstance";
import "./Favorites.css";
import FavoriteFileCard from "../Browse/component/FavoriteFileCard";
import { useTranslation } from "react-i18next";
import CollectionSidebar from "./component/CollectionSidebar";
import AddToCollectionModal from "./component/AddToCollectionModal";
import CollectionFilesView from "./component/CollectionFilesView";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_API_URL;
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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
  const [activeTab, setActiveTab] = useState("all");
  const [sidebarActiveTab, setSidebarActiveTab] = useState("my");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("0");
  const [isDescending] = useState(true);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);  
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

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => {
        setCategories(res.data.data || []);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    setCourseId("");
    axios
      .get(`/Api/Course/GetList/${categoryId}`)
      .then((res) => {
        setCourses(res.data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
      });
  }, [categoryId]);

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

  const handleUserClick = (userId) => {
    console.log("🔵 handleUserClick called with userId:", userId);
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage(t("favorites.loginRequired"), "warning");
      return;
    }
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      console.log("⚠️ No valid userId provided");
      showMessage(t("favorites.cannotViewProfile"), "warning");
    }
  };

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
          categoryId: file.categoryId,
          courseId: file.courseId,
          photoUrl: file.photoUrl,
        }));

        setFiles(filesData);
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

      let favorites = [];

      if (res.data && res.data.succeeded && res.data.data && Array.isArray(res.data.data)) {
        favorites = res.data.data.map((item) => ({
          id: item.collectionId,
          collectionId: item.collectionId,
          name: item.name,
          description: item.description || "",
          filesCount: item.filesCount || 0,
          files: item.files || [],
          uploaderId: item.uploaderId,
          uploaderName: item.uploaderName,
          courseName: item.courseName || "",
          addedAt: item.addedAt,
          isFavorite: true,
        }));
      }

      console.log("✅ Final favorite collections:", favorites.length);
      setFavoriteCollections(favorites);
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

  const searchInFavorites = useCallback(async () => {
    if (!searchTerm && !categoryId && !courseId && !fileType) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    
    try {
      let orderByValue = undefined;
      if (orderBy === "0") {
        orderByValue = "DownloadCount";
      } else if (orderBy === "1") {
        orderByValue = "UploadedAt";
      }

      const params = {
        Keyword: searchTerm || undefined,
        CategoryId: categoryId || undefined,
        CourseId: courseId || undefined,
        FileType: fileType || undefined,
        OrderBy: orderByValue,
        IsDescending: isDescending,
      };

      console.log("🔍 Searching in favorites:", params);

      const res = await axios.get("/Api/EduFile/Search", { params });
      
      const allFiles = res.data.data?.files || [];
      
      const favoriteFilesIds = new Set(files.map(f => f.eduFileId || f.id));
      const filteredFavorites = allFiles.filter(file => 
        favoriteFilesIds.has(file.id || file.eduFileId)
      );
      
      setSearchResults(filteredFavorites);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryId, courseId, fileType, orderBy, isDescending, files]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || categoryId || courseId || fileType) {
        searchInFavorites();
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryId, courseId, fileType, orderBy, searchInFavorites]);

  useEffect(() => {
    if (selectedCollection) return;

    if (isSearching) {
      let result = [...searchResults];

      if (activeTab !== "all" && !fileType) {
        result = result.filter((file) => Number(file.fileType) === Number(activeTab));
      }

      if (orderBy === "0") {
        result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      } else if (orderBy === "1") {
        result.sort((a, b) => {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          
          return dateB - dateA;
        });
      }

      setFilteredFiles(result);
    } else {
      let result = [...files];

      if (activeTab !== "all" && !fileType) {
        result = result.filter((file) => Number(file.fileType) === Number(activeTab));
      }

      if (orderBy === "0") {
        result.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
      } else if (orderBy === "1") {
        result.sort((a, b) => {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          
          return dateB - dateA;
        });
      }

      setFilteredFiles(result);
    }
  }, [files, searchResults, isSearching, activeTab, fileType, orderBy, selectedCollection]);

  const resetFilters = () => {
    setCategoryId("");
    setCourseId("");
    setFileType("");
    setOrderBy("0");
    setActiveTab("all");
    setSearchTerm("");
    setIsSearching(false);
    setSearchResults([]);
    setShowFilters(false);
  };

  useEffect(() => {
    const handleFavoriteRemoved = (event) => {
      const { fileId } = event.detail;
      setFiles((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
      if (isSearching) {
        setSearchResults((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
      }
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
  }, [fetchFavorites, fetchFavoriteCollections, isSearching]);

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
      if (isSearching) {
        setSearchResults((prev) => prev.filter((f) => (f.eduFileId || f.id) !== fileId));
      }
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

  const handleSelectCollection = (collection) => {
    console.log("Collection selected:", collection);
    if (collection && collection.files) {
      console.log("Files in collection:", collection.files.length);
    }
    const isFavorite = collection.isFavorite || sidebarActiveTab === "favorite";
    setSelectedCollection({ ...collection, isFavorite });
    
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (isMobileOrTablet) {
      scrollToCollectionFiles();
    }
  };

  const handleBackToFavorites = () => {
    setSelectedCollection(null);
    setSearchTerm("");
    setActiveTab("all");
    resetFilters();
  };

  const activeFiltersCount = [categoryId, courseId, fileType !== "", orderBy !== "0", searchTerm].filter(Boolean).length;

  if (loading && !isSearching) {
    return (
      <div className="favorites-loading">
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

            <div className="search-filter-wrapper">
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

              <button 
                className={`filter-toggle-btn ${showFilters ? "active" : ""} ${activeFiltersCount > 0 ? "has-filters" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter /> 
                {t("browse.filters")}
                {activeFiltersCount > 0 && <span className="filters-badge">{activeFiltersCount}</span>}
              </button>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <div className="filters-grid">
                  <select 
                    className="filter-select"
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">{t("browse.allCategories")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="filter-select"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    disabled={!categoryId}
                  >
                    <option value="">{t("browse.courses")}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="filter-select"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                  >
                    <option value="">{t("browse.allTypes")}</option>
                    <option value="0">{t("browse.types.lecture")}</option>
                    <option value="1">{t("browse.types.slides")}</option>
                    <option value="2">{t("browse.types.summary")}</option>
                    <option value="3">{t("browse.types.exam")}</option>
                    <option value="4">{t("browse.types.assignment")}</option>
                    <option value="5">{t("browse.types.book")}</option>
                    <option value="6">{t("browse.types.other")}</option>
                  </select>
                  
                  <select
                    className="filter-select"
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                  >
                    <option value="0">{t("browse.order.mostDownloaded")}</option>
                    <option value="1">{t("browse.order.newest")}</option>
                  </select>
                </div>
                
                {(categoryId || courseId || fileType || orderBy !== "0" || searchTerm) && (
                  <button className="reset-filters-btn" onClick={resetFilters}>
                    {t("browse.resetFilters")}
                  </button>
                )}
              </div>
            )}

            <div className="tabs-container">
              {fileTypes.map((type) => (
                <button
                  key={type.id}
                  className={`tab-btn ${activeTab === type.id && !fileType ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(type.id);
                    if (type.id !== "all") {
                      setFileType(type.id === "all" ? "" : String(type.id));
                    } else {
                      setFileType("");
                    }
                  }}
                >
                  {type.icon} {type.name}
                  <span className="tab-count">
                    {
                      (isSearching ? searchResults : files).filter(
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
              <div className={`message-success message-${messageType}`}>
                {message}
              </div>
            )}

            <div className="files-grid">
              {filteredFiles.length === 0 ? (
                <div className="empty-files-container">
                  <p className="empty-title">
                    {t("favorites.noFilesFound")}
                  </p>
                  <p className="empty-subtitle">
                    {searchTerm || categoryId || courseId || fileType 
                      ? t("favorites.tryChangingFilters") 
                      : t("favorites.addFilesFromBrowse")}
                  </p>
                  {(searchTerm || categoryId || courseId || fileType) && (
                    <button className="reset-filters-btn empty-reset-btn" onClick={resetFilters}>
                      {t("browse.resetFilters")}
                    </button>
                  )}
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