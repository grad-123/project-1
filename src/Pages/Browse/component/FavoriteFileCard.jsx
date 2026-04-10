import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Browse.css";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";

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
    // منع النقر المتكرر
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    try {
      const fileId = file.id || file.eduFileId;
      
      // التحقق من وجود ID
      if (!fileId) {
        console.error("❌ No file ID found:", file);
        if (setMessage) {
          setMessage("File ID not found", "error");
        }
        setIsDownloading(false);
        return;
      }
      
      const downloadUrl = `/Api/EduFile/Download/${fileId}`;
      console.log("📥 Download URL:", downloadUrl);
      console.log("📥 File ID:", fileId);
      
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
        headers: {
          'Accept': '*/*',
          'ngrok-skip-browser-warning': 'true',
        }
      });

      // التحقق من أن الاستجابة تحتوي على بيانات
      if (!response.data || response.data.size === 0) {
        throw new Error("No data received from server");
      }

      console.log("✅ Download successful, file size:", response.data.size, "bytes");

      // استخراج اسم الملف من Content-Disposition
      let fileName = `file_${fileId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      } else {
        // استخدام اسم الملف من الـ file object إذا وجد
        fileName = file.title || file.filePath?.split('/').pop() || `download_${fileId}`;
      }

      // إنشاء رابط التحميل
      const blob = new Blob([response.data]);
      const fileUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // تنظيف الذاكرة
      window.URL.revokeObjectURL(fileUrl);

      if (setMessage) {
        setMessage(t("browse.downloadStarted") || "Download started!", "success");
        setTimeout(() => setMessage && setMessage(""), 2000);
      }
    } catch (err) {
      console.error("❌ Download error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.message,
        data: err.response?.data
      });
      
      let errorMessage = t("browse.downloadError") || "Download failed";
      
      if (err.response?.status === 401) {
        errorMessage = t("browse.sessionExpired") || "Session expired. Please login again.";
      } else if (err.response?.status === 404) {
        errorMessage = t("browse.fileNotFound") || "File not found or has been deleted.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid request. Please try again.";
      }
      
      if (setMessage) {
        setMessage(errorMessage, "error");
        setTimeout(() => setMessage && setMessage(""), 3000);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    e.preventDefault();

    console.log("🔵 FavoriteFileCard - Clicked on uploader:", {
      userId,
      userName,
    });

    const token = localStorage.getItem("token");
    if (!token) {
      if (setMessage) setMessage(t("browse.loginToViewProfile"), "warning");
      return;
    }
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      console.log("⚠️ No valid userId provided");
      if (setMessage) setMessage(t("browse.cannotViewProfile"), "warning");
    }
  };

  return (
    <div className="file-card">
      <div
        className={`file-favorite ${isFavorite ? "active" : ""}`}
        onClick={() => {
          const token = localStorage.getItem("token");
          if (!token) {
            setMessage(t("browse.loginFirst"));
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
            onClick={() => {
              const directUrl = `${serverUrl}${file.filePath}`;
              window.open(directUrl, "_blank");
            }}
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
                onClick={(e) =>
                  handleUploaderClick(
                    file.uploadedByUserId,
                    file.uploadedByUserName,
                    e,
                  )
                }
                title={
                  t("browse.clickToViewProfile") || "انقر لعرض الملف الشخصي"
                }
                style={{ cursor: "pointer", color: "#007bff" }}
              >
                👤 {file.uploadedByUserName}
              </span>
            )}
            <span>⬇ {file.downloadCount}</span>
            <span>
              📅{" "}
              {file.uploadedAt
                ? new Date(file.uploadedAt).toLocaleDateString("en-GB")
                : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="file-actions">
        {file.fileType === 0 && (
          <button
            className="watch-btn"
            onClick={() => {
              window.open(`${serverUrl}${file.filePath}`, "_blank");
            }}
          >
            🎥 {t("browse.watch")}
          </button>
        )}
        <button 
          className="download-btn" 
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? "⏳ ..." : "⬇ " + t("browse.download")}
        </button>

        {showAddButton && onAddToCollection && (
          <button
            className="add-to-collection-btn-card"
            onClick={onAddToCollection}
          >
            + {t("addToCollection.title")}
          </button>
        )}
      </div>
    </div>
  );
}