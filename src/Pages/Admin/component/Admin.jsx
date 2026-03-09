import React, { useState } from "react";
import "./Admin.css";
import { useTranslation } from "react-i18next";
import Categories from './../../categories/component/Categories';
import Courses from './../../Courses/component/Courses';
import { FaUserCircle } from "react-icons/fa";
function Sidebar ({ activeSection, setActiveSection }){
  return(
    <div className="sidebar">
      <h2>EDUPRO</h2>
      <p>Admin Panel</p>
      <button className = {activeSection==="files"? "active":""}
      onClick={()=>setActiveSection("files")}
      >
        Manage Files
      </button>
       <button className = {activeSection==="categories"? "active":""}
      onClick={()=>setActiveSection("categories")}
      >
        Manage Categories
      </button>
       <button className = {activeSection==="courses"? "active":""}
      onClick={()=>setActiveSection("courses")}
      >
        Manage Courses
      </button>
       <button className = {activeSection==="users"? "active":""}
      onClick={()=>setActiveSection("users")}
      >
      Manage Users
      </button>

    </div>
  );}
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
    "Computer Systems Engineering",
    "Engineering",
    "Physics",
  ]);
  const [courses, setCourses] = useState([
    "Data Structures and Algorithms",
    "Introduction to Computer Science",
    "Communication Skills",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [updatedNameCategory, setUpdatedNameCategory] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [editCourse, setEditCourse] = useState(null);
  const [updatedNameCourse, setUpdatedNameCourse] = useState("");
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
      superAdmin: true
    }
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
      superAdmin: false
    }
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
      superAdmin: false
    }
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
      superAdmin: false
    }
  }
]);
  const [selectedUser, setSelectedUser] = useState(null);

  const approveFile = (id) => {
    setFiles(
      files.map((file) =>
        file.id === id ? { ...file, status: "Approved" } : file,
      ),
    );
  };
  const rejectFile = (id) => {
    setFiles(
      files.map((file) =>
        file.id === id ? { ...file, status: "Rejected" } : file,
      ),
    );
  };
  const filterFiles = files.filter((file) => file.status === activeTab);
  const addCategory = () => {
    if (newCategory.trim() === "") return;

    setCategories([...categories, newCategory]);

    setNewCategory("");
  };
  const addCourse = () => {
    if (newCourse.trim() === "") return;

    setCourses([...courses, newCourse]);

    setNewCourse("");
  };
  const deleteCategory = (categoryToDelete) => {
    setCategories(categories.filter((item) => item !== categoryToDelete));
  };
  const deleteCourse = (courseToDelete) => {
    setCourses(courses.filter((item) => item !== courseToDelete));
  };
  const updateCategory = () => {
    setCategories(
      categories.map((category) =>
        category === editCategory ? updatedNameCategory : category,
      ),
    );
    setEditCategory(null);
    setUpdatedNameCategory("");
  };
  const updateCourse = () => {
    setCourses(
      courses.map((course) =>
        course === editCourse ? updatedNameCourse : course,
      ),
    );
    setEditCourse(null);
    setUpdatedNameCourse("");
  };
   const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchUser.toLowerCase())
  );
  const handlePermissionChange = (permission) => {
  setSelectedUser(prev => ({
    ...prev,
    permissions: {
      ...prev.permissions,
      [permission]: !prev.permissions[permission]
    }
  }));
};
  return (
    <div className ="admin-container">
    <Sidebar activeSection={activeSection} setActiveSection={setActiveSection}/>
      <div className="admin-content">
        <div className="admin-inner">
{activeSection==="files" && (
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
                <td> {file.name}</td>
                <td>{file.uploadedBy}</td>
                <td> {file.major}</td>
                <td> {file.course}</td>
                <td> {file.date}</td>
                <td> {file.status}</td>
                <td>
                  {file.status === "Pending" && (
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      
  
      )}
      {activeSection==="categories" && (
      <div className="section">
        <h3 className="category">{t("admin.categories.title")}</h3>
        <div className="category-box">
          <input
            type="text"
            placeholder={t("admin.categories.newCategory")}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />

          <button onClick={addCategory}>{t("admin.buttons.add")}</button>
        </div>

        <ul className="category-list">
          {categories.map((category, index) => (
            <li key={index}>
              {editCategory === category ? (
                <>
                  <input
                    value={updatedNameCategory}
                    onChange={(e) => setUpdatedNameCategory(e.target.value)}
                  />

                  <button onClick={updateCategory}>
                    {t("admin.buttons.save")}
                  </button>
                  </>
                
              ) : (
                <>
                  <span>{category}</span>

                  <div>
                    <button
                      className="edit"
                      onClick={() => {
                        setEditCategory(category);
                        setUpdatedNameCategory(category);
                      }}
                    >
                      {t("admin.buttons.edit")}
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteCategory(category)}
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
      {activeSection==="courses" && (
      <div className="section">
        <h3 className="course">{t("admin.courses.title")}</h3>
        <div className="course-box">
          <input
            type="text"
            placeholder={t("admin.courses.newCourse")}
            value={newCourse}
            onChange={(e) => setNewCourse(e.target.value)}
          />

          <button onClick={addCourse}>{t("admin.buttons.add")}</button>
        </div>

        <ul className="course-list">
          {courses.map((course, index) => (
            <li key={index}>
              {editCourse === course ? (
                <>
                  <input
                    value={updatedNameCourse}
                    onChange={(e) => setUpdatedNameCourse(e.target.value)}
                  />

                  <button onClick={updateCourse}>
                    {t("admin.buttons.save")}
                  </button>
                </>
              ) : (
                <>
                  <span>{course}</span>

                  <div>
                    <button
                      className="edit"
                      onClick={() => {
                        setEditCourse(course);
                        setUpdatedNameCourse(course);
                      }}
                    >
                      {t("admin.buttons.edit")}
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteCourse(course)}
                    >
                      {t("admin.buttons.delete")}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div> )} 

   
{activeSection ==="users"&&(
  <div className="users-section">
<div className="users-list">
<h3>Users</h3>
<div className="search-box">
    <span className="search-icon">🔍</span>
<input type="text" placeholder="search" className="search"
value={searchUser}
onChange={(e)=>setSearchUser(e.target.value)}
/>
</div>

{filteredUsers.map((user)=>(
  <div key ={user.id}
  className="user-item"
  onClick={()=>setSelectedUser(user)}>
    <div className="avatar">
      {user.name.charAt(0)}
    </div>
    <div>
      <p className="user-name">{user.name}</p>
      <span className="usr-role">{user.role}</span>
    </div>
    </div>
)
)}
</div>
<div className= "user-details">
{selectedUser?(
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
                  : selectedUser.roles.filter(r => r !== "Admin");
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
                  : selectedUser.roles.filter(r => r !== "Student");
                setSelectedUser({ ...selectedUser, roles: newRoles });
              }}
            />
           <span>Student</span> 
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
  </> 
):(
  <div className="container">
  <div className="no-user-selected">
       <FaUserCircle size={80} color="#007bff" />
  <p>Choose a user to manage their permissions</p>
</div> 
</div>
)}



</div>


  </div>
)
}
 </div>
</div>
</div>
  ); 
  }

export default Admin;
