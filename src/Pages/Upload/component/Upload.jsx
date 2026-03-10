import "./Upload.css" 
import React, { useState} from 'react';
import { useForm } from "react-hook-form"
import Swal from "sweetalert2";
import { AiOutlineFile, AiOutlineUpload } from "react-icons/ai";
import { FiCheckCircle } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
export default function Upload() { 
   const { t } = useTranslation();
 const { register, handleSubmit, watch, formState: { errors } } = useForm();
 const selectedCategory = watch("category");
   const [selectedFile, setSelectedFile] = useState(null);
    const coursesByCategory = {
  computer_science: [
    "Introduction to Computer Science",
    "Data Structures",
    "Algorithms"
  ],
  mathematics: [
    "Calculus",
    "Linear Algebra",
    "Statistics"
  ],
  physics: [
    "Classical Mechanics",
    "Quantum Physics"
  ],
  business: [
    "Marketing",
    "Accounting"
  ],
  engineering: [
    "Thermodynamics",
    "Engineering Drawing"
  ],
  medicine: [
    "Anatomy",
    "Biochemistry"
  ]
};
  const onSubmit = (data) => {
    const file = data.file[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("materialTitle", data.materialTitle);
    formData.append("course", data.course);
    formData.append("category", data.category);
    formData.append("materialType", data.materialType);
    formData.append("description", data.description);
    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    .then((res) => {
  if (!res.ok) {
    throw new Error("Upload failed");
  }
  return res.json();
})
    .then(() => {
      Swal.fire({
        title:t("upload.alerts.successTitle"),
         text: t("upload.alerts.successText"),
        icon:"success",
        confirmButtonText: t("upload.alerts.ok"),
      });
      setSelectedFile(null);
    })
    .catch(() => {
      Swal.fire({
        title:t("upload.alerts.failTitle"),
        text:t("upload.alerts.failText"),
        icon:"error",
      confirmButtonText: t("upload.alerts.oK"),
      });
    });
};
const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  
  const isFormComplete = selectedFile &&
    !errors.materialTitle &&
    !errors.course &&
    !errors.category &&
    !errors.materialType &&
    !errors.description;
  
  return ( 
     <div className="page-wrapper">
  <div className="upload-page">

    <div className="left-section">
      <form onSubmit={handleSubmit(onSubmit)} className="upload-form">
        <h2 className="title">
  <FiShare2 size={26} color="#007bff" />
 { t("upload.title")}
</h2>
        <p className="subtitle">
        {t("upload.subtitle")}
        </p>
        <div className="file-upload">
  <label htmlFor="fileInput" className="upload-box">
    {selectedFile ? (
                <div className="file-preview">
                  <AiOutlineFile size={50} color="#007bff" />
                  <p>{selectedFile.name}</p>
                  <button type="button" className="remove-btn" onClick={removeFile}>
                    {t("upload.file.remove")}
                  </button>
                </div>
              ) : ( <>
    <div className="upload-icon">
  <AiOutlineUpload size={40} color="#007bff" />
</div>

    <p className="upload-text">
    {t("upload.file.clickText")}
    </p>

    <span className="upload-subtext">
     {t("upload.file.subText")}
    </span>

    <input
      id="fileInput"
      type="file"
      {...register("file", { required:t("upload.form.fileRequired" )})}
      accept=".pdf,.docx"
      hidden
      onChange={handleFileChange}
    />
    </>)}
  </label>

  {errors.file && <span className="error">{errors.file.message}</span>}
</div> 
        <div div className="form-row">
          <div className="form-group">
            <label>{t("upload.form.materialTitleLabel")}</label>
            <input
              type="text"
              placeholder={t("upload.form.materialTitle")}
              {...register("materialTitle", {
                required: t("upload.form.materialTitleRequired"),
              })}
            />
            {errors.materialTitle && (
              <span className="error">{errors.materialTitle.message}</span>
            )}
          </div>
          <div className="form-group"> 
              <label>{t("upload.form.categoryLabel")}</label>

          
            <select
              {...register("category", { required: t("upload.form.categoryRequired") })}
            >  
<option value="">{t("upload.form.categories.selectCategory")}</option>
<option value="computer_science">{t("upload.form.categories.computer_science")}</option>
<option value="mathematics">{t("upload.form.categories.mathematics")}</option>
<option value="physics">{t("upload.form.categories.physics")}</option>
<option value="business">{t("upload.form.categories.business")}</option>
<option value="engineering">{t("upload.form.categories.engineering")}</option>
<option value="medicine">{t("upload.form.categories.medicine")}</option>
            </select>
            {errors.category && (
              <span className="error">{errors.category.message}</span>
            )}
          </div>
          </div>

<div class="form-row">
          <div className="form-group">
              <label>{t("upload.form.courseLabel")}</label>

            <select {...register("course", { required: t("upload.form.courseRequired") })}>
  <option value="">{t("upload.form.courses.selectCourse")}</option>

  {coursesByCategory[selectedCategory]?.map((course, index) => (
    <option key={index} value={course}>
      {course}
    </option>
  ))}

</select>
            {errors.course && (
              <span className="error">{errors.course.message}</span>
            )}
          </div>
        

          <div className="form-group">
              <label>{t("upload.form.materialTypeLabel")}</label>
            <select
              {...register("materialType", {
                required: t("upload.form.materialTypeRequired"),
              })}
            >
<option value="">{t("upload.form.materialTypes.selectMaterialType")}</option>
<option value="lecture_pdf">{t("upload.form.materialTypes.lecture_pdf")}</option>
<option value="handwritten_notes">{t("upload.form.materialTypes.handwritten_notes")}</option>
<option value="ai_summary">{t("upload.form.materialTypes.ai_summary")}</option>
<option value="research_paper">{t("upload.form.materialTypes.research_paper")}</option>
            </select>
            {errors.materialType && (
              <span className="error">{errors.materialType.message}</span>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>{t("upload.form.descriptionLabel")}</label>
          <textarea 
            placeholder={t("upload.form.description")}
            {...register("description", {
              required: t("upload.form.descriptionRequired"),
            })}
          />
          {errors.description && (
            <span className="error">{errors.description.message}</span>
          )}
        </div>
        <button type="submit" disabled={!isFormComplete}>{t("upload.form.submitBtn")}</button>
      </form>
    </div>
    <div className="right-section">
      <div className="info-card">
<h3><FaShieldAlt  color="#007bff"/> {t("upload.infoCards.guidelines")}</h3>     
 <ul>
         {t("upload.infoCards.guidelineList",{ returnObjects: true }).map((item, index) => (
    <li key={index}>{item}</li>
  ))}
</ul>
          
      </div>
      <div className="info-card">
        <h3><FaLightbulb  color="#007bff"/> {t("upload.infoCards.whyContribute")}</h3>
       <ul>
         {t("upload.infoCards.contributeList",{ returnObjects: true }).map((item, index) => (
    <li key={index}>{item}</li>))}
</ul>
      </div>

    </div>

  </div> 
  </div>
  );}