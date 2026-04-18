import "./Sidebar.css";
import { FaRobot, FaSearch, FaDownload, FaCalendar, FaUser } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Sidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_API_URL;
  
  // State
  const [files, setFiles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileType, setFileType] = useState("");
  const [orderBy, setOrderBy] = useState("0");
  // ✅ isDescending ثابت = true (تنازلي دائماً)
  const [isDescending] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  // For collection view
  const [showCollectionFiles, setShowCollectionFiles] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionFiles, setCollectionFiles] = useState([]);
  
  // For dropdowns
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Message
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch categories
  useEffect(() => {
    axios
      .get("/api/v1/Category/GetList")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.log(err));
  }, []);

  // Fetch courses when category changes
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // عندما يتم مسح searchTerm بالكامل، أعد تعيين النتائج
  useEffect(() => {
    if (!searchTerm && !categoryId && !courseId && showResults) {
      setShowResults(false);
      setFiles([]);
      setCollections([]);
    }
  }, [searchTerm, categoryId, courseId, showResults]);

  // Search files and collections
  const searchFiles = useCallback(async () => {
    if (!showResults) return;
    
    // إذا كان searchTerm و categoryId و courseId كلهم فارغين، لا تبحث
    if (!debouncedSearch && !categoryId && !courseId) {
      setFiles([]);
      setCollections([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const params = {
        Keyword: debouncedSearch || undefined,
        CategoryId: categoryId || undefined,
        CourseId: courseId || undefined,
        FileType: fileType || undefined,
        OrderBy: orderBy === "0" ? "DownloadCount" : "UploadedAt",
        IsDescending: isDescending, // ✅ دائماً true (تنازلي)
      };
      
      console.log("🔍 Searching with params:", params);
      
      const res = await axios.get("/Api/EduFile/Search", { params });

      const filesData = res.data.data?.files || [];
      const collectionsData = res.data.data?.collections || [];
      
      console.log(`📄 Found ${filesData.length} files`);
      console.log(`📚 Found ${collectionsData.length} collections`);
      
      setFiles(filesData);
      setCollections(collectionsData);
    } catch (err) {
      console.error("Search error:", err);
      setFiles([]);
      setCollections([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categoryId, courseId, fileType, orderBy, isDescending, showResults]);

  useEffect(() => {
    searchFiles();
  }, [searchFiles]);

  // Handle search button click
  const handleSearch = () => {
    if (!searchTerm && !categoryId && !courseId) {
      setMessage(t("browse.enterKeyword") || "أدخل كلمة مفتاحية أو اختر تصنيفاً");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    setShowResults(true);
    setShowCollectionFiles(false);
    setSelectedCollection(null);
    setCollectionFiles([]);
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchTerm("");
    setCategoryId("");
    setCourseId("");
    setFileType("");
    setOrderBy("0");
    setShowResults(false);
    setFiles([]);
    setCollections([]);
    setMessage("");
  };

  // Open collection to view its files
  const openCollection = async (collection) => {
    setSelectedCollection(collection);
    setShowCollectionFiles(true);
    setIsLoading(true);
    
    try {
      const res = await axios.get(`/api/v1/Collection/GetById/${collection.id}`);
      if (res.data && res.data.succeeded && res.data.data) {
        const collectionData = res.data.data;
        const files = (collectionData.files || []).map(file => ({
          ...file,
          id: file.eduFileId,
          eduFileId: file.eduFileId,
          fileType: Number(file.fileType),
          title: file.title,
          filePath: file.filePath,
          description: file.description,
          courseName: file.courseName,
          categoryName: file.categoryName,
          downloadCount: file.downloadCount || 0,
          uploadedAt: file.uploadedAt || collectionData.createdAt,
          uploadedByUserName: file.uploadedByUserName || collectionData.uploaderName,
          uploadedByUserId: file.uploadedByUserId || collectionData.uploaderId
        }));
        setCollectionFiles(files);
      } else {
        setCollectionFiles([]);
      }
    } catch (err) {
      console.error("Error fetching collection files:", err);
      setCollectionFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const backToResults = () => {
    setShowCollectionFiles(false);
    setSelectedCollection(null);
    setCollectionFiles([]);
  };

  // ✅ IMPROVED: Handle file click with better error handling and logging
  const handleFileClick = (file) => {
    // التحقق من صحة بيانات الملف
    if (!file) {
      console.error("❌ No file data provided");
      setMessage(t("browse.errorNoFileData") || "خطأ: لا توجد بيانات للملف");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    const fileId = file.id || file.eduFileId;
    
    if (!fileId) {
      console.error("❌ File has no ID:", file);
      setMessage(t("browse.errorNoFileId") || "خطأ: الملف لا يحتوي على معرف صالح");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    // تسجيل معلومات الملف للتأكد
    console.log("📁 Opening file in chat:", {
      id: fileId,
      title: file.title,
      type: file.fileType,
      hasDescription: !!file.description,
      courseName: file.courseName,
      categoryName: file.categoryName,
      downloadCount: file.downloadCount,
      uploadedAt: file.uploadedAt,
      uploadedByUserName: file.uploadedByUserName
    });
    
    // تمرير كامل بيانات الملف عبر state
    navigate(`/ai/file/${fileId}`, { 
      state: { 
        file: {
          id: fileId,
          title: file.title,
          fileType: file.fileType,
          description: file.description,
          courseName: file.courseName,
          categoryName: file.categoryName,
          filePath: file.filePath,
          downloadCount: file.downloadCount,
          uploadedAt: file.uploadedAt,
          uploadedByUserName: file.uploadedByUserName,
          uploadedByUserId: file.uploadedByUserId
        }
      } 
    });
  };

  const handleUploaderClick = (userId, userName, e) => {
    e.stopPropagation();
    
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage(t("browse.loginToViewProfile") || "الرجاء تسجيل الدخول أولاً");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    if (userId && userId !== 0) {
      navigate(`/PublicProfile/${userId}`);
    } else {
      setMessage(t("browse.cannotViewProfile") || "لا يمكن عرض الملف الشخصي");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    const icons = { 0: "🎥", 1: "📄", 2: "📝", 3: "🧾", 4: "📌", 5: "📚", 6: "📁" };
    return icons[fileType] || "📄";
  };

  // Get file type text
  const getFileTypeText = (type) => {
    const types = {
      0: t("browse.types.lecture") || "محاضرة",
      1: t("browse.types.slides") || "شرائح",
      2: t("browse.types.summary") || "ملخص",
      3: t("browse.types.exam") || "امتحان",
      4: t("browse.types.assignment") || "واجب",
      5: t("browse.types.book") || "كتاب",
      6: t("browse.types.other") || "أخرى"
    };
    return types[type] || t("browse.types.other") || "أخرى";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="ai-sidebar-container">
      <div className="ai-sidebar-inner">
        {/* Header */}
        <div className="ai-sidebar-header">
          <FaRobot size={32} className="ai-sidebar-header-icon" />
          <h2 className="ai-sidebar-header-title">{t("sidebar.AI Assistant")}</h2>
        </div>

        {/* Search Input */}
        <div className="ai-search-section">
          <div className="ai-search-input-wrapper">
            <FaSearch className="ai-search-icon" />
            <input
              type="text"
              className="ai-search-input"
              placeholder={t("sidebar.searchFiles") || "ابحث عن ملفات أو مجموعات..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchTerm && (
              <button 
                className="ai-clear-search"
                onClick={handleClearSearch}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  fontSize: "16px"
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button className="ai-search-button" onClick={handleSearch}>
            {t("browse.searchButton") || "بحث"}
          </button>
        </div>

        {/* Filters */}
        {showResults && !showCollectionFiles && (
          <div className="ai-filters-section">
            <select className="ai-filter-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">{t("browse.allCategories") || "جميع التصنيفات"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select className="ai-filter-select" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!categoryId}>
              <option value="">{t("browse.courses") || "جميع المساقات"}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>

            <select className="ai-filter-select" value={fileType} onChange={(e) => setFileType(e.target.value)}>
              <option value="">{t("browse.allTypes") || "جميع الأنواع"}</option>
              <option value="0">{t("browse.types.lecture") || "محاضرة"}</option>
              <option value="1">{t("browse.types.slides") || "شرائح"}</option>
              <option value="2">{t("browse.types.summary") || "ملخص"}</option>
              <option value="3">{t("browse.types.exam") || "امتحان"}</option>
              <option value="4">{t("browse.types.assignment") || "واجب"}</option>
              <option value="5">{t("browse.types.book") || "كتاب"}</option>
              <option value="6">{t("browse.types.other") || "أخرى"}</option>
            </select>

            <select className="ai-filter-select" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
              <option value="0">{t("browse.order.mostDownloaded") || "الأكثر تحميلاً"}</option>
              <option value="1">{t("browse.order.newest") || "الأحدث"}</option>
            </select>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`ai-message ${messageType === "error" ? "error" : "success"}`} style={{
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            backgroundColor: messageType === "error" ? "#ffebee" : "#e8f5e9",
            color: messageType === "error" ? "#c62828" : "#2e7d32",
            fontSize: "14px",
            textAlign: "center"
          }}>
            {message}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="ai-loading-state">
            <p>⏳ {t("collection.loadingCollectionFiles") || "جاري التحميل..."}</p>
          </div>
        )}

        {/* Collection Files View */}
        {showCollectionFiles && selectedCollection && (
          <>
            <button className="ai-back-button" onClick={backToResults}>
               {t("browse.backToResults") || "العودة إلى النتائج"}
            </button>
            
            <div className="ai-collection-header">
              <h4 className="ai-collection-header-title">📁 {selectedCollection.name}</h4>
              <p className="ai-collection-header-desc">{selectedCollection.description || t("browse.noDescription")}</p>
            </div>

            <h3 className="ai-subtitle">{t("collection.filesInCollection") || "الملفات في هذه المجموعة"} ({collectionFiles.length})</h3>
            <div className="ai-files-list">
              {collectionFiles.map((file, index) => (
                <div
                  key={file.id || index}
                  className="ai-file-card"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="ai-file-icon">{getFileIcon(file.fileType)}</div>
                  <div className="ai-file-info">
                    <h4 className="ai-file-title">{file.title}</h4>
                    <div className="ai-file-type-badge">
                      <span className="type-badge">{getFileTypeText(file.fileType)}</span>
                    </div>
                    {file.description && (
                      <p className="ai-file-description">{file.description}</p>
                    )}
                    <div className="ai-meta-info">
                      <span className="ai-category-name">📁 {file.categoryName}</span>
                      <span className="ai-course-name">📚 {file.courseName}</span>
                    </div>
                    <div className="ai-file-stats">
                      <span className="ai-download-count"><FaDownload /> {file.downloadCount || 0}</span>
                      <span className="ai-file-date"><FaCalendar /> {formatDate(file.uploadedAt)}</span>
                    </div>
                    {file.uploadedByUserName && (
                      <p 
                        className="ai-uploader-name"
                        onClick={(e) => handleUploaderClick(file.uploadedByUserId, file.uploadedByUserName, e)}
                      >
                        <FaUser /> {file.uploadedByUserName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search Results - Files */}
        {showResults && !showCollectionFiles && files.length > 0 && (
          <>
            <h3 className="ai-subtitle">{t("sidebar.files") || "ملفات"} ({files.length})</h3>
            <div className="ai-files-list">
              {files.map((file, index) => (
                <div
                  key={file.id || index}
                  className="ai-file-card"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="ai-file-icon">{getFileIcon(file.fileType)}</div>
                  <div className="ai-file-info">
                    <h4 className="ai-file-title">{file.title}</h4>
                    <div className="ai-file-type-badge">
                      <span className="type-badge">{getFileTypeText(file.fileType)}</span>
                    </div>
                    {file.description && (
                      <p className="ai-file-description">{file.description}</p>
                    )}
                    <div className="ai-meta-info">
                      <span className="ai-category-name">📁 {file.categoryName}</span>
                      <span className="ai-course-name">📚 {file.courseName}</span>
                    </div>
                    <div className="ai-file-stats">
                      <span className="ai-download-count"><FaDownload /> {file.downloadCount || 0}</span>
                      <span className="ai-file-date"><FaCalendar /> {formatDate(file.uploadedAt)}</span>
                    </div>
                    {file.uploadedByUserName && (
                      <p 
                        className="ai-uploader-name"
                        onClick={(e) => handleUploaderClick(file.uploadedByUserId, file.uploadedByUserName, e)}
                      >
                        <FaUser /> {file.uploadedByUserName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Search Results - Collections */}
        {showResults && !showCollectionFiles && collections.length > 0 && (
          <>
            <h3 className="ai-subtitle">{t("sidebar.collections") || "مجموعات"} ({collections.length})</h3>
            <div className="ai-collections-list">
              {collections.map((collection, index) => (
                <div
                  key={collection.id || index}
                  className="ai-collection-card"
                  onClick={() => openCollection(collection)}
                >
                  <div className="ai-file-icon">📁</div>
                  <div className="ai-collection-info">
                    <h4 className="ai-collection-title">{collection.name}</h4>
                    {collection.description && (
                      <p className="ai-collection-desc">
                        {collection.description.substring(0, 80)}...
                      </p>
                    )}
                    <div className="ai-meta-info">
                      <span className="ai-category-name">📁 {collection.categoryName}</span>
                      <span className="ai-course-name">📚 {collection.courseName}</span>
                    </div>
                    <div className="ai-collection-stats">
                      <span className="ai-files-count">📄 {collection.filesCount || 0} ملف</span>
                    </div>
                    {collection.uploaderName && (
                      <p 
                        className="ai-uploader-name"
                        onClick={(e) => handleUploaderClick(collection.uploaderId || collection.uploadedByUserId, collection.uploaderName, e)}
                      >
                        <FaUser /> {collection.uploaderName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {showResults && !showCollectionFiles && files.length === 0 && collections.length === 0 && !isLoading && (
          <div className="ai-empty-state">
            <p>🔍 {t("browse.noResults") || "لا توجد نتائج"}</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>{t("browse.tryAnotherSearch") || "جرب كلمات بحث أو فلاتر مختلفة"}</p>
          </div>
        )}

        {/* Initial State */}
        {!showResults && (
          <div className="ai-empty-state">
            <p>{t("sidebar.searchPrompt") || "أدخل كلمة بحث أعلاه"}</p>
            <p style={{ fontSize: "12px", marginTop: "8px" }}>{t("sidebar.searchFiles") || "ابحث عن ملفات أو مجموعات"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;