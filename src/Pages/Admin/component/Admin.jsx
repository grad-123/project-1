import React, { useState, useEffect } from "react";
import "./Admin.css";
import { useTranslation } from "react-i18next";
//<<<<<<< HEAD
//import Categories from './../../categories/component/Categories';
import Courses from './../../Courses/component/Courses';
//=======
//>>>>>>> cf285972e258dfae8b490b2be14e7161f145c4fa
import { FaUserCircle } from "react-icons/fa";
import axios from "../../../api/axiosInstance";
function Sidebar({ activeSection, setActiveSection }) {
  return (
    <div className="sidebar">
      <h2>EDUPRO</h2>
      <p>Admin Panel</p>
      <button
        className={activeSection === "files" ? "active" : ""}
        onClick={() => setActiveSection("files")}
      >
        Manage Files
      </button>
      <button
        className={activeSection === "categories" ? "active" : ""}
        onClick={() => setActiveSection("categories")}
      >
        Manage Categories
      </button>
      <button
        className={activeSection === "courses" ? "active" : ""}
        onClick={() => setActiveSection("courses")}
      >
        Manage Courses
      </button>
      <button
        className={activeSection === "users" ? "active" : ""}
        onClick={() => setActiveSection("users")}
      >
        Manage Users
      </button>
    </div>
  );
}

function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Pending");
  const [activeSection, setActiveSection] = useState("files");

  const [files, setFiles] = useState([ ]);

  const [categories, setCategories] = useState([ ]);

  
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
  const statusMap = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected"
};
  const fetchFiles = async () => {
  if (!statusMap[activeTab]) return; // safety
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

  
  const fetchCategories = async () => {
  try {
    const response = await axios.get("/api/v1/Category/GetList");

    if (response.data.succeeded) {
      setCategories(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};const fetchCourses = async () => {
  if (!selectedCategory) return; // ما ننفذ إذا ما فيه كاتيجوري
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
      fetchCategories(); // تحديث اللائحة بعد التعديل
      setEditCategory(null); // إغلاق وضعية التعديل
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
    const categoryObj = categories.find(cat => cat.id === selectedCategory);
    const categoryId = categoryObj ? categoryObj.id : selectedCategory;

    const response = await axios.post("/Api/Course/Create", {
      name: newCourse,
      description: newCourseDesc,
      categoryId: categoryId,
    });

    if (response.data.succeeded) {
      setNewCourse("");
      setNewCourseDesc("");
      await fetchCourses();
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
    const response = await axios.get("/Api/Authorization/GetUsersList", {
      params: { keyword: searchUser }
    });

    console.log(response.data);

    if (response.data.succeeded) {
      setUsers(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};
useEffect(() => {
  fetchUsers();
}, [searchUser]);
useEffect(() => {
  fetchCategories();
}, []);
const banUser = async (id) => {
  try {
    await axios.post(`/Api/User/Ban/${id}`);
    fetchUsers();
  } catch (error) {
    console.error("Ban user error:", error);
  }
};
const unbanUser = async (id) => {
  try {
    await axios.post(`/Api/User/Unban/${id}`);
    fetchUsers();
  } catch (error) {
    console.error("Unban user error:", error);
  }
};
 const filteredUsers = users.filter(
  (user) =>
    user.name?.toLowerCase().includes(searchUser?.toLowerCase() || "")
);
  const handlePermissionChange = (permission) => {
    setSelectedUser((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [permission]: !prev.permissions[permission] },
    }));
  };
  const updateUser = async () => {
  try {
    const response = await axios.put("/Api/User/Update", selectedUser);

    if (response.data.succeeded) {
      fetchUsers();
      alert("User updated");
    }
  } catch (error) {
    console.error("Update user error:", error);
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
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="admin-content">
        <div className="admin-inner">
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
                        <td>{file.title}</td>
<td>{file.uploadedByUserName}</td>
<td>{file.categoryName}</td>
<td>{file.courseName}</td>
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
      {file.status === 1 ? "Approved" : "Rejected"}
    </span>

    <button
      className="delete-btn"
      onClick={() => deleteFile(file.id)}
    >
      Delete
    </button>
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
  placeholder="Description"
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
                          placeholder="Category Name"
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
                            {t("admin.buttons.delete")}
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
                  placeholder="Description"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                />
                 <select
                  value={selectedCategory }
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>

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
                          placeholder="Course Name"
                        />
                        <input
                          value={updatedCourseDesc}
                          onChange={(e) => setUpdatedCourseDesc(e.target.value)}
                          placeholder="Course Description"
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
                            {t("admin.buttons.delete")}
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
                <h3>Users</h3>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="search"
                    className="search"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                </div>

                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="user-item"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="avatar">{user.name.charAt(0)}</div>
                    <div className="user-info">
                      <p className="user-name">{user.name}</p>
                      <span className="usr-role">{user.role}</span>
                      <div className="user-actions">
                        {bannedUsers.includes(user.id) ? (
                          <button
                            className="unban-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              unbanUser(user.id);
                            }}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            className="ban-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              banUser(user.id);
                            }}
                          >
                            Ban
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
                    <h3>{selectedUser.name}</h3>

                    <div>
                      <h4>👤Roles</h4>
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
                          <span> Admin</span>
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
                          <span> Student</span>
                        </label>
                      </div>
                    </div>

                    <h4>🔑Permissions</h4>
                    <ul className="permissions-grid">
                      <li>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.manageCategories}
                            onChange={() => handlePermissionChange("manageCategories")}
                          />
                          Manage Categories
                        </label>
                      </li>
                      <li>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.manageCourses}
                            onChange={() => handlePermissionChange("manageCourses")}
                          />
                          Manage Courses
                        </label>
                      </li>
                      <li>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedUser.permissions.publishCourse}
                            onChange={() => handlePermissionChange("publishCourse")}
                          />
                          Publish Course
                        </label>
                      </li>
                    </ul>

                  <button className="save-btn" onClick={updateUser}>
  Save Changes
</button>
                  </>
                ) : (
                  <div className="container">
                    <div className="no-user-selected">
                      <FaUserCircle size={80} color="#007bff" />
                      <p>Choose a user to manage their permissions</p>
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

