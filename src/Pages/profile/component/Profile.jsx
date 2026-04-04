import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { useTranslation } from "react-i18next";
function Profile() {
   const { t } = useTranslation();
  const BASE_URL = "https://corny-unevacuated-willy.ngrok-free.dev";
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("files");
  const [filter, setFilter] = useState("all");
const [collections, setCollections] = useState([]);
const [passwordError, setPasswordError] = useState("");
const [newEmail, setNewEmail] = useState("");
const [emailSent, setEmailSent] = useState(false);
const [collectionFiles, setCollectionFiles] = useState({}); 
const [newCollectionModal, setNewCollectionModal] = useState(false);
const [newCollectionData, setNewCollectionData] = useState({
  name: "", description: "", categoryId: "", courseName: ""
});
const [categories, setCategories] = useState([]);
const [coursesList, setCoursesList] = useState([]);       // قائمة كل الكورسات المتاحة
const [filteredCourses, setFilteredCourses] = useState([]); // الكورسات المقترحة حسب الكتابة
const [courses, setCourses] = useState([]);
const [selectedCollectionCourse, setSelectedCollectionCourse] = useState("");
  const [userData, setUserData] = useState({
  name: "",
  email: "",
  totalFiles: 0,
  totalDownloads: 0,
  collectionsCount: 0,
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  photo: null,
});
const [isReordering, setIsReordering] = useState(false);
const [draggedFileIndex, setDraggedFileIndex] = useState(null);
const [draggedCollectionId, setDraggedCollectionId] = useState(null);

// بدء السحب
const handleDragStart = (e, collectionId, fileIndex) => {
  if (!collections.find(c => c.id === collectionId)?.isOwner) {
    e.preventDefault();
    return false;
  }
  
  setIsReordering(true);
  setDraggedCollectionId(collectionId);
  setDraggedFileIndex(fileIndex);
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", JSON.stringify({
    collectionId,
    fileIndex
  }));
};

