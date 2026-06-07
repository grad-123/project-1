import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import "./PublicProfile.css";
import { useTranslation } from "react-i18next";

function PublicProfile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("files");
  const [fileFilter, setFileFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [savedItems, setSavedItems] = useState(new Set());

  // ============================================================
  // Fetch public profile
  // ============================================================
  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      // ✅ userId هو رقم (29, 30, إلخ)
      const res = await axios.get(`/Api/Profile/GetPublicProfile/${userId}`);
      if (res.data.succeeded) {
        setProfile(res.data.data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await axios.get("/Favorite/GetList");
      const collectionsRes = await axios.get("/Favorite/GetCollections");

      const fileIds = res.data.succeeded 
        ? res.data.data.map(f => f.eduFileId) 
        : [];
        
      const colIds = collectionsRes.data.succeeded 
        ? collectionsRes.data.data.map(c => `col-${c.collectionId}`) 
        : [];

      setSavedItems(new Set([...fileIds, ...colIds]));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPublicProfile();
    fetchFavorites();
  }, [userId]);

  // ============================================================
  // Save File to favourites
  // ============================================================
  const handleSaveFile = async (fileId) => {
    try {
      if (savedItems.has(fileId)) {
        await axios.delete(`/Favorite/Delete/${fileId}`);
        setSavedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      } else {
        await axios.post(`/Favorite/Add/${fileId}`);
        setSavedItems(prev => new Set([...prev, fileId]));
      }
      await fetchFavorites();
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // Save Collection to favourites
  // ============================================================
  const handleSaveCollection = async (collectionId) => {
    const key = `col-${collectionId}`;
    const isSaved = savedItems.has(key);

    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (isSaved) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });

    setSavingId(key);

    try {
      if (isSaved) {
        await axios.delete(`/Favorite/RemoveCollection/${collectionId}`, { data: {} });
      } else {
        await axios.post(`/Favorite/AddCollection/${collectionId}`, {});
      }
    } catch (err) {
      if (err.response?.data?.message?.includes("already in your favorites")) {
        console.warn("Collection already saved, syncing state...");
        await fetchFavorites();
      } else {
        console.error("Error saving collection:", err.response?.data || err);
        setSavedItems(prev => {
          const newSet = new Set(prev);
          if (isSaved) newSet.add(key);
          else newSet.delete(key);
          return newSet;
        });
      }
    } finally {
      setSavingId(null);
    }
  };

  // Derived data
  // ============================================================
  const publishedFiles = (profile?.files || []).filter(f => f.isPublished);
  const publishedCollections = (profile?.collections || []).filter(c => c.isPublished);

  const filteredFiles = publishedFiles.filter(file => {
    const matchesFilter =
      fileFilter === "all" ||
      (fileFilter === "exams" && file.fileType === 3) ||
      (fileFilter === "lectures" && file.fileType === 1) ||
      (fileFilter === "summaries" && file.fileType === 4) ||
      (fileFilter === "slides" && file.fileType === 5);

    const matchesSearch =
      !searchQuery ||
      file.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.courseName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const fileTypeLabel = (type) => {
    const map = {  1: t("publicProfile.fileTypes.lecture"),
    2: t("publicProfile.fileTypes.assignment"),
    3: t("publicProfile.fileTypes.exam"),
    4: t("publicProfile.fileTypes.summary"),
    5: t("publicProfile.fileTypes.slides")};
    return map[type] ||  t("publicProfile.fileTypes.default");
  };

  const fileTypeClass = (type) => {
    const map = { 1: "type-lecture", 2: "type-assignment", 3: "type-exam", 4: "type-summary", 5: "type-slides" };
    return map[type] || "type-default";
  };

  const fileTypeIcon = (type) => {
    const map = { 1: "🎥", 2: "📝", 3: "📋", 4: "📄", 5: "🖼️" };
    return map[type] || "📁";
  };

  // ============================================================
  // Loading
  // ============================================================
  if (loading) {
    return (
      <div className="pp-loading">
        <div className="pp-spinner"></div>
    <p>{t("publicProfile.loading")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pp-not-found">
      <h2>{t("publicProfile.notFound")}</h2>
      <button onClick={() => navigate(-1)}>
  {t("publicProfile.goBack")}</button>
      </div>
    );
  }

  return (
    <div className="pp-container">

      {/* ======================== HEADER ======================== */}
      <div className="pp-header">
        <div className="pp-header-bg"></div>

        <div className="pp-header-content">
          <div className="pp-avatar-wrap">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.fullName} className="pp-avatar-img" />
            ) : (
              <div className="pp-avatar-placeholder">
                <span>{profile.fullName?.charAt(0) || "?"}</span>
              </div>
            )}
          </div>

          <div className="pp-header-info">
            <span className="pp-badge">{t("publicProfile.badge")}</span>
            <h1 className="pp-name">{profile.fullName}</h1>
            <p className="pp-email">{profile.email}</p>

            <div className="pp-stats">
              <div className="pp-stat">
                <span className="pp-stat-num">{profile.totalFiles ?? 0}</span>
             <span className="pp-stat-label">{t("publicProfile.files")}</span>

              </div>
              <div className="pp-stat-divider"></div>
              <div className="pp-stat">
                <span className="pp-stat-num">{profile.totalDownloads ?? 0}</span>
               <span className="pp-stat-label">{t("publicProfile.downloads")}</span>
              </div>
              <div className="pp-stat-divider"></div>
              <div className="pp-stat">
                <span className="pp-stat-num">{profile.collectionsCount ?? 0}</span>
              <span className="pp-stat-label">{t("publicProfile.collections")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================== TABS ======================== */}
      <div className="pp-tabs-bar">
        <button
          className={`pp-tab ${activeTab === "files" ? "pp-tab-active" : ""}`}
          onClick={() => setActiveTab("files")}
        >
        {t("publicProfile.tabFiles")}
        </button>
        <button
          className={`pp-tab ${activeTab === "collections" ? "pp-tab-active" : ""}`}
          onClick={() => setActiveTab("collections")}
        >
          {t("publicProfile.tabCollections")}
        </button>
      </div>

      {/* ======================== FILES TAB ======================== */}
      {activeTab === "files" && (
        <div className="pp-section">
          <div className="pp-section-head">
            <div>
              <h2>{t("publicProfile.filesTitle")}</h2>
              <p>{t("publicProfile.filesSubtitle")}</p>
            </div>
            <div className="pp-search-wrap">
              <span className="pp-search-icon">🔍</span>
              <input
                type="text"
               placeholder={t("publicProfile.searchPlaceholder")}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pp-search"
              />
            </div>
          </div>

          {/* Filter pills */}
         <div className="pp-filters">
  {[
    { key: "all", label: t("publicProfile.filterAll") },
    { key: "exams", label: t("publicProfile.filterExams") },
    { key: "lectures", label: t("publicProfile.filterLectures") },
    { key: "summaries", label: t("publicProfile.filterSummaries") },
    { key: "slides", label: t("publicProfile.filterSlides") }
  ].map(f => (
    <button
      key={f.key}
      className={`pp-filter-pill ${fileFilter === f.key ? "pp-filter-active" : ""}`}
      onClick={() => setFileFilter(f.key)}
    >
      {f.label}
    </button>
  ))}
</div>

          {/* Files table */}
          {filteredFiles.length === 0 ? (
            <div className="pp-empty">
             <p>{t("publicProfile.noFiles")}</p>
            </div>
          ) : (
            <table className="pp-table">
              <thead>
                <tr>
                 <th>{t("publicProfile.colResource")}</th>
<th>{t("publicProfile.colCourse")}</th>
<th>{t("publicProfile.colType")}</th>
<th>{t("publicProfile.colDate")}</th>
<th>{t("publicProfile.colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id}>
                    <td>
                      <div className="pp-file-title">
                        <span className="pp-file-icon">{fileTypeIcon(file.fileType)}</span>
                        <div>
                          <strong>{file.title}</strong>
                          <small>{fileTypeLabel(file.fileType)} · {new Date(file.uploadedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="pp-course-badge">{file.courseName}</span>
                    </td>
                    <td>
                      <span className={`pp-type-badge ${fileTypeClass(file.fileType)}`}>
                        ● {fileTypeLabel(file.fileType)}
                      </span>
                    </td>
                    <td className="pp-date">{new Date(file.uploadedAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>
                      <button
                        className={`pp-save-btn ${savedItems.has(file.id) ? "pp-saved" : ""}`}
                        onClick={() => handleSaveFile(file.id)}
                        disabled={savingId === file.id}
                      >
                       {savedItems.has(file.id) ? t("publicProfile.saved") : savingId === file.id ? t("publicProfile.saving") : t("publicProfile.save")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ======================== COLLECTIONS TAB ======================== */}
      {activeTab === "collections" && (
        <div className="pp-section">
          <div className="pp-section-head">
            <div>
            <h2>{t("publicProfile.collectionsTitle")}</h2>
<p>{t("publicProfile.collectionsSubtitle")}</p>
            </div>
          </div>

          {publishedCollections.length === 0 ? (
            <div className="pp-empty">
            <p>{t("publicProfile.noCollections")}</p>
            </div>
          ) : (
            <div className="pp-collections-grid">
              {publishedCollections.map(col => (
                <div key={col.id} className="pp-col-card">
                  <div className="pp-col-card-top">
                    <div className="pp-col-info">
                      <h4>{col.name}</h4>
                      <p>{col.description}</p>
                    </div>
                    <span className="pp-col-published-badge">{t("publicProfile.published")}</span>
                  </div>

                  <div className="pp-col-meta">
                    <span>📁 {col.filesCount} files</span>
                    <span>📅 {new Date(col.createdAt).toLocaleDateString("en-CA")}</span>
                    <span>📂 {col.courseName}</span>
                  </div>

                  <button
                    className={`pp-save-col-btn ${
                      savedItems.has(`col-${col.id}`) ? "pp-saved" : "pp-not-saved"
                    }`}
                    onClick={() => handleSaveCollection(col.id)}
                    disabled={savingId === `col-${col.id}`}
                  >
                    {savedItems.has(`col-${col.id}`) ? "✓ Saved" : "🔖 Save Collection"}
                  </button>
                 <button
  className={`pp-save-col-btn ${
    savedItems.has(`col-${col.id}`) ? "pp-saved" : "pp-not-saved"
  }`}
  onClick={() => handleSaveCollection(col.id)}
  disabled={savingId === `col-${col.id}`}
>
 {savedItems.has(`col-${col.id}`) ? t("publicProfile.saved") : t("publicProfile.saveCollection")}
</button>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default PublicProfile;