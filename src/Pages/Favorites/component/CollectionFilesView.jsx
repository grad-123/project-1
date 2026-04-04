import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaPlay, FaStop, FaDownload, FaVideo, FaArrowRight, FaCheck, FaUser } from "react-icons/fa";
import "./CollectionFilesView.css";

function CollectionFilesView({ 
  collection, 
  onBack, 
  onCollectionUpdate, 
  serverUrl, 
  showMessage,
  isFavoriteCollection = false 
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isReordering, setIsReordering] = useState(false);
  
  const hasLoadedRef = useRef(false);
  const collectionIdRef = useRef(collection?.id);

  // ✅ هذه الدالة ستستخدم فقط للملفات في Favorite Collections (لن تظهر في My Collections)
  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("🔵 CollectionFilesView - Clicked on uploader:", { userId, userName });
    
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadFiles = async () => {
      if (!collection?.id) {
        setLoading(false);
        return;
      }
      
      if (collectionIdRef.current === collection.id && hasLoadedRef.current) {
        return;
      }
      
      collectionIdRef.current = collection.id;
      setLoading(true);
      
      try {
        console.log("🔄 Fetching files from API for collection:", collection.id);
        const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
        
        if (res.data && res.data.data && res.data.data.files) {
          const collectionData = res.data.data;
          console.log("📦 Collection data from API:", collectionData);
          console.log("👤 Uploader info:", {
            uploaderId: collectionData.uploaderId,
            uploaderName: collectionData.uploaderName
          });
          
          const formattedFiles = collectionData.files.map((file, index) => ({
            ...file,
            id: file.eduFileId || file.id,
            eduFileId: file.eduFileId || file.id,
            fileType: Number(file.fileType),
            title: file.title || file.name || "Untitled",
            filePath: file.filePath,
            description: file.description,
            courseName: file.courseName,
            categoryName: file.categoryName,
            downloadCount: file.downloadCount || 0,
            order: file.order !== undefined ? file.order : index,
            uploadedByUserId: file.uploadedByUserId || collectionData.uploaderId,
            uploadedByUserName: file.uploadedByUserName || collectionData.uploaderName,
            uploadedAt: file.uploadedAt || collectionData.createdAt,
          }));
          
          formattedFiles.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFiles(formattedFiles);
          
          const savedProgress = localStorage.getItem(`learning_progress_${collection.id}`);
          if (savedProgress) {
            try {
              const progress = JSON.parse(savedProgress);
              setCompletedCount(progress.completedCount || 0);
              setCurrentFileIndex(progress.currentFileIndex || 0);
            } catch (e) {
              console.log("Error parsing saved progress");
            }
          }
        } else {
          setFiles([]);
        }
      } catch (err) {
        console.error("Error loading files:", err);
        
        if (collection.files && Array.isArray(collection.files)) {
          console.log("⚠️ Using files from collection prop as fallback");
          const formattedFiles = collection.files.map((file, index) => ({
            ...file,
            id: file.eduFileId || file.id,
            eduFileId: file.eduFileId || file.id,
            fileType: Number(file.fileType),
            title: file.title || file.name || "Untitled",
            filePath: file.filePath,
            description: file.description,
            courseName: file.courseName,
            categoryName: file.categoryName,
            downloadCount: file.downloadCount || 0,
            order: file.order !== undefined ? file.order : index,
            uploadedByUserId: file.uploadedByUserId || collection.uploaderId,
            uploadedByUserName: file.uploadedByUserName || collection.uploaderName,
            uploadedAt: file.uploadedAt || collection.createdAt,
          }));
          
          formattedFiles.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFiles(formattedFiles);
        } else {
          setFiles([]);
        }
        
        if (showMessage) {
          showMessage(t("collection.errorLoadingFiles") + ": " + (err.response?.data?.message || err.message), "error");
        }
      } finally {
        setLoading(false);
        hasLoadedRef.current = true;
      }
    };
    
    loadFiles();
  }, [collection?.id, collection?.files, collection?.uploaderId, collection?.uploaderName, collection?.createdAt, showMessage, t]);

  const saveProgress = useCallback(() => {
    if (!collection?.id) return;
    const progress = {
      completedCount: completedCount,
      currentFileIndex: currentFileIndex,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`learning_progress_${collection.id}`, JSON.stringify(progress));
  }, [collection?.id, completedCount, currentFileIndex]);

  const getProgressPercentage = () => {
    if (files.length === 0) return 0;
    return ((completedCount / files.length) * 100).toFixed(0);
  };

  const startLearningMode = () => {
    if (files.length === 0) {
      showMessage(t("collection.noFilesToLearn"), "warning");
      return;
    }
    
    if (completedCount >= files.length) {
      setCompletedCount(0);
      setCurrentFileIndex(0);
      localStorage.removeItem(`learning_progress_${collection.id}`);
    }
    
    setIsLearningMode(true);
  };

  const stopLearningMode = () => {
    saveProgress();
    setIsLearningMode(false);
  };

  const nextFile = () => {
    if (currentFileIndex + 1 < files.length) {
      setCurrentFileIndex(currentFileIndex + 1);
      setCompletedCount(completedCount + 1);
      setTimeout(() => saveProgress(), 100);
    } else {
      setCompletedCount(files.length);
      setCurrentFileIndex(files.length - 1);
      setTimeout(() => saveProgress(), 100);
    }
  };

  const completeLearning = () => {
    const finalProgress = {
      completedCount: files.length,
      currentFileIndex: files.length - 1,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(`learning_progress_${collection.id}`, JSON.stringify(finalProgress));
    setIsLearningMode(false);
    showMessage(t("collection.congratulations"), "success");
  };

  const remainingFiles = files.length - completedCount;
  const isCompleted = completedCount >= files.length && files.length > 0;
  const progressPercentage = getProgressPercentage();

  const handleDragStart = (e, index) => {
    if (isFavoriteCollection) return;
    setIsDragging(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    if (isFavoriteCollection) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, dropIndex) => {
    if (isFavoriteCollection) return;
    e.preventDefault();
    
    let dragIndex = draggedIndex;
    if (dragIndex === null) {
      const dragIndexStr = e.dataTransfer.getData("text/plain");
      if (dragIndexStr) {
        dragIndex = parseInt(dragIndexStr, 10);
      }
    }
    
    if (dragIndex === null || dragIndex === dropIndex) {
      setIsDragging(false);
      setDraggedIndex(null);
      return;
    }
    
    setIsReordering(true);
    
    const newFiles = [...files];
    const temp = newFiles[dragIndex];
    newFiles[dragIndex] = newFiles[dropIndex];
    newFiles[dropIndex] = temp;
    
    setFiles(newFiles);
    
    const reorderData = {
      collectionId: collection.id,
      files: newFiles.map((file, idx) => ({
        eduFileId: file.id || file.eduFileId,
        order: idx
      }))
    };
    
    console.log("Swapping files at positions:", dragIndex, "and", dropIndex);
    
    try {
      await axios.put("/api/v1/Collection/Reorder", reorderData, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (showMessage) showMessage(t("collection.orderUpdated"), "success");
      
      const updatedFiles = newFiles.map((file, idx) => ({ ...file, order: idx }));
      setFiles(updatedFiles);
      
    } catch (err) {
      console.log("Error updating order:", err);
      if (showMessage) showMessage(t("collection.orderUpdateError"), "error");
      
      try {
        const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
        if (res.data && res.data.data && res.data.data.files) {
          const formattedFiles = res.data.data.files.map((file, idx) => ({
            ...file,
            id: file.eduFileId || file.id,
            eduFileId: file.eduFileId || file.id,
            fileType: Number(file.fileType),
            title: file.title || file.name || "Untitled",
            filePath: file.filePath,
            courseName: file.courseName,
            categoryName: file.categoryName,
            downloadCount: file.downloadCount || 0,
            order: file.order !== undefined ? file.order : idx,
            uploadedByUserId: res.data.data.uploaderId,
            uploadedByUserName: res.data.data.uploaderName,
            uploadedAt: res.data.data.createdAt,
          }));
          formattedFiles.sort((a, b) => (a.order || 0) - (b.order || 0));
          setFiles(formattedFiles);
        }
      } catch (reloadErr) {
        console.log("Error reloading files:", reloadErr);
      }
    } finally {
      setIsReordering(false);
      setIsDragging(false);
      setDraggedIndex(null);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDownload = async (file, e) => {
    e.stopPropagation();
    if (!file || !file.id) {
      if (showMessage) showMessage(t("collection.fileIdNotAvailable"), "error");
      return;
    }
    
    try {
      const response = await axios.get(`/Api/EduFile/Download/${file.id}`, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;
      const fileName = file.filePath?.split("/").pop() || file.title || 'download';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);
      
      if (showMessage) showMessage(t("collection.downloadStarted"), "success");
    } catch (err) {
      console.log("Download error:", err);
      if (showMessage) showMessage(t("collection.downloadError"), "error");
    }
  };

  const handleWatchVideo = (file, e) => {
    e.stopPropagation();
    if (!file || !file.filePath) {
      if (showMessage) showMessage(t("collection.filePathNotAvailable"), "error");
      return;
    }
    const fileUrl = `${serverUrl}${file.filePath}`;
    window.open(fileUrl, "_blank");
    if (showMessage) showMessage(t("collection.watchingVideo"), "info");
  };

  const handleRemoveFile = async (fileId, e) => {
    e.stopPropagation();
    if (isFavoriteCollection) {
      if (showMessage) showMessage(t("collection.cannotRemoveFromFavorite"), "warning");
      return;
    }
    
    if (!collection) return;
    
    if (window.confirm(t("collection.removeFileConfirm") || "Remove this file from collection?")) {
      setIsReordering(true);
      try {
        await axios.delete("/api/v1/collection/RemoveFile", {
          data: {
            collectionId: collection.id,
            eduFileId: fileId
          }
        });
        
        const newFiles = files.filter(f => (f.id || f.eduFileId) !== fileId);
        setFiles(newFiles);
        
        if (showMessage) showMessage(t("collection.fileRemoved"), "success");
        if (onCollectionUpdate) onCollectionUpdate();
      } catch (err) {
        console.log("Error removing file:", err);
        if (showMessage) showMessage(t("collection.removeError"), "error");
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handleFileClick = (file) => {
    if (!file || !file.filePath) {
      if (showMessage) showMessage(t("collection.filePathNotAvailable"), "error");
      return;
    }
    const fileUrl = `${serverUrl}${file.filePath}`;
    window.open(fileUrl, "_blank");
  };

  const getFileTypeIcon = (fileType) => {
    const icons = { 0: "🎥", 1: "📄", 2: "📝", 3: "📝", 4: "📌", 5: "📚", 6: "📁" };
    return icons[fileType] || "📄";
  };

  const getFileTypeText = (fileType) => {
    const types = {
      0: t("collection.video"),
      1: t("collection.slides"),
      2: t("collection.summary"),
      3: t("collection.exam"),
      4: t("collection.assignment"),
      5: t("collection.book"),
      6: t("collection.other")
    };
    return types[fileType] || t("collection.other");
  };

  const isVideo = (fileType) => fileType === 0;

  if (loading) {
    return (
      <div className="collection-loading">
        <div className="loading-spinner"></div>
        <p>{t("collection.loadingCollectionFiles")}</p>
      </div>
    );
  }

  return (
    <div className="collection-files-view">
      <div className="collection-view-header">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> {t("collection.backToFavorites")}
        </button>
        <div className="collection-info-header">
          <h1>
            {collection?.name || t("collection.collections")}
            {isFavoriteCollection && <span className="favorite-badge"> ❤️ {t("collection.favoriteCollections")}</span>}
          </h1>
          <p>{collection?.description || t("collection.noDescription")}</p>
          <div className="collection-stats">
            <span className="files-count-badge">
              {files.length} {files.length === 1 ? t("collection.file") : t("collection.files")}
            </span>
            {/* ✅ يظهر اسم المستخدم فقط في Favorite Collections */}
            {collection?.uploaderName && isFavoriteCollection && (
              <span 
                className="uploader-name-clickable collection-uploader"
                onClick={(e) => handleUploaderClick(collection.uploaderId, collection.uploaderName, e)}
                title="انقر لعرض الملف الشخصي"
                style={{ cursor: 'pointer', color: '#007bff' }}
              >
                <FaUser /> {collection.uploaderName}
              </span>
            )}
            {collection?.createdAt && (
              <span className="collection-date">
                📅 {formatDate(collection.createdAt)}
              </span>
            )}
            {files.length > 0 && !isLearningMode && (
              <button className="start-learning-btn" onClick={startLearningMode}>
                <FaPlay /> {t("collection.startLearning")}
              </button>
            )}
          </div>
        </div>
      </div>

      {isLearningMode && (
        <div className="learning-mode-bar">
          <div className="learning-progress-container">
            <div className="learning-progress-info">
              <span className="learning-progress-text">
                {t("collection.learningProgress")}: {completedCount}/{files.length} ({progressPercentage}%)
              </span>
              <span className="learning-remaining-text">
                {remainingFiles} {t("collection.remaining")}
              </span>
            </div>
            <div className="learning-progress-bar">
              <div 
                className="learning-progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div className="learning-controls">
            <button className="learning-stop-btn" onClick={stopLearningMode}>
              <FaStop /> {t("collection.stop")}
            </button>
            {!isCompleted ? (
              <button className="learning-next-btn" onClick={nextFile}>
                {t("collection.next")} <FaArrowRight />
              </button>
            ) : (
              <button className="learning-done-btn" onClick={completeLearning}>
                <FaCheck /> {t("collection.done")}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="files-list-collection">
        <h3>{isFavoriteCollection ? t("collection.filesInCollection") : t("collection.dragHint")}</h3>
        
        {isReordering && (
          <div className="reordering-overlay">
            <div className="loading-spinner-small"></div>
            <p>{t("collection.updatingOrder")}</p>
          </div>
        )}
        
        {files.length === 0 ? (
          <div className="empty-files-message">
            <p>📁 {t("collection.noFilesFound")}</p>
          </div>
        ) : (
          <div className={`files-grid-collection ${isFavoriteCollection ? "readonly-grid" : "reorderable-grid"}`}>
            {files.map((file, index) => {
              const isCompletedFile = index < completedCount;
              const isCurrentFile = index === currentFileIndex && isLearningMode;
              
              return (
                <div
                  key={file.id || file.eduFileId || index}
                  className={`collection-file-card 
                    ${isDragging && draggedIndex === index ? "dragging" : ""}
                    ${isCompletedFile ? "completed-file" : ""}
                    ${isCurrentFile ? "current-file" : ""}`}
                  draggable={!isFavoriteCollection}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {!isFavoriteCollection && <div className="drag-handle">⋮⋮</div>}
                  <div className="file-icon-large" onClick={() => handleFileClick(file)}>
                    {getFileTypeIcon(file.fileType)}
                  </div>
                  <div className="file-details-collection" onClick={() => handleFileClick(file)}>
                    <h4>
                      {isCompletedFile && <FaCheck className="completed-check" />}
                      {index + 1}. {file.title}
                    </h4>
                    <p>{file.description || t("collection.noDescription")}</p>
                    <div className="file-meta-collection">
                      <span className="file-type-badge">{getFileTypeText(file.fileType)}</span>
                      {file.courseName && <span className="course-name">{file.courseName}</span>}
                      {/* ✅ يظهر اسم المستخدم فقط في Favorite Collections */}
                      {isFavoriteCollection && (file.uploadedByUserName || collection?.uploaderName) && (
                        <span 
                          className="uploader-name-clickable file-uploader"
                          onClick={(e) => handleUploaderClick(
                            file.uploadedByUserId || collection?.uploaderId, 
                            file.uploadedByUserName || collection?.uploaderName, 
                            e
                          )}
                          title="انقر لعرض الملف الشخصي"
                          style={{ cursor: 'pointer', color: '#007bff' }}
                        >
                          <FaUser /> {file.uploadedByUserName || collection?.uploaderName}
                        </span>
                      )}
                      {file.uploadedAt && (
                        <span className="file-date">
                          📅 {formatDate(file.uploadedAt)}
                        </span>
                      )}
                      <span className="download-count">⬇️ {file.downloadCount || 0}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="download-file-btn-collection" onClick={(e) => handleDownload(file, e)} title={t("collection.download")}>
                      <FaDownload />
                    </button>
                    {isVideo(file.fileType) && (
                      <button className="watch-video-btn-collection" onClick={(e) => handleWatchVideo(file, e)} title={t("collection.watchVideo")}>
                        <FaVideo />
                      </button>
                    )}
                    {!isFavoriteCollection && (
                      <button className="remove-file-btn-collection" onClick={(e) => handleRemoveFile(file.id || file.eduFileId, e)} title={t("collection.removeFromCollection")}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionFilesView;