import "./Sidebar.css";
import { useEffect, useState } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [isDescending, setIsDescending] = useState(true);

  const navigate = useNavigate();

  // ===== جلب كل الملفات بدون باراميتر =====
  const getAllFiles = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search");
      setFiles(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // ===== جلب الكاتيجوري =====
  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  // ===== جلب الكورسات حسب الكاتيجوري =====
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

  // ===== تحميل كل الملفات أول ما الصفحة تفتح =====
  useEffect(() => {
    getAllFiles();
  }, []);

  // ===== البحث مع الفلاتر =====
  const handleSearch = async () => {
    try {
      const res = await axios.get("/Api/EduFile/Search", {
        params: {
          Keyword: searchTerm || undefined,
          CategoryId: categoryId || undefined,
          CourseId: courseId || undefined,
          FileType: fileType || undefined,
          OrderBy: orderBy || undefined,
          IsDescending: isDescending,
        },
      });

      setFiles(res.data.data || []);
    } catch (err) {
      console.log(err);
      setMessage("Search error");
    }
  };

  // ===== تشغيل البحث عند تغيير الفلاتر =====
  useEffect(() => {
    handleSearch();
  }, [categoryId, courseId, fileType, orderBy, isDescending]);

  return (
    <div className="ai-sidebar">
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="filters">
        <select onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>

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
          <option value="">Courses</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        <select onChange={(e) => setFileType(e.target.value)}>
          <option value="">All Types</option>
          <option value="0">Lecture</option>
          <option value="1">Slides</option>
          <option value="2">Summary</option>
          <option value="3">Exam</option>
          <option value="4">Assignment</option>
          <option value="5">Book</option>
          <option value="6">Other</option>
        </select>

        <select onChange={(e) => setOrderBy(e.target.value)}>
          <option value="">Order</option>
          <option value="0">Most Downloaded</option>
          <option value="1">Newest</option>
        </select>

        <select onChange={(e) => setIsDescending(e.target.value === "true")}>
          <option value="true">Descending</option>
          <option value="false">Ascending</option>
        </select>
      </div>

      {message && <p className="message">{message}</p>}

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