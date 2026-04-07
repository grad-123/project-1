import React from "react";
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

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `/Api/EduFile/Download/${file.id || file.eduFileId}`,
        {
          responseType: "blob",
        },
      );

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const fileName =
        file.filePath?.split("/").pop() || file.title || "download";

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(fileUrl);

      if (setMessage)
        setMessage(t("browse.downloadStarted") || "Download started!");
      setTimeout(() => setMessage && setMessage(""), 2000);
    } catch (err) {
      console.log("Download error:", err);
      if (setMessage)
        setMessage(t("browse.downloadError") || "Download failed");
      setTimeout(() => setMessage && setMessage(""), 3000);
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
        <button className="download-btn" onClick={handleDownload}>
          ⬇ {t("browse.download")}
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
