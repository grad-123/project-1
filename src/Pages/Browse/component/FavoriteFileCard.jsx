import React from "react";
import "./Browse.css";


const fileTypeText = {
  0: "Lecture",
  1: "Summary",
  2: "Exam",
  3: "Assignment",
  4: "Book",
  5: "Other",
};

export default function FavoriteFileCard({ file, isFavorite, toggleFavorite, handleDownload, serverUrl }) {
  return (
    <div className="file-card">
      <div
        className={`file-favorite ${isFavorite ? "active" : ""}`}
        onClick={() => toggleFavorite(file.id || file.eduFileId)}
      >
        {isFavorite ? "❤️" : "♡"}
      </div>
      <div className="file-info">
        <div className="file-icon">
          {file.fileType === 0 && "📄"}
          {file.fileType === 1 && "📄"}
          {file.fileType === 2 && "📝"}
          {file.fileType === 3 && "📌"}
          {file.fileType === 4 && "📚"}
          {file.fileType === 5 && "❔"}
        </div>
        <div className="file-details">
          <h3 className="file-title">
            <a href={`${serverUrl}${file.filePath}`} target="_blank" rel="noreferrer">
              {file.title}
            </a>
          </h3>
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
      <button className="download-btn" onClick={() => handleDownload(file.id || file.eduFileId, file.filePath)}>
        Download
      </button>
    </div>
  );
}