// السحب فوق العنصر
const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};
// إسقاط العنصر
const handleDrop = async (e, targetCollectionId, targetFileIndex) => {
  e.preventDefault();
  e.stopPropagation();
  
  let dragData;
  try {
    dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
  } catch (err) {
    console.error("Invalid drag data", err);
    setIsReordering(false);
    setDraggedCollectionId(null);
    setDraggedFileIndex(null);
    return;
  }
  
  const { collectionId: sourceCollectionId, fileIndex: sourceFileIndex } = dragData;
  
  // نفس المجموعة ونفس المكان -> لا تفعل شيئاً
  if (sourceCollectionId === targetCollectionId && sourceFileIndex === targetFileIndex) {
    setIsReordering(false);
    setDraggedCollectionId(null);
    setDraggedFileIndex(null);
    return;
  }
  
  // إنشاء نسخة جديدة من الملفات
  const newFiles = [...viewFilesList];
  
  // التأكد من صحة المؤشرات
  if (sourceFileIndex < 0 || sourceFileIndex >= newFiles.length ||
      targetFileIndex < 0 || targetFileIndex >= newFiles.length) {
    console.error("Invalid indices", { sourceFileIndex, targetFileIndex, length: newFiles.length });
    setIsReordering(false);
    setDraggedCollectionId(null);
    setDraggedFileIndex(null);
    return;
  }
  
  // نقل الملف من مكانه القديم إلى المكان الجديد
  const [movedFile] = newFiles.splice(sourceFileIndex, 1);
  newFiles.splice(targetFileIndex, 0, movedFile);
  
  // ✅ تحديث الواجهة فوراً (هذا هو المفتاح!)
  setViewFilesList([...newFiles]);
  
  // تحديث collectionFiles أيضاً
  setCollectionFiles(prev => ({ 
    ...prev, 
    [sourceCollectionId]: [...newFiles] 
  }));
  
  // تجهيز البيانات للإرسال إلى الخادم
  const reorderData = {
    collectionId: sourceCollectionId,
    files: newFiles
      .filter(file => file != null && (file.eduFileId || file.id))
      .map((file, idx) => ({
        eduFileId: file.eduFileId || file.id,
        order: idx
      }))
  };
  
  console.log("Sending reorder data:", reorderData);
  
  try {
    await axios.put("/api/v1/Collection/Reorder", reorderData, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log("Reorder successful!");
  } catch (err) {
    console.error("Reorder error:", err);
    alert("Error updating file order. Please try again.");
    
    // ✅ في حالة الخطأ، نعيد تحميل الملفات الأصلية
    try {
      const res = await axios.get(`/api/v1/Collection/GetById/${sourceCollectionId}`);
      if (res.data.succeeded) {
        const originalFiles = res.data.data.files || [];
        setViewFilesList([...originalFiles]);
        setCollectionFiles(prev => ({ ...prev, [sourceCollectionId]: [...originalFiles] }));
      }
    } catch (reloadErr) {
      console.error("Error reloading files:", reloadErr);
    }
  } finally {
    setIsReordering(false);
    setDraggedCollectionId(null);
    setDraggedFileIndex(null);
  }
};
// إنهاء السحب
const handleDragEnd = () => {
  setIsReordering(false);
  setDraggedCollectionId(null);
  setDraggedFileIndex(null);
};
  const [addFilesModalOpen, setAddFilesModalOpen] = useState(false);
const [selectedCollectionId, setSelectedCollectionId] = useState(null);
const [selectedFiles, setSelectedFiles] = useState([]);
const [viewFilesModalOpen, setViewFilesModalOpen] = useState(false);
const [viewFilesList, setViewFilesList] = useState([]);
const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
const [editCollectionModal, setEditCollectionModal] = useState(false);
const [editCollectionData, setEditCollectionData] = useState({
  id: null,
  name: "",
  description: ""
});
  const fetchCategories = async () => {
  try {
    const res = await axios.get("/api/v1/Category/GetList"); 
    if (res.data.succeeded) {
      setCategories(res.data.data);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchCategories();
}, []);
  // 📥 Fetch Files
  const fetchMyFiles = async () => {
    try {
      const res = await axios.get("/Api/EduFile/GetMyFiles");
      if (res.data.succeeded) {
        setFiles(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
const fetchCollectionFiles = async (id) => {
  try {
    const res = await axios.get(`/api/v1/Collection/GetById/${id}`);
    if (res.data.succeeded) {
      setCollectionFiles(prev => ({
        ...prev,
        [id]: res.data.data.files || []
      }));
    }
  } catch (err) {
    console.error(err);
  }
};
  // 📥 Fetch Profile
  const fetchProfile = async () => {
  try {
    const res = await axios.get("Api/Profile/GetMyProfile");
    if (res.data.succeeded) {
      const data = res.data.data;
      setUserData({
        name: data.fullName || "",
        email: data.email || "",
        totalFiles: data.totalFiles || 0,
        totalDownloads: data.totalDownloads || 0,
        collectionsCount: data.collectionsCount || 0,
        // ✅ أضف هاي عشان ما تصير undefined
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        photo: null,
      });

      setFiles(data.files || []);
      const collectionsWithOwner = (data.collections || []).map(c => ({
        ...c,
        isOwner: true
      }));
      setCollections(collectionsWithOwner);
     setProfilePhotoUrl(data.profilePicture ? `${BASE_URL}${data.profilePicture}` : null);
    }
  } catch (err) {
    console.error(err);
  }
};

 useEffect(() => {
  fetchProfile();
}, []);

  // 🔍 Filter
  const filteredFiles = files.filter(file => {
  if (filter === "all") return true;
  if (filter === "approved") return file.status === 1;
  if (filter === "pending") return file.status === 0;
  if (filter === "rejected") return file.status === 2;
});
const approvedFiles = files.filter(
  f =>
    f.status === 1 &&
    f.courseName.toLowerCase() === selectedCollectionCourse.toLowerCase()
);
const fileIcons = {
  0: "🎥", // Lecture
  1: "📚", // Slides
  2: "📌", // Summary
  3: "📝", // Exam
  4: "📄", // Assignment
  5: "📖", // Book
  6: "📁"  // Other
};
const fileTypeNames = {
  0: "Lecture",
  1: "Slides",
  2: "Summary",
  3: "Exam",
  4: "Assignment",
  5: "Book",
  6: "Other"
};
  // 🚀 Publish
  const publishFile = async (id) => {
  try {
    await axios.put(`/Api/EduFile/Publish/${id}`);
    
    // تحديث status محليًا
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === id ? { ...f, status: 1, isPublished: true } : f
      )
    );
  } catch (err) {
    console.error(err);
  }
};
const unpublishFile = async (id) => {
  try {
    await axios.put(`/Api/EduFile/Unpublish/${id}`);
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === id ? { ...f, isPublished: false } : f
      )
    );
  } catch (err) {
    console.error(err);
  }
};

  const fetchCollections = async () => {
    try {
      const res = await axios.get("api/v1/Collection/GetProfileCollections"); // endpoint للـ collections
      if (res.data.succeeded) {
       const collectionsWithOwner = res.data.data.map(c => ({
        ...c,
        isOwner: true
      }));
       setCollections(collectionsWithOwner);
      }
    } catch (err) {
      console.error(err);
    }
  };
// Publish مجموعة
const publishCollection = async (collectionId) => {
  try {
    await axios.put(`/api/v1/Collection/Publish/${collectionId}`); // endpoint publish
    fetchCollections(); // حدث البيانات بعد التغيير
  } catch (err) {
    console.error("Publish error:", err);
  }
};

// Unpublish مجموعة
const unpublishCollection = async (collectionId) => {
  try {
    await axios.put(`/api/v1/Collection/Unpublish/${collectionId}`); // endpoint unpublish
    fetchCollections();
  } catch (err) {
    console.error("Unpublish error:", err);
  }
};
const addFilesToCollection = async (collectionId) => {
  setSelectedCollectionId(collectionId);

  try {
    const res = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
    if (res.data.succeeded) {
      const data = res.data.data;

      // ✅ 1. خزن الملفات الموجودة
      const existingIds = (data.files || []).map(f => f.eduFileId);
      setSelectedFiles(existingIds);

      // ✅ 2. أهم سطر (خزن اسم الكورس)
      setSelectedCollectionCourse(data.courseName);

      // ✅ 3. خزن الملفات
      setCollectionFiles(prev => ({
        ...prev,
        [collectionId]: data.files || []
      }));
    }
  } catch (err) {
    console.error(err);
  }

  setAddFilesModalOpen(true);
};
const deleteCollection = async (collectionId) => {
  if (window.confirm("Are you sure you want to delete this collection?")) {
    try {
      await axios.delete(`/api/v1/Collection/Delete/${collectionId}`);
      fetchCollections(); // تحديث البيانات بعد الحذف
    } catch (err) {
      console.error("Delete error:", err);
    }
  }
};  
const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
const handleAddFilesToCollection = async () => {
  try {
    const existingFiles = collectionFiles[selectedCollectionId] || [];
    const existingIds = existingFiles.map(f => f.eduFileId); // ✅ eduFileId مش id

    const filesToAdd = selectedFiles.filter(id => !existingIds.includes(id));
    const filesToRemove = existingIds.filter(id => !selectedFiles.includes(id));

    for (let fileId of filesToAdd) {
      await axios.post("api/v1/Collection/AddFile", {
        collectionId: selectedCollectionId,
        eduFileId: fileId
      });
    }

    for (let fileId of filesToRemove) {
  await axios.delete("api/v1/Collection/RemoveFile", {
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      collectionId: selectedCollectionId,
      eduFileId: fileId
    }
  });
}

    alert("Collection updated ✅");
    setAddFilesModalOpen(false);
    setSelectedFiles([]);
    fetchCollections();

  } catch (err) {
    console.error(err);
    alert("Error updating collection");
  }
};
const handleCreateCollection = async () => {
 const match = coursesList.find(course =>
  course.name.toLowerCase() === newCollectionData.courseName.toLowerCase()
);

  if (!match) {
    alert("❌ You must select an existing course");
    return;
  }

  try {
    await axios.post("api/v1/Collection/CreateProfile", {
      name: newCollectionData.name,
      description: newCollectionData.description,
      courseId: match.id,  // ← هنا نرسل ID بدل الاسم
    });

    setNewCollectionModal(false);

    await fetchProfile(); 
  } catch (err) {
    console.error(err);
  }
};
  // تحديث البيانات الشخصية (الاسم، الإيميل، الصورة)
const handleUpdateProfile = async () => {
  try {
    const formData = new FormData();
    formData.append("fullName", userData.name);

    if (userData.photo) {
      formData.append("profilePicture", userData.photo);
    }

    if (newEmail && newEmail !== userData.email) {
      formData.append("email", newEmail);
    }

    const res = await axios.put("/Api/Profile/UpdateProfile", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (res.data.succeeded) {
      await fetchProfile(); // ✅ تحديث الصورة فوراً
      if (newEmail && newEmail !== userData.email) {
        setEmailSent(true);
        setNewEmail("");
      } else {
        alert("Profile updated successfully!");
      }
    }
  } catch (error) {
    console.error(error);
    alert("Error updating profile.");
  }
};
// تحديث كلمة المرور
const handleUpdatePassword = async () => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!passwordRegex.test(userData.newPassword)) {
    setPasswordError(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
    return;
  } else {
    setPasswordError("");
  }

  if (userData.newPassword !== userData.confirmPassword) {
    setPasswordError("Passwords do not match!");
    return;
  } else {
    setPasswordError("");
  }

  try {
    await axios.put("Api/Profile/ChangePassword", {
      currentPassword: userData.currentPassword,
      newPassword: userData.newPassword,
      confirmPassword: userData.confirmPassword, // ✅ أضيفي هاد
    });

    alert("Password updated successfully!");
    setUserData({
      ...userData,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error(error);
    // ✅ أظهري الخطأ من الباك إند
    const msg = error.response?.data?.message || "Error updating password.";
    alert(msg);
  }
};
const handleUpdateCollection = async () => {
  try {
    await axios.put("api/v1/Collection/Update", {
      id: editCollectionData.id,
      name: editCollectionData.name,
      description: editCollectionData.description
    });
    setEditCollectionModal(false);
    fetchCollections();
  } catch (err) {
    console.error(err);
    alert("Error updating collection.");
  }
};
// حذف ملف
const deleteFile = async (fileId) => {
  if (window.confirm("Are you sure you want to delete this file?")) {
    try {
      await axios.delete(`/Api/EduFile/StudentDelete/${fileId}`);

      // ❗ مهم: بدل ما تعملي fetch، احذفيه من الواجهة مباشرة
      setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));

    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting file.");
    }
  }
};
const [editFileModalOpen, setEditFileModalOpen] = useState(false);
const [editFileData, setEditFileData] = useState({
  id: null,
  title: "",        // ✅ مش undefined
  categoryId: "",   // ✅ غيّر null لـ ""
  courseInput: "",  // ✅
  fileType: "",     // ✅ غيّر null لـ ""
});
const [showSuggestions, setShowSuggestions] = useState(false);
const [showCollectionSuggestions, setShowCollectionSuggestions] = useState(false);
const [isNewCourse, setIsNewCourse] = useState(false);

const openEditFile = (file) => {
  const matchedCategory = categories.find(cat => cat.name === file.categoryName);
  
  if (matchedCategory) {
    fetchCourses(matchedCategory.id); // ✅ هون بس بتنادي
  }

  setEditFileData({
    id: file.id,
    title: file.title || "",
    description: file.description || "",
    categoryId: matchedCategory ? matchedCategory.id : "",
    courseInput: file.courseName || "",
    fileType: file.fileType ?? "",
  });
  setEditFileModalOpen(true);
};
const handleUpdateFile = async () => {
  // جيبي الـ courseId من الـ coursesList
  const matchedCourse = coursesList.find(c => 
  c.name.toLowerCase() === editFileData.courseInput.toLowerCase()
);

  if (!matchedCourse) {
    alert("Please select a valid course from the list");
    return;
  }

  try {
    const payload = {
      id: editFileData.id,
      title: editFileData.title,
      description: editFileData.description || "",  // ✅ أضيفي هاد
      courseId: matchedCourse.id,                   // ✅ courseId مش courseName
      fileType: Number(editFileData.fileType)
    };

    console.log("Payload:", payload);

    await axios.put("/Api/EduFile/UpdateMyFile", payload);
    alert("File updated successfully!");
    setEditFileModalOpen(false);
    fetchMyFiles();
  } catch (err) {
    console.log("Error response:", err.response?.data);
    alert(err.response?.data?.message || "Error updating file.");
  }
};
const fetchCourses = async (categoryId) => {
  if (!categoryId) return;
  try {
    const res = await axios.get(`/Api/Course/GetList/${categoryId}`);
    console.log("Courses fetched:", res.data.data); // ✅ شوفي شو بيجي
    setCourses(res.data.data);
    setCoursesList(res.data.data);
  } catch (error) {
    console.log(error);
  }
};
const openViewFiles = async (collectionId) => {
  setSelectedCollectionId(collectionId);
  try {
    const res = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
    if (res.data.succeeded) {
      const files = res.data.data.files || [];
      setViewFilesList(files);
      // ✅ خزنهم بالـ collectionFiles كمان
      setCollectionFiles(prev => ({ ...prev, [collectionId]: files }));
      setViewFilesModalOpen(true);
    }
  } catch (err) {
    console.error(err);
  }
};
  return (
    <div className="profile-container">

      {/* 🔵 HEADER */}
     <div className="pp-header">
  <div className="pp-header-bg"></div>

  <div className="pp-header-content">
    <div className="pp-avatar-wrap">
      {profilePhotoUrl ? (
        <img src={profilePhotoUrl} alt={userData.name} className="pp-avatar-img" />
      ) : (
        <div className="pp-avatar-placeholder">
          <span>{userData.name?.charAt(0) || "?"}</span>
        </div>
      )}
    </div>

    <div className="pp-header-info">
      <span className="pp-badge">{t("profile.badge")}
</span>
      <h1 className="pp-name">{userData.name}</h1>
      <p className="pp-email">{userData.email}</p>

      <div className="pp-stats">
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.totalFiles ?? 0}</span>
          <span className="pp-stat-label">{t("profile.filesUploaded")}</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.totalDownloads ?? 0}</span>
          <span className="pp-stat-label">{t("profile.downloads")}</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.collectionsCount ?? 0}</span>
          <span className="pp-stat-label">{t("profile.collectionss")}</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{files.filter(f => f.status === 1).length}</span>
          <span className="pp-stat-label">{t("profile.approved")}</span>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* 🔘 TABS */}
     <div className="tabs">
  <button
    className={activeTab === "files" ? "active-tab" : ""}
    onClick={() => setActiveTab("files")}
  >
{t("profile.tabFiles")}
  </button>

  <button
    className={activeTab === "collections" ? "active-tab" : ""}
    onClick={() => setActiveTab("collections")}
  >
  {t("profile.tabCollections")}
  </button>

  <button
    className={activeTab === "settings" ? "active-tab" : ""}
    onClick={() => setActiveTab("settings")}
  >
    {t("profile.tabSettings")}
  </button>
