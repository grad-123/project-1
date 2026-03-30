import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
function Profile() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("files");
  const [filter, setFilter] = useState("all");
const [collections, setCollections] = useState([]);
const [passwordError, setPasswordError] = useState("");
const [confirmError, setConfirmError] = useState("");
const [collectionFiles, setCollectionFiles] = useState({}); 
const [newCollectionModal, setNewCollectionModal] = useState(false);
const [newCollectionData, setNewCollectionData] = useState({
  name: "", description: "", categoryId: "", courseName: ""
});
const [categories, setCategories] = useState([]);
const [coursesList, setCoursesList] = useState([]);       // قائمة كل الكورسات المتاحة
const [filteredCourses, setFilteredCourses] = useState([]); // الكورسات المقترحة حسب الكتابة
const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: ""
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
const normalizeCourseName = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")        // حذف المسافات الزايدة
    .replace(/s$/, "");          // حذف s من النهاية (Structures → Structure)
};
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
    name: data.fullName,
    email: data.email,
  });

  setFiles(data.files || []);
  setCollections(data.collections || []);
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
        setCollections(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };
// Publish مجموعة
const publishCollection = async (collectionId) => {
  try {
    await axios.put(`/Api/Collection/Publish/${collectionId}`); // endpoint publish
    fetchCollections(); // حدث البيانات بعد التغيير
  } catch (err) {
    console.error("Publish error:", err);
  }
};

// Unpublish مجموعة
const unpublishCollection = async (collectionId) => {
  try {
    await axios.put(`/Api/Collection/Unpublish/${collectionId}`); // endpoint unpublish
    fetchCollections();
  } catch (err) {
    console.error("Unpublish error:", err);
  }
};
const addFilesToCollection = (collectionId) => {
  navigate(`/add-files/${collectionId}`); 
  // أو افتحي Modal لإضافة الملفات مباشرة
};
const deleteCollection = async (collectionId) => {
  if (window.confirm("Are you sure you want to delete this collection?")) {
    try {
      await axios.delete(`/Api/Collection/Delete/${collectionId}`);
      fetchCollections(); // تحديث البيانات بعد الحذف
    } catch (err) {
      console.error("Delete error:", err);
    }
  }
};  
const handleCreateCollection = async () => {
  const normalizedInput = normalizeCourseName(newCollectionData.courseName);
  const match = coursesList.find(course =>
    normalizeCourseName(course.name) === normalizedInput
  );
  if (!match) {
    alert("❌ You must select an existing course");
    return;
  }
  try {
    await axios.post("api/v1/Collection/CreateProfile", {
      name: newCollectionData.name,
      description: newCollectionData.description,
      categoryId: newCollectionData.categoryId,
      courseName: match.name, // نضمن الصح
    });
    setNewCollectionModal(false);
    fetchCollections();
  } catch (err) {
    console.error(err);
  }
};
  // تحديث البيانات الشخصية (الاسم، الإيميل، الصورة)
const handleUpdateProfile = async () => {
  try {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    if (userData.photo) {
      formData.append("photo", userData.photo);
    }

    // مثال لإرسال البيانات للباك إند
   await axios.put("/Api/Profile/UpdateProfile", {
  fullName: userData.name,
  email: userData.email,
});

    alert("Profile updated successfully!");
  } catch (error) {
    console.error(error);
    alert("Error updating profile.");
  }
};

