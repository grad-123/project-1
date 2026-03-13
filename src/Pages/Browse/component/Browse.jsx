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
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [categoryId, setCategoryId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isDescending, setIsDescending] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
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
          <div className="filters">
            <select onChange={(e) => setCategoryId(Number(e.target.value))}>
              <option value="">{t("browse.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={courseId}
              onChange={(e) => setCourseId(Number(e.target.value))}
              disabled={!categoryId}
            >
              <option value="">{t("browse.courses")}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

            <select onChange={(e) => setFileType(e.target.value)}>
              <option value="">{t("browse.allTypes")}</option>
              <option value="0">Lecture</option>
              <option value="1">Summary</option>
              <option value="2">Exam</option>
              <option value="3">Assignment</option>
              <option value="4">Book</option>
              <option value="5">Other</option>
            </select>

            <select
              onChange={(e) =>
                setOrderBy(e.target.value === "" ? "" : Number(e.target.value))
              }
            >
              <option value="0">Most Downloaded</option>
              <option value="1">Newest</option>
            </select>

            <select
              onChange={(e) => setIsDescending(e.target.value === "true")}
            >
              <option value="true">{t("browse.descending")}</option>
              <option value="false">{t("browse.ascending")}</option>
            </select>
          </div>
          {files.length === 0 && (
            <div className="no-results">
              <h3>{t("browse.noFiles")}</h3>
              <p>{t("browse.tryAnotherSearch")}</p>
            </div>
          )}
          <div className="files-container">
            {files.length > 0 &&
              files.map((file) => (
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
                          📅{" "}
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file.id, file.filePath)}
                  >
                    {t("browse.download")}
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
