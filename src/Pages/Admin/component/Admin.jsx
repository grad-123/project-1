import React, { useState } from "react";
import "./Admin.css";
import { useTranslation } from "react-i18next";
function Admin() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("Pending");
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Data Structures Summary.pdf",
      uploadedBy: "Razan Madani",
      major: "Computer Systems Engineering",
      Course: "Introduction to Computer Science",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 2,
      name: "Calculus Notes.pdf",
      uploadedBy: "Tahani Mansour",
      major: "Engineering",
      Course: "Data Structures and Algorithms",
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 3,
      name: "Physics Lab Report.docx",
      uploadedBy: "Masa Omar",
      major: "Physics",
      Course: "Communication Skills",
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
  return (
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
                <td> {file.Course}</td>
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
      </div>
    </div>
  );
}
export default Admin;