</div>

      {/* ================= FILES ================= */}
    {activeTab === "files" && (
  <div className="files-table-container">
   <h3>{t("profile.files.title")}</h3>
   <p>{t("profile.files.subtitle")}</p>

    {/* Filters */}
    <div className="filters">
      <button onClick={() => setFilter("all")} className={filter==="all"?"active":""}>{t("profile.files.filterAll")}</button>
      <button onClick={() => setFilter("approved")} className={filter==="approved"?"active":""}>{t("profile.files.filterApproved")}</button>
      <button onClick={() => setFilter("pending")} className={filter==="pending"?"active":""}>{t("profile.files.filterPending")}</button>
      <button onClick={() => setFilter("rejected")} className={filter==="rejected"?"active":""}>{t("profile.files.filterRejected")}</button>
    </div>

    {/* Table */}
    <table className="files-table">
      <thead>
        <tr>
          <th>{t("profile.files.colResource")}</th>
          <th>{t("profile.files.colCourse")}</th>
          <th>{t("profile.files.colStatus")}</th>
          <th>{t("profile.files.colDate")}</th>
          <th>{t("profile.files.colActions")}</th>
        </tr>
      </thead>
      <tbody>
        {filteredFiles.map(file => (
          <tr key={file.id}>
            <td>
              <strong>{file.title}</strong><br />
              <small>{file.description}</small>
            </td>
            <td>{file.courseName}</td>
            <td>
             <span
  className={`status ${
    file.status === 0
      ? "status-pending"
      : file.status === 1
      ? "status-approved"
      : "status-rejected"
  }`}
>
                {file.status === 0 && t("profile.files.statusPending")}
                {file.status === 1 && t("profile.files.statusApproved")}
                {file.status === 2 && t("profile.files.statusRejected")}
              </span>
            </td>
        <td>{new Date(file.uploadedAt).toLocaleDateString("en-GB")}</td>
           <td>
  {file.status === 1 && (
    !file.isPublished ? (
      <button onClick={() => publishFile(file.id)}>{t("profile.files.publish")}</button>
    ) : (
      <button onClick={() => unpublishFile(file.id)}>{t("profile.files.unpublish")}</button>
    )
  )}
  <button onClick={() => deleteFile(file.id)}>🗑️</button>
  <button onClick={() => openEditFile(file)}>{t("profile.files.edit")}</button>
</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
{editFileModalOpen && (
  <div className="modal">
    <div className="modal-content">
      {t("profile.editFile.title")}
      {t("profile.editFile.subtitle")}

      {/* Title */}
      <div className="form-group">
        <label>{t("profile.editFile.titleLabel")}</label>
        <input
          type="text"
          value={editFileData.title}
          onChange={(e) =>
            setEditFileData({ ...editFileData, title: e.target.value })
          }
        />
      </div>

      {/* Category */}
      <div className="form-group">
        <label>{t("profile.editFile.category")}</label>
        <select
          value={editFileData.categoryId || ""}
          onChange={(e) =>
            setEditFileData({ ...editFileData, categoryId: e.target.value })
          }
        >
          <option value="">{t("profile.editFile.selectCategory")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Course */}
      <div className="form-group">
        <label>{t("profile.editFile.course")}</label>
        <input
          type="text"
          value={editFileData.courseInput}
   onChange={(e) => {
  const value = e.target.value;
  setEditFileData({ ...editFileData, courseInput: value });
  setShowSuggestions(true);

  // ✅ بدون normalizeCourseName - فلترة بسيطة
  const filtered = coursesList.filter(c =>
    c.name.toLowerCase().includes(value.toLowerCase())
  );
  setFilteredCourses(filtered);

  const match = coursesList.some(
    (c) => c.name.toLowerCase() === value.toLowerCase()
  );
  setIsNewCourse(!match);
}}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={t("profile.editFile.coursePlaceholder")}
        />
        {showSuggestions && filteredCourses.length > 0 && (
  <div className="suggestions-box">
    {filteredCourses.map((course) => (
      <div
        key={course.id}
        className="suggestion-item"
        onClick={() => {
          setEditFileData({ ...editFileData, courseInput: course.name });
          setFilteredCourses([]);
          setIsNewCourse(false);
          setShowSuggestions(false);
        }}
      >
        {course.name}
      </div>
    ))}
  </div>
)}
        {isNewCourse && editFileData.courseInput && (
          <small>{t("profile.editFile.newCourseHint")}</small>
        )}
      </div>

      {/* File Type */}
      <div className="form-group">
        <label>{t("profile.editFile.fileType")}</label>
        <select
          value={editFileData.fileType || ""}
          onChange={(e) =>
            setEditFileData({ ...editFileData, fileType: e.target.value })
          }
        >
          <option value="">{t("profile.editFile.selectType")}</option>
          <option value="1">{t("profile.editFile.types.lecture")}</option>
          <option value="2">{t("profile.editFile.types.assignment")}</option>
          <option value="3">{t("profile.editFile.types.exam")}</option>
          <option value="4">{t("profile.editFile.types.summary")}</option>
          <option value="5">{t("profile.editFile.types.slides")}</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="btns-row">
        <button onClick={() => setEditFileModalOpen(false)}>{t("profile.editFile.cancel")}</button>
        <button onClick={handleUpdateFile}> {t("profile.editFile.save")}</button>
      </div>
    </div>
  </div>
)}

      {/* ================= COLLECTIONS ================= */}
      {activeTab === "collections" && (
  <div className="collections">
    <div className="collections-header">
      <div className="header-text">
        <h3>{t("profile.collections.title")}</h3>
        <p>{t("profile.collections.subtitle")}</p>
      </div>
      <button className="new-btn" onClick={() => setNewCollectionModal(true)}>
       {t("profile.collections.newBtn")}
      </button>
    </div>

    <div className="collections-grid">
      {collections
       .filter(collection => collection.isOwner === true)
      .map(collection => (
        <div key={collection.id} className="collection-card">
          <div className="collection-card-header">
            <div>
              <h4>{collection.name}</h4>
              <p>{collection.description}</p>
            </div>
            <span className={collection.isPublished ? "badge-published" : "badge-draft"}>
              {collection.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          <div className="collections-meta">
  <span>📁 {collection.filesCount} {t("profile.collections.files")}</span>
  <span>📅 {new Date(collection.createdAt).toLocaleDateString("en-CA")}</span>
  <span>📂 {collection.courseName}</span>
</div>
          <div className="collection-actions">
            <button className="add-files-btn" 
            onClick={() => addFilesToCollection(collection.id)}>{t("profile.collections.addFiles")}
            </button>
              <button className="edit-btn"
    onClick={() => {
      setEditCollectionData({
        id: collection.id,
        name: collection.name,
        description: collection.description
      });
      setEditCollectionModal(true);
    }}>
    {t("profile.collections.edit")}
  </button>
            {!collection.isPublished ? (
              <button className="publish-btn" 
                onClick={() => publishCollection(collection.id)}>
                {t("profile.collections.publish")}
              </button>
            ) : (
              <button className="published-btn" 
                onClick={() => unpublishCollection(collection.id)}>
               {t("profile.collections.publishedBtn")}
              </button>
            )}
            <button className="view-files-btn"
    onClick={() => openViewFiles(collection.id)}>
    {t("profile.collections.viewFiles")}
  </button>

            <button className="trash-btn" 
              onClick={() => deleteCollection(collection.id)}>🗑️</button>
          </div>
        </div>
      ))}
    </div>

    {/* Modal */}
    {newCollectionModal && (
      <div className="modal">
        <div className="modal-content">
          <h3>{t("profile.newCollection.title")}</h3>
          <p>{t("profile.newCollection.subtitle")}</p>

          <div className="form-group">
            <label>{t("profile.newCollection.nameLabel")}</label>
            <input
              type="text"
              placeholder={t("profile.newCollection.namePlaceholder")}
              value={newCollectionData.name}
              onChange={(e) => setNewCollectionData({...newCollectionData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>{t("profile.newCollection.descLabel")} (optional)</label>
            <input
              type="text"
              placeholder={t("profile.newCollection.descPlaceholder")}
              value={newCollectionData.description}
              onChange={(e) => setNewCollectionData({...newCollectionData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t("profile.newCollection.categoryLabel")}</label>
             <select
  value={newCollectionData.categoryId}
  onChange={(e) => {
    const catId = e.target.value;
    setNewCollectionData({ ...newCollectionData, categoryId: catId });
    fetchCourses(catId); // تحديث قائمة الكورسات
  }}
>
                <option value="">{t("profile.newCollection.selectCategory")}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

           <div className="form-group">
  <label>{t("profile.newCollection.courseLabel")}</label>
<input
  type="text"
 placeholder={t("profile.newCollection.coursePlaceholder")}
  value={newCollectionData.courseName}
 onChange={(e) => {
  const value = e.target.value;
  setNewCollectionData({ ...newCollectionData, courseName: value });
  setShowCollectionSuggestions(true);

  // فلترة الكورسات
  const filtered = coursesList.filter(c =>
  c.name.toLowerCase().includes(value.toLowerCase())
);
  setFilteredCourses(filtered);  // خزّن الكورسات المقترحة
}}
  onFocus={() => setShowCollectionSuggestions(true)}
  onBlur={() => setTimeout(() => setShowCollectionSuggestions(false), 200)}
/>
{showCollectionSuggestions && filteredCourses.length > 0 && (
  <div className="suggestions-box">
    {filteredCourses.map(course => (
      <div
        key={course.id}
        className="suggestion-item"
        onClick={() => {
          setNewCollectionData({...newCollectionData, courseName: course.name});
          setShowCollectionSuggestions(false);
          setFilteredCourses([]); // تنظيف القائمة
        }}
      >
        {course.name}
      </div>
    ))}
  </div>
)}
</div> 
</div>
          

          <div className="info-note">
           {t("profile.newCollection.infoNote")}
          </div>

          <div className="btns-row">
            <button onClick={() => setNewCollectionModal(false)}>{t("profile.newCollection.cancel")}</button>
            <button onClick={handleCreateCollection}>{t("profile.newCollection.create")}</button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
{addFilesModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h3>{t("profile.addFiles.title")}</h3>
      <p>{t("profile.addFiles.subtitle")}</p>

      <div className="files-list">
        {approvedFiles.length === 0 ? (
          <p>{t("profile.addFiles.noFiles")}</p>
        ) : (
          approvedFiles.map(file => (
            <div className="file-item-card">
  <input
    type="checkbox"
    checked={selectedFiles.includes(file.id)}
    onChange={() => toggleFileSelection(file.id)}
  />

  <div className="file-info">
    <div className="file-icon">
   {fileIcons[file.fileType] || "📁"}
    </div>

    <div>
      <div className="file-title">{file.title}</div>
      <div className="file-meta">
       {file.courseName}
      </div>
    </div>
  </div>
  <span className={`file-type-badge type-${file.fileType}`}>
    {fileTypeNames[file.fileType]}
  </span>
</div>
          ))
        )}
      </div>

      <div className="btns-row">
        <button onClick={() => setAddFilesModalOpen(false)}>
          {t("profile.addFiles.cancel")}
        </button>
        <button onClick={handleAddFilesToCollection}>
          {t("profile.addFiles.addSelected")}
        </button>
      </div>
    </div>
  </div>
)}
{viewFilesModalOpen && (
  <div className="modal">
    <div className="modal-content files-reorder-modal">
      <h3>{t("profile.viewFiles.title")}</h3>
      <p className="reorder-hint">
        {t("profile.viewFiles.hint")}
      </p>

      <div className="files-list reorderable-list">
        {viewFilesList.length === 0 ? (
          <p>{t("profile.viewFiles.noFiles")}</p>
        ) : (
          viewFilesList.map((file, index) => {
            const isDragging = isReordering && 
                               draggedCollectionId === selectedCollectionId && 
                               draggedFileIndex === index;
            
            return (
              <div
                key={file.eduFileId || file.id}
                className={`file-item-card reorder-item ${isDragging ? 'dragging' : ''}`}
                draggable={collections.find(c => c.id === selectedCollectionId)?.isOwner === true}
                onDragStart={(e) => handleDragStart(e, selectedCollectionId, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, selectedCollectionId, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle */}
                {collections.find(c => c.id === selectedCollectionId)?.isOwner && (
                  <div className="drag-handle" title="Drag to reorder">
                    ⋮⋮
                  </div>
                )}
                
                <div 
                  className="file-info"
                  onClick={() => window.open(`${BASE_URL}${file.filePath}`, "_blank")}
                  style={{ cursor: "pointer", flex: 1 }}
                >
                  <div className="file-icon">
                    {fileIcons[Number(file.fileType)] || "📁"}
                  </div>
                  <div>
                    <div className="file-title">
                      <span className="file-order">{index + 1}.</span> {file.title}
                    </div>
                    <div className="file-meta">{file.courseName}</div>
                  </div>
                </div>

                <span className={`file-type-badge type-${Number(file.fileType)}`}>
                  {fileTypeNames[Number(file.fileType)]}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="btns-row">
        <button onClick={() => setViewFilesModalOpen(false)}>{t("profile.viewFiles.close")}</button>
      </div>
    </div>
  </div>
)}
{editCollectionModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>{t("profile.editCollection.title")}</h3>

      <div className="form-group">
        <label>{t("profile.editCollection.nameLabel")}</label>
        <input
          type="text"
          value={editCollectionData.name}
          onChange={(e) => setEditCollectionData({
            ...editCollectionData, name: e.target.value
          })}
        />
      </div>

      <div className="form-group">
        <label>{t("profile.editCollection.descLabel")}</label>
        <input
          type="text"
          value={editCollectionData.description}
          onChange={(e) => setEditCollectionData({
            ...editCollectionData, description: e.target.value
          })}
        />
      </div>

      <div className="btns-row">
        <button onClick={() => setEditCollectionModal(false)}>{t("profile.editCollection.cancel")}</button>
        <button onClick={handleUpdateCollection}> {t("profile.editCollection.save")}</button>
      </div>
    </div>
  </div>
)}
      {/* ================= SETTINGS ================= */}
     {activeTab === "settings" && (
  <div className="settings-container">

    {/* ===== Edit Profile Section ===== */}
   <div className="card">
  <h3>{t("profile.settings.editTitle")}</h3>
  <p className="sub-text">{t("profile.settings.editSubtitle")}</p>

  {/* تغيير الصورة */}
  <div className="photo-upload-section">
    <div className="photo-preview">
      {profilePhotoUrl ? (
        <img src={profilePhotoUrl} alt="profile" className="profile-photo-preview" />
      ) : (
        <div className="profile-photo-placeholder">
          <span>{userData.name?.charAt(0) || "?"}</span>
        </div>
      )}
    </div>

    <div className="photo-upload-info">
      <label className="change-photo-btn">
       {t("profile.settings.changePhoto")}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setUserData({ ...userData, photo: e.target.files[0] })}
        />
      </label>
      <small> {t("profile.settings.photoHint")}</small>
    </div>
  </div>

      <div className="form-group">
        <label>{t("profile.settings.nicknameLabel")}</label>
        <input
          type="text"
          value={userData.name}
          onChange={(e) =>
            setUserData({ ...userData, name: e.target.value })
          }
        />
      </div>

{/* Current Email - Read Only */}
<div className="form-group">
  <label>{t("profile.settings.emailLabel")}</label>
  <input
    type="email"
    value={newEmail}
    onChange={(e) => {
      setNewEmail(e.target.value);
      setEmailSent(false);
    }}
    placeholder={userData.email}
  />

  {/* ✅ يظهر لما المستخدم يكتب إيميل جديد */}
  {newEmail && !emailSent && (
    <small className="email-hint">
     {t("profile.settings.emailChangeHint")}
    </small>
  )}

  {/* ✅ يظهر بعد ما يتبعت الطلب */}
  {emailSent && (
    <small className="email-hint" style={{ color: "green" }}>
      {t("profile.settings.emailSentMsg")}
    </small>
  )}
</div>
      <div className="btns-row">
        <button className="cancel-btns">{t("profile.settings.cancel")}</button>
        <button className="save-btns" onClick={handleUpdateProfile}>
         {t("profile.settings.saveChanges")}
        </button>
      </div>
    </div>

    {/* ===== Change Password Section ===== */}
    <div className="card">
      <h3>{t("profile.settings.passwordTitle")}</h3>
      <p className="sub-text">{t("profile.settings.passwordSubtitle")}</p>

      <div className="form-group">
        <label>{t("profile.settings.currentPassword")}</label>
        <input
          type="password"
          value={userData.currentPassword}
          onChange={(e) =>
            setUserData({
              ...userData,
              currentPassword: e.target.value,
            })
          }
        />
      </div>

      <div className="form-group">
        <label>{t("profile.settings.newPassword")}</label>
        <input
          type="password"
         
          value={userData.newPassword}
          onChange={(e) =>
            setUserData({
              ...userData,
              newPassword: e.target.value,
            })
          }
        /> 
        {!userData.newPassword && (
  <small className="hint">
   {t("profile.settings.passwordHint")}
  </small>
)}
         {passwordError && <p className="error-text">{passwordError}</p>}
      </div>

      <div className="form-group">
        <label>{t("profile.settings.confirmPassword")}</label>
        <input
          type="password"
          value={userData.confirmPassword}
          onChange={(e) =>
            setUserData({
              ...userData,
              confirmPassword: e.target.value,
            })
          }
        />
      </div>

      <div className="btns-row">
        <button className="cancel-btns">{t("profile.settings.cancel")}</button>
        <button className="save-btns" onClick={handleUpdatePassword}>
        {t("profile.settings.updatePassword")}
        </button>
      </div>
    </div>

  </div>
)}

    </div>
  );
}

export default Profile;