// تحديث كلمة المرور
const handleUpdatePassword = async () => {
  // Regex تحقق الباسورد: 8 أحرف، حرف كبير، حرف صغير، رقم، ورمز خاص
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

  if (!passwordRegex.test(userData.newPassword)) {
    setPasswordError(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
    setConfirmError("");
    return;
  }
   else {
    setPasswordError("");
  }

  if (userData.newPassword !== userData.confirmPassword) {
    setPasswordError("Passwords do not match!");
    return;
  }
else {
    setConfirmError("");
  }

  try {
    // مثال إرسال البيانات للباك إند
    const response = await axios.put("Api/Profile/ChangePassword", {
      currentPassword: userData.currentPassword,
      newPassword: userData.newPassword,
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
    alert("Error updating password.");
  }
};
// حذف ملف
const deleteFile = async (fileId) => {
  if (window.confirm("Are you sure you want to delete this file?")) {
    try {
      await axios.delete(`/Api/EduFile/Delete/${fileId}`);
      fetchMyFiles(); // حدث البيانات بعد الحذف
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting file.");
    }
  }
};
const [editFileModalOpen, setEditFileModalOpen] = useState(false);
const [editFileData, setEditFileData] = useState({
  id: null,
  title: "",
  categoryId: null,
  courseInput: "",
  fileType: null
});
const [showSuggestions, setShowSuggestions] = useState(false);
const [showCollectionSuggestions, setShowCollectionSuggestions] = useState(false);
const [isNewCourse, setIsNewCourse] = useState(false);

const openEditFile = (file) => {
  setEditFileData({
    id: file.id,
    title: file.title,
    categoryId: file.categoryId || null,
    courseInput: file.courseName,
    fileType: file.fileType
  });
  setEditFileModalOpen(true);
};
const handleUpdateFile = async () => {
  try {
    const payload = {
      id: editFileData.id,
      title: editFileData.title,
      categoryId: editFileData.categoryId,
      courseName: editFileData.courseInput,
      fileType: editFileData.fileType
    };

    await axios.put("/Api/EduFile/UpdateMyFile", payload);

    alert("File updated successfully!");
    setEditFileModalOpen(false);
    fetchMyFiles(); // لتحديث الجدول
  } catch (err) {
    console.error(err);
    alert("Error updating file.");
  }
};
const fetchCourses = async (categoryId) => {
  if (!categoryId) return; // لو ما في كاتيجوري، ما تعمل request
  try {
    const res = await axios.get(`/Api/Course/GetList/${categoryId}`);
    setCourses(res.data.data);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchCourses();
}, []);
  return (
    <div className="profile-container">

      {/* 🔵 HEADER */}
      <div className="profile-header">
        <h2>{userData.name || "Student Name"}</h2>
        <p>{userData.email}</p>

        <div className="stats">
          <div>
            <h3>{files.length}</h3>
            <p>Files Uploaded</p>
          </div>

          <div>
            <h3>{files.filter(f => f.isPublished).length}</h3>
            <p>Published</p>
          </div>

          <div>
            <h3>{files.filter(f => f.status === 1).length}</h3>
            <p>Approved</p>
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
              {!file.isPublished ? (
                <button onClick={() => publishFile(file.id)}>Publish</button>
              ) : (
                <button onClick={() => unpublishFile(file.id)}>Unpublish</button>
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

  // فلترة الكورسات
  const filtered = coursesList.filter(c =>
    normalizeCourseName(c.name).includes(normalizeCourseName(value))
  );
  setFilteredCourses(filtered);

  const match = coursesList.some(
   (c) => normalizeCourseName(c.name) === normalizeCourseName(value)
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

          <div className="collection-meta">
            <span>📁 {collection.filesCount} files</span>
            <span>📅 {new Date(collection.createdAt).toLocaleDateString("en-CA")}</span>
            <span>📂 {collection.courseName}</span>
          </div>

          <div className="collection-actions">
            <button className="add-files-btn" 
              onClick={() => addFilesToCollection(collection.id)}>
              + Add Files
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
                onChange={(e) => setNewCollectionData({...newCollectionData, categoryId: e.target.value})}
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
    normalizeCourseName(c.name).includes(normalizeCourseName(value))
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

      {/* ================= SETTINGS ================= */}
     {activeTab === "settings" && (
  <div className="settings-container">

    {/* ===== Edit Profile Section ===== */}
    <div className="card">
      <h3>Edit Profile</h3>
      <p className="sub-text">Update your personal information</p>

      {/* تغيير الصورة */}
      <div className="form-group">
        <label>Profile Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setUserData({ ...userData, photo: e.target.files[0] })
          }
        />
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

      <div className="form-group">
        <label>Email Address</label>
        <input
          type="email"
          value={userData.email}
          onChange={(e) =>
            setUserData({ ...userData, email: e.target.value })
          }
        />
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