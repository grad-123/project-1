import "./Sidebar.css";
import { FaRobot } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Sidebar() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("0"); 
  const [isDescending, setIsDescending] = useState(true);

  const navigate = useNavigate();

  const getAllFiles = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search");
      setFiles(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setCourses([]);
      setCourseId("");
      return;
    }
    axios
      .get(`/Api/Course/GetList/${categoryId}`)
      .then((res) => setCourses(res.data.data || []))
      .catch((err) => console.log(err));
  }, [categoryId]);

  useEffect(() => {
    getAllFiles();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: searchTerm || undefined,
          CategoryId: categoryId || undefined,
          CourseId: courseId || undefined,
          FileType: fileType || undefined,
        },
      });
      let data = res.data.data || [];

      data = data.sort((a, b) => {
        if (orderBy === "0") {
          return isDescending
            ? b.downloadCount - a.downloadCount
            : a.downloadCount - b.downloadCount;
        }
        if (orderBy === "1") {
          return isDescending
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });

      setFiles(data);
      setMessage("");
    } catch (err) {
      console.log(err);
      setMessage(t("alerts.failText"));
    }
  };

  return (
    <div className="ai-sidebar">
      <div className="sidebar-header">
        <FaRobot size={32} className="sidebar-icon" />
        <h2 className="sidebar-title">{t("sidebar.AI Assistant")}</h2>
      </div>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder={t("browse.searchPlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>{t("browse.searchButton")}</button>
      </div>

      <div className="filterss">
        <select onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">{t("browse.allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
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
          <option value="0">{t("browse.types.lecture")}</option>
          <option value="1">{t("browse.types.slides")}</option>
          <option value="2">{t("browse.types.summary")}</option>
          <option value="3">{t("browse.types.exam")}</option>
          <option value="4">{t("browse.types.assignment")}</option>
          <option value="5">{t("browse.types.book")}</option>
          <option value="6">{t("browse.types.other")}</option>
        </select>

        <select onChange={(e) => setOrderBy(e.target.value)}>
          <option value="0">{t("browse.order.mostDownloaded")}</option>
          <option value="1">{t("browse.order.newest")}</option>
        </select>

        <select onChange={(e) => setIsDescending(e.target.value === "true")}>
          <option value="true">{t("browse.descending")}</option>
          <option value="false">{t("browse.ascending")}</option>
        </select>
      </div>

      {message && <p className="message">{message}</p>}

      <h3 className="subtitle">{t("sidebar.title")}</h3>
      <div className="files">
        {files.map((file) => (
          <div
            key={file.id}
            className="file-item"
            onClick={() => navigate(`/ai/file/${file.id}`)}
          >
            <div className="file-icon">
              {file.fileType === 0 && "🎥"}
              {file.fileType === 1 && "📄"}
              {file.fileType === 2 && "📝"}
              {file.fileType === 3 && "🧾"}
              {file.fileType === 4 && "📌"}
              {file.fileType === 5 && "📚"}
              {file.fileType === 6 && "📁"}
            </div>
            <div className="file-info">
              <h4>{file.title}</h4>
              <p className="meta">
                {file.courseName} • {file.categoryName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;