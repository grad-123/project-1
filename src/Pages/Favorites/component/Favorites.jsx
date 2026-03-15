import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import "./Favorites.css";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";
import { useTranslation } from "react-i18next";

function Favorites() {
 const { t } = useTranslation();
 const [files,setFiles] = useState([]);
 const toggleFavorite = (fileId) => {
  removeFavorite(fileId); 
};

const handleDownload = (fileId, filePath) => {
  window.open(`${serverUrl}${filePath}`, "_blank");
};

 useEffect(()=>{
  axios.get("/Favorite/GetList")
  .then(res => setFiles(res.data.data))
  .catch(err => console.log(err));

 },[]);
  const removeFavorite = async (fileId) => {
    try {
      await axios.delete(`/Favorite/Delete/${fileId}`);
      setFiles(prevFiles => prevFiles.filter(f => f.eduFileId !== fileId));
    } catch (err) {
      console.log(err);
    }
  };
   const serverUrl = "https://ozie-unneedful-freely.ngrok-free.dev";

 return (

  <div className="files-container">
 <div className="favorites-header">
    <h1>
  {t("favorites.title.first")}
  <span className="blue">{t("favorites.title.second")}</span>
</h1>
        <p>{t("favorites.subtitle")}</p>
    </div>
    <div className="files-grid">
       {files.length === 0 ? (
          <p>{t("file.noFiles")}</p>
        ) : (
  files.map((file) => (
    <FavoriteFileCard
      key={file.eduFileId}
      file={file}
      isFavorite={true}
      toggleFavorite={toggleFavorite}
      handleDownload={handleDownload}
      serverUrl={serverUrl}
    />
  )) 
)}
</div>
  </div>

 );
}

export default Favorites;