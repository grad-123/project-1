import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
function Profile() {
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
  try {
    const res = await axios.get(`/api/v1/Collection/GetById/${collectionId}`);
    if (res.data.succeeded) {
      setViewFilesList(res.data.data.files || []);
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
      <span className="pp-badge">✦ ACADEMIC DASHBOARD</span>
      <h1 className="pp-name">{userData.name}</h1>
      <p className="pp-email">{userData.email}</p>

      <div className="pp-stats">
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.totalFiles ?? 0}</span>
          <span className="pp-stat-label">Files Uploaded</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.totalDownloads ?? 0}</span>
          <span className="pp-stat-label">Downloads</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{userData.collectionsCount ?? 0}</span>
          <span className="pp-stat-label">Collections</span>
        </div>
        <div className="pp-stat-divider"></div>
        <div className="pp-stat">
          <span className="pp-stat-num">{files.filter(f => f.status === 1).length}</span>
          <span className="pp-stat-label">Approved</span>
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
   📁 My Files
  </button>

  <button
    className={activeTab === "collections" ? "active-tab" : ""}
    onClick={() => setActiveTab("collections")}
  >
   📚 Collections
  </button>

  <button
    className={activeTab === "settings" ? "active-tab" : ""}
    onClick={() => setActiveTab("settings")}
  >
    ⚙ Settings
  </button>
</div>

      {/* ================= FILES ================= */}
    {activeTab === "files" && (
  <div className="files-table-container">
    <h3>My Files</h3>
    <p>Manage and publish your uploaded content</p>

    {/* Filters */}
    <div className="filters">
      <button onClick={() => setFilter("all")} className={filter==="all"?"active":""}>All</button>
      <button onClick={() => setFilter("approved")} className={filter==="approved"?"active":""}>Approved</button>
      <button onClick={() => setFilter("pending")} className={filter==="pending"?"active":""}>Pending</button>
      <button onClick={() => setFilter("rejected")} className={filter==="rejected"?"active":""}>Rejected</button>
    </div>

    {/* Table */}
    <table className="files-table">
      <thead>
        <tr>
          <th>Resource</th>
          <th>Course</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
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
                {file.status === 0 && "Pending"}
                {file.status === 1 && "Approved"}
                {file.status === 2 && "Rejected"}
              </span>
            </td>
        <td>{new Date(file.uploadedAt).toLocaleDateString("en-GB")}</td>
           <td>
  {file.status === 1 && (
    !file.isPublished ? (
      <button onClick={() => publishFile(file.id)}>Publish</button>
    ) : (
      <button onClick={() => unpublishFile(file.id)}>Unpublish</button>
    )
  )}
  <button onClick={() => deleteFile(file.id)}>🗑️</button>
  <button onClick={() => openEditFile(file)}>✏️ Edit</button>
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
      <h3>Edit File</h3>
      <p>Update file information</p>

      {/* Title */}
      <div className="form-group">
        <label>Title</label>
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
        <label>Category</label>
        <select
          value={editFileData.categoryId || ""}
          onChange={(e) =>
            setEditFileData({ ...editFileData, categoryId: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Course */}
      <div className="form-group">
        <label>Course</label>
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
          placeholder="Enter course name"
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
          <small>This course does not exist. It will be added automatically.</small>
        )}
      </div>

      {/* File Type */}
      <div className="form-group">
        <label>File Type</label>
        <select
          value={editFileData.fileType || ""}
          onChange={(e) =>
            setEditFileData({ ...editFileData, fileType: e.target.value })
          }
        >
          <option value="">Select Type</option>
          <option value="1">Lecture</option>
          <option value="2">Assignment</option>
          <option value="3">Exam</option>
          <option value="4">Summary</option>
          <option value="5">Slides</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="btns-row">
        <button onClick={() => setEditFileModalOpen(false)}>Cancel</button>
        <button onClick={handleUpdateFile}>Save Changes</button>
      </div>
    </div>
  </div>
)}

      {/* ================= COLLECTIONS ================= */}
      {activeTab === "collections" && (
  <div className="collections">
    <div className="collections-header">
      <div className="header-text">
        <h3>My Collections</h3>
        <p>Organize and publish your study sets to Browse</p>
      </div>
      <button className="new-btn" onClick={() => setNewCollectionModal(true)}>
        + New Collection
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
  <span>📁 {collection.filesCount} files</span>
  <span>📅 {new Date(collection.createdAt).toLocaleDateString("en-CA")}</span>
  <span>📂 {collection.courseName}</span>
</div>
          <div className="collection-actions">
            <button className="add-files-btn" 
            onClick={() => addFilesToCollection(collection.id)}>+ Add Files
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
    ✏️ Edit
  </button>
            {!collection.isPublished ? (
              <button className="publish-btn" 
                onClick={() => publishCollection(collection.id)}>
                🌐 Publish
              </button>
            ) : (
              <button className="published-btn" 
                onClick={() => unpublishCollection(collection.id)}>
                Published ✓
              </button>
            )}
            <button className="view-files-btn"
    onClick={() => openViewFiles(collection.id)}>
    👁️ View Files
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
          <h3>Create New Collection</h3>
          <p>This collection will be linked to a specific course and can be published to Browse</p>

          <div className="form-group">
            <label>Collection Name</label>
            <input
              type="text"
              placeholder="e.g. Data Structures – Dr. Anas"
              value={newCollectionData.name}
              onChange={(e) => setNewCollectionData({...newCollectionData, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              placeholder="Brief description..."
              value={newCollectionData.description}
              onChange={(e) => setNewCollectionData({...newCollectionData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
             <select
  value={newCollectionData.categoryId}
  onChange={(e) => {
    const catId = e.target.value;
    setNewCollectionData({ ...newCollectionData, categoryId: catId });
    fetchCourses(catId); // تحديث قائمة الكورسات
  }}
>
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

           <div className="form-group">
  <label>Course</label>
<input
  type="text"
  placeholder="e.g. Data Structures"
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
            ℹ️ Files added to this collection must belong to the selected course
          </div>

          <div className="btns-row">
            <button onClick={() => setNewCollectionModal(false)}>Cancel</button>
            <button onClick={handleCreateCollection}>Create Collection</button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
{addFilesModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h3>Add Files to Collection</h3>
      <p>Select approved files</p>

      <div className="files-list">
        {approvedFiles.length === 0 ? (
          <p>No approved files</p>
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
          Cancel
        </button>
        <button onClick={handleAddFilesToCollection}>
          Add Selected
        </button>
      </div>
    </div>
  </div>
)}
{viewFilesModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h3>Collection Files</h3>
      <p>Files in this collection</p>

      <div className="files-list">
        {viewFilesList.length === 0 ? (
          <p>No files in this collection</p>
        ) : (
          viewFilesList.map(file => (
            <div
              key={file.eduFileId}
              className="file-item-card"
              style={{ cursor: "pointer" }}
              onClick={() => window.open(`${BASE_URL}${file.filePath}`, "_blank")}
            >
              <div className="file-info">
                <div className="file-icon">
                  {fileIcons[Number(file.fileType)] || "📁"}
                </div>
                <div>
                  <div className="file-title">{file.title}</div>
                  <div className="file-meta">{file.courseName}</div>
                </div>
              </div>

              <span className={`file-type-badge type-${Number(file.fileType)}`}>
                {fileTypeNames[Number(file.fileType)]}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="btns-row">
        <button onClick={() => setViewFilesModalOpen(false)}>Close</button>
      </div>
    </div>
  </div>
)}
{editCollectionModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Edit Collection</h3>

      <div className="form-group">
        <label>Collection Name</label>
        <input
          type="text"
          value={editCollectionData.name}
          onChange={(e) => setEditCollectionData({
            ...editCollectionData, name: e.target.value
          })}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={editCollectionData.description}
          onChange={(e) => setEditCollectionData({
            ...editCollectionData, description: e.target.value
          })}
        />
      </div>

      <div className="btns-row">
        <button onClick={() => setEditCollectionModal(false)}>Cancel</button>
        <button onClick={handleUpdateCollection}>Save Changes</button>
      </div>
    </div>
  </div>
)}
      {/* ================= SETTINGS ================= */}
     {activeTab === "settings" && (
  <div className="settings-container">

    {/* ===== Edit Profile Section ===== */}
   <div className="card">
  <h3>Edit Profile</h3>
  <p className="sub-text">Update your personal information</p>

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
        📷 Change Photo
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setUserData({ ...userData, photo: e.target.files[0] })}
        />
      </label>
      <small>JPG, PNG or WebP · Max 5MB</small>
    </div>
  </div>

      <div className="form-group">
        <label>Full Name</label>
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
  <label>Email Address</label>
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
      ⚠️ A confirmation link will be sent to your current email
    </small>
  )}

  {/* ✅ يظهر بعد ما يتبعت الطلب */}
  {emailSent && (
    <small className="email-hint" style={{ color: "green" }}>
      ✅ Confirmation link sent! Check your current email to confirm the change.
    </small>
  )}
</div>
      <div className="btns-row">
        <button className="cancel-btns">Cancel</button>
        <button className="save-btns" onClick={handleUpdateProfile}>
          Save Changes
        </button>
      </div>
    </div>

    {/* ===== Change Password Section ===== */}
    <div className="card">
      <h3>Change Password</h3>
      <p className="sub-text">Keep your account secure</p>

      <div className="form-group">
        <label>Current Password</label>
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
        <label>New Password</label>
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
    At least 8 characters, uppercase, lowercase, number & special character
  </small>
)}
         {passwordError && <p className="error-text">{passwordError}</p>}
      </div>

      <div className="form-group">
        <label>Confirm New Password</label>
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
        <button className="cancel-btns">Cancel</button>
        <button className="save-btns" onClick={handleUpdatePassword}>
          Update Password
        </button>
      </div>
    </div>

  </div>
)}

    </div>
  );
}

export default Profile;