import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaPlay, FaStop, FaStepForward, FaDownload, FaVideo } from "react-icons/fa";
import "./CollectionFilesView.css";

function CollectionFilesView({ collection, onBack, onCollectionUpdate, serverUrl, showMessage }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progressState, setProgressState] = useState({});
  const [localFilesCache, setLocalFilesCache] = useState({});
  
  const [draggedFile, setDraggedFile] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem("collectionProgress");
    if (savedProgress) {
      setProgressState(JSON.parse(savedProgress));
    }
    
    const savedCache = localStorage.getItem("collectionFilesCache");
    if (savedCache) {
      setLocalFilesCache(JSON.parse(savedCache));
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateCache = useCallback((collectionId, filesData) => {
    setLocalFilesCache(prevCache => {
      const newCache = { ...prevCache, [collectionId]: filesData };
      localStorage.setItem("collectionFilesCache", JSON.stringify(newCache));
      return newCache;
    });
  }, []);

  const handleDownload = async (file, e) => {
    e.stopPropagation();
    if (!file || !file.id) {
      if (showMessage) {
        showMessage(t("collectionFiles.fileIdNotAvailable") || "File ID not available", "error");
      }
      return;
    }
    
    try {
      const response = await axios.get(
        `/Api/EduFile/Download/${file.id}`,
        {
          responseType: "blob",
        }
      );

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = fileUrl;
      const fileName = file.filePath?.split("/").pop() || file.title || 'download';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(fileUrl);
      
      if (showMessage) {
        showMessage(t("collectionFiles.downloadStarted") || "Download started!", "success");
      }
    } catch (err) {
      console.log("Download error:", err);
      if (showMessage) {
        showMessage(t("collectionFiles.downloadError") || "Error downloading file", "error");
      }
    }
  };

  const handleWatchVideo = (file, e) => {
    e.stopPropagation();
    if (!file || !file.filePath) {
      if (showMessage) {
        showMessage(t("collectionFiles.filePathNotAvailable") || "File path not available", "error");
      }
      return;
    }
    const fileUrl = `${serverUrl}${file.filePath}`;
    window.open(fileUrl, "_blank");
    
    if (showMessage) {
      showMessage(t("collectionFiles.watchingVideo") || "Opening video...", "info");
    }
  };

  const loadCollectionFiles = useCallback(async () => {
    if (!collection?.id || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    
    try {
      setLoading(true);
      
      const progress = progressState[collection.id];
      if (progress) {
        setCurrentFileIndex(progress.currentIndex || 0);
        setIsLearningMode(progress.isLearningMode || false);
      } else {
        setCurrentFileIndex(0);
        setIsLearningMode(false);
      }
      
      if (localFilesCache[collection.id] && localFilesCache[collection.id].length > 0) {
        setFiles(localFilesCache[collection.id]);
        console.log(`✅ Loaded ${localFilesCache[collection.id].length} files from cache`);
        setLoading(false);
        isLoadingRef.current = false;
        return;
      }
      
      const oldStorageKey = `collection_files_${collection.id}`;
      const oldSavedFiles = localStorage.getItem(oldStorageKey);
      if (oldSavedFiles) {
        const parsedFiles = JSON.parse(oldSavedFiles);
        if (parsedFiles.length > 0) {
          console.log(`✅ Loaded ${parsedFiles.length} files from old storage format`);
          setFiles(parsedFiles);
          updateCache(collection.id, parsedFiles);
          setLoading(false);
          isLoadingRef.current = false;
          return;
        }
      }
      
      console.log("No files found in cache or storage");
      setFiles([]);
      
    } catch (err) {
      console.log("Error loading files:", err);
      setFiles([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
    }
  }, [collection, progressState, localFilesCache, updateCache]);

  useEffect(() => {
    if (collection?.id) {
      loadCollectionFiles();
    }
  }, [collection?.id, loadCollectionFiles]);

  const prevFilesRef = useRef();
  useEffect(() => {
    if (collection?.id && files.length > 0 && JSON.stringify(prevFilesRef.current) !== JSON.stringify(files)) {
      prevFilesRef.current = files;
      updateCache(collection.id, files);
      const oldStorageKey = `collection_files_${collection.id}`;
      localStorage.setItem(oldStorageKey, JSON.stringify(files));
    } else if (collection?.id && files.length === 0 && prevFilesRef.current !== undefined) {
      prevFilesRef.current = files;
      const oldStorageKey = `collection_files_${collection.id}`;
      localStorage.removeItem(oldStorageKey);
    }
  }, [files, collection, updateCache]);

  useEffect(() => {
    const handleFilesAdded = (event) => {
      if (event.detail.collectionId === collection?.id && isMounted.current) {
        console.log("📥 Files added event received:", event.detail);
        
        const newFiles = event.detail.files || [];
        setFiles(prevFiles => {
          const existingIds = new Set(prevFiles.map(f => f.id || f.eduFileId));
          const existingTitles = new Set(prevFiles.map(f => f.title?.toLowerCase()));
          
          const duplicateFiles = newFiles.filter(f => {
            const fileId = f.id || f.eduFileId;
            const fileTitle = f.title?.toLowerCase();
            return existingIds.has(fileId) || existingTitles.has(fileTitle);
          });
          
          const uniqueNewFiles = newFiles.filter(f => {
            const fileId = f.id || f.eduFileId;
            const fileTitle = f.title?.toLowerCase();
            return !existingIds.has(fileId) && !existingTitles.has(fileTitle);
          });
          
          if (duplicateFiles.length > 0 && showMessage) {
            const duplicateNames = duplicateFiles.map(f => f.title).join(', ');
            showMessage(`⚠️ ${t("collectionFiles.fileAlreadyExists") || "File already exists in this collection"}: ${duplicateNames}`, "warning");
          }
          
          const updatedFiles = [...prevFiles, ...uniqueNewFiles];
          
          updateCache(collection.id, updatedFiles);
          
          const oldStorageKey = `collection_files_${collection.id}`;
          localStorage.setItem(oldStorageKey, JSON.stringify(updatedFiles));
          
          console.log(`✅ Added ${uniqueNewFiles.length} files, total: ${updatedFiles.length}`);
          
          if (showMessage && uniqueNewFiles.length > 0) {
            showMessage(`✅ ${t("collectionFiles.addedToCollection") || "Added"} ${uniqueNewFiles.length} ${t("collectionFiles.file") || "file(s)"} ${t("collectionFiles.toCollection") || "to collection"}`, "success");
          }
          
          return updatedFiles;
        });
        
        if (onCollectionUpdate) onCollectionUpdate();
      }
    };
    
    window.addEventListener('filesAddedToCollection', handleFilesAdded);
    return () => {
      window.removeEventListener('filesAddedToCollection', handleFilesAdded);
    };
  }, [collection, onCollectionUpdate, showMessage, updateCache, t]);

  const saveProgress = useCallback((collectionId, progress) => {
    setProgressState(prevState => {
      const newProgress = { ...prevState, [collectionId]: progress };
      localStorage.setItem("collectionProgress", JSON.stringify(newProgress));
      return newProgress;
    });
  }, []);

  const handleRemoveFile = async (fileId, e) => {
    e.stopPropagation();
    if (!collection) return;
    
    try {
      await axios.delete("/api/v1/collection/RemoveFile", {
        data: {
          collectionId: collection.id,
          eduFileId: fileId
        }
      });
      
      setFiles(prev => {
        const updatedFiles = prev.filter(f => (f.id || f.eduFileId) !== fileId);
        updateCache(collection.id, updatedFiles);
        
        // Update old format
        const oldStorageKey = `collection_files_${collection.id}`;
        if (updatedFiles.length > 0) {
          localStorage.setItem(oldStorageKey, JSON.stringify(updatedFiles));
        } else {
          localStorage.removeItem(oldStorageKey);
        }
        
        return updatedFiles;
      });
      
      // Update progress if current file is removed
      if (currentFileIndex >= files.length - 1) {
        const newIndex = Math.max(0, files.length - 2);
        setCurrentFileIndex(newIndex);
        if (isLearningMode) {
          saveProgress(collection.id, {
            currentIndex: newIndex,
            isLearningMode: true
          });
        }
      }
      
      if (showMessage) {
        showMessage(t("collectionFiles.fileRemoved") || "File removed from collection", "success");
      }
      if (onCollectionUpdate) onCollectionUpdate();
    } catch (err) {
      console.log("Error removing file:", err);
      if (showMessage) {
        showMessage(t("collectionFiles.errorRemovingFile") || "Error removing file", "error");
      }
    }
  };

  const handleReorder = useCallback(async (reorderedFiles) => {
    if (!collection) return;
    
    try {
      const payload = {
        collectionId: collection.id,
        files: reorderedFiles.map((file, index) => ({
          eduFileId: file.id || file.eduFileId,
          order: index
        }))
      };
      
      console.log("Sending reorder payload:", payload);
      await axios.put("/api/v1/collection/Reorder", payload);
      
      // Update local state and cache
      setFiles(reorderedFiles);
      updateCache(collection.id, reorderedFiles);
      
      // Update progress if in learning mode
      if (isLearningMode) {
        const currentFileId = files[currentFileIndex]?.id || files[currentFileIndex]?.eduFileId;
        const newIndex = reorderedFiles.findIndex(f => 
          (f.id || f.eduFileId) === currentFileId
        );
        if (newIndex !== -1 && newIndex !== currentFileIndex) {
          setCurrentFileIndex(newIndex);
          saveProgress(collection.id, {
            currentIndex: newIndex,
            isLearningMode: true
          });
        }
      }
      
      if (showMessage) {
        showMessage(t("collectionFiles.filesReordered") || "Files reordered successfully", "success");
      }
      
    } catch (err) {
      console.log("Error reordering files:", err);
      if (showMessage) {
        showMessage(t("collectionFiles.errorReordering") || "Error reordering files", "error");
      }
    }
  }, [collection, files, currentFileIndex, isLearningMode, updateCache, saveProgress, showMessage, t]);

  // Drag and Drop handlers
  const handleDragStart = (e, file, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ file, index }));
    setDraggedFile({ file, index });
    e.target.classList.add('dragging');
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    
    if (!draggedFile) {
      setDragOverIndex(null);
      return;
    }
    
    const sourceIndex = draggedFile.index;
    
    if (sourceIndex === targetIndex) {
      setDraggedFile(null);
      setDragOverIndex(null);
      return;
    }
    
    // Reorder files
    const newFiles = [...files];
    const [removed] = newFiles.splice(sourceIndex, 1);
    newFiles.splice(targetIndex, 0, removed);
    
    // Call API to save new order
    await handleReorder(newFiles);
    
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedFile(null);
    setDragOverIndex(null);
  };

  const handleFileClick = (file, index) => {
    if (!file || !file.filePath) {
      console.log("No file path for file:", file);
      if (showMessage) {
        showMessage(t("collectionFiles.filePathNotAvailable") || "File path not available", "error");
      }
      return;
    }
    const fileUrl = `${serverUrl}${file.filePath}`;
    window.open(fileUrl, "_blank");
    
    if (isLearningMode) {
      setCurrentFileIndex(index);
      if (collection) {
        saveProgress(collection.id, {
          currentIndex: index,
          isLearningMode: true
        });
      }
    }
  };

  const handleStartLearning = () => {
    if (!files || files.length === 0) {
      if (showMessage) {
        showMessage("No files to learn", "error");
      }
      return;
    }
    if (!collection) return;
    
    let startIndex = 0;
    const progress = progressState[collection.id];
    if (progress && progress.currentIndex !== undefined) {
      startIndex = Math.min(progress.currentIndex, files.length - 1);
    }
    
    setCurrentFileIndex(startIndex);
    setIsLearningMode(true);
    
    saveProgress(collection.id, {
      currentIndex: startIndex,
      isLearningMode: true
    });
  };

  const handleStopLearning = () => {
    setIsLearningMode(false);
    if (collection) {
      saveProgress(collection.id, {
        currentIndex: currentFileIndex,
        isLearningMode: false
      });
    }
  };

  const handleNext = () => {
    if (!files || files.length === 0) return;
    if (!collection) return;
    
    if (currentFileIndex < files.length - 1) {
      const newIndex = currentFileIndex + 1;
      setCurrentFileIndex(newIndex);
      
      saveProgress(collection.id, {
        currentIndex: newIndex,
        isLearningMode: true
      });
    } else {
      setIsLearningMode(false);
      saveProgress(collection.id, {
        currentIndex: files.length - 1,
        isLearningMode: false,
        completed: true
      });
      if (showMessage) {
        showMessage(t("collectionFiles.collectionCompleted") || "🎉 Congratulations! You've completed this collection!", "success");
      }
    }
  };

  const getProgressPercentage = () => {
    if (!files || files.length === 0) return 0;
    return Math.round(((currentFileIndex + 1) / files.length) * 100);
  };

  const getFileTypeIcon = (fileType) => {
    const icons = { 0: "🎥", 1: "📄", 2: "📝", 3: "📝", 4: "📌", 5: "📚", 6: "📁" };
    return icons[fileType] || "📄";
  };

  const getFileTypeText = (fileType) => {
    const types = { 
      0: t("collectionFiles.video") || "Video", 
      1: t("collectionFiles.slides") || "Slides", 
      2: t("collectionFiles.summary") || "Summary", 
      3: t("collectionFiles.exam") || "Exam", 
      4: t("collectionFiles.assignment") || "Assignment", 
      5: t("collectionFiles.book") || "Book", 
      6: t("collectionFiles.other") || "Other" 
    };
    return types[fileType] || "File";
  };

  // Check if file is a video (fileType 0)
  const isVideo = (fileType) => {
    return fileType === 0;
  };

  if (loading) {
    return (
      <div className="collection-loading">
        <div className="loading-spinner"></div>
        <p>{t("collectionFiles.loadingCollectionFiles") || "Loading collection files..."}</p>
      </div>
    );
  }

  return (
    <div className="collection-files-view">
      <div className="collection-view-header">
        <button className="back-btn" onClick={onBack}>
          <FaArrowLeft /> {t("collectionFiles.backToFavorites") || "Back to Favorites"}
        </button>
        <div className="collection-info-header">
          <h1>{collection?.name || "Collection"}</h1>
          <p>{collection?.description || t("collectionFiles.noDescription") || "No description"}</p>
          <span className="files-count-badge">
            {files.length} {files.length === 1 ? (t("collectionFiles.file") || "file") : (t("collectionFiles.files") || "files")} 
            {collection.filesCount > 0 && ` (${t("collectionFiles.total") || "from"} ${collection.filesCount} ${t("collectionFiles.files") || "files"})`}
          </span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="learning-section-collection">
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }} />
            </div>
            <span className="progress-text">{getProgressPercentage()}% {t("collectionFiles.completedPercent") || "Completed"}</span>
          </div>
          
          <div className="learning-controls">
            {!isLearningMode ? (
              <button className="start-learning-btn" onClick={handleStartLearning}>
                <FaPlay /> {t("collectionFiles.startLearning") || "Start Learning Mode"}
              </button>
            ) : (
              <>
                <div className="current-file-info">
                  <span className="current-label">{t("collectionFiles.currentlyLearning") || "Currently learning:"}</span>
                  <span className="current-file-name">
                    {files[currentFileIndex]?.title || "Loading..."}
                  </span>
                  <span className="current-progress">
                    {currentFileIndex + 1} / {files.length}
                  </span>
                </div>
                <div className="learning-buttons">
                  <button className="stop-learning-btn" onClick={handleStopLearning}>
                    <FaStop /> {t("collectionFiles.stopLearning") || "Stop Learning"}
                  </button>
                  <button 
                    className="next-btn" 
                    onClick={handleNext}
                    disabled={currentFileIndex >= files.length - 1}
                  >
                    {currentFileIndex >= files.length - 1 ? 
                      (t("collectionFiles.completed") || "✅ Completed") : 
                      <><FaStepForward /> {t("collectionFiles.next") || "Next"}</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="files-list-collection">
        <h3>{t("collectionFiles.filesInCollection") || "Files in this collection"}</h3>
        <p className="drag-hint">💡 {t("collectionFiles.dragHint") || "Drag the ⋮⋮ icon to reorder files"}</p>
        {files.length === 0 ? (
          <div className="empty-files-message">
            <p>{t("collectionFiles.noFilesVisible") || "📁 No files visible in this collection"}</p>
            <p className="hint">
              {t("collectionFiles.apiFilesHint", { count: collection.filesCount }) || 
                `The collection has ${collection.filesCount} files, but they cannot be displayed.`}
            </p>
            <p className="hint" style={{fontWeight: "bold", marginTop: "1rem"}}>
              {t("collectionFiles.solutionHint") || "⚠️ Solution: Add a new file to this collection, then it will appear here."}
            </p>
          </div>
        ) : (
          <div className="files-grid-collection">
            {files.map((file, index) => (
              <div
                key={file.id || file.eduFileId || index}
                className={`collection-file-card ${isLearningMode && index === currentFileIndex ? "active-file-card" : ""} ${dragOverIndex === index ? "drag-over" : ""}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, file, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="drag-handle" title={t("collectionFiles.dragToReorder") || "Drag to reorder"}>
                  ⋮⋮
                </div>
                <div className="file-icon-large" onClick={() => handleFileClick(file, index)}>
                  {getFileTypeIcon(file.fileType)}
                </div>
                <div className="file-details-collection" onClick={() => handleFileClick(file, index)}>
                  <h4>{file.title || file.name || "Untitled"}</h4>
                  <p>{file.description || t("collectionFiles.noDescription") || "No description"}</p>
                  <div className="file-meta">
                    <span className="file-type-badge">{getFileTypeText(file.fileType)}</span>
                    {file.courseName && <span className="course-name">{file.courseName}</span>}
                  </div>
                </div>
                <div className="file-actions">
                  {/* Download Button - يستخدم نفس API مثل FavoriteFileCard */}
                  <button
                    className="download-file-btn-collection"
                    onClick={(e) => handleDownload(file, e)}
                    title={t("collectionFiles.download") || "Download"}
                  >
                    <FaDownload />
                  </button>
                  {/* Watch Video Button - فقط للملفات من نوع فيديو */}
                  {isVideo(file.fileType) && (
                    <button
                      className="watch-video-btn-collection"
                      onClick={(e) => handleWatchVideo(file, e)}
                      title={t("collectionFiles.watchVideo") || "Watch Video"}
                    >
                      <FaVideo />
                    </button>
                  )}
                  {/* Remove Button */}
                  <button
                    className="remove-file-btn-collection"
                    onClick={(e) => handleRemoveFile(file.id || file.eduFileId, e)}
                    title={t("collectionFiles.removeFromCollection") || "Remove from collection"}
                  >
                    ✕
                  </button>
                </div>
                {isLearningMode && index === currentFileIndex && (
                  <div className="current-indicator-badge">
                    {t("collectionFiles.currentlyLearningBadge") || "▶ Currently Learning"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionFilesView;