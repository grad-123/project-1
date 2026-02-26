import React from 'react'
import "./Browse.css"
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Browse() {
    const { t } = useTranslation();
  
  return (
    <>
    <h1 className="browse-title">{t("browse.categories")}</h1>
    </>
  );
}

export default Browse