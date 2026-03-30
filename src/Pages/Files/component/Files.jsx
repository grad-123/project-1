import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./Files.css";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";

function Files() {
  const [message, setMessage] = useState("");
  const [activeType, setActiveType] = useState("all");
  const { t } = useTranslation();
  const { courseId } = useParams();
  const serverUrl = "https://ozie-unneedful-freely.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    axios
      .get(`/Api/EduFile/GetByCourseId/${courseId}`)
      .then((res) => {
        const filesWithId = res.data.data.map(file => ({
          ...file,
          eduFileId: file.eduFileId || file.id,
          id: file.id || file.eduFileId,
          fileType: file.fileType !== undefined ? Number(file.fileType) : file.type,
          uploadedAt: file.uploadedAt || file.createdAt || file.upload_date,
          downloadCount: file.downloadCount || file.download_count || 0
        }));
        setFiles(filesWithId);
      })
      .catch((err) => console.log(err));
  }, [courseId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/Favorite/Getlist")
      .then((res) => {
        if (res.data && res.data.data) {
          setFavorites(res.data.data.map(f => f.eduFileId));
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const addFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(`/Favorite/Add/${fileId}`);
      setFavorites(prev => [...prev, fileId]);
      setMessage(t("files.addedToFavorites") || "Added to favorites");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log(err);
      setMessage(t("files.error") || "Error adding to favorites");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const removeFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFavorites(prev => prev.filter(id => id !== fileId));
      setMessage(t("files.removedFromFavorites") || "Removed from favorites");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log(err);
      setMessage(t("files.error") || "Error removing from favorites");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const toggleFavorite = (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage"));
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    favorites.includes(fileId) ? removeFavorite(fileId) : addFavorite(fileId);
  };

  const handleDownload = async (fileId, filePath) => {
    setDownloadingId(fileId);
    try {
      const response = await axios.get(`/Api/EduFile/Download/${fileId}`, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filePath.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(fileUrl);

      setFiles(prevFiles =>
        prevFiles.map(f =>
          (f.id === fileId || f.eduFileId === fileId)
            ? { ...f, downloadCount: (f.downloadCount || 0) + 1 }
            : f
        )
      );

      setMessage(t("files.downloadStarted") || "Download started!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.log("Download error:", err);
      setMessage(t("files.downloadError") || "Download failed");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

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

  const displayedFiles = [...files].filter(
    f => activeType === "all" || f.fileType === Number(activeType)
  );

  return (
    <div className="files-container">
      <h2 className="files-title">{t("files.title")}</h2>
      <p className="files-description">{t("files.description")}</p>

      <div className="tabs">
        {fileTypes.map(type => (
          <button
            key={type.id}
            className={activeType === type.id ? "active" : ""}
            onClick={() => setActiveType(type.id)}
          >
            {type.icon} {type.name} (
            {type.id === "all"
              ? files.length
              : files.filter(f => f.fileType === type.id).length}
            )
          </button>
        ))}
      </div>

      {message && <div className="message">{message}</div>}

      {displayedFiles.length === 0 ? (
        <p>{t("files.noFiles")}</p>
      ) : (
        displayedFiles.map(file => (
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
    </div>
  );
}

export default Files;