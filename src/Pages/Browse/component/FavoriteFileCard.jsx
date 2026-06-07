// FavoriteFileCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FavoriteFileCard.css";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../../api/axiosInstance";

const fileTypeText = {
  0: "Lecture",
  1: "Slides",
  2: "Summary",
  3: "Exam",
  4: "Assignment",
  5: "Book",
  6: "Other",
};

export default function FavoriteFileCard({
  file,
  isFavorite,
  toggleFavorite,
  serverUrl,
  setMessage,
  showAddButton = true,
  onAddToCollection = null,
  hideFileType = false,
  downloadingId = null,
  hideUploader = false,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const fileId = file.id || file.eduFileId;
      
      if (!fileId) {
        console.error("❌ No file ID found:", file);
        if (setMessage) {
          setMessage("File ID not found", "error");
        }
        setIsDownloading(false);
        return;
      }
     
      const response = await axiosInstance.get(`/Api/EduFile/Download/${fileId}`, {
        responseType: "blob",
      });

      if (!response.data || response.data.size === 0) {
        throw new Error("No data received from server");
      }

      console.log("✅ Download successful, file size:", response.data.size, "bytes");

      let fileName = `file_${fileId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      } else {
        fileName = file.title || file.filePath?.split('/').pop() || `download_${fileId}`;
        if (file.fileType === 0 && !fileName.includes('.mp4')) fileName += '.mp4';
        if (file.fileType === 1 && !fileName.includes('.pdf')) fileName += '.pdf';
        if (file.fileType === 2 && !fileName.includes('.docx')) fileName += '.docx';
      }

      const blob = new Blob([response.data]);
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(fileUrl);

      if (setMessage) {
        setMessage(t("browse.downloadStarted") || "Download started!", "success");
        setTimeout(() => setMessage && setMessage(""), 2000);
      }
    } catch (err) {
      console.error("❌ Download error:", err);
      
      let errorMessage = t("browse.downloadError") || "Download failed";
      
      if (err.response?.status === 400) {
        const directUrl = `${serverUrl}/Api/EduFile/Download/${file.id || file.eduFileId}`;
        console.log("Trying direct URL in new tab:", directUrl);
        window.open(directUrl, "_blank");
        errorMessage = "Opening download in new tab...";
      } else if (err.response?.status === 401) {
        errorMessage = t("browse.sessionExpired") || "Session expired. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = t("browse.fileNotFound") || "File not found or has been deleted.";
      }
      
      if (setMessage) {
        setMessage(errorMessage, "error");
        setTimeout(() => setMessage && setMessage(""), 3000);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenFile = () => {
    const directUrl = `${serverUrl}${file.filePath}`;
    window.open(directUrl, "_blank");
  };

  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      if (setMessage) setMessage(t("browse.loginToViewProfile") || "Please login to view profile", "warning");
      return;
    }
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      if (setMessage) setMessage(t("browse.cannotViewProfile") || "Cannot view profile", "warning");
    }
  };

  return (
    <div className="file-card">
      <div
        className={`file-favorite ${isFavorite ? "active" : ""}`}
        onClick={() => {
          const token = localStorage.getItem("token");
          if (!token) {
            setMessage(t("browse.loginFirst") || "Login first to add/remove favorites!");
            return;
          }
          toggleFavorite(file.id || file.eduFileId);
        }}
      >
        {isFavorite ? "❤️" : "♡"}
      </div>

      <div className="file-info">
        <div className="file-icon">
          {file.fileType === 0 && "🎥"}
          {file.fileType === 1 && "📄"}
          {file.fileType === 2 && "📝"}
          {file.fileType === 3 && "📝"}
          {file.fileType === 4 && "📌"}
          {file.fileType === 5 && "📚"}
          {file.fileType === 6 && "📁"}
        </div>
        <div className="file-details">
          <h3
            className="file-title clickable"
            onClick={handleOpenFile}
            style={{ cursor: 'pointer' }}
          >
            {file.title}
          </h3>
          {!hideFileType && (
            <span className="file-type">{fileTypeText[file.fileType]}</span>
          )}
          <p className="file-description">{file.description}</p>
          <div className="file-meta">
            <span>📚 {file.courseName}</span>
            <span>📁 {file.categoryName}</span>
          </div>
          <div className="file-footer">
            {!hideUploader && file.uploadedByUserName && (
              <span
                className="uploader-name-clickable"
                onClick={(e) => handleUploaderClick(file.uploadedByUserId, file.uploadedByUserName, e)}
                title={t("browse.clickToViewProfile") || "Click to view profile"}
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                👤 {file.uploadedByUserName}
              </span>
            )}
            <span>⬇ {file.downloadCount}</span>
            <span>
              📅 {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString("en-GB") : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="file-actions">
        {file.fileType === 0 && (
          <button className="watch-btn" onClick={handleOpenFile}>
            🎥 {t("browse.watchVideo") || "Watch video"}
          </button>
        )}
        <button 
          className="download-btn" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "⏳ ..." : "⬇ " + (t("browse.download") || "Download")}
        </button>

        {showAddButton && onAddToCollection && (
          <button className="add-to-collection-btn-card" onClick={onAddToCollection}>
            + {t("addToCollection.title") || "Add to Collection"}
          </button>
        )}
      </div>
    </div>
  );
}