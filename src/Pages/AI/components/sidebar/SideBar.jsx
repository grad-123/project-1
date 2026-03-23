import "./Sidebar.css";
import { useEffect, useState } from "react";
import axios from "../../../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/Api/EduFile/Approve`) 
            .then((res) => {
        setFiles(res.data.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="ai-sidebar">
      <input placeholder="Search files..." />

      <div className="files">
        {files.map((file) => (
          <div
            key={file.id}
            className="file-item"
            onClick={() => navigate(`/ai/file/${file.id}`)}
          >
            <div className="file-icon">
              {file.fileType === 0 && "🎥"}
              {file.fileType === 1 && "📄"}
              {file.fileType === 2 && "📝"}
              {file.fileType === 3 && "🧾"}
              {file.fileType === 4 && "📌"}
              {file.fileType === 5 && "📚"}
              {file.fileType === 6 && "📁"}
            </div>

            <div className="file-info">
              <h4>{file.title}</h4>

              <p className="meta">
                {file.courseName} • {file.categoryName}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;