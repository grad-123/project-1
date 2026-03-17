import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { useTranslation } from "react-i18next";
import "./Files.css";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";
function Files() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
  const [files, setFiles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    axios
      .get(`/Api/EduFile/GetByCourseId/${courseId}`)
      .then((res) => {
        setFiles(res.data.data);
      })
      .catch((err) => console.log(err));
  }, [courseId]);

  useEffect(()=>{
    axios
    .get("/Favorite/Getlist")
    .then((res)=>{
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

      window.open(
        `${serverUrl}${filePath}`,
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
     {files.length === 0 ? (
        <p>{t("file.noFiles")}</p>
      ) : (
        files.map((file) => (
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
