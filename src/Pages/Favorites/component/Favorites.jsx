import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import "./Favorites.css";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";

function Favorites() {

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
      Saved <span className="blue">Resources</span>
    </h1>
     <p>
      Manage your personalized collection of AI summaries, course notes,
      and research materials for quick academic reference.
    </p>
    </div>
    <div className="files-grid">
  {files.map((file) => (
    <FavoriteFileCard
      key={file.eduFileId}
      file={file}
      isFavorite={true}
      toggleFavorite={toggleFavorite}
      handleDownload={handleDownload}
      serverUrl={serverUrl}
    />
  ))}
</div>

     
  
  </div>

 );
}

export default Favorites;