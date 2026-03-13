import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./Files.css";
function Files() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const [files, setFiles] = useState([]);
  const fileTypeLabels = {
    0: "Lecture",
    1: "Summary",
    2: "Exam",
    3: "Assignment",
    4: "Book",
    5: "Other",
  };
  useEffect(() => {
    axios
      .get(`/Api/EduFile/GetByCourseId/${courseId}`)
      .then((res) => {
        setFiles(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [courseId]);
  const handleDownload = async (fileId, filePath) => {
    try {
      await axios.get(`/Api/EduFile/Download/${fileId}`);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, downloadCount: f.downloadCount + 1 } : f,
        ),
      );

      window.open(
        `https://corny-unevacuated-willy.ngrok-free.dev${filePath}`,
        "_blank",
      );
    } catch (err) {
      console.log("Download error:", err);
    }
  };

  return (
    <div className="files-container">
      <h2 className="files-title">{t("file.title")}</h2>
      <p className="files-description">{t("file.description")}</p>
      {files.map((file) => (
        <div className="file-card" key={file.id}>
          <div className="file-favorite">❤️</div> 
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
                <a
                  href={`https://corny-unevacuated-willy.ngrok-free.dev${file.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {file.title}
                </a>
              </h3>
              <span className="file-type">
                {fileTypeLabels[file.fileType] || "Other"}
              </span>
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

          <button
            className="download-btn"
            onClick={() => handleDownload(file.id, file.filePath)}
          >
            {t("file.download")}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Files;
