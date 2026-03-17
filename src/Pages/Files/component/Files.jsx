import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./Files.css";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";
function Files() {
  const [activeType, setActiveType] = useState("all");
  const { t } = useTranslation();
  const { courseId } = useParams();
  const serverUrl = "https://ozie-unneedful-freely.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const filteredFiles =
    activeType === "all"
      ? files
      : files.filter((file) => file.fileType === Number(activeType));

  useEffect(() => {
    axios
      .get(`/Api/EduFile/GetByCourseId/${courseId}`)
      .then((res) => {
        setFiles(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [courseId]);

  useEffect(() => {
    axios
      .get("/Favorite/Getlist")
      .then((res) => {
        const favIds = res.data.data.map((f) => f.eduFileId);
        setFavorites(favIds);
      })
      .catch((err) => console.log(err));
  }, []);
  const addFavorite = async (fileId) => {
    try {
      await axios.post(`/Favorite/Add/${fileId}`);
      setFavorites((prev) => [...prev, fileId]);
    } catch (err) {
      console.log(err);
    }
  };
  const removeFavorite = async (fileId) => {
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFavorites((prev) => prev.filter((id) => id !== fileId));
    } catch (err) {
      console.log(err);
    }
  };
  const toggleFavorite = (fileId) => {
    if (favorites.includes(fileId)) {
      removeFavorite(fileId);
    } else {
      addFavorite(fileId);
    }
  };
  const handleDownload = async (fileId, filePath) => {
    try {
      await axios.get(`/Api/EduFile/Download/${fileId}`);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, downloadCount: f.downloadCount + 1 } : f,
        ),
      );

      window.open(`${serverUrl}${filePath}`, "_blank");
    } catch (err) {
      console.log("Download error:", err);
    }
  };

  const fileTypes = [
    { id: "all", name: "All", icon: "📂" },
    { id: 0, name: "Lectures", icon: "🎥" },
    { id: 1, name: "Slides", icon: "📑" },
    { id: 2, name: "Summaries", icon: "📄" },
    { id: 3, name: "Exams", icon: "🧾" },
    { id: 4, name: "Assignments", icon: "📌" },
    { id: 5, name: "Books", icon: "📚" },
    { id: 6, name: "Other", icon: "📁" },
  ];

  return (
    <div className="files-container">
      <h2 className="files-title">{t("file.title")}</h2>
      <p className="files-description">{t("file.description")}</p>

      <div className="tabs">
        {fileTypes.map((type) => (
          <button
            key={type.id}
            className={activeType === type.id ? "active" : ""}
            onClick={() => setActiveType(type.id)}
          >
            {type.icon} {type.name} (
            {type.id === "all"
              ? files.length
              : files.filter((f) => f.fileType === type.id).length}
            )
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <p>{t("file.noFiles")}</p>
      ) : (
        filteredFiles.map((file) => (
          <FavoriteFileCard
            key={file.id || file.eduFileId}
            file={file}
            isFavorite={favorites.includes(file.id || file.eduFileId)}
            toggleFavorite={toggleFavorite}
            handleDownload={handleDownload}
            serverUrl={serverUrl}
          />
        ))
      )}
    </div>
  );
}

export default Files;
