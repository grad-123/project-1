import React, { useEffect, useState } from "react";
import "./Browse.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";
import { FaSearch } from "react-icons/fa";

function Browse() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [files, setFiles] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isDescending, setIsDescending] = useState(true);

  const [showResults, setShowResults] = useState(false); 

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

  const searchFiles = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: searchTerm,
          CategoryId: categoryId,
          FileType: fileType,
          OrderBy: orderBy,
          IsDescending: isDescending,
        },
      });
      setFiles(res.data.data || []);
      setShowResults(true); 
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleDownload = async (fileId, filePath) => {
    try {
      await axios.get(`/EduFile/Download/${fileId}`);
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

        <button className="search-btn" onClick={searchFiles}>
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
          <div className="filters">
            <select onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select onChange={(e) => setFileType(e.target.value)}>
              <option value="">All Types</option>
              <option value="0">Lecture</option>
              <option value="1">Summary</option>
              <option value="2">Exam</option>
              <option value="3">Assignment</option>
              <option value="4">Book</option>
              <option value="5">Other</option>
            </select>

            <select onChange={(e) => setOrderBy(e.target.value)}>
              <option value="">Sort</option>
              <option value="0">Most Downloaded</option>
              <option value="1">Newest</option>
            </select>

            <select
              onChange={(e) => setIsDescending(e.target.value === "true")}
            >
              <option value="true">Descending</option>
              <option value="false">Ascending</option>
            </select>
          </div>

          <div className="files-container">
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
                      {{
                        0: "Lecture",
                        1: "Summary",
                        2: "Exam",
                        3: "Assignment",
                        4: "Book",
                        5: "Other",
                      }[file.fileType] || "Other"}
                    </span>
                    <p className="file-description">{file.description}</p>
                    <div className="file-meta">
                      <span>📚 {file.courseName}</span>
                      <span>📁 {file.categoryName}</span>
                    </div>
                    <div className="file-footer">
                      <span>👤 {file.uploadedByUserName}</span>
                      <span>⬇ {file.downloadCount}</span>
                      <span>
                        📅 {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="download-btn"
                  onClick={() => handleDownload(file.id, file.filePath)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Browse;
