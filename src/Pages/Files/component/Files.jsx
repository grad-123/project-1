import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./Files.css";
import { FaHeart } from "react-icons/fa";

import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";

function Files() {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("files");
  const [activeType, setActiveType] = useState("all");
  const { t } = useTranslation();
  const { courseId } = useParams();
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionFiles, setCollectionFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteCollections, setFavoriteCollections] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [loadingCollectionFiles, setLoadingCollectionFiles] = useState(false);
  const [togglingCollectionId, setTogglingCollectionId] = useState(null);

  // الاستماع لأحداث إزالة وإضافة المفضلة من صفحة Favorites
  useEffect(() => {
    const handleFavoriteRemoved = (event) => {
      const { fileId } = event.detail;
      setFavorites(prev => prev.filter(id => id !== fileId));
    };
    
    const handleFavoriteAdded = (event) => {
      const { fileId } = event.detail;
      setFavorites(prev => [...prev, fileId]);
    };
    
    window.addEventListener('favoriteRemoved', handleFavoriteRemoved);
    window.addEventListener('favoriteAdded', handleFavoriteAdded);
    
    return () => {
      window.removeEventListener('favoriteRemoved', handleFavoriteRemoved);
      window.removeEventListener('favoriteAdded', handleFavoriteAdded);
    };
  }, []);

  // جلب الملفات
  useEffect(() => {
    axios
      .get(`/Api/EduFile/GetByCourseId/${courseId}`)
      .then((res) => {
        const filesWithId = res.data.data.map((file) => ({
          ...file,
          eduFileId: file.eduFileId || file.id,
          id: file.id || file.eduFileId,
          fileType:
            file.fileType !== undefined ? Number(file.fileType) : file.type,
          uploadedAt: file.uploadedAt || file.createdAt || file.upload_date,
          downloadCount: file.downloadCount || file.download_count || 0,
        }));
        setFiles(filesWithId);
      })
      .catch((err) => console.log(err));
  }, [courseId]);

  // جلب المجموعات (Collections) في Browse - النسخة المعدلة (تعرض كل المجموعات)
  useEffect(() => {
    setLoadingCollections(true);
    axios
      .get(`/api/v1/Collection/GetByCourseId/${courseId}`)
      .then((res) => {
        console.log("Collections response:", res.data);
        let allCollections = [];
        
        if (res.data && res.data.succeeded && res.data.data) {
          allCollections = res.data.data.filter(col => col && col.id);
        } else if (res.data && Array.isArray(res.data)) {
          allCollections = res.data.filter(col => col && col.id);
        }
        
        console.log(`✅ Showing ${allCollections.length} collections from all students`);
        console.log("All collections:", allCollections.map(c => ({ 
          id: c.id, 
          name: c.name, 
          uploaderName: c.uploaderName,
          filesCount: c.filesCount 
        })));
        
        setCollections(allCollections);
        setLoadingCollections(false);
      })
      .catch((err) => {
        console.error("Error fetching collections:", err);
        setCollections([]);
        setLoadingCollections(false);
      });
  }, [courseId]);

  // جلب المفضلات (الملفات)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/Favorite/Getlist")
      .then((res) => {
        if (res.data && res.data.data) {
          setFavorites(res.data.data.map((f) => f.eduFileId));
        }
      })
      .catch((err) => console.log(err));
  }, []);

  // جلب المجموعات المفضلة
  const fetchFavoriteCollections = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get("/Favorite/GetCollections");
      console.log("Favorite collections response:", res.data);
      
      if (res.data && res.data.succeeded && res.data.data) {
        const validFavorites = [];
        for (const item of res.data.data) {
          try {
            const checkRes = await axios.get(`/api/v1/Collection/GetById/${item.collectionId}`);
            if (checkRes.data && checkRes.data.succeeded && checkRes.data.data) {
              validFavorites.push(item.collectionId);
              console.log(`✅ Favorite collection ${item.collectionId} (${item.name}) is valid`);
            } else {
              console.log(`⚠️ Favorite collection ${item.collectionId} (${item.name}) is invalid, but KEEPING it`);
              validFavorites.push(item.collectionId);
            }
          } catch (err) {
            console.log(`⚠️ Error fetching collection ${item.collectionId} (${item.name}): ${err.message} - KEEPING it`);
            validFavorites.push(item.collectionId);
          }
        }
        setFavoriteCollections(validFavorites);
        console.log("Favorite collections (kept all):", validFavorites);
      } else if (Array.isArray(res.data)) {
        const favoriteIds = res.data.map((item) => item.collectionId || item.id);
        setFavoriteCollections(favoriteIds);
      }
    } catch (err) {
      console.log("Error fetching favorite collections:", err);
    }
  }, []);

  useEffect(() => {
    fetchFavoriteCollections();
  }, [fetchFavoriteCollections]);

  // دالة حذف ملف من مجموعات الطالب (My Collections)
  const removeFileFromMyCollections = async (fileId) => {
    try {
      const collectionsRes = await axios.get("/api/v1/Collection/GetLibraryCollections");
      const myCollections = collectionsRes.data?.data || [];
      
      let removedCount = 0;
      for (const collection of myCollections) {
        const collectionId = collection.id;
        if (!collectionId) continue;
        
        try {
          const collectionDetails = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
          const filesInCollection = collectionDetails.data?.data?.files || [];
          const fileExists = filesInCollection.some(f => (f.eduFileId || f.id) === fileId);
          
          if (fileExists) {
            await axios.delete("/api/v1/collection/RemoveFile", {
              data: {
                collectionId: collectionId,
                eduFileId: fileId
              }
            });
            removedCount++;
            console.log(`File ${fileId} removed from My Collection ${collectionId}`);
          }
        } catch (err) {
          console.log(`Error checking/removing from My Collection ${collectionId}:`, err);
        }
      }
      return removedCount;
    } catch (err) {
      console.log("Error removing file from my collections:", err);
      return 0;
    }
  };

  // إضافة مجموعة إلى المفضلة
  const addFavoriteCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage") || "Please login first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setTogglingCollectionId(collectionId);
    try {
      await axios.post(`/Favorite/AddCollection/${collectionId}`);
      setFavoriteCollections((prev) => [...prev, collectionId]);
      setMessage(
        t("files.collectionAddedToFavorites") ||
          "✨ Collection added to favorites!",
      );
      setTimeout(() => setMessage(""), 3000);

      window.dispatchEvent(new CustomEvent('favoriteAdded', { 
        detail: { collectionId } 
      }));

      if (window.refreshFavoriteCollections) {
        window.refreshFavoriteCollections();
      }
    } catch (err) {
      console.log("Error adding collection to favorites:", err);
      setMessage(t("files.error") || "❌ Error adding collection to favorites");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setTogglingCollectionId(null);
    }
  };

  // إزالة مجموعة من المفضلة
  const removeFavoriteCollection = async (collectionId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage") || "Please login first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setTogglingCollectionId(collectionId);
    try {
      await axios.delete(`/Favorite/RemoveCollection/${collectionId}`);
      setFavoriteCollections((prev) =>
        prev.filter((id) => id !== collectionId),
      );
      setMessage(
        t("files.collectionRemovedFromFavorites") ||
          "💔 Collection removed from favorites",
      );
      setTimeout(() => setMessage(""), 3000);

      if (window.refreshFavoriteCollections) {
        window.refreshFavoriteCollections();
      }
    } catch (err) {
      console.log("Error removing collection from favorites:", err);
      setMessage(
        t("files.error") || "❌ Error removing collection from favorites",
      );
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setTogglingCollectionId(null);
    }
  };

  // تبديل حالة المفضلة (مجموعة)
  const toggleFavoriteCollection = async (collectionId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage") || "Please login first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (favoriteCollections.includes(collectionId)) {
      await removeFavoriteCollection(collectionId);
    } else {
      await addFavoriteCollection(collectionId);
    }
  };

