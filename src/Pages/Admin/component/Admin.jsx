import React, { useState } from "react";
import "./Admin.css";
import { useTranslation } from "react-i18next";
import { FaUserCircle } from "react-icons/fa";

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

  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Data Structures Summary.pdf",
      uploadedBy: "Razan Madani",
      major: "Computer Systems Engineering",
      course: "Introduction to Computer Science",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 2,
      name: "Calculus Notes.pdf",
      uploadedBy: "Tahani Mansour",
      major: "Engineering",
      course: "Data Structures and Algorithms",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 3,
      name: "Physics Lab Report.docx",
      uploadedBy: "Masa Omar",
      major: "Physics",
      course: "Communication Skills",
      date: "2025-03-01",
      status: "Pending",
    },
  ]);

  const [categories, setCategories] = useState([
    { name: "Computer Systems Engineering", description: "" },
    { name: "Engineering", description: "" },
    { name: "Physics", description: "" },
  ]);

  const [courses, setCourses] = useState([
    { name: "Data Structures and Algorithms", description: "" },
    { name: "Introduction to Computer Science", description: "" },
    { name: "Communication Skills", description: "" },
  ]);

  // --- Categories & Courses States ---
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [updatedNameCategory, setUpdatedNameCategory] = useState("");
  const [updatedCategoryDesc, setUpdatedCategoryDesc] = useState("");

  const [newCourse, setNewCourse] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [editCourse, setEditCourse] = useState(null);
  const [updatedCourseName, setUpdatedCourseName] = useState("");
  const [updatedCourseDesc, setUpdatedCourseDesc] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "EduPro Admin",
      role: "Admin",
      roles: ["Admin"],
      permissions: {
        manageCategories: true,
        manageCourses: true,
        manageUsers: true,
        publishCourse: true,
        superAdmin: true,
      },
    },
    {
      id: 2,
      name: "Ahmad Salem",
      role: "Student",
      roles: ["Student"],
      permissions: {
        manageCategories: false,
        manageCourses: false,
        manageUsers: false,
        publishCourse: false,
        superAdmin: false,
      },
    },
    {
      id: 3,
      name: "Sara Khalil",
      role: "Student",
      roles: ["Student"],
      permissions: {
        manageCategories: false,
        manageCourses: false,
        manageUsers: false,
        publishCourse: false,
        superAdmin: false,
      },
    },
    {
      id: 4,
      name: "Majd Nasser",
      role: "Admin",
      roles: ["Admin"],
      permissions: {
        manageCategories: true,
        manageCourses: true,
        manageUsers: true,
        publishCourse: true,
        superAdmin: false,
      },
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [bannedUsers, setBannedUsers] = useState([]);
  const approveFile = (id) => {
    setFiles(files.map((file) => (file.id === id ? { ...file, status: "Approved" } : file)));
  };
  const rejectFile = (id) => {
    setFiles(files.map((file) => (file.id === id ? { ...file, status: "Rejected" } : file)));
  };
  const filterFiles = files.filter((file) => file.status === activeTab);
  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, { name: newCategory, description: newCategoryDesc }]);
    setNewCategory("");
    setNewCategoryDesc("");
  };
  const updateCategory = (index) => {
    const updated = [...categories];
    updated[index] = { name: updatedNameCategory, description: updatedCategoryDesc };
    setCategories(updated);
    setEditCategory(null);
    setUpdatedNameCategory("");
    setUpdatedCategoryDesc("");
  };
  const deleteCategory = (index) => {
    setCategories(categories.filter((category, i) => i !== index));
  };
  const addCourse = () => {
    if (!newCourse.trim()) return;
    setCourses([...courses, { name: newCourse, description: newCourseDesc }]);
    setNewCourse("");
    setNewCourseDesc("");
  };
  const updateCourse = (index) => {
    const updated = [...courses];
    updated[index] = { name: updatedCourseName, description: updatedCourseDesc };
    setCourses(updated);
    setEditCourse(null);
    setUpdatedCourseName("");
    setUpdatedCourseDesc("");
  };
  const deleteCourse = (index) => {
    setCourses(courses.filter((course, i) => i !== index));
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchUser.toLowerCase())
  );
  const handlePermissionChange = (permission) => {
    setSelectedUser((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [permission]: !prev.permissions[permission] },
    }));
  };

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
                        <td>{file.name}</td>
                        <td>{file.uploadedBy}</td>
                        <td>{file.major}</td>
                        <td>{file.course}</td>
                        <td>{file.date}</td>
                        <td>
                          {file.status === "Pending" ? (
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
                            <span>{file.status}</span>
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
              <div className="category-box">
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
                {categories.map((category, index) => (
                  <li key={index}>
                    {editCategory === index ? (
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
                        <button onClick={() => updateCategory(index)}>
                          {t("admin.buttons.save")}
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {category.name} - {category.description}
                        </span>
                        <div>
                          <button
                            className="edit"
                            onClick={() => {
                              setEditCategory(index);
                              setUpdatedNameCategory(category.name);
                              setUpdatedCategoryDesc(category.description);
                            }}
                          >
                            {t("admin.buttons.edit")}
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteCategory(index)}
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
              <div className="course-box">
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
                <button onClick={addCourse}>{t("admin.buttons.add")}</button>
              </div>

              <ul className="course-list">
                {courses.map((course, index) => (
                  <li key={index}>
                    {editCourse === index ? (
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
                        <button onClick={() => updateCourse(index)}>
                          {t("admin.buttons.save")}
                        </button>
                      </>
                    ) : (
                      <>
                        <span>
                          {course.name} - {course.description}
                        </span>
                        <div>
                          <button
                            className="edit"
                            onClick={() => {
                              setEditCourse(index);
                              setUpdatedCourseName(course.name);
                              setUpdatedCourseDesc(course.description);
                            }}
                          >
                            {t("admin.buttons.edit")}
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteCourse(index)}
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
                              setBannedUsers(bannedUsers.filter((id) => id !== user.id));
                            }}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            className="ban-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBannedUsers([...bannedUsers, user.id]);
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

                    <button className="save-btn">Save Changes</button>
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

