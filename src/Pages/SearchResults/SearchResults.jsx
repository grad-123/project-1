import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../api/axiosInstance";
import FavoriteFileCard from "../Browse/component/FavoriteFileCard";
import "./SearchResults.css";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const serverUrl = import.meta.env.VITE_API_URL;

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteCollections, setFavoriteCollections] = useState([]);
  const [togglingCollectionId, setTogglingCollectionId] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionFiles, setCollectionFiles] = useState([]);
  const [showCollectionFiles, setShowCollectionFiles] = useState(false);
  const [collectionFileType, setCollectionFileType] = useState("all");
  const [message, setMessage] = useState("");

  
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [selectedOrderBy, setSelectedOrderBy] = useState("0");

  const params = new URLSearchParams(location.search);
  const initialKeyword = params.get("keyword") || "";
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    const newParams = new URLSearchParams(location.search);
    const newKeyword = newParams.get("keyword") || "";
    if (newKeyword !== keyword) {
      setKeyword(newKeyword);
      setSelectedCollection(null);
      setShowCollectionFiles(false);
      setCollectionFiles([]);
    }
  }, [location.search]);

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setCourses([]);
      setSelectedCourseId("");
      return;
    }
    setSelectedCourseId("");
    axios
      .get(`/Api/Course/GetList/${selectedCategoryId}`)
      .then((res) => setCourses(res.data.data || []))
      .catch((err) => console.error("Error fetching courses:", err));
  }, [selectedCategoryId]);

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

  const searchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let orderByValue = undefined;
      if (selectedOrderBy === "0") orderByValue = "DownloadCount";
      else if (selectedOrderBy === "1") orderByValue = "UploadedAt";

      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: keyword || undefined,
          CategoryId: selectedCategoryId || undefined,
          CourseId: selectedCourseId || undefined,
          FileType: selectedFileType || undefined,
          OrderBy: orderByValue,
          IsDescending: true,
        },
      });

      setFiles(res.data.data?.files || []);
      setCollections(res.data.data?.collections || []);
    } catch (err) {
      console.error("Search error:", err);
      setFiles([]);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategoryId, selectedCourseId, selectedFileType, selectedOrderBy]);

  useEffect(() => {
    searchFiles();
  }, [searchFiles]);

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
      setMessage(t("browse.loginFirst") || "Login first!");
      setTimeout(() => setMessage(""), 3000);
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
        const formattedFiles = (collectionData.files || []).map(file => ({
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
        setCollectionFiles(formattedFiles);
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
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("browse.loginToViewProfile") || "Please login to view profile");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (userId) {
      navigate(`/PublicProfile/${userId}`);
    }
  };

  const fileTypes = [
    { id: "all", name: t("browse.all"), icon: "📂", value: "" },
    { id: 0, name: t("browse.types.lecture"), icon: "🎥", value: "0" },
    { id: 1, name: t("browse.types.slides"), icon: "📑", value: "1" },
    { id: 2, name: t("browse.types.summary"), icon: "📄", value: "2" },
    { id: 3, name: t("browse.types.exam"), icon: "🧾", value: "3" },
    { id: 4, name: t("browse.types.assignment"), icon: "📌", value: "4" },
    { id: 5, name: t("browse.types.book"), icon: "📚", value: "5" },
    { id: 6, name: t("browse.types.other"), icon: "📁", value: "6" },
  ];

  const CollectionCard = ({ collection }) => {
    const isFav = favoriteCollections.includes(collection.id);
    const isToggling = togglingCollectionId === collection.id;
    const uploaderId = collection.uploadedByUserId || collection.uploaderId;
    const uploaderName = collection.uploaderName || collection.uploadedByUserName;

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
            >
              👤 {uploaderName || t("browse.unknown")}
            </span>
          </div>
        </div>
        <div className="collection-actions">
          <button
            className={`collection-favorite-btn ${isFav ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isFav) {
                removeFavoriteCollection(collection.id);
              } else {
                addFavoriteCollection(collection.id);
              }
            }}
            disabled={isToggling}
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

  const hasFiles = files.length > 0;
  const hasCollections = collections.length > 0;

  if (loading && files.length === 0 && collections.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <h1>{t("browse.searchResults")}</h1>
      {keyword && <p className="search-keyword">{t("browse.searchingFor")}: "{keyword}"</p>}

      <div className="search-filters">
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="filter-select"
        >
          <option value="">{t("browse.allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          disabled={!selectedCategoryId}
          className="filter-select"
        >
          <option value="">{t("browse.courses")}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>

        <select
          value={selectedOrderBy}
          onChange={(e) => setSelectedOrderBy(e.target.value)}
          className="filter-select"
        >
          <option value="0">{t("browse.order.mostDownloaded")}</option>
          <option value="1">{t("browse.order.newest")}</option>
        </select>
      </div>

      {message && <div className="message">{message}</div>}

      {showCollectionFiles && selectedCollection ? (
        <>
          <div className="back-header">
            <button className="back-btn" onClick={backToResults}>
              {t("browse.backToResults")}
            </button>
            <h3 className="collection-title-header">📦 {selectedCollection.name}</h3>
            <p className="collection-desc-header">{selectedCollection.description}</p>
          </div>

          <div className="collection-tabs">
            {fileTypes.map((type) => (
              <button
                key={type.id}
                className={`collection-tab ${collectionFileType === type.id ? "active" : ""}`}
                onClick={() => setCollectionFileType(type.id)}
              >
                {type.icon} {type.name} ({collectionFiles.filter(f => type.id === "all" || f.fileType === type.id).length})
              </button>
            ))}
          </div>

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
        </>
      ) : (
        <>
          {hasFiles && (
            <div className="files-section">
              <h2>📄 {t("browse.files")} ({files.length})</h2>
              <div className="files-container">
                {files.map((file) => (
                  <FavoriteFileCard
                    key={file.id || file.eduFileId}
                    file={file}
                    isFavorite={favorites.includes(file.id || file.eduFileId)}
                    toggleFavorite={toggleFavorite}
                    serverUrl={serverUrl}
                    setMessage={setMessage}
                  />
                ))}
              </div>
            </div>
          )}

          {hasCollections && (
            <div className="collections-section">
              <h2>📦 {t("browse.collections")} ({collections.length})</h2>
              <div className="collections-grid">
                {collections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </div>
          )}

          {!hasFiles && !hasCollections && !loading && (
            <div className="no-results">
              <h3>{t("browse.noResults")}</h3>
              <p>{t("browse.tryAnotherSearch")}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResults;