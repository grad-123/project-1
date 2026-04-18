import React, { useEffect, useState, useCallback } from "react";
import "./Browse.css";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import axios from "../../../api/axiosInstance";
import { FaSearch } from "react-icons/fa";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";

function Browse() {
  const [message, setMessage] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [categoryId, setCategoryId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("0"); 
  const [isDescending] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  const [favoriteCollections, setFavoriteCollections] = useState([]);
  const [togglingCollectionId, setTogglingCollectionId] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionFiles, setCollectionFiles] = useState([]);
  const [showCollectionFiles, setShowCollectionFiles] = useState(false);
  const [collectionFileType, setCollectionFileType] = useState("all");
  
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => {
        setCategories(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/Favorite/Getlist")
      .then((res) => {
        const favIds = res.data.data.map((f) => f.eduFileId);
        setFavorites(favIds);
      })
      .catch((err) => console.log(err));
  }, []);

  const fetchFavoriteCollections = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setFavoriteCollections([]);
      return;
    }
    try {
      const res = await axios.get("/Favorite/GetCollections");
      if (res.data && res.data.succeeded && res.data.data) {
        setFavoriteCollections(res.data.data.map(item => item.collectionId));
      } else if (Array.isArray(res.data)) {
        setFavoriteCollections(res.data.map(item => item.collectionId || item.id));
      } else {
        setFavoriteCollections([]);
      }
    } catch (err) {
      console.log("Error fetching favorite collections:", err);
      setFavoriteCollections([]);
    }
  }, []); 

  useEffect(() => {
    fetchFavoriteCollections();
  }, [fetchFavoriteCollections]);

  const addFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(`/Favorite/Add/${fileId}`);
      setFavorites((prev) => [...prev, fileId]);
    } catch (err) {
      console.log(err);
    }
  };

  const removeFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFavorites((prev) => prev.filter((id) => id !== fileId));
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFavorite = (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Login first to add/remove favorites!");
      return;
    }
    if (favorites.includes(fileId)) {
      removeFavorite(fileId);
    } else {
      addFavorite(fileId);
    }
  };

  const addFavoriteCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("browse.loginFirst"));
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    setTogglingCollectionId(collectionId);
    try {
      await axios.post(`/Favorite/AddCollection/${collectionId}`);
      setFavoriteCollections(prev => [...prev, collectionId]);
      setMessage(t("browse.collectionAddedToFavorites"));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log(err);
      setMessage(t("browse.errorAddingCollection"));
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setTogglingCollectionId(null);
    }
  };

  const removeFavoriteCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setTogglingCollectionId(collectionId);
    try {
      await axios.delete(`/Favorite/RemoveCollection/${collectionId}`);
      setFavoriteCollections(prev => prev.filter(id => id !== collectionId));
      setMessage(t("browse.collectionRemovedFromFavorites"));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log(err);
      setMessage(t("browse.errorRemovingCollection"));
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setTogglingCollectionId(null);
    }
  };

  const openCollection = async (collection) => {
    setSelectedCollection(collection);
    setShowCollectionFiles(true);
    setCollectionFileType("all");
    try {
      const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
      if (res.data && res.data.succeeded && res.data.data) {
        const collectionData = res.data.data;
        const files = (collectionData.files || []).map(file => ({
          ...file,
          id: file.eduFileId,
          eduFileId: file.eduFileId,
          fileType: Number(file.fileType),
          title: file.title,
          filePath: file.filePath,
          description: file.description,
          courseName: file.courseName,
          categoryName: file.categoryName,
          downloadCount: file.downloadCount || 0,
          uploadedAt: file.uploadedAt || collectionData.createdAt,
          uploadedByUserName: file.uploadedByUserName || collectionData.uploaderName,
          uploadedByUserId: file.uploadedByUserId || collectionData.uploaderId
        }));
        setCollectionFiles(files);
      } else {
        setCollectionFiles([]);
      }
    } catch (err) {
      console.error("Error fetching collection files:", err);
      setCollectionFiles([]);
    }
  };

  const backToResults = () => {
    setSelectedCollection(null);
    setShowCollectionFiles(false);
    setCollectionFiles([]);
    setCollectionFileType("all");
  };

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // دالة البحث
  const searchFiles = async () => {
    try {
      // تحويل orderBy إلى القيمة الصحيحة للـ API
      let orderByValue = undefined;
      if (orderBy === "0") {
        orderByValue = "DownloadCount";
      } else if (orderBy === "1") {
        orderByValue = "UploadedAt";
      }
      
      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: debouncedSearch || undefined,
          CategoryId: categoryId || undefined,
          CourseId: courseId || undefined,
          FileType: fileType || undefined,
          OrderBy: orderByValue,
          IsDescending: isDescending,
        },
      });

      const filesData = res.data.data?.files || [];
      const collectionsData = res.data.data?.collections || [];
      
      setFiles(Array.isArray(filesData) ? filesData : []);
      setCollections(Array.isArray(collectionsData) ? collectionsData : []);
      
    } catch (err) {
      console.error("Search error:", err);
      setFiles([]);
      setCollections([]);
    }
  };

  const handleSearch = () => {
    if (!searchTerm && !categoryId && !courseId) {
      setMessage(t("browse.enterKeyword"));
      return;
    }
    setShowResults(true);
    setShowCollectionFiles(false);
    setSelectedCollection(null);
    searchFiles();
  };

  useEffect(() => {
    if (!showResults) return;
    searchFiles();
  }, [debouncedSearch, categoryId, courseId, fileType, orderBy]);

  const getFileTypeIcon = (type) => {
    const icons = { 0: "🎥", 1: "📄", 2: "📝", 3: "📝", 4: "📌", 5: "📚", 6: "📁" };
    return icons[type] || "📄";
  };

  const getFileTypeName = (type) => {
    const names = {
      0: t("browse.types.lecture"),
      1: t("browse.types.slides"),
      2: t("browse.types.summary"),
      3: t("browse.types.exam"),
      4: t("browse.types.assignment"),
      5: t("browse.types.book"),
      6: t("browse.types.other")
    };
    return names[type] || t("browse.types.other");
  };

  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("browse.loginToViewProfile") || "Please login to view profile");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    const validUserId = userId || null;
    if (validUserId && validUserId !== 0 && validUserId !== "0") {
      navigate(`/PublicProfile/${validUserId}`);
    } else {
      setMessage("لا يمكن عرض الملف الشخصي - معرف المستخدم غير صالح");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const CollectionCard = ({ collection }) => {
    const isFav = favoriteCollections.includes(collection.id);
    const isToggling = togglingCollectionId === collection.id;

    const uploaderId = collection.uploadedByUserId || collection.uploaderId || collection.userId;
    const uploaderName = collection.uploaderName || collection.uploadedByUserName || collection.userName;

    return (
      <div className="collection-card" onClick={() => openCollection(collection)}>
        <div className="collection-icon">📦</div>
        <div className="collection-info">
          <h3 className="collection-title">{collection.name}</h3>
          <p className="collection-description">
            {collection.description || t("browse.noDescription")}
          </p>
          <div className="collection-meta">
            <span>📚 {collection.courseName || t("browse.unknownCourse")}</span>
            <span>📄 {collection.filesCount || 0} {t("browse.files")}</span>
            <span 
              className="uploader-name-clickable"
              onClick={(e) => handleUploaderClick(uploaderId, uploaderName, e)}
              title={t("browse.clickToViewProfile")}
              style={{ cursor: 'pointer', color: '#007bff' }}
            >
              👤 {uploaderName || t("browse.unknown")}
            </span>
          </div>
        </div>
        <div className="collection-actions">
          <button
            className={`collection-favorite-btn ${isFav ? "active" : ""}`}
            onClick={async (e) => {
              e.stopPropagation();
              if (isToggling) return;
              if (isFav) {
                await removeFavoriteCollection(collection.id);
              } else {
                await addFavoriteCollection(collection.id);
              }
            }}
            disabled={isToggling}
            title={isFav ? t("browse.removeFromFavorites") : t("browse.addToFavorites")}
          >
            {isToggling ? "⏳" : (isFav ? "❤️" : "♡")}
          </button>
          <button
            className="view-collection-btn"
            onClick={(e) => {
              e.stopPropagation();
              openCollection(collection);
            }}
          >
            {t("browse.viewFiles")} 📂
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const hasFiles = files.length > 0;
  const hasCollections = collections.length > 0;

  return (
    <div className="browse-page">
      <h1 className="browse-title">{t("browse.categories")}</h1>
      <p className="browse-description">{t("browse.description")}</p>
      {message && <div className="message">{message}</div>}
      
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
        <button className="search-btn" onClick={handleSearch}>
          {t("browse.searchButton")}
        </button>
      </div>

      {!showResults && (
        <div className="categories-container">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses/${cat.id}`}
              state={{ categoryName: cat.name }}
              className="category-link"
            >
              <div className="category-card">
                <div className="card-content">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <div className="card-arrow">›</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showResults && (
        <>
          <div className="filters">
            <select onChange={(e) => setCategoryId(Number(e.target.value))}>
              <option value="">{t("browse.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              disabled={!categoryId}
            >
              <option value="">{t("browse.courses")}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            
            {hasFiles && (
              <select
                onChange={(e) =>
                  setFileType(e.target.value === "" ? "" : Number(e.target.value))
                }
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
            )}
            
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="0">{t("browse.order.mostDownloaded")}</option>
              <option value="1">{t("browse.order.newest")}</option>
            </select>
          </div>

          {showCollectionFiles && selectedCollection ? (
            <>
              <div className="back-header">
                <button className="back-btn" onClick={backToResults}>
                  ← {t("browse.backToResults")}
                </button>
                <h3 className="collection-title-header">📦 {selectedCollection.name}</h3>
                <p className="collection-desc-header">{selectedCollection.description}</p>
              </div>

              <div className="tabs">
                <button 
                  className={collectionFileType === "all" ? "active" : ""} 
                  onClick={() => setCollectionFileType("all")}
                >
                  📂 {t("browse.all")} ({collectionFiles.length})
                </button>
                {[0, 1, 2, 3, 4, 5, 6].map(type => (
                  <button 
                    key={type} 
                    className={collectionFileType === type ? "active" : ""} 
                    onClick={() => setCollectionFileType(type)}
                  >
                    {getFileTypeIcon(type)} {getFileTypeName(type)} ({collectionFiles.filter(f => f.fileType === type).length})
                  </button>
                ))}
              </div>

              {collectionFiles.length === 0 ? (
                <div className="no-results">
                  <h3>{t("browse.noFilesInCollection")}</h3>
                </div>
              ) : (
                <div className="files-container">
                  {collectionFiles
                    .filter(f => collectionFileType === "all" || f.fileType === collectionFileType)
                    .map((file) => (
                      <FavoriteFileCard
                        key={file.id || file.eduFileId}
                        file={file}
                        isFavorite={favorites.includes(file.id || file.eduFileId)}
                        toggleFavorite={toggleFavorite}
                        serverUrl={serverUrl}
                        setMessage={setMessage}
                        hideFileType={true}
                        hideUploader={false}
                      />
                    ))}
                </div>
              )}
            </>
          ) : (
            <>
              {hasFiles && (
                <div className="files-section">
                  <h2>{t("browse.files")} ({files.length})</h2>
                  <div className="files-container">
                    {files.map((file) => (
                      <FavoriteFileCard
                        key={file.id || file.eduFileId}
                        file={file}
                        isFavorite={favorites.includes(file.id || file.eduFileId)}
                        toggleFavorite={toggleFavorite}
                        serverUrl={serverUrl}
                        setMessage={setMessage}
                        hideFileType={false}
                        hideUploader={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {hasCollections && (
                <div className="collections-section">
                  <h2>{t("browse.collections")} ({collections.length})</h2>
                  <div className="collections-grid">
                    {collections.map((collection) => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </div>
                </div>
              )}

              {!hasFiles && !hasCollections && (
                <div className="no-results">
                  <h3>{t("browse.noResults")}</h3>
                  <p>{t("browse.tryAnotherSearch")}</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Browse;