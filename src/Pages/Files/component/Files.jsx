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
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
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
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("/Favorite/Getlist")
      .then((res) => {
        const favIds = res.data.data.map((f) => f.eduFileId);
        setFavorites(favIds);
      })
      .catch((err) => console.log(err));
  }, []);

  const addFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(`/Favorite/Add/${fileId}`);
      setFavorites((prev) => [...prev, fileId]);
    } catch (err) {
      console.log(err);
    }
  };

  const removeFavorite = async (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFavorites((prev) => prev.filter((id) => id !== fileId));
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFavorite = (fileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("files.loginMessage")); 
      return;
    }
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
          f.id === fileId ? { ...f, downloadCount: f.downloadCount + 1 } : f
        )
      );
      window.open(`${serverUrl}${filePath}`, "_blank");
    } catch (err) {
      console.log("Download error:", err);
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

  return (
    <div className="files-container">
      <h2 className="files-title">{t("files.title")}</h2>
      <p className="files-description">{t("files.description")}</p>


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
      {message && <div className="message">{message}</div>}

      {filteredFiles.length === 0 ? (
        <p>{t("files.noFiles")}</p>
      ) : (
        filteredFiles.map((file) => (
          <FavoriteFileCard
            key={file.id || file.eduFileId}
            file={file}
            isFavorite={favorites.includes(file.id || file.eduFileId)}
            toggleFavorite={toggleFavorite}
            handleDownload={handleDownload}
            serverUrl={serverUrl}
            setMessage={setMessage} 
          />
        ))
      )}
    </div>
  );
}

export default Files;