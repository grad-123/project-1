import "./Upload.css";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { AiOutlineFile, AiOutlineUpload } from "react-icons/ai";
import { FiCheckCircle } from "react-icons/fi";
import { FaShieldAlt } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "../../../api/axiosInstance";
export default function Upload() {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const selectedCategory = watch("category");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileTypes = [
    { value: 0, label: "Lecture" },
    { value: 1, label: "Slides" },
    { value: 2, label: "Summary" },
    { value: 3, label: "Exam" },
    { value: 4, label: "Assignment" },
    { value: 5, label: "Book" },
    { value: 6, label: "Other" },
  ];
  const [categories, setCategories] = useState([]);
export default function Upload() { 
   const { t } = useTranslation();
 const { register, handleSubmit, watch, formState: { errors } } = useForm();
 const selectedCategory = watch("category");
   const [selectedFile, setSelectedFile] = useState(null);
   const [courseInput, setCourseInput] = useState("");
const [filteredCourses, setFilteredCourses] = useState([]);
const [isNewCourse, setIsNewCourse] = useState(false);
   const fileTypes = [
  { value: 0, label: "Lecture" },
  { value: 1, label: "Slides" },
  { value: 2, label: "Summary" },
  { value: 3, label: "Exam" },
  { value: 4, label: "Assignment" },
  { value: 5, label: "Book" },
  { value: 6, label: "Other" },
];
const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/v1/Category/GetList");
      console.log(res.data);
      setCategories(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  const [courses, setCourses] = useState([]);
  const fetchCourses = async (categoryId) => {
    try {
      const res = await axios.get(`/Api/Course/GetList/${categoryId}`);

      setCourses(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!selectedCategory) {
      setCourses([]);
      return;
    }
    fetchCourses(selectedCategory);
  }, [selectedCategory]);

  const onSubmit = async (data) => {
    if (!selectedFile) return;

 } catch (error) {
   console.error(error);
 }
};
    const [courses, setCourses] = useState([]);
    const fetchCourses = async (categoryId) => {
  try {

    const res = await axios.get(`/Api/Course/GetList/${categoryId}`);

    setCourses(res.data.data);

  } catch (error) {
    console.log(error);
  }
}; 
const normalizeCourseName = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")        // حذف المسافات الزايدة
    .replace(/s$/, "");          // حذف s من النهاية (Structures → Structure)
};
useEffect(() => {
  // امسحي الكورس المكتوب
  setCourseInput("");

  if (!selectedCategory) {
    setCourses([]);
    return;
  }

  // جيب الكورسات
  fetchCourses(selectedCategory);

}, [selectedCategory]);

useEffect(() => {
  if (!courseInput) {
    setFilteredCourses([]);
    setIsNewCourse(false);
    return;
  }
  const filtered = courses.filter(course =>
   normalizeCourseName(course.name).includes(normalizeCourseName(courseInput))
  );

  setFilteredCourses(filtered);

const exists = courses.some(
  c => normalizeCourseName(c.name) === normalizeCourseName(courseInput)
);  

  setIsNewCourse(!exists);
}, [courseInput, courses]);

 const onSubmit = async (data) => {
  if (!selectedFile) return;

  try {
    let courseId = 0;
let isNewCourseFlag = false;
    const existingCourse = courses.find(
 c => normalizeCourseName(c.name) === normalizeCourseName(courseInput)
    );

    if (existingCourse) {
      courseId = existingCourse.id;
    } else {
        isNewCourseFlag = true;

const confirm = await Swal.fire({
  title: t("upload.alerts.courseNotExistTitle"),
  text: t("upload.alerts.courseNotExistText"),
  icon: "question",
  showCancelButton: true,
  confirmButtonText: t("upload.alerts.yes"),
  cancelButtonText: t("upload.alerts.cancel"),
});

      if (!confirm.isConfirmed) return;
}
    
    const formData = new FormData();
    formData.append("File", selectedFile);
    formData.append("Title", data.materialTitle);
    formData.append("Description", data.description);
    formData.append("FileType", data.materialType);
    formData.append("CourseId", data.course);
    formData.append("CategoryId", data.category);
    try {
      const response = await axios.post("/Api/EduFile/Upload", formData);
      Swal.fire({
        title: t("upload.alerts.successTitle"),
        text: t("upload.alerts.successText"),
        icon: "success",
        confirmButtonText: t("upload.alerts.ok"),
      });
      setSelectedFile(null);
    } catch (error) {
      Swal.fire({
        title: t("upload.alerts.failTitle"),
        text: t("upload.alerts.failText"),
        icon: "error",
        confirmButtonText: t("upload.alerts.oK"),
      });
    }
  };
    formData.append("CategoryId", data.category);
if (existingCourse) {
  formData.append("CourseId",  existingCourse.id);
}
else {
      formData.append("RequestedCourseName", courseInput);
       const selectedCategoryName = categories.find(cat => cat.id == data.category)?.name;
formData.append("RequestedCategoryName", selectedCategoryName);
    }
    await axios.post("/Api/EduFile/Upload", formData);

    Swal.fire("Success", "File uploaded successfully", "success");
    setSelectedFile(null);
    setCourseInput("");

  } 
  catch (error) {
Swal.fire("Error", "Something went wrong", "error");
  }
};

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const isFormComplete =
    selectedFile &&
    !errors.materialTitle &&
    !errors.course &&
    !errors.category &&
    !errors.materialType &&
    !errors.description;
const [showSuggestions, setShowSuggestions] = useState(false);
  
  const isFormComplete =
  selectedFile &&
  courseInput &&
  !errors.materialTitle &&
  !errors.category &&
  !errors.materialType &&
  !errors.description;
  
  return ( 
     <div className="page-wrapper">
  <div className="upload-page">

  return (
    <div className="page-wrapper">
      <div className="upload-page">
        <div className="left-section">
          <form onSubmit={handleSubmit(onSubmit)} className="upload-form">
            <h2 className="title">
              <FiShare2 size={26} color="#007bff" />
              {t("upload.title")}
            </h2>
            <p className="subtitle">{t("upload.subtitle")}</p>
            <div className="file-upload">
              <label htmlFor="fileInput" className="upload-box">
                {selectedFile ? (
                  <div className="file-preview">
                    {selectedFile.type.startsWith("video") ? (
                      <video width="100" controls>
                        <source
                          src={URL.createObjectURL(selectedFile)}
                          type={selectedFile.type}
                        />
                      </video>
                    ) : (
                      <AiOutlineFile size={50} color="#007bff" />
                    )}
                    <p>{selectedFile.name}</p>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={removeFile}
                    >
                      {t("upload.file.remove")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <AiOutlineUpload size={40} color="#007bff" />
                    </div>

                    <p className="upload-text">{t("upload.file.clickText")}</p>

                    <span className="upload-subtext">
                      {t("upload.file.subText")}
                    </span>

                    <input
                      id="fileInput"
                      type="file"
                      {...register("file", {
                        required: t("upload.form.fileRequired"),
                      })}
                      accept=".pdf,.docx,.mp4,.avi,.mov,.mkv"
                      hidden
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </label>

              {errors.file && (
                <span className="error">{errors.file.message}</span>
              )}
            </div>
            <div className="form-row">
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
                  {...register("category", { required: "Category required" })}
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="error">{errors.category.message}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t("upload.form.courseLabel")}</label>
                <select
                  {...register("course", {
                    required: t("upload.form.courseRequired"),
                  })}
                  disabled={!selectedCategory}
                >
                  <option value="">
                    {t("upload.form.courses.selectCourse")}
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
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
                  <option value="">Select Type</option>

                  {fileTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
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
            <button type="submit" disabled={!isFormComplete}>
              {t("upload.form.submitBtn")}
            </button>
          </form>
        </div>
        <div className="right-section">
          <div className="info-card">
            <h3>
              <FaShieldAlt color="#007bff" /> {t("upload.infoCards.guidelines")}
            </h3>
            <ul>
              {t("upload.infoCards.guidelineList", { returnObjects: true }).map(
                (item, index) => (
                  <li key={index}>{item}</li>
                ),
              )}
            </ul>
          </div>
          <div className="info-card">
            <h3>
              <FaLightbulb color="#007bff" />{" "}
              {t("upload.infoCards.whyContribute")}
            </h3>
            <ul>
              {t("upload.infoCards.contributeList", {
                returnObjects: true,
              }).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

          <div className="form-group"> 
              <label>{t("upload.form.categoryLabel")}</label>

          
           <select
 {...register("category", { required: "Category required" })}
>
<option value="">{t("upload.form.categories.selectCategory")}</option>

{categories.map((cat) => (
  <option key={cat.id} value={cat.id}>
    {cat.name}
  </option>
))}

</select>
            {errors.category && (
              <span className="error">{errors.category.message}</span>
            )}
          </div>
          </div>

<div className="form-row">
          <div className="form-group">
              <label>{t("upload.form.courseLabel")}</label>
  <input
    type="text"
    value={courseInput}
    onChange={(e) => {setCourseInput(e.target.value)
      setShowSuggestions(true);
    }}
     onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
  onFocus={() => setShowSuggestions(true)}
    placeholder={t("upload.form.coursePlaceholder")}
    disabled={!selectedCategory}
  />
  {showSuggestions &&filteredCourses.length > 0 && (
    <ul className="suggestions">
      {filteredCourses.map((course) => (
        <li
          key={course.id}
          onClick={() => {
            setCourseInput(course.name);
            setFilteredCourses([]);
            setIsNewCourse(false);
            setShowSuggestions(false);
          }}
        >
          {course.name}
        </li>
      ))}
    </ul>
  )}
  {isNewCourse && courseInput && (
    <span className="info-text">
     {t("upload.form.newCourseInfo")}
    </span>
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

{fileTypes.map((type) => (
  <option key={type.value} value={type.value}>
    {type.label}
  </option>
))}

</select>
            {errors.materialType && (
              <span className="error">{errors.materialType.message}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
