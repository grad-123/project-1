import React from "react";
import "./Browse.css";
import { useTranslation } from "react-i18next";
export default function FavoriteFileCard({
  file,
  isFavorite,
  toggleFavorite,
  handleDownload,
  serverUrl,
}) {
  const { t } = useTranslation();
const fileTypeText = {
   0: t("browse.types.lecture"),
  1: t("browse.types.slides"),
  2: t("browse.types.summary"),
  3: t("browse.types.exam"),
  4: t("browse.types.assignment"),
  5: t("browse.types.book"),
  6: t("browse.types.other"),
};
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
         {file.fileType === 0 && "▶️"}
  {file.fileType === 0 && ["mp4", "avi", "mov", "mkv"].includes(file.fileExtension) ? (
    <video width="150" controls>
      <source
        src={`${serverUrl}${file.filePath}`}
        type={
          file.fileExtension === "mp4" ? "video/mp4" :
          file.fileExtension === "mov" ? "video/quicktime" :
          file.fileExtension === "avi" ? "video/x-msvideo" :
          file.fileExtension === "mkv" ? "video/x-matroska" :
          "video/mp4" 
        }
       />
      Your browser does not support the video tag.
    </video>
  ) : (
   
    <>
      {file.fileType === 1 && "📄"}
      {file.fileType === 2 && "📄"}
      {file.fileType === 3 && "📝"}
      {file.fileType === 4 && "📌"}
      {file.fileType === 5 && "📚"}
      {file.fileType === 6 && "❔"}
    </>
  )}
</div>
        <div className="file-details">
          <h3 className="file-title">
            <a
              href={`${serverUrl}${file.filePath}`}
              target="_blank"
              rel="noreferrer"
            >
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
            <span>
              📅 {new Date(file.uploadedAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        </div>
      </div>
      <button
        className="download-btn"
        onClick={() => handleDownload(file.id || file.eduFileId, file.filePath)}
      >
       {t("file.download")}
      </button>
    </div>
  );
}
