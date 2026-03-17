import React from "react";
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
}) {
  const { t } = useTranslation();

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${serverUrl}${file.filePath}`, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      window.open(fileUrl, "_blank");

      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", file.filePath.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log("Download error:", err);
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
          <h3 className="file-title">{file.title}</h3>
          <span className="file-type">{fileTypeText[file.fileType]}</span>
          <p className="file-description">{file.description}</p>
          <div className="file-meta">
            <span>📚 {file.courseName}</span>
            <span>📁 {file.categoryName}</span>
          </div>
          <div className="file-footer">
            <span>👤 {file.uploadedByUserName}</span>
            <span>⬇ {file.downloadCount}</span>
            <span>📅 {new Date(file.uploadedAt).toLocaleDateString("en-GB")}</span>
          </div>
        </div>
      </div>

      <div className="file-actions">
        {file.fileType === 0 && (
          <button
            className="download-btn"
            onClick={() => window.open(`${serverUrl}${file.filePath}`, "_blank")}
          >
            {t("browse.watchVideo")}
          </button>
        )}
        <button className="download-btn" onClick={handleDownload}>
          {t("browse.download")}
        </button>
      </div>
    </div>
  );
}