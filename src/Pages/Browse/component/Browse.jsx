import React, { useEffect, useState } from "react";
import "./Browse.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";
import { FaSearch } from "react-icons/fa";
import FavoriteFileCard from "../../Browse/component/FavoriteFileCard";
function Browse() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [categoryId, setCategoryId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isDescending, setIsDescending] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => {
        setCategories(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);
  useEffect(()=>{
    axios
    .get("/favorites/Getlist")
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

 useEffect(() => {
  if (!categoryId) {
    setCourses([]);
    setCourseId("");
    return;
  }
  setCourseId("");
  axios.get(`/Api/Course/GetList/${categoryId}`)
    .then((res) => {
    setCourses(res.data.data || []);
    })
    .catch((err) => {
      console.error("Error fetching courses:", err);
    });
}, [categoryId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  const searchFiles = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: debouncedSearch || undefined,
          CategoryId: categoryId || undefined,
          CourseId: courseId || undefined,
          FileType: fileType || undefined,
          OrderBy: orderBy || undefined,
          IsDescending: isDescending,
        },
      });

      setFiles(res.data.data || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };
  const handleSearch = () => {
    setShowResults(true);
    searchFiles();
  };

  useEffect(() => {
    if (!showResults) return;
    searchFiles();
  }, [debouncedSearch, categoryId, courseId, fileType, orderBy, isDescending]);

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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <h1 className="browse-title">{t("browse.categories")}</h1>
      <p className="browse-description">{t("browse.description")}</p>
      <div className="search-wrapper">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t("browse.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="search-btn" onClick={handleSearch}>
          {t("browse.searchButton")}
        </button>
      </div>
      {!showResults && (
        <div className="categories-container">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/courses/${cat.id}`}
              state={{ categoryName: cat.name }}
              className="category-link"
            >
              <div className="category-card">
                <div className="card-content">
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                </div>
                <div className="card-arrow">›</div>
              </div>
            </Link>
          ))}
        </div>
      )}

     {showResults && (
  <>
    <div className="filters">...</div>

    {files.length === 0 ? (
      <div className="no-results">
        <h3>{t("browse.noFiles")}</h3>
        <p>{t("browse.tryAnotherSearch")}</p>
      </div>
    ) : (
      <div className="files-container">
        {files.map((file) => (
          <FavoriteFileCard
            key={file.id || file.eduFileId}
            file={file}
            isFavorite={favorites.includes(file.id || file.eduFileId)}
            toggleFavorite={toggleFavorite}
            handleDownload={handleDownload}
            serverUrl={serverUrl}
          />
        ))}
      </div>
    )}
  </>
)}
    </div>
  );
}

export default Browse;