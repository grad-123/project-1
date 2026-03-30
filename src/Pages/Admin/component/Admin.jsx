import React, { useState, useEffect } from "react";
import "./Admin.css";
import { useTranslation } from "react-i18next";
import Courses from './../../Courses/component/Courses';
import { FaUserCircle } from "react-icons/fa";
import axios from "../../../api/axiosInstance";
import { jwtDecode } from "jwt-decode";
function Sidebar({ activeSection, setActiveSection, currentUser }) {
  const { t } = useTranslation();
console.log(currentUser);
  return (
    <div className="sidebar">
      <h2>EDUPRO</h2>
      <p>{t("admin.panel")}</p>

<button
  className={activeSection === "dashboard" ? "active" : ""}
  onClick={() => setActiveSection("dashboard")}
>
{t("admin.dashboard.title")}
</button>

      {(currentUser?.permissions?.ManageFiles || currentUser?.permissions?.SuperAdmin) && (
        <button
          className={activeSection === "files" ? "active" : ""}
          onClick={() => setActiveSection("files")}
        >
          {t("admin.sidebar.files")}
        </button>
      )}

      {(currentUser?.permissions?.ManageCategories || currentUser?.permissions?.SuperAdmin)&& (
        <button
          className={activeSection === "categories" ? "active" : ""}
          onClick={() => setActiveSection("categories")}
        >
          {t("admin.sidebar.categories")}
        </button>
      )}

      {(currentUser?.permissions?.ManageCourses || currentUser?.permissions?.SuperAdmin) && (
        <button
          className={activeSection === "courses" ? "active" : ""}
          onClick={() => setActiveSection("courses")}
        >
          {t("admin.sidebar.courses")}
        </button>
      )}

      {(currentUser?.permissions?.ManageUsers || currentUser?.permissions?.SuperAdmin) && (
        <button
          className={activeSection === "users" ? "active" : ""}
          onClick={() => setActiveSection("users")}
        >
          {t("admin.sidebar.users")}
        </button>
      )}
    </div>
  );
}

function Admin() {
  const { t } = useTranslation();
  const serverUrl = "https://corny-unevacuated-willy.ngrok-free.dev";
  const [activeTab, setActiveTab] = useState("Pending");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [files, setFiles] = useState([ ]);

  const [categories, setCategories] = useState([ ]);
const [stats, setStats] = useState(null);
  
  const [courses, setCourses] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [updatedNameCategory, setUpdatedNameCategory] = useState("");
  const [updatedCategoryDesc, setUpdatedCategoryDesc] = useState("");

  const [newCourse, setNewCourse] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("");
  const [editCourse, setEditCourse] = useState(null);
  const [updatedCourseName, setUpdatedCourseName] = useState("");
  const [updatedCourseDesc, setUpdatedCourseDesc] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [allCourses, setAllCourses] = useState([]);

  const statusMap = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected"
};
const token = localStorage.getItem("token");

let currentUser = { permissions: {} };

if (token) {
  const decoded = jwtDecode(token);
 console.log("Decoded token:", decoded);

  currentUser = {
  permissions: {
    ManageCategories: decoded.ManageCategories?.toLowerCase() === "true",
    ManageCourses: decoded.ManageCourses?.toLowerCase() === "true",
    ManageFiles: decoded.ManageFiles?.toLowerCase() === "true",
    ManageUsers: decoded.ManageUsers?.toLowerCase() === "true",
    SuperAdmin: decoded.SuperAdmin?.toLowerCase() === "true",
  }
};
}
  const fetchFiles = async () => {
  if (!statusMap[activeTab]) return; 
  try {
    const response = await axios.get(`/Api/EduFile/GetList/${statusMap[activeTab]}`);
    console.log(response.data);
    if (response.data.succeeded) {
      setFiles(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching files:", error);
  }
};
const fetchStats = async () => {
  try {
    const res = await axios.get("/api/v1/Stats/GetAdminStats");

    if (res.data.succeeded) {
      setStats(res.data.data);
    }

  } catch (error) {
    console.error("Stats error:", error);
  }
};
useEffect(() => {
  fetchFiles();
}, [activeTab]);
const approveFile = async (id) => {
  try {
    await axios.put(`/Api/EduFile/Approve/${id}`);
    fetchFiles();
  } catch (error) {
    console.error("Approve file error:", error);
  }
};

const rejectFile = async (id) => {
  try {
    await axios.put(`/Api/EduFile/Reject/${id}`);
    fetchFiles();
  } catch (error) {
    console.error("Reject file error:", error);
  }
};
const fetchAllCourses = async () => {
  try {
    const allResults = await Promise.all(
      categories.map(cat => axios.get(`/Api/Course/GetList/${cat.id}`))
    );
    const merged = allResults.flatMap(res => 
      res.data.succeeded ? res.data.data : []
    );
    setAllCourses(merged);
  } catch (error) {
    console.error("Error fetching all courses:", error);
  }
};

useEffect(() => {
  if (categories.length > 0) fetchAllCourses();
}, [categories]);

  const fetchCategories = async () => {
  try {
    const response = await axios.get("/api/v1/Category/GetList");

    if (response.data.succeeded) {
      setCategories(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};
const fetchCourses = async () => {
  if (!selectedCategory) return; 
  try {
    const response = await axios.get(`/Api/Course/GetList/${selectedCategory}`);
    if (response.data.succeeded) {
      setCourses(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching courses:", error.response?.data || error);
  }
};
 
 useEffect(() => {
  if (selectedCategory) fetchCourses();
}, [selectedCategory]);
  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axios.post("/api/v1/Category/Create", {
        name: newCategory,
        description: newCategoryDesc,
      });

      if (response.data.succeeded) {
        fetchCategories(); 
        setNewCategory("");
        setNewCategoryDesc("");
      }
    } catch (error) {
      console.error("Add Category Error:", error);
    }
  };

  const updateCategory = async (id) => {
  try {
    const response = await axios.put("/api/v1/Category/Update", {
      id:id, 
      name: updatedNameCategory,
      description: updatedCategoryDesc,
    });

    if (response.data.succeeded) {
      fetchCategories(); 
      setEditCategory(null); 
      setUpdatedNameCategory("");
      setUpdatedCategoryDesc("");
    }
  } catch (error) {
    console.error("Update Category Error:", error);
  }
};
 const deleteCategory = async (id) => {
  try {

    const response = await axios.delete(`/api/v1/Category/Delete/${id}`);

    if (response.data.succeeded) {
      fetchCategories();
    }

  } catch (error) {
    console.error("Delete Category Error:", error);
  }
};
const addCourse = async () => {
  if (!newCourse.trim() || !selectedCategory) return;

  try {
    const response = await axios.post("/Api/Course/Create", {
      name: newCourse,
      description: newCourseDesc,
      categoryId: selectedCategory,
      eduFileId: selectedFileId
    });

    if (response.data.succeeded) {
      
      // 🔥 اعملي approve للملف
      if (selectedFileId) {
        await axios.put(`/Api/EduFile/Approve/${selectedFileId}`);
      }

      // تحديث
      fetchFiles();
      fetchCourses();

      // تنظيف
      setNewCourse("");
      setNewCourseDesc("");
      setSelectedCategory("");
      setSelectedFileId(null);
    }

  } catch (error) {
    console.error("Add Course Error:", error);
  }
};
const updateCourse = async (courseId) => {
  try {
    const categoryId =
      selectedCategory || courses.find(c => c.id === courseId).categoryId;

    const payload = {
      id: courseId,
      name: updatedCourseName,
      description: updatedCourseDesc,
      categoryId: categoryId
    };

    const response = await axios.put("/Api/Course/Update", payload);

    if (response.data.succeeded) {
      fetchCourses(); 
      setEditCourse(null);
      setUpdatedCourseName("");
      setUpdatedCourseDesc("");
      setSelectedCategory("");
    }
  } catch (error) {
    console.error("Update Course Error:", error.response?.data || error);
  }
};
  const deleteCourse = async (id) => {
  try {
    const response = await axios.delete(`/Api/Course/Delete/${id}`);
    if (response.data.succeeded) {
      setCourses(courses.filter(course => course.id !== id));
    }
  } catch (error) {
    console.error("Delete Course Error:", error.response?.data || error);
  }
};
const fetchUsers = async () => {
  try {

    const url = searchUser
      ? `/Api/Authorization/GetUsersList?keyword=${searchUser}`
      : `/Api/Authorization/GetUsersList`;

    const response = await axios.get(url);

   console.log("Users Response:", response.data);
console.log("Users Data:", response.data.data);

    if (response.data.succeeded) {
      setUsers(response.data.data);
    }

  } catch (error) {
    console.error("Error fetching users:", error);
  }
};
const loadUserData = async (user) => {
  try {
    const rolesRes = await axios.get(`/Api/Authorization/ManageUserRoles/${user.id}`);
    const claimsRes = await axios.get(`/Api/Authorization/ManageUserClaims/${user.id}`);

    const rolesArray = rolesRes.data.data.userRoles
      .filter(r => r.hasRole)
      .map(r => r.name);

    const claimsArray = claimsRes.data.data.userClaims || [];

    const permissionsObject = {};
    claimsArray.forEach(claim => {
      permissionsObject[claim.type] = claim.value;
    });

    setSelectedUser({
      ...user,
      roles: rolesArray,
      permissions: permissionsObject
    });

  } catch (error) {
    console.error("Error loading user roles/claims", error);
  }
};
const updateClaims = async () => {
  try {
    const claimsArray = Object.keys(selectedUser.permissions).map(key => ({
      type: key,
      value: selectedUser.permissions[key]
    }));

    await axios.put("/Api/Authorization/UpdateUserClaims", {
      userId: selectedUser.id,
      userClaims: claimsArray
    });

  } catch (error) {
    console.error("Update claims error:", error);
  }
};
useEffect(() => {
  fetchUsers();
}, [searchUser]);

useEffect(() => {
  fetchCategories();
}, []);
useEffect(() => {
  fetchStats();
}, []);
const banUser = async (id) => {
  try {
    await axios.put(`/Api/Authorization/BanUser/${id}`);

    setBannedUsers((prev) => [...prev, id]);

    fetchUsers();
  } catch (error) {
    console.error("Ban user error:", error);
  }
};

const unbanUser = async (id) => {
  try {
    await axios.put(`/Api/Authorization/UnbanUser/${id}`);

    setBannedUsers((prev) => prev.filter((userId) => userId !== id));

    fetchUsers();
  } catch (error) {
    console.error("Unban user error:", error);
  }
};
 const filteredUsers = users.filter(
  (user) =>
    user.fullName?.toLowerCase().includes(searchUser?.toLowerCase() || "")
);
  const handlePermissionChange = (key) => {
  setSelectedUser((prev) => ({
    ...prev,
    permissions: {
      ...prev.permissions,
      [key]: !prev.permissions[key], 
    },
  }));
};

  const updateRoles = async () => {
  try {
    const userRoles = selectedUser.roles.map((roleName, index) => ({
      id: 0, 
      name: roleName,
      hasRole: true
    }));

    await axios.put("/Api/Authorization/UpdateUserRoles", {
      userId: selectedUser.id,
      userRoles: userRoles
    });

  } catch (error) {
    console.error("Update roles error:", error.response?.data || error);
  }
};
  const deleteFile = async (id) => {
  try {
    await axios.delete(`/Api/EduFile/Delete/${id}`);

    setFiles(files.filter((file) => file.id !== id));
  } catch (error) {
    console.error("Delete file error:", error);
  }
};
const handleReviewNow = () => {
  setActiveSection("files");
}

const filterFiles = files.filter((file) => {
  const statusMapReverse = {
    Pending: 0,
    Approved: 1,
    Rejected: 2
  };
  
  return file.status === statusMapReverse[activeTab];
});
 

  return (
    <div className="admin-container">
      <Sidebar
  activeSection={activeSection}
  setActiveSection={setActiveSection}
  currentUser={currentUser }
/>

      <div className="admin-content">
        <div className="admin-inner">
          {activeSection === "dashboard" && stats && (

<div className="dashboard">
<h2>{t("admin.dashboard.title")}</h2>
<p>{t("admin.dashboard.overview")}</p>
<div className="stats-container">
   {(currentUser?.permissions?.ManageFiles || currentUser?.permissions?.SuperAdmin) && (
<>
<div className="stat-card pending">
   <div className="stat-icon">⏳</div>
   <div>
<h3>{stats.pendingFilesCount}</h3>
<p>{t("admin.dashboard.pendingFiles")}</p>
</div>
</div>

<div className="stat-card approved">
   <div className="stat-icon">✅</div>
   <div>
<h3>{stats.approvedFilesCount}</h3>
<p>{t("admin.dashboard.approvedFiles")}</p>
</div>
</div>
<div className="stat-card rejected">
   <div className="stat-icon">❌</div>
          <div>
<h3>{stats.rejectedFilesCount}</h3>
<p>{t("admin.dashboard.rejectedFiles")}</p></div>  
</div>
</>
   )}

<div className="stat-card downloads">
   <div className="stat-icon">⬇️</div>
   <div>
<h3>{stats.totalDownloads}</h3>
<p>{t("admin.dashboard.totalDownloads")}</p>
</div>
</div> 
 <div className="additional-stats">
    <div className="stat-card most-downloaded">
      <div className="stat-icon">🏆</div>
      <div className="stat-text">
        <h3>{stats.mostDownloadedFile}</h3>
       <p>{t("admin.dashboard.mostDownloaded")}</p>
      </div>
    </div> 

    <div className="stat-card most-active-course">
      <div className="stat-icon">🔥</div>
      <div className="stat-text">
        <h3>{stats.mostActiveCourse}</h3>
         <p>{t("admin.dashboard.mostActiveCourse")}</p>
      </div>
    </div>
  </div>
{(currentUser?.permissions?.ManageFiles || currentUser?.permissions?.SuperAdmin) && (
  <div className="review-alert">
     <div className="stat-icon">⚠️</div>
    <p>{stats.pendingFilesCount} {t("admin.dashboard.reviewMessage")}</p>
      <button onClick={handleReviewNow}>{t("admin.dashboard.reviewNow")}</button>
  </div> )}

</div>

</div>




)}
          {activeSection === "files" && (
            <div className="admin">
              <h2>{t("admin.title")}</h2>
              <p>{t("admin.manageFiles")}</p>
              <div className="tab">
                <button
                  className={activeTab === "Pending" ? "active" : ""}
                  onClick={() => setActiveTab("Pending")}
                >
                  {t("admin.tabs.pending")}
                </button>
                <button
                  className={activeTab === "Approved" ? "active" : ""}
                  onClick={() => setActiveTab("Approved")}
                >
                  {t("admin.tabs.approved")}
                </button>
                <button
                  className={activeTab === "Rejected" ? "active" : ""}
                  onClick={() => setActiveTab("Rejected")}
                >
                  {t("admin.tabs.rejected")}
                </button>
              </div>

              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>{t("admin.table.fileName")}</th>
                      <th>{t("admin.table.uploadedBy")}</th>
                      <th>{t("admin.table.category")}</th>
                      <th>{t("admin.table.course")}</th>
                      <th>{t("admin.table.date")}</th>
                      <th>{t("admin.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterFiles.map((file) => (
                      <tr key={file.id}>
  <td>
<a
  href={file.filePath ? `${serverUrl}${file.filePath}` : "#"}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => {
    if (!file.filePath) {
      e.preventDefault();
      alert("No file URL!");
    }
  }}
>
  {file.title}
</a>
</td>
<td>{file.uploadedByUserName}</td>
<td>{file.categoryName}</td> 

<td>
  {!allCourses.some(c => c.name === file.courseName)&& file.status === 0 ? (
    <span
      style={{
        cursor: "pointer",
         textDecoration: "underline",
        color: "red"
      }}
      onClick={() => {
  setActiveSection("courses");

  setNewCourse(file.courseName);

  const category = categories.find(
    (cat) => cat.name === file.categoryName
  );

  if (category) {
    setSelectedCategory(category.id);
  }
  setSelectedFileId(file.id);
}}
    >
      {file.courseName || "Unknown Course"}
    </span>
  ) : (
    
    <span>{file.courseName}</span>
  )}
</td>
  
<td>{new Date(file.uploadedAt).toLocaleString()}</td>
                        <td>
                       {file.status === 0 ? (
  <div className="actions">
    <button
      className="approve-btn"
      onClick={() => approveFile(file.id)}
    >
      {t("admin.buttons.approve")}
    </button>

    <button
      className="reject-btn"
      onClick={() => rejectFile(file.id)}
    >
      {t("admin.buttons.reject")}
    </button>
  </div>
) : (
  <div className="actions">
    <span>
     {file.status === 1 ? t("admin.tabs.approved") : t("admin.tabs.rejected")}
    </span>
{file.status === 1 && (
    <button
      className="delete-btn"
      onClick={() => deleteFile(file.id)}
    >
      {t("admin.buttons.disabled")}
    </button> 
)}
  </div>
)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === "categories" && (
            <div className="section">
              <h3 className="category">{t("admin.categories.title")}</h3>
              <div className="category-boxs">
                <input
                  type="text"
                  placeholder={t("admin.categories.newCategory")}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              
<input
  type="text"
  placeholder={t("admin.categories.description")}
  value={newCategoryDesc}
  onChange={(e) => setNewCategoryDesc(e.target.value)}
/>
<button onClick={addCategory}>{t("admin.buttons.add")}</button>
              </div>

              <ul className="category-list">
                {categories.map((category) => (
                  <li key={category.id}>
                    {editCategory === category.id  ? (
                      <>
                        <input
                          value={updatedNameCategory}
                          onChange={(e) => setUpdatedNameCategory(e.target.value)}
                          placeholder={t("admin.categories.placeholderName")}
                        />
                        <input
                          value={updatedCategoryDesc}
                          onChange={(e) => setUpdatedCategoryDesc(e.target.value)}
                          placeholder="Category Description"
                        />
                        <button className="save" onClick={() => updateCategory(category.id)}>
                          {t("admin.buttons.save")}
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {category.name} - {category.description || ""}
                        </span>
                       <div className="buttons">
                          <button
                            className="edit"
                            onClick={() => {
                              setEditCategory(category.id);
                              setUpdatedNameCategory(category.name);
                              setUpdatedCategoryDesc(category.description);
                            }}
                          >
                            {t("admin.buttons.edit")}
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteCategory(category.id)}
                          >
                            {t("admin.buttons.disabled")}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "courses" && (
            <div className="section">
              <h3 className="course">{t("admin.courses.title")}</h3>
              <div className="course-boxs">
                <input
                  type="text"
                  placeholder={t("admin.courses.newCourse")}
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                />
                <input
                  type="text"
                 placeholder={t("admin.courses.description")}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                />
                 <select
                  value={selectedCategory }
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t("admin.courses.selectCategory")}</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button onClick={addCourse}>{t("admin.buttons.add")}</button>
              </div>

              <ul className="course-list">
                {courses.map((course) => (
                  <li key={course.id}>
                    {editCourse === course.id ? (
                      <>
                        <input
                          value={updatedCourseName}
                          onChange={(e) => setUpdatedCourseName(e.target.value)}
                         placeholder={t("admin.courses.placeholderName")}
                        />
                        <input
                          value={updatedCourseDesc}
                          onChange={(e) => setUpdatedCourseDesc(e.target.value)}
                         placeholder={t("admin.courses.description")}
                        />
                        <button className="save"  onClick={() => updateCourse(course.id)}>
                          {t("admin.buttons.save")}
                        </button>
                      </>
                    ) : (
                      <>
                         <span>
                 {course.name} - {course.description}
                    </span>

                       <div className="buttons">
                          <button
                            className="edit"
                            onClick={() => {
                              setEditCourse(course.id);
                              setUpdatedCourseName(course.name);
                              setUpdatedCourseDesc(course.description);
                            }}
                          >
                            {t("admin.buttons.edit")}
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteCourse(course.id)}
                          >
                            {t("admin.buttons.disabled")}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

       
          {activeSection === "users" && (
            <div className="users-section">
              <div className="users-list">
              <h3>{t("admin.users.title")}</h3>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                  placeholder={t("admin.users.search")}
                    className="search"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-item"
                   onClick={() => loadUserData(user)}
                  >
                    <div className="avatar">{user.fullName?.charAt(0)}</div>
                    <div className="user-info">
                     <p className="user-name">{user.fullName}</p>
                   <span className="usr-role">{user.roles?.join(", ")}</span>
                      <div className="user-actions">
                        {bannedUsers.includes(user.id) ? (
                          <button
                            className="unban-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              unbanUser(user.id);
                            }}
                          >
                          {t("admin.users.unban")}
                          </button>
                        ) : (
                          <button
                            className="ban-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              banUser(user.id);
                            }}
                          >
                          {t("admin.users.ban")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="user-details">
                {selectedUser ? (
                  <>
                 <h3>{selectedUser.fullName}</h3>

                    <div>
                    <h4>👤 {t("admin.users.roles")}</h4>
                      <div className="role-container">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.roles.includes("Admin")}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...selectedUser.roles, "Admin"]
                                : selectedUser.roles.filter((r) => r !== "Admin");
                              setSelectedUser({ ...selectedUser, roles: newRoles });
                            }}
                          />
                       <span>{t("admin.roles.admin")}</span>
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.roles.includes("Student")}
                            onChange={(e) => {
                              const newRoles = e.target.checked
                                ? [...selectedUser.roles, "Student"]
                                : selectedUser.roles.filter((r) => r !== "Student");
                              setSelectedUser({ ...selectedUser, roles: newRoles });
                            }}
                          />
                        <span>{t("admin.roles.student")}</span>
                        </label>
                      </div>
                    </div>
                    {selectedUser.roles.includes("Admin") || selectedUser.roles.includes("SuperAdmin") ? (
                      <>
<h4>🔑 {t("admin.users.permissions")}</h4>
                    <ul className="permissions-grid">
                      <li>
                        <label>
                          <input
                            type="checkbox"
                           checked={selectedUser.permissions.ManageCategories || false}
                            onChange={() => handlePermissionChange("ManageCategories")}
                          />
                     {t("admin.permissions.manageCategories")}
                        </label>
                      </li>
                      <li>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.ManageCourses || false}
                            onChange={() => handlePermissionChange("ManageCourses")}
                          />
                        {t("admin.permissions.manageCourses")}
                        </label>
                      </li>
                      <li>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.ManageFiles || false}
                            onChange={() => handlePermissionChange("ManageFiles")}
                          />
                      {t("admin.permissions.manageFiles")}
                        </label>
                        </li>
                        <li>
                         <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.SuperAdmin || false}
                            onChange={() => handlePermissionChange("SuperAdmin")}
                          />
                     {t("admin.permissions.superAdmin")}
                        </label>
                      </li>
                    </ul>
                    </>
                    ):null}

                <button
  className="save-btn"
  onClick={async () => {
    await updateRoles();
    await updateClaims();
   alert(t("admin.users.updated"));
  }}
>
  {t("admin.users.saveChanges")}
</button>
                  </>
                ) : (
                  <div className="container">
                    <div className="no-user-selected">
                      <FaUserCircle size={80} color="#007bff" />
                      <p>{t("admin.users.chooseUser")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;