const openCollection = async (collection) => {
  if (!collection || !collection.id) {
    console.error("Invalid collection:", collection);
    setMessage(t("files.invalidCollection"));
    setTimeout(() => setMessage(""), 3000);
    return;
  }

  setSelectedCollection(collection);
  setLoadingCollectionFiles(true);
  setActiveType("all");

  try {
    console.log("Fetching collection with ID:", collection.id);
    const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
    console.log("Collection files response:", res.data);
    
    if (res.data && res.data.succeeded && res.data.data) {
      if (res.data.data.files && Array.isArray(res.data.data.files)) {
        const formattedFiles = res.data.data.files.map((file) => ({
          ...file,
          id: file.eduFileId,
          eduFileId: file.eduFileId,
          fileType: Number(file.fileType),
          title: file.title,
          filePath: file.filePath,
          courseName: file.courseName,
          categoryName: file.categoryName,
          downloadCount: file.downloadCount || 0,
        }));
        setCollectionFiles(formattedFiles);
        console.log("Loaded files:", formattedFiles.length);
      } else {
        console.log("No files found in collection");
        setCollectionFiles([]);
      }
    } else {
      setCollectionFiles([]);
    }
  } catch (err) {
    console.error("Error fetching collection files:", err);
    
    if (err.response && err.response.status === 404) {
      setMessage(""); 
      setCollectionFiles([]);
      setLoadingCollectionFiles(false);
      // لا نحذف المجموعة من القائمة
    }
  } finally {
    setLoadingCollectionFiles(false);
  }
};

  // الرجوع إلى قائمة المجموعات
  const backToCollections = () => {
    setSelectedCollection(null);
    setCollectionFiles([]);
    setActiveType("all");
  };

  // إضافة إلى المفضلة (ملف)
  const addFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(`/Favorite/Add/${fileId}`);
      setFavorites((prev) => [...prev, fileId]);
      setMessage(t("files.addedToFavorites") || "✨ Added to favorites");
      setTimeout(() => setMessage(""), 3000);
      
      window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: { fileId } }));
      
    } catch (err) {
      console.log(err);
      setMessage(t("files.error") || "❌ Error adding to favorites");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // إزالة من المفضلة (ملف)
  const removeFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      const removedFromMyCollections = await removeFileFromMyCollections(fileId);
      
      await axios.delete(`/Favorite/Delete/${fileId}`);
      
      setFavorites((prev) => prev.filter((id) => id !== fileId));
      
      if (removedFromMyCollections > 0) {
        setMessage(`${t("files.removedFromFavorites")} ${t("files.removedFromMyCollections", { count: removedFromMyCollections })}`);
      } else {
        setMessage(t("files.removedFromFavorites") || "💔 Removed from favorites");
      }
      setTimeout(() => setMessage(""), 3000);
      
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: { fileId } }));
      
    } catch (err) {
      console.log(err);
      setMessage(t("files.error") || "❌ Error removing from favorites");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // تبديل حالة المفضلة (ملف)
  const toggleFavorite = (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage") || "Please login first");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    favorites.includes(fileId) ? removeFavorite(fileId) : addFavorite(fileId);
  };

  // تحميل الملف
  const handleDownload = async (fileId, filePath) => {
    setDownloadingId(fileId);
    try {
      const response = await axios.get(`/Api/EduFile/Download/${fileId}`, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filePath?.split("/").pop() || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId || f.eduFileId === fileId
            ? { ...f, downloadCount: (f.downloadCount || 0) + 1 }
            : f,
        ),
      );

      setCollectionFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId || f.eduFileId === fileId
            ? { ...f, downloadCount: (f.downloadCount || 0) + 1 }
            : f,
        ),
      );

      setMessage(t("files.downloadStarted") || "⬇️ Download started!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log("Download error:", err);
      setMessage(t("files.downloadError") || "❌ Download failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  // أنواع الملفات للفلترة
  const fileTypes = [
    { id: "all", name: t("files.all"), icon: "📂" },
    { id: 0, name: t("files.lectures"), icon: "🎥" },
    { id: 1, name: t("files.slides"), icon: "📑" },
    { id: 2, name: t("files.summaries"), icon: "📄" },
    { id: 3, name: t("files.exams"), icon: "🧾" },
    { id: 4, name: t("files.assignments"), icon: "📌" },
    { id: 5, name: t("files.books"), icon: "📚" },
    { id: 6, name: t("files.other"), icon: "📁" },
  ];

  // فلترة الملفات حسب النوع
  const displayedFiles = [...files].filter(
    (f) => activeType === "all" || Number(f.fileType) === activeType,
  );

  const displayedCollectionFiles = [...collectionFiles].filter(
    (f) => activeType === "all" || Number(f.fileType) === activeType,
  );

  const CollectionCard = ({ collection }) => {
    const isFav = favoriteCollections.includes(collection.id);
    const isToggling = togglingCollectionId === collection.id;

    return (
      <div
        className="collection-card"
        onClick={() => openCollection(collection)}
      >
        <div className="collection-icon">📦</div>
        <div className="collection-info">
          <h3 className="collection-title">{collection.name}</h3>
          <p className="collection-description">
            {collection.description ||
              t("files.noDescription") ||
              "No description"}
          </p>
          <div className="collection-meta">
            <span>
              📚{" "}
              {collection.courseName ||
                t("files.unknownCourse") ||
                "Unknown Course"}
            </span>
            <span>
              📄 {collection.filesCount || 0} {t("files.files") || "files"}
            </span>
            <span>
              👤 {collection.uploaderName || t("files.unknown") || "Unknown"}
            </span>
          </div>
        </div>
        <div className="collection-actions">
          <button
            className={`collection-favorite-btn ${isFav ? "active" : ""}`}
            onClick={async (e) => {
              e.stopPropagation();
              if (isToggling) return;
              await toggleFavoriteCollection(collection.id, e);
            }}
            disabled={isToggling}
            title={
              isFav ? t("files.removeFromFavorites") : t("files.addToFavorites")
            }
          >
            {isToggling ? (
              "⏳"
            ) : isFav ? (
              "❤️"
            ) : (
              <FaHeart
                style={{
                  color: "white",
                  stroke: "black",
                  strokeWidth: "40px",
                }}
              />
            )}
          </button>

          <button
            className="view-collection-btn"
            onClick={(e) => {
              e.stopPropagation();
              openCollection(collection);
            }}
          >
            {t("files.viewFiles") || "View Files"} 📂
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="files-container">
      <h2 className="files-title">{t("files.title")}</h2>
      <p className="files-description">{t("files.description")}</p>

      {!selectedCollection && (
        <div className="tabs-main">
          <button
            className={`tab-btn ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            📄 {t("files.files") || "Files"} ({files.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "collections" ? "active" : ""}`}
            onClick={() => setActiveTab("collections")}
          >
            📦 {t("files.collections") || "Collections"} ({collections.length})
          </button>
        </div>
      )}

      {selectedCollection && (
        <div className="back-header">
          <button className="back-btn" onClick={backToCollections}>
            ← {t("files.backToCollections") || "Back to Collections"}
          </button>
          <h3 className="collection-title-header">
            📦 {selectedCollection.name}
          </h3>
          <p className="collection-desc-header">
            {selectedCollection.description}
          </p>
        </div>
      )}

      {message && (
        <div
          className={`message ${message.includes("⚠️") || message.includes("❌") || message.includes("💔") ? "warning" : message.includes("✨") || message.includes("⬇️") ? "success" : ""}`}
        >
          {message}
        </div>
      )}

      {!selectedCollection && activeTab === "files" && (
        <>
          <div className="tabs">
            {fileTypes.map((type) => (
              <button
                key={type.id}
                className={activeType === type.id ? "active" : ""}
                onClick={() => setActiveType(type.id)}
              >
                {type.icon} {type.name} (
                {type.id === "all"
                  ? files.length
                  : files.filter((f) => f.fileType === type.id).length}
                )
              </button>
            ))}
          </div>

          {displayedFiles.length === 0 ? (
            <p className="no-items">{t("files.noFiles")}</p>
          ) : (
            displayedFiles.map((file) => (
              <FavoriteFileCard
                key={file.id || file.eduFileId}
                file={file}
                isFavorite={favorites.includes(file.id || file.eduFileId)}
                toggleFavorite={toggleFavorite}
                handleDownload={handleDownload}
                serverUrl={serverUrl}
                setMessage={setMessage}
                downloadingId={downloadingId}
              />
            ))
          )}
        </>
      )}

      {!selectedCollection && activeTab === "collections" && (
        <>
          {loadingCollections ? (
            <div className="loading-spinner">
              {t("files.loadingCollections") || "Loading collections..."}
            </div>
          ) : collections.length === 0 ? (
            <p className="no-items">
              {t("files.noCollections") || "No collections found"}
            </p>
          ) : (
            <div className="collections-grid">
              {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedCollection && (
        <>
          <div className="tabs">
            {fileTypes.map((type) => (
              <button
                key={type.id}
                className={activeType === type.id ? "active" : ""}
                onClick={() => setActiveType(type.id)}
              >
                {type.icon} {type.name} (
                {type.id === "all"
                  ? collectionFiles.length
                  : collectionFiles.filter((f) => f.fileType === type.id)
                      .length}
                )
              </button>
            ))}
          </div>

          {loadingCollectionFiles ? (
            <div className="loading-spinner">
              {t("files.loadingFiles") || "Loading files..."}
            </div>
          ) : displayedCollectionFiles.length === 0 ? (
            <div className="no-items">
              <p>
                📭{" "}
                {t("files.noFilesInCollection") ||
                  "No files found in this collection"}
              </p>
            </div>
          ) : (
            displayedCollectionFiles.map((file) => (
              <FavoriteFileCard
                key={file.id || file.eduFileId}
                file={file}
                isFavorite={favorites.includes(file.id || file.eduFileId)}
                toggleFavorite={toggleFavorite}
                handleDownload={handleDownload}
                serverUrl={serverUrl}
                setMessage={setMessage}
                downloadingId={downloadingId}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Files;