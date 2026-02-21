
import React from "react";
import {
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaBookOpen,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./Footer.css";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <div className="logo">
            <div className="logo-icon"><FaBookOpen /></div>
            <h2>EDUPRO</h2>
          </div>

          <p>{t("footer.description")}</p>

          <div className="social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          </div>
        </div>

        <div className="footer-col">
          <h3>{t("footer.resources")}</h3>
          <ul>
            <li>{t("footer.browse")}</li>
            <li>{t("footer.summaries")}</li>
            <li>{t("footer.pastPapers")}</li>
            <li>{t("footer.ai")}</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>{t("footer.platform")}</h3>
          <ul>
            <li>{t("footer.upload")}</li>
            <li>{t("footer.collection")}</li>
            <li>{t("footer.qa")}</li>
            <li>{t("footer.contributor")}</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>{t("footer.legal")}</h3>
          <ul>
            <li>{t("footer.privacy")}</li>
            <li>{t("footer.terms")}</li>
            <li>{t("footer.integrity")}</li>
            <li>{t("footer.support")}</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t("footer.copyright")}</p>
        <div className="engine"><span className="dot"></span>{t("footer.engine")}</div>
        <p>{t("footer.madeWith")}</p>
      </div>
    </footer>
  );
}

export default Footer;