import React, { useState } from "react";
import "./Admin.css";
function Admin() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Data Structures Summary.pdf",
      uploadedBy: "Razan Madani",
      major: "Computer Systems Engineering",
      level: 3,
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 2,
      name: "Calculus Notes.pdf",
      uploadedBy: "Tahani Mansour",
      major: "Engineering",
      level: 1,
      date: "2025-03-01",
      status: "Pending",
    },
    {
      id: 3,
      name: "Physics Lab Report.docx",
      uploadedBy: "Masa Omar",
      major: "Physics",
      level: 2,
      date: "2025-03-01",
      status: "Pending",
    },
  ]);
  const [categories, setCategories] = useState([
    "Computer Systems Engineering",
    "Engineering",
    "Physics",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
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
  const deleteCategory = (cat) => {
    setCategories(categories.filter((c) => c !== cat));
  };
  const updateCategory = () => {
    setCategories(
      categories.map((cat) => (cat === editCategory ? updatedName : cat)),
    );
    setEditCategory(null);
    setUpdatedName("");
  };
  return (
    <div className="admin">
      <h2>Admin Dashboard</h2>
      <p>Manage Upload File</p>
      <div className="tab">
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("Pending")}
        >
          pending
        </button>
        <button
          className={activeTab === "Approved" ? "active" : ""}
          onClick={() => setActiveTab("Approved")}
        >
          Approved
        </button>
        <button
          className={activeTab === "Rejected" ? "active" : ""}
          onClick={() => setActiveTab("Rejected")}
        >
          Rejected
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>File Name</th>
            <th>Uploaded By</th>
            <th>Categories</th>
            <th>Level</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filterFiles.map((file) => (
            <tr key={file.id}>
              <td> {file.name}</td>
              <td>{file.uploadedBy}</td>
              <td> {file.major}</td>
              <td> {file.level}</td>
              <td> {file.date}</td>
              <td> {file.status}</td>
              <td>
                {file.status === "Pending" && (
                  <>
                    <button  className="approve-btn"
                    onClick={() => approveFile(file.id)}>
                      Approve
                    </button>
                    <button  className="reject-btn"
                    onClick={() => rejectFile(file.id)}> Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="category">Manage Categories</h3>
      <div className="category-box">
        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <button onClick={addCategory}>Add</button>
      </div>

      <ul className="category-list">
        {categories.map((cat, index) => (
          <li key={index}>
            {editCategory === cat ? (
              <>
                <input
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                />

                <button onClick={updateCategory}>Save</button>
              </>
            ) : (
              <>
                <span>{cat}</span>

                <div>
                  <button
                    className="edit"
                    onClick={() => {
                      setEditCategory(cat);
                      setUpdatedName(cat);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete"
                    onClick={() => deleteCategory(cat)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default Admin